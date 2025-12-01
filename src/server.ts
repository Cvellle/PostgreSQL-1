import express, { Request, Response } from "express";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const sql = neon(process.env.DATABASE_URL!);

interface Ingredient {
  id: number;
  name: string;
  quantity: number | null;
  created_at: string;
}

app.get("/ingredients", async (req: Request, res: Response) => {
  try {
    const rows = await sql`
      SELECT * FROM ingredients
      ORDER BY id ASC
    `;

    console.log("DB RESPONSE:", rows); // <-- See exactly what you get

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

app.listen(3001, () => console.log("Server running at http://localhost:3001"));
