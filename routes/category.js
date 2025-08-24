import express from "express";
import {
  createCategory,
  listCategory,
  removeCategory,
} from "../controllers/category.js";
import { authCheck, adminCheck } from "../middlewares/authCheck.js";
const router = express.Router();

router.post("/category", authCheck, adminCheck, createCategory);
router.get("/category", listCategory);
router.delete("/category/:id", authCheck, adminCheck, removeCategory);

export default router;
