import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { getLedger } from "../../services/trading/ownershipLedgerService.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const ledger = await getLedger(req.company.id);
    res.status(200).json({ success: true, ledger });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
