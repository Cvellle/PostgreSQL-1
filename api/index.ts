import express, { Request, Response } from "express";
import mealRoutes from "../routes/meal.routes";

import { sql } from "../config/db";

const PORT = process.env.PORT || 3001;

const app = express();

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

// health
// app.get("/health", (_req, res) => res.json({ ok: true }));
// preetify
app.set("json spaces", 2);
// routes
app.use("/meals", mealRoutes);
// app.use("/meal-items", mealItemRoutes);

export default app;

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);

module.exports = app;
