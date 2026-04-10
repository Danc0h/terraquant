// backend/src/routes/analytics/analyticsRoutes.js

import express from "express";
import { analyzeArea } from "../../services/analytics/envGeoService.js";
// future:
// import { getProjectAnalytics } from "../../services/analytics/env/envProjectService.js";

const router = express.Router();

// =========================
// 🌍 EXPLORE MODE (POLYGON)
// =========================
router.post("/area-insights", analyzeArea);

// =========================
// 🏢 PROJECT MODE (FUTURE)
// =========================
// router.get("/project/:id", async (req, res) => {
//   try {
//     const data = await getProjectAnalytics(req.params.id);
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

export default router;
