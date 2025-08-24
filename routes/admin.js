import express from "express";
const router = express.Router();
import { changeOrderStatus, getOrdersAdmin } from "../controllers/admin.js";
import { authCheck } from "../middlewares/authCheck.js";

router.put("/admin/order-status", authCheck, changeOrderStatus);
router.get("/admin/orders", authCheck, getOrdersAdmin);

export default router;
