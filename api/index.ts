import express, { Request, Response } from "express";
import mealRoutes from "../routes/meal.routes";
import itemsRoutes from "../routes/items.route";
import authRoutes from "../routes/auth.route";
import cors from "cors";
import cookieParser from "cookie-parser";
import { sql } from "../config/db";

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
  console.log(123, req.cookies.jwt);
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

const PORT = process.env.PORT || 3001;

const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://food-calc-rose.vercel.app/",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman or mobile apps
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    // for cookies
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/ingredients", async (req: Request, res: Response) => {
  try {
    const rows = await sql`
      SELECT * FROM ingredients
      ORDER BY id ASC
    `;

    console.log("DB RESPONSE:", rows);

    return res.json(rows);
  } catch (error: any) {
    console.error("NEON ERROR:", {
      message: error.message,
      code: error.code,
      sourceError: error.sourceError,
      stack: error.stack,
    });

    return res.status(500).json({
      error: error.message || "Unknown error",
    });
  }
});

app.set("json spaces", 2);
// routes
app.use("/meals", authenticateJWT, mealRoutes);
app.use("/items", itemsRoutes);
app.use("/auth", authRoutes);

export default app;

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`),
);

module.exports = app;
