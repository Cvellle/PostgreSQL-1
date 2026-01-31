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
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized, token missing" });
  }

  try {
    const secret = process.env.ACCESS_TOKEN_SECRET || "your-secret";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized, invalid token" });
  }
}
//

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authenticateJWT, getCurrentUser);

export default router;
