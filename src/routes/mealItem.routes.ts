import { Router } from "express";
import {
  createMealItem,
  updateMealItem,
  deleteMealItem,
  getMealItemById,
  getAllMealItems,
} from "../controllers/mealItem.controller";

const router = Router();

router.get("/", getAllMealItems);
router.get("/:Item_id", getMealItemById);
router.post("/", createMealItem);
router.patch("/:id", updateMealItem);
router.delete("/:id", deleteMealItem);

export default router;
