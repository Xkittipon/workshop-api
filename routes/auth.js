import express from "express";
const router = express.Router();
import { register, login, currentUser } from "../controllers/auth.js";
import { authCheck, adminCheck } from "../middlewares/authCheck.js";

router.post("/register", register);
router.post("/login", login);
router.post("/current-user", authCheck, currentUser);
router.post("/current-admin", authCheck, adminCheck, currentUser); // Assuming you want to allow GET as well

export default router;
