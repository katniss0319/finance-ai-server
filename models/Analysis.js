import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    summary: [String],

    risks: [
      {
        title: String,
        description: String,
      },
    ],

    advantages: [String],

    recommendation: String,

    riskScore: Number,

    keyInfo: [
      {
        label: String,
        value: String,
      },
    ],

    checklist: [String],

    easyExplanation: {
      title: String,
      original: String,
      translated: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Analysis", analysisSchema);