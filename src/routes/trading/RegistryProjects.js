import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { listRegistryProjects } from "../../services/trading/RegistryProjectService.js";

const router = express.Router();

/**
 * GET /trading/verified-projects
 * List verified projects
 */
router.get("/", protect, async (req, res) => {
  try {
    const { registry_body, country } = req.query;
    const projects = await listRegistryProjects({ registry_body, country });
    res.status(200).json({ success: true, projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
