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

    summary: String,

    risks: [String],

    advantages: [String],

    recommendation: String,

    riskScore: Number,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Analysis", analysisSchema);