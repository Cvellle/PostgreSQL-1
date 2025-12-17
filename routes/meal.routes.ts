import express from "express";
import {
  getMeals,
  getMeal,
  createMealAndItems,
} from "../controllers/meal.controller";

const router = express.Router();

router.get("/", getMeals);
router.get("/:mealId", getMeal);
router.get("/create", createMealAndItems);

export default router;
