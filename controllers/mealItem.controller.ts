import { Request, Response } from "express";
import {
  createMealItemSchema,
  updateMealItemSchema,
} from "../schemas/mealItem.schema";
import { sql } from "../config/db";

export async function getAllMealItems(req: Request, res: Response) {
  try {
    const mealId = req.query.meal_id ? Number(req.query.meal_id) : null;

    if (mealId !== null && isNaN(mealId)) {
      return res.status(400).json({ error: "Invalid meal_id query parameter" });
    }

    let rows;
    if (mealId !== null) {
      rows = await sql`
        SELECT * FROM meal_items WHERE meal_id = ${mealId} ORDER BY id ASC
      `;
    } else {
      rows = await sql`
        SELECT * FROM meal_items ORDER BY id ASC
      `;
    }

    return res.json(rows);
  } catch (error: any) {
    console.error("Get all meal items error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}

export async function getMealItemById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid meal item ID" });
    }

    const rows = await sql`
      SELECT * FROM meal_items WHERE id = ${id}
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: "Meal item not found" });
    }

    return res.json(rows[0]);
  } catch (error: any) {
    console.error("Get meal item error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}

export async function createMealItem(req: Request, res: Response) {
  try {
    const parsed = createMealItemSchema.parse(req.body);

    const inserted = await sql`
      INSERT INTO meal_items (meal_id, item_id, quantity, measurement)
      VALUES (${parsed.meal_id}, ${parsed.item_id}, ${parsed.quantity}, ${parsed.measurement})
      RETURNING *;
    `;

    res.status(201).json(inserted[0]);
  } catch (error: any) {
    if (error?.errors) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
}

function buildUpdateQuery(
  tableName: string,
  fieldsToUpdate: Record<string, any>,
  id: number
) {
  const keys = Object.keys(fieldsToUpdate);
  const values = Object.values(fieldsToUpdate);

  if (keys.length === 0) {
    throw new Error("No fields to update provided");
  }

  const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(", ");

  const sqlText = `UPDATE ${tableName} SET ${setClause} WHERE id = $${
    keys.length + 1
  } RETURNING *`;

  return {
    text: sqlText,
    values: [...values, id],
  };
}

export async function updateMealItem(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid meal item ID" });
    }

    const parseResult = updateMealItemSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Invalid input",
        details: parseResult.error.issues,
      });
    }

    const fieldsToUpdate = parseResult.data;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields provided for update" });
    }

    const query = buildUpdateQuery("meal_items", fieldsToUpdate, id);

    // Neon returns an array of rows directly
    const rows = await sql.query(query.text, query.values);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Meal item not found" });
    }

    return res.json(rows[0]);
  } catch (error: any) {
    console.error("Update meal item error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}

export async function deleteMealItem(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ error: "Invalid meal_item ID" });

    const deleted = await sql`
      DELETE FROM meal_items WHERE id = ${id} RETURNING *;
    `;

    if (deleted.length === 0) {
      return res.status(404).json({ error: "Meal item not found" });
    }

    res.json({ message: "Meal item deleted", deleted: deleted[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
