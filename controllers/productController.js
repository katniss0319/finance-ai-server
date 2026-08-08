import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.status(200).json(products);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "상품 조회 실패",
    });
  }
};