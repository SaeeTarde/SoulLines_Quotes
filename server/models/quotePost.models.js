// server/models/quote.model.js

import mongoose, { Schema } from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const quoteSchema = new mongoose.Schema(
  {
    quoteText: {
      type: String,
      required: [true, "Quote text is required"],
    },
    authorName: {
      type: String,
      default: "Unknown",
    },
    source: {
      type: String, // e.g. book, movie, drama
      trim: true,
    },
    backgroundImage: {
      public_id: String,
      secure_url: String,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    fontFamily: {
      type: String,
      default: "inherit",
    },
  },
  { timestamps: true }
);

quoteSchema.plugin(mongooseAggregatePaginate);

export const QuotePost = mongoose.model("QuotePost", quoteSchema);
