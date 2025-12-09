// src/utils/nutrientCalculator.ts
// import type { MealItemRow } from "../types/db.ts";

type MealItemRow = {
  item_id: number;
  item_name: string;
  quantity: number | string;
  measurement: string;
  nutrient_name: string;
  nutrient_unit: string;
  per_100g: number | null;
  per_unit: number | null;
};

type NutrientTotal = {
  nutrient: string;
  unit: string;
  total: number;
};

type ItemSummary = {
  name: string;
  quantity: number;
  measurement: string;
};

export function calculateMealNutrients(rows: MealItemRow[]): {
  nutrients: NutrientTotal[];
  items: ItemSummary[];
} {
  const nutrientMap = new Map<string, NutrientTotal>();

  // Map to track if we've already counted quantity for an item_id
  const itemMap = new Map<number, ItemSummary>();

  // We'll only add quantity once per item_id to avoid duplication
  const countedItemIds = new Set<number>();

  for (const row of rows) {
    const {
      item_id,
      item_name,
      quantity,
      measurement,
      nutrient_name,
      nutrient_unit,
      per_100g,
      per_unit,
    } = row;

    // Store quantity and measurement once per item
    if (!itemMap.has(item_id)) {
      itemMap.set(item_id, {
        name: item_name,
        quantity: Number(quantity),
        measurement,
      });
      countedItemIds.add(item_id);
    }

    // Calculate nutrient contribution per row (per nutrient)
    let contribution = 0;
    if (measurement === "grams" && per_100g != null) {
      contribution = (Number(per_100g) * Number(quantity)) / 100;
    } else if (measurement === "unit" && per_unit != null) {
      contribution = Number(per_unit) * Number(quantity);
    } else {
      contribution = 0;
    }

    // Aggregate nutrient totals
    const key = nutrient_name.toLowerCase(); // Normalize key
    if (!nutrientMap.has(key)) {
      nutrientMap.set(key, {
        nutrient: nutrient_name,
        unit: nutrient_unit,
        total: contribution,
      });
    } else {
      nutrientMap.get(key)!.total += contribution;
    }
  }

  return {
    nutrients: Array.from(nutrientMap.values()),
    items: Array.from(itemMap.values()),
  };
}
