import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ================= 회원가입 =================

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 빈값 확인
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "모든 항목을 입력해주세요.",
      });
    }

    // 이메일 중복 확인
    const exist = await User.findOne({ email });

    if (exist) {
      return res.status(409).json({
        message: "이미 가입된 이메일입니다.",
      });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 회원 생성
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      message: "회원가입 성공",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "서버 오류",
    });
  }
};

// ================= 로그인 =================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "로그인 성공",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "서버 오류",
    });
  }
};