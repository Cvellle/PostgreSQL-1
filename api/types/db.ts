// src/types/db.d.ts
export type MealItemRow = {
  item_id: number;
  quantity: number;
  measurement: string;
  nutrient_id: number;
  nutrient_name: string;
  nutrient_unit: string;
  per_100g: number | null;
  per_unit: number | null;
  item_name: string;
};
