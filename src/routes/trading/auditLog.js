import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { AuditLog } from "../../models/index.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const logs = await AuditLog.findAll({ order: [["created_at", "DESC"]] });
    res.status(200).json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
