import express from "express";
import { getMealController } from "../controllers/meal.controller";

const router = express.Router();

router.get("/:mealId", getMealController);

export default router;
