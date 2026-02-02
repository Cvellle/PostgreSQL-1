import express from "express";
import {
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
import { getSavedMeals, saveMeals } from "../controllers/savedMeals.controller";

interface AuthRequest extends Request {
  user?: any;
}

const authCors = cors({
  origin: allowedOrigins,
  credentials: true,
});

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

    req.user = decoded.UserInfo ?? decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
}
//

router.get("/", authCors, authenticateJWT, getSavedMeals);
router.post("/save", authCors, authenticateJWT, saveMeals);

export default router;
