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
  // 1. Proveri prvo Authorization Header (Bearer token)
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1] || req.cookies?.jwt; // Ako nema u headeru, uzmi iz kukija

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // PAZI: Moraš biti siguran koji tajni ključ koristiš!
    // Ako koristiš isti kuki za refresh, ovde bi verovatno trebalo da bude REFRESH_TOKEN_SECRET
    // osim ako prilikom logina ne čuvaš Access Token u kukiju (što nije preporuka)
    const secret = process.env.ACCESS_TOKEN_SECRET || "your-secret";
    const decoded = jwt.verify(token, secret) as any;

    // Proveri da li tvoj token sadrži 'id' ili je upakovan u 'UserInfo'
    // Ako si u loginu stavio { id: user.id }, onda je ovo req.user = decoded;
    req.user = decoded;

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
