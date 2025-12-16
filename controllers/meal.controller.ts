import type { Request, Response } from "express";

import { z } from "zod";

import { sql } from "../config/db";
import { mealIdParam } from "../schemas/meal.schema";
import { getMealDetails } from "../services/meal.service";

export async function getMeals(req: Request, res: Response) {
  try {
    const rows = await sql`
      SELECT
        m.id,
        m.name,
        STRING_AGG(i.name, ', ' ORDER BY mi.item_id) AS ingredients_preview
      FROM meals m
      LEFT JOIN meal_items mi ON mi.meal_id = m.id
      LEFT JOIN items i ON i.id = mi.item_id
      GROUP BY m.id, m.name
      ORDER BY m.id ASC;
    `;

    return res.json(rows);
  } catch (error: any) {
    console.error("Get meals preview error:", error);
    return res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
}

export async function getMeal(req: Request, res: Response) {
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

export const mealQuerySchema = z.object({
  meal_id: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .refine((v) => v === undefined || !isNaN(v), {
      message: "meal_id must be a number",
    }),
});

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

////////////////
// export async function getMeals(req: Request, res: Response) {
//   try {
//     const mealId = req.query.meal_id ? Number(req.query.meal_id) : null;

//     if (mealId !== null && isNaN(mealId)) {
//       return res.status(400).json({ error: "Invalid meal_id query parameter" });
//     }

//     let rows;

//     if (mealId !== null) {
//       rows = await sql`
//         SELECT
//           m.id,
//           m.name,
//           COALESCE(
//             json_agg(mi.*) FILTER (WHERE mi.id IS NOT NULL),
//             '[]'
//           ) AS items
//         FROM meals m
//         LEFT JOIN meal_items mi ON mi.meal_id = m.id
//         WHERE m.id = ${mealId}
//         GROUP BY m.id
//       `;
//     } else {
//       rows = await sql`
//         SELECT
//           m.id,
//           m.name,
//           COALESCE(
//             json_agg(mi.*) FILTER (WHERE mi.id IS NOT NULL),
//             '[]'
//           ) AS items
//         FROM meals m
//         LEFT JOIN meal_items mi ON mi.meal_id = m.id
//         GROUP BY m.id
//         ORDER BY m.id ASC
//       `;
//     }

//     return res.json(rows);
//   } catch (error: any) {
//     console.error("Get all meals error:", error);
//     return res.status(500).json({
//       error: error.message || "Internal Server Error",
//     });
//   }
// }
