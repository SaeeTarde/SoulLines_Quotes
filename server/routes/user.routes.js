import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  loginUser,
  registerUser,
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
} from "../controllers/user.controllers.js";

import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

//unsecured routes
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.get("/likes/:quoteId", getLikesCount);
router.get("/search", searchQuotes);
router.get("/:userId/profile", getPublicUserProfile);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/update-profile").patch(
  verifyJWT,
  upload.single("avatar"), // ✅ instead of .fields
  updateAccountDetails
);

router.route("/add-post").post(
  verifyJWT,
  upload.fields([
    {
      name: "backgroundImage",
      maxCount: 1,
    },
  ]),
  postQuote
);
router.post("/save", verifyJWT, saveOrUnsaveQuote);
//router.delete("/unsave/:quoteId", verifyJWT, unsaveQuote);
router.get("/saved", verifyJWT, getSavedQuotes);
router.post("/like", verifyJWT, likeOrUnlikeQuote);
router.get("/dashboard", verifyJWT, getUserDashboard);
router.get("/quotes", verifyJWT, getAllQuotes);
router.delete("/delete/:quoteId", verifyJWT, deleteQuote);

export default router;
