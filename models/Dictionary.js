import mongoose from "mongoose";

const dictionarySchema = new mongoose.Schema(
  {
    term: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    summary: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "대출",
        "예금·적금",
        "보험",
        "투자",
        "금리",
        "기타",
      ],
    },

    tags: {
      type: [String],
      default: [],
    },

    relatedTerms: {
      type: [String],
      default: [],
    },

    views: {
      type: Number,
      default: 0,
    },

    searchCount: {
      type: Number,
      default: 0,
    },

    favoriteCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Dictionary", dictionarySchema);