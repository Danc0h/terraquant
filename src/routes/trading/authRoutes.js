import express from "express";
import {
  signupCompany,
  loginCompany,
  getMe,
} from "../../services/trading/authService.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signupCompany);
router.post("/signin", loginCompany);
router.get("/me", protect, getMe);

export default router;
