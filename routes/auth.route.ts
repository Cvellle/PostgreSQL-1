import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  handleRefreshToken,
  handleLogout,
} from "../controllers/auth.controller";
import { Request, Response } from "express";

const router = express.Router();

// testing
import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { allowedOrigins } from "../api";
import cors from "cors";

interface AuthRequest extends Request {
  user?: any;
}

const authCors = cors({
  origin: allowedOrigins,
  credentials: true,
});

interface AuthRequest extends Request {
  user?: any;
}

export function authenticateJWT(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies["accessToken"];

  if (!token) {
    return res.status(401).json({ message: "No access token" });
  }

  try {
    const secret = process.env.ACCESS_TOKEN_SECRET || "your-secret";
    const decoded = jwt.verify(token, secret) as any;

    req.user = decoded.UserInfo ? decoded.UserInfo : decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token expired" });
  }
}
//

router.get("/me", authCors, authenticateJWT, getCurrentUser);
router.post("/refresh", handleRefreshToken);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", handleLogout);

export default router;
