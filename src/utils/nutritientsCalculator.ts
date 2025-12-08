// src/utils/nutrientCalculator.ts
import type { MealItemRow } from "../types/db.d.ts";

export type NutrientTotal = {
  nutrient: string;
  unit: string;
  total: number;
};

export type ItemSummary = {
  name: string;
  amount: number;
  measurement: string;
};

export function calculateMealNutrients(rows: MealItemRow[]): {
  nutrients: NutrientTotal[];
  items: ItemSummary[];
} {
  const nutrientMap = new Map<string, NutrientTotal>();
  const itemMap = new Map<number, ItemSummary>();

  for (const row of rows) {
    const {
      item_id,
      item_name,
      amount,
      measurement,
      nutrient_name,
      nutrient_unit,
      per_100g,
      per_unit,
    } = row;

    // accumulate item summary (one entry per item)
    if (!itemMap.has(item_id)) {
      itemMap.set(item_id, {
        name: item_name,
        amount: Number(amount),
        measurement,
      });
    } else {
      // if same item appears multiple times with different rows, keep sum for grams measurement
      const existing = itemMap.get(item_id)!;
      if (existing.measurement === "grams" && measurement === "grams") {
        existing.amount += Number(amount);
      }
      // don't change units logic otherwise
    }

    // compute contribution
    let contribution = 0;
    if (measurement === "grams" && per_100g != null) {
      contribution = (Number(per_100g) * Number(amount)) / 100;
    } else if (measurement === "unit" && per_unit != null) {
      contribution = Number(per_unit) * Number(amount);
    } else {
      contribution = 0;
    }

    const key = nutrient_name;
    if (!nutrientMap.has(key)) {
      nutrientMap.set(key, {
        nutrient: nutrient_name,
        unit: nutrient_unit,
        total: contribution,
      });
    } else {
      const cur = nutrientMap.get(key)!;
      cur.total += contribution;
    }
  }

  return {
    nutrients: Array.from(nutrientMap.values()),
    items: Array.from(itemMap.values()),
  };
}
