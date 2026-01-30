import type { Request, Response } from "express";
import { sql } from "../config/db";

export async function getItems(req: Request, res: Response) {
  try {
    const rows = await sql`
        SELECT
            id,
            name
        FROM items
        ORDER BY name;
    `;

    return res.json(rows);
  } catch (error: any) {
    console.error("Get items preview error:", error);
    return res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
}
