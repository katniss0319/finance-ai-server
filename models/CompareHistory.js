import mongoose from "mongoose";

const compareHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    contractType: {
      type: String,
      default: "",
    },

    products: [
      {
        analysisId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Analysis",
        },

        product: String,

        organization: String,
      },
    ],

    winner: String,

    result: Object,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("CompareHistory", compareHistorySchema);