// src/schemas/meal.schemas.ts
import { z } from "zod";

export const mealIdParam = z.object({
  mealId: z.string().regex(/^\d+$/).transform(Number),
});

export type MealIdParsed = z.infer<typeof mealIdParam>;
