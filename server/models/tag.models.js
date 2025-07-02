import mongoose, { Schema } from "mongoose";

//import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Tag = mongoose.model("Tag", tagSchema);
