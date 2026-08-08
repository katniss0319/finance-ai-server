import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    bank: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    rate: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    repay: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);