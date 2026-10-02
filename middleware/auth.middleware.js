import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authMiddleware = async (
  req,
  res,
  next
) => {
  try {
    const token =
      req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user =
      await User.findById(
        decoded.userId
      ).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;

    next();

  } catch (error) {

    console.log(
      "Auth middleware error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired session",
    });
  }
};

export default authMiddleware;