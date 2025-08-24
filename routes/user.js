import express from "express";
const router = express.Router();
import {
  changeRole,
  changeStatus,
  getUserCart,
  listUser,
  userCart,
  deleteUserCart,
  saveAddress,
  saveOrder,
  getOrder,
} from "../controllers/user.js";
import { authCheck, adminCheck } from "../middlewares/authCheck.js";

// Admin routes
router.get("/users", authCheck, adminCheck, listUser);
router.post("/change-status", authCheck, adminCheck, changeStatus);
router.post("/change-role", authCheck, adminCheck, changeRole);

router.post("/user/cart", authCheck, userCart);
router.get("/user/cart", authCheck, getUserCart);
router.delete("/user/cart", authCheck, deleteUserCart);

router.post("/user/address", authCheck, saveAddress);

router.post("/user/order", authCheck, saveOrder);
router.get("/user/order", authCheck, getOrder);

export default router;
