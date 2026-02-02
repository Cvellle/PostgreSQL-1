import { Request, Response } from "express";
import { sql } from "../config/db";

interface Nutrient {
  nutrient: string;
  unit: string;
  total: number;
}

interface Item {
  name: string;
  quantity: number;
  measurement: "grams" | "unit";
}

interface SavedMealPayload {
  daily_meal_id?: number;
  user_id: number;
  name: string;
  date?: string;
  items: Item[];
  nutrients: Nutrient[];
}

export async function saveMeals(req: Request, res: Response) {
  try {
    const payload: SavedMealPayload = req.body;

    if (
      !payload.user_id ||
      !payload.name ||
      !payload.items ||
      !payload.nutrients
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const snapshot = {
      items: payload.items,
      nutrients: payload.nutrients,
    };

    const inserted = await sql`
      INSERT INTO saved_meals (daily_meal_id, user_id, name, date, data)
      VALUES (
        ${payload.daily_meal_id ?? null},
        ${payload.user_id},
        ${payload.name},
        ${payload.date ? new Date(payload.date) : new Date()},
        ${snapshot}
      )
      RETURNING *;
    `;

    res.status(201).json({
      message: "Meal snapshot saved",
      savedMeal: inserted[0],
    });
  } catch (error: any) {
    console.error("Error saving meal snapshot:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

export async function getSavedMeals(req: Request, res: Response) {
  try {
    const userId = Number(req.query.user_id);
    const mealId = req.query.meal_id ? Number(req.query.meal_id) : null;

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid or missing user_id" });
    }
    if (mealId !== null && isNaN(mealId)) {
      return res.status(400).json({ error: "Invalid meal_id" });
    }

    let rows;

    if (mealId !== null) {
      rows = await sql`
        SELECT * FROM saved_meals
        WHERE user_id = ${userId} AND meal_id = ${mealId}
        ORDER BY created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT * FROM saved_meals
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
    }

    return res.json(rows);
  } catch (error: any) {
    console.error("Error fetching saved meals:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
