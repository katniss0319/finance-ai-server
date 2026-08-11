import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    dictionaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dictionary",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// 같은 사용자가 같은 용어를 중복 저장하지 못하게 함
favoriteSchema.index(
  { userId: 1, dictionaryId: 1 },
  { unique: true }
);

export default mongoose.model("Favorite", favoriteSchema);