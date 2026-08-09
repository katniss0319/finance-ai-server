import mongoose from "mongoose";
import dotenv from "dotenv";
import Dictionary from "./models/Dictionary.js";
import dictionaryData from "./data/dictionaryData.js";

dotenv.config();

const seedDictionary = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    await Dictionary.deleteMany({});

    await Dictionary.insertMany(dictionaryData);

    console.log(
      `✅ ${dictionaryData.length}개의 금융 용어가 저장되었습니다.`
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed 실패:", error);
    process.exit(1);
  }
};

seedDictionary();