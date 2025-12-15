// src/controllers/meal.controller.ts
import type { Request, Response } from "express";

import { z } from "zod";

import { sql } from "../config/db";
import { mealIdParam } from "../schemas/meal.schema";
import { getMealDetails } from "../services/meal.service";

export async function getMealController(req: Request, res: Response) {
  try {
    const parsed = mealIdParam.parse(req.params);
    const meal = await getMealDetails(parsed.mealId);

    if (!meal) {
      return res.status(404).json({ error: "Meal not found" });
    }

    return res.json(meal);
  } catch (err: any) {
    // Zod or runtime error
    return res.status(400).json({ error: err?.message || String(err) });
  }
}

// Zod schema to validate request body for creating an item
const createItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  measurement: z.enum(["unit", "grams"]),
});

export async function createItem(req: Request, res: Response) {
  try {
    // Validate input
    const parsed = createItemSchema.parse(req.body);

    // Insert new item into the database
    const inserted = await sql`
      INSERT INTO items (name, category, measurement)
      VALUES (${parsed.name}, ${parsed.category}, ${parsed.measurement})
      RETURNING *;
    `;

    return res.status(201).json(inserted[0]);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.issues,
      });
    }
    console.error("Create item error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}

// Example usage:
// POST /items
// {
//   "name": "egg",
//   "category": "protein",
//   "measurement": "unit"
// }

// POST /items
// {
//   "name": "broccoli",
//   "category": "vegetable",
//   "measurement": "grams"
// }

// add item - grams
// INSERT INTO meal_items (meal_id, item_id, quantity, measurement)
// VALUES (:mealId, :broccoliItemId, 200, 'grams');

// add by 'unit'
// INSERT INTO meal_items (meal_id, item_id, quantity, measurement)
// VALUES (1, 2, 3, 'unit');

// /meals/:id - to test changes
