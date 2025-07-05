import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { QuotePost } from "../models/quotePost.models.js";
import { SavedQuote } from "../models/savedQuote.models.js";
import { Tag } from "../models/tag.models.js";
import { Like } from "../models/like.models.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found!");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while genrting access and refresh tokens!!"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, tags } = req.body;

  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required!");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with same email or username already exists!");
  }

  let avatar = {
    public_id: "",
    secure_url: "",
  };

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  if (avatarLocalPath) {
    avatar = await uploadOnCloudinary(avatarLocalPath);
  }

  let tagIds = [];
  if (tags && Array.isArray(tags)) {
    tagIds = await Promise.all(
      tags.map(async (tagName) => {
        const lowerName = tagName.toLowerCase().trim();
        let tag = await Tag.findOne({ name: lowerName });
        if (!tag) {
          tag = await Tag.create({ name: lowerName });
        }
        return tag._id;
      })
    );
  }

  const user = await User.create({
    avatar: avatar?.secure_url || "",
    email,
    password,
    username: username.toLowerCase(),
    tags: tagIds,
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const createdUser = await User.findById(user._id)
    .select("-password -refreshToken")
    .populate("tags");

  const options = {
    httpOnly: true,
    secure: true, // Always true on Render
    sameSite: "None",
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "User registered successfully"
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  // Ensure at least one of email or username is provided
  if (!identifier?.trim() || !password?.trim()) {
    throw new ApiError(400, "Username or email and password are required!");
  }

  // Find user by email or username
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  }).select("+password +refreshToken"); // 👈 Ensure password is selectable

  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  // Validate password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials!");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // Save refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Fetch safe user data
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };
  // localStorage.setItem("userId", res.data.data._id);
  console.log("Logged in successfully");
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // Clear the refreshToken in DB
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );

  // Clear the cookies
  const options = {
    httpOnly: true,
    secure: true, // ✅ Render is HTTPS, so force secure
    sameSite: "None",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required!");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token! User not found");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(403, "Refresh token mismatch! Login again.");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    // Save new refresh token to DB
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
      httpOnly: true,
      secure: true, // Always true on Render
      sameSite: "None",
    };
    console.log("Incoming Refresh:", incomingRefreshToken);
    console.log("User Refresh from DB:", user?.refreshToken);
    console.log("Decoded:", decodedToken);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(403, "Invalid or expired refresh token!");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id).select("+password");

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "old password incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully!"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { username, tags } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Handle username update
  if (username && username.trim()) {
    const existingUser = await User.findOne({
      username: username.toLowerCase(),
      _id: { $ne: userId }, // excludes current user
    });

    if (existingUser) {
      throw new ApiError(400, "Username already taken");
    }

    user.username = username.toLowerCase();
  }

  // Handle avatar update
  const avatarFile = req.file;
  if (avatarFile) {
    const avatarLocalPath = avatarFile.path;
    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
    user.avatar = uploadedAvatar.url;
  }

  // Handle tags update (expects array of tag IDs)
  // Handle tags update (expects array of tag names or stringified comma list)
  if (tags) {
    let tagNames = [];

    if (Array.isArray(tags)) {
      tagNames = tags;
    } else if (typeof tags === "string") {
      tagNames = tags.split(",");
    }

    // Clean tag names (trim, lowercase)
    tagNames = tagNames.map((t) => t.trim().toLowerCase());

    // Fetch or create corresponding Tag documents
    const tagDocs = await Promise.all(
      tagNames.map(async (name) => {
        let tag = await Tag.findOne({ name });
        if (!tag) {
          tag = await Tag.create({ name });
        }
        return tag._id;
      })
    );

    user.tags = tagDocs; // array of ObjectIds
  }

  await user.save();

  const updatedUser = await User.findById(userId).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User profile updated successfully")
    );
});

const postQuote = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { quoteText, authorName, source, tags, fontFamily } = req.body;

  if (!quoteText?.trim()) {
    throw new ApiError(400, "Quote text is required");
  }

  let backgroundImage = null;

  const bgImagePath = req.files?.backgroundImage?.[0]?.path;
  if (bgImagePath) {
    try {
      const uploaded = await uploadOnCloudinary(bgImagePath);
      backgroundImage = {
        public_id: uploaded.public_id,
        secure_url: uploaded.secure_url,
      };
    } catch (error) {
      console.log("Cloudinary upload error", error);
      throw new ApiError(500, "Failed to upload background image");
    }
  }

  // Handle tags (if provided)
  let tagArray = [];

  if (tags) {
    if (Array.isArray(tags)) {
      tagArray = await Promise.all(
        tags.map(async (tagName) => {
          const tagDoc = await Tag.findOne({ name: tagName.trim() });
          return tagDoc?._id;
        })
      );
    } else {
      console.log("tags not done!");
    }
  }

  // Create the quote
  const quote = await QuotePost.create({
    quoteText,
    authorName: authorName || "Unknown",
    source,
    backgroundImage,
    postedBy: userId,
    tags: tagArray,
    fontFamily: fontFamily || "inherit", // If your quoteSchema includes tags: [ObjectId]
  });
  return res
    .status(201)
    .json(new ApiResponse(201, quote, "Quote posted successfully"));
});

const saveOrUnsaveQuote = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { quoteId } = req.body;

  const existing = await SavedQuote.findOne({ user: userId, quote: quoteId });

  if (existing) {
    await existing.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, { saved: false }, "Quote unsaved"));
  }

  const saved = await SavedQuote.create({ user: userId, quote: quoteId });
  return res
    .status(201)
    .json(new ApiResponse(201, { saved: true }, "Quote saved"));
});

const getSavedQuotes = asyncHandler(async (req, res) => {
  const savedQuotes = await SavedQuote.find({ user: req.user._id })
    .populate("quote")
    .sort({ createdAt: -1 });

  const validSavedQuotes = savedQuotes.filter((entry) => entry.quote !== null);

  return res
    .status(200)
    .json(new ApiResponse(200, savedQuotes, "Saved quotes fetched"));
});

const getAllQuotes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = "", tags = [] } = req.query;
  const userId = req.user?._id; // Logged-in user
  // Convert tags to array if it's comma-separated
  const tagFilter = Array.isArray(tags) ? tags : tags.split(",");

  const matchStage = {};

  if (search) {
    matchStage.quoteText = { $regex: search, $options: "i" };
  }

  if (tagFilter.length && tagFilter[0] !== "") {
    matchStage.tags = { $in: tagFilter };
  }

  const aggregate = QuotePost.aggregate([
    { $match: matchStage },
    { $sample: { size: 100 } },
    {
      $lookup: {
        from: "tags",
        localField: "tags",
        foreignField: "_id",
        as: "tags",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "postedBy",
        foreignField: "_id",
        as: "postedBy",
      },
    },
    { $unwind: "$postedBy" },
  ]);

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const quotes = await QuotePost.aggregatePaginate(aggregate, options);

  // 🔁 Check for likes by current user for each quote
  if (userId && quotes?.docs?.length > 0) {
    const quoteIds = quotes.docs.map((q) => q._id);

    // Get liked quotes
    const likedQuotes = await Like.find({
      user: userId,
      quote: { $in: quoteIds },
    }).select("quote");

    const likedQuoteIds = new Set(
      likedQuotes.map((like) => like.quote.toString())
    );

    // Get saved quotes
    const savedQuotes = await SavedQuote.find({
      user: userId,
      quote: { $in: quoteIds },
    }).select("quote");

    const savedQuoteIds = new Set(
      savedQuotes.map((save) => save.quote.toString())
    );

    // Attach both to each quote
    quotes.docs = quotes.docs.map((quote) => {
      const quoteId = quote._id.toString();
      return {
        ...quote,
        _id: quoteId, // ensure string
        isLiked: likedQuoteIds.has(quoteId),
        isSaved: savedQuoteIds.has(quoteId),
      };
    });
  }

  // console.log("🚀 FINAL QUOTE SENT:", JSON.stringify(quotes.docs[0], null, 2));
  console.log("🔥 isLiked?", quotes.docs[0].isLiked);
  console.log("🔥 isSaved?", quotes.docs[0].isSaved);

  return res
    .status(200)
    .json(new ApiResponse(200, quotes, "Quotes fetched with pagination"));
});

const likeOrUnlikeQuote = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { quoteId } = req.body;

  if (!quoteId) {
    throw new ApiError(400, "Quote ID is required");
  }

  const quoteExists = await QuotePost.findById(quoteId);
  if (!quoteExists) {
    throw new ApiError(404, "Quote not found");
  }

  const existingLike = await Like.findOne({ user: userId, quote: quoteId });

  if (existingLike) {
    // Unlike
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, { liked: false }, "Quote unliked"));
  }

  // Like
  await Like.create({ user: userId, quote: quoteId });
  return res
    .status(201)
    .json(new ApiResponse(201, { liked: true }, "Quote liked"));
});

const getLikesCount = asyncHandler(async (req, res) => {
  const { quoteId } = req.params;

  if (!quoteId) {
    throw new ApiError(400, "Quote ID is required");
  }

  const count = await Like.countDocuments({ quote: quoteId });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { quoteId, likes: count }, "Likes count fetched")
    );
});

const searchQuotes = asyncHandler(async (req, res) => {
  const { query, tags } = req.query;

  const searchFilter = {};

  // 🔤 Text search on quoteText or authorName
  if (query) {
    searchFilter.$or = [
      { quoteText: { $regex: query, $options: "i" } },
      { authorName: { $regex: query, $options: "i" } },
    ];

    // 🏷️ Filter by tags
    const matchingTags = await Tag.find({
      name: { $regex: query.trim(), $options: "i" },
    });

    if (matchingTags.length > 0) {
      const tagIds = matchingTags.map((tag) => tag._id);
      searchFilter.$or.push({ tags: { $in: tagIds } });
    }
  }

  const quotes = await QuotePost.find(searchFilter)
    .populate("postedBy", "username avatar")
    .populate("tags", "name")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, quotes, "Quotes fetched successfully"));
});

const getUserDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId)
    .select("username email avatar tags createdAt")
    .populate("tags", "name");

  if (!user) throw new ApiError(404, "User not found!");

  let postedQuotes = await QuotePost.find({ postedBy: userId }).sort({
    createdAt: -1,
  });

  const savedQuoteDocs = await SavedQuote.find({ user: userId })
    .populate({
      path: "quote",
      populate: [
        { path: "tags", select: "name" },
        { path: "postedBy", select: "username" },
      ],
    })
    .sort({ createdAt: -1 });

  // Filter out any null quote references (e.g., deleted posts)
  let savedQuotes = savedQuoteDocs
    .map((item) => item.quote)
    .filter((q) => q && q._id);

  // Filter postedQuotes to avoid unexpected nulls (just in case)
  postedQuotes = postedQuotes.filter((q) => q && q._id);

  // Combine all for checking likes/saves
  const allQuotes = [...postedQuotes, ...savedQuotes].filter((q) => q && q._id);
  const allQuoteIds = allQuotes.map((q) => q._id.toString());

  const likedQuotes = await Like.find({
    user: userId,
    quote: { $in: allQuoteIds },
  }).select("quote");

  const savedQuoteEntities = await SavedQuote.find({
    user: userId,
    quote: { $in: allQuoteIds },
  }).select("quote");

  const likedQuoteIds = new Set(
    likedQuotes.map((like) => like.quote.toString())
  );

  const savedQuoteIds = new Set(
    savedQuoteEntities.map((save) => save.quote.toString())
  );

  // Add isLiked & isSaved to posted
  postedQuotes = postedQuotes.map((quote) => {
    const id = quote._id.toString();
    return {
      ...quote.toObject(),
      isLiked: likedQuoteIds.has(id),
      isSaved: savedQuoteIds.has(id),
    };
  });

  // Add isLiked & isSaved to saved
  savedQuotes = savedQuotes.map((quote) => {
    const id = quote._id.toString();
    return {
      ...quote.toObject(),
      isLiked: likedQuoteIds.has(id),
      isSaved: savedQuoteIds.has(id),
    };
  });

  const totalLikes = await Like.countDocuments({
    quote: { $in: postedQuotes.map((q) => q._id) },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        stats: {
          totalQuotesPosted: postedQuotes.length,
          totalLikesReceived: totalLikes,
          totalQuotesSaved: savedQuotes.length,
        },
        postedQuotes,
        savedQuotes,
      },
      "Dashboard fetched"
    )
  );
});

const getPublicUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("username avatar");
  if (!user) throw new ApiError(404, "User not found");

  const quotes = await QuotePost.find({ postedBy: userId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        quotes,
      },
      "Public profile fetched"
    )
  );
});

const deleteQuote = asyncHandler(async (req, res) => {
  const { quoteId } = req.params;
  const userId = req.user._id;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(quoteId)) {
    throw new ApiError(400, "Invalid Quote ID");
  }

  // Find the quote
  const quote = await QuotePost.findById(quoteId);

  if (!quote) {
    throw new ApiError(404, "Quote not found");
  }

  // Optional: Ensure only the user who posted can delete
  if (quote.postedBy.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this quote");
  }

  // Delete the quote
  await QuotePost.findByIdAndDelete(quoteId);

  res.status(200).json({
    success: true,
    message: "Quote deleted successfully",
  });
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
  postQuote,
  saveOrUnsaveQuote,
  getSavedQuotes,
  getAllQuotes,
  likeOrUnlikeQuote,
  getLikesCount,
  searchQuotes,
  getUserDashboard,
  getPublicUserProfile,
  deleteQuote,
};
