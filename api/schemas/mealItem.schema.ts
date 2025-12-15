import { z } from "zod";

export const createMealItemSchema = z.object({
  meal_id: z.number().int().positive(),
  item_id: z.number().int().positive(),
  quantity: z.number().positive(),
  measurement: z.enum(["grams", "unit"]),
});

export const updateMealItemSchema = z.object({
  quantity: z.number().positive().optional(),
  measurement: z.enum(["grams", "unit"]).optional(),
});
