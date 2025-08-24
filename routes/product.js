import express from "express";
import {
  addProduct,
  listby,
  listProduct,
  readProduct,
  removeProduct,
  searchFilters,
  updateProduct,
  addImages,
  removeImage,
} from "../controllers/product.js";
import { authCheck, adminCheck } from "../middlewares/authCheck.js";
const router = express.Router();

router.post("/product", addProduct);
router.get("/products/:count", listProduct);
router.get("/product/:id", readProduct);
router.put("/product/:id", updateProduct);
router.delete("/product/:id", removeProduct);
router.post("/productby", listby);
router.post("/search/filters", searchFilters);

router.post("/images", authCheck, adminCheck, addImages);
router.post("/removeimage", authCheck, adminCheck, removeImage);

export default router;
