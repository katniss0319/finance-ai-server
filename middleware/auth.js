import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    // Authorization: Bearer xxxxx
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "로그인이 필요합니다.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (err) {
    return res.status(401).json({
      message: "유효하지 않은 토큰입니다.",
    });
  }
};

export default auth;