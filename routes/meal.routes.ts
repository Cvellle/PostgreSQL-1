import express from "express";
import {
  getMeals,
  getMeal,
  createMealAndItems,
  updateMealScore,
} from "../controllers/meal.controller";

const router = express.Router();

router.get("/", getMeals);
router.get("/:mealId", getMeal);
router.post("/create", createMealAndItems);
router.patch("/:mealId/score", updateMealScore);

export default router;
