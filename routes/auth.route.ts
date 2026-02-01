import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../controllers/auth.controller";
import { Request, Response } from "express";

const router = express.Router();

// testing
import { NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: any;
}

export function authenticateJWT(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1] || req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const secret = process.env.ACCESS_TOKEN_SECRET || "your-secret";
    const decoded = jwt.verify(token, secret) as any;

    req.user = decoded.UserInfo ? decoded.UserInfo : decoded;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
//

router.get("/me", authenticateJWT, getCurrentUser);
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
