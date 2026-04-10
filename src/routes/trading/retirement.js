import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { retireCredits } from "../../services/trading/retirementService.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const retirement = await retireCredits(req.company.id, req.body);
    res.status(201).json({ success: true, retirement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
