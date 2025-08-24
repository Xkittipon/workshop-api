import express from "express";
const router = express.Router();
import { authCheck } from "../middlewares/authCheck.js";
import { payment } from "../controllers/stripe.js";

router.post("/user/create-payment-intent", authCheck, payment);

export default router;
