import { sql } from "../config/db";
import type { MealItemRow } from "../types/db";

export async function getMealRawData(mealId: number): Promise<MealItemRow[]> {
  const rows = await sql`
    SELECT
      mi.item_id,
      mi.quantity,
      mi.measurement,
      n.id AS nutrient_id,
      n.name AS nutrient_name,
      n.unit AS nutrient_unit,
      in_.per_100g,
      in_.per_unit,
      it.name AS item_name
    FROM meal_items mi
    JOIN item_nutrients in_ ON in_.item_id = mi.item_id
    JOIN nutrients n ON n.id = in_.nutrient_id
    JOIN items it ON it.id = mi.item_id
    WHERE mi.meal_id = ${mealId}
  `;

  return rows as MealItemRow[];
}
