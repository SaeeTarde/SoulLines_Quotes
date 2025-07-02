// server/models/savedQuote.model.js

import mongoose, { Schema } from "mongoose";

const savedQuoteSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuotePost",
      required: true,
    },
  },
  { timestamps: true }
);

savedQuoteSchema.index({ user: 1, quote: 1 }, { unique: true }); // Prevent duplicate saves

export const SavedQuote = mongoose.model("SavedQuote", savedQuoteSchema);
