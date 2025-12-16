import express from "express";
import { getMeals, getMeal } from "../controllers/meal.controller";

const router = express.Router();

router.get("/", getMeals);
router.get("/:mealId", getMeal);

export default router;
