import { getMealRawData } from "../repositories/meals.repo";
import { calculateMealNutrients } from "../utils/nutritientsCalculator";

export async function getMealDetails(mealId: number) {
  const rows = await getMealRawData(mealId);
  if (!rows || rows.length === 0) return null;
  const result = calculateMealNutrients(rows);
  return result;
}
