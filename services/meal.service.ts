import { createMealsRepository } from "../repositories/meals.repo";
import { calculateMealNutrients } from "../utils/nutritientsCalculator";

const mealsRepo = createMealsRepository();

export async function getMealDetails(mealId: number) {
  const rows = await mealsRepo.getRawData(mealId);
  if (!rows || rows.length === 0) return null;
  const result = calculateMealNutrients(rows);
  return result;
}
