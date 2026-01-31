import express, { Request, Response } from "express";
import mealRoutes from "../routes/meal.routes";
import itemsRoutes from "../routes/items.route";
import authRoutes from "../routes/auth.route";
import cors from "cors";

import { sql } from "../config/db";

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

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
app.use("/meals", mealRoutes);
app.use("/items", itemsRoutes);
app.use("/auth", authRoutes);

export default app;

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`),
);

module.exports = app;
