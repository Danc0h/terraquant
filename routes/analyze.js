import express from "express";
import { getNDVI } from "../services/ndviService.js";
import { reverseGeocode, searchPlace } from "../services/geoService.js";
import { getWeather } from "../services/weatherService.js";
import { calculateCarbon } from "../utils/carbonCalculator.js";

const router = express.Router();

/**
 * POST /api/analyze
 * body: { lat, lng }
 */
router.post("/analyze", async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Latitude and longitude required" });
  }

  try {
    const ndvi = await getNDVI(lat, lng);
    const carbonData = calculateCarbon(ndvi);
    const location = await reverseGeocode(lat, lng);
    const weather = await getWeather(lat, lng);

    res.json({
      location,
      ndvi,
      ...carbonData,
      weather,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Analysis failed" });
  }
});

/**
 * GET /api/search?query=Paris
 */
router.get("/search", async (req, res) => {
  const { query } = req.query;

  if (!query) return res.status(400).json({ error: "Query required" });

  try {
    const results = await searchPlace(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
