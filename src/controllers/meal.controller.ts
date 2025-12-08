// src/controllers/meal.controller.ts
import type { Request, Response } from "express";
import { mealIdParam } from "../schemas/meal.schemas";
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
