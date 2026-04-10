import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  createBatch,
  listBatches,
} from "../../services/trading/carbonBatchService.js";

const router = express.Router();

/**
 * POST /trading/batches
 * Body (camelCase):
 * - projectId (required)
 * - vintageYear
 * - totalQuantity
 * - pricePerUnitUSD
 * - issuanceDate
 * Optional:
 * - availableQuantity
 * - status
 */
router.post("/", protect, async (req, res) => {
  try {
    const companyId = req.company?.id;
    if (!companyId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { projectId, ...batchData } = req.body;

    if (!projectId)
      return res
        .status(400)
        .json({ success: false, message: "projectId is required" });

    const batch = await createBatch(companyId, projectId, batchData);

    res.status(201).json({ success: true, batch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /trading/batches
 * Query params: projectId (optional)
 */
router.get("/", protect, async (req, res) => {
  try {
    const companyId = req.company?.id;

    const batches = await listBatches(companyId, req.query);

    res.status(200).json({ success: true, batches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
