import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Favorite from "../models/Favorite.js";
import XLSX from "xlsx";
import Analysis from "../models/Analysis.js";
import CompareHistory from "../models/CompareHistory.js";
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
// ================= 회원정보 수정 =================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    // 빈값 확인
    if (!name || !email) {
      return res.status(400).json({
        message: "이름과 이메일을 모두 입력해주세요.",
      });
    }

    // 다른 사용자가 이미 사용 중인 이메일인지 확인
    const existingUser = await User.findOne({
      email,
      _id: { $ne: userId },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "이미 사용 중인 이메일입니다.",
      });
    }

    // 회원정보 수정
    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    res.json({
      message: "회원정보가 수정되었습니다.",
      user,
    });
  } catch (error) {
    console.error("회원정보 수정 실패:", error);

    res.status(500).json({
      message: "회원정보 수정에 실패했습니다.",
    });
  }
};
// ================= 현재 비밀번호 확인 =================
export const verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "현재 비밀번호를 입력해주세요.",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "현재 비밀번호가 올바르지 않습니다.",
      });
    }

    res.json({
      message: "비밀번호 확인 성공",
    });
  } catch (error) {
    console.error("현재 비밀번호 확인 실패:", error);

    res.status(500).json({
      message: "비밀번호 확인에 실패했습니다.",
    });
  }
};


// ================= 비밀번호 변경 =================
export const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        message: "새 비밀번호를 입력해주세요.",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    res.json({
      message: "비밀번호가 변경되었습니다.",
    });

  } catch (error) {
    console.error(
      "비밀번호 변경 실패:",
      error
    );

    res.status(500).json({
      message: "비밀번호 변경에 실패했습니다.",
    });
  }
};
// ================= 내 데이터 백업 =================
export const exportMyData = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 회원정보
    const user = await User.findById(userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    // 즐겨찾기
    const favorites = await Favorite.find({
      userId,
    })
      .populate("dictionaryId")
      .sort({ createdAt: -1 });

    // 분석 기록
    const analyses = await Analysis.find({
      user: userId,
    }).sort({ createdAt: -1 });

    // =========================
    // 엑셀용 데이터
    // =========================

    const profileData = [
      {
        항목: "이름",
        내용: user.name || "",
      },
      {
        항목: "이메일",
        내용: user.email || "",
      },
      {
        항목: "백업일시",
        내용: new Date().toLocaleString("ko-KR"),
      },
    ];

    const favoriteData = favorites.map((item) => ({
      금융용어: item.dictionaryId?.term || "",
      카테고리: item.dictionaryId?.category || "",
      저장일: item.createdAt
        ? new Date(item.createdAt).toLocaleDateString("ko-KR")
        : "",
    }));

    const analysisData = analyses.map((item) => ({
      파일명: item.fileName || "",
      위험도: item.riskScore ?? "",
      요약: item.summary || "",
      AI추천: item.recommendation || "",
      분석일: item.createdAt
        ? new Date(item.createdAt).toLocaleDateString("ko-KR")
        : "",
    }));

    // =========================
    // Workbook 생성
    // =========================

    const workbook = XLSX.utils.book_new();

    // 회원정보
    const profileSheet =
      XLSX.utils.json_to_sheet(profileData);

    XLSX.utils.book_append_sheet(
      workbook,
      profileSheet,
      "회원정보"
    );

    // 즐겨찾기
    const favoriteSheet =
      XLSX.utils.json_to_sheet(
        favoriteData.length > 0
          ? favoriteData
          : [
              {
                금융용어: "저장된 즐겨찾기가 없습니다.",
                카테고리: "",
                저장일: "",
              },
            ]
      );

    XLSX.utils.book_append_sheet(
      workbook,
      favoriteSheet,
      "즐겨찾기"
    );

    // 분석 기록
    const analysisSheet =
      XLSX.utils.json_to_sheet(
        analysisData.length > 0
          ? analysisData
          : [
              {
                파일명: "저장된 분석 기록이 없습니다.",
                위험도: "",
                요약: "",
                AI추천: "",
                분석일: "",
              },
            ]
      );

    XLSX.utils.book_append_sheet(
      workbook,
      analysisSheet,
      "분석 기록"
    );

    // =========================
    // 컬럼 너비
    // =========================

    profileSheet["!cols"] = [
      { wch: 15 },
      { wch: 35 },
    ];

    favoriteSheet["!cols"] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
    ];

    analysisSheet["!cols"] = [
      { wch: 35 },
      { wch: 10 },
      { wch: 50 },
      { wch: 50 },
      { wch: 15 },
    ];

    // =========================
    // XLSX Buffer 생성
    // =========================

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    const date = new Date()
      .toISOString()
      .slice(0, 10);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Choicon_backup_${date}.xlsx"`
    );

    res.send(buffer);

  } catch (error) {
    console.error("데이터 백업 실패:", error);

    res.status(500).json({
      message: "데이터 백업에 실패했습니다.",
    });
  }
};
// ================= 회원탈퇴 =================
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "비밀번호를 입력해주세요.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "비밀번호가 올바르지 않습니다.",
      });
    }

    // 🔖 즐겨찾기 삭제
    await Favorite.deleteMany({
      userId: userId,
    });

    // 📄 분석 기록 삭제
    await Analysis.deleteMany({
      user: userId,
    });

    // ⚖️ 비교 기록 삭제
    await CompareHistory.deleteMany({
      user: userId,
    });

    // 👤 회원 삭제
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "회원탈퇴가 완료되었습니다.",
    });

  } catch (error) {
    console.error("회원탈퇴 실패:", error);

    res.status(500).json({
      message: "회원탈퇴에 실패했습니다.",
    });
  }
};