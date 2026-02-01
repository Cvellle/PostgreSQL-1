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

interface AuthRequest extends Request {
  user?: any;
}

export function authenticateJWT(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  // 1. Gledamo ISKLJUČIVO Authorization Header
  if (!authHeader?.startsWith("Bearer ")) {
    // Ako nema headera, šaljemo 401. FetchWithAuth će ovo presresti i pozvati /refresh
    return res.status(401).json({ message: "No access token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.ACCESS_TOKEN_SECRET || "your-secret";
    const decoded = jwt.verify(token, secret) as any;

    // 2. Proveravamo UserInfo strukturu koju šaljemo u loginUser-u
    req.user = decoded.UserInfo ? decoded.UserInfo : decoded;
    next();
  } catch (err) {
    // 3. Ako je token istekao (Expired), šaljemo 401
    return res.status(401).json({ message: "Token expired" });
  }
}
//

router.get("/me", authenticateJWT, getCurrentUser);
router.post("/refresh", handleRefreshToken);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", handleLogout);

export default router;
