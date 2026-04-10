import * as turf from "@turf/turf";
import { getVegetationIndices } from "./vegetationService.js";

export const analyzeArea = async (req, res) => {
  try {
    const { polygon } = req.body;

    const coordinates = polygon.map((p) => [p.longitude, p.latitude]);
    coordinates.push(coordinates[0]);

    const geojson = turf.polygon([coordinates]);

    // =========================
    // 🌍 AREA
    // =========================
    const areaSqMeters = turf.area(geojson);
    const areaHectares = areaSqMeters / 10000;

    // =========================
    // 🌿 NDVI + EVI
    // =========================
    const { ndvi, evi, ndviTile } = await getVegetationIndices(coordinates);
    console.log("NDVI TILE:", ndviTile);
    // =========================
    // 🌳 IMPROVED BIOMASS MODEL
    // =========================
    const vegetationScore = (ndvi + evi) / 2;

    const agb = vegetationScore * 120; // tons/hectare (scaled model)

    const carbonEstimate = areaHectares * agb * 0.47;

    // =========================
    // ⚠️ RISK MODEL
    // =========================
    const riskScore = Math.floor(100 - vegetationScore * 100);

    return res.json({
      areaHectares: areaHectares.toFixed(2),

      ndvi: ndvi.toFixed(3),
      evi: evi.toFixed(3),

      ndviTile, // 🔥 ADD THIS

      vegetationScore: vegetationScore.toFixed(3),

      agb: agb.toFixed(2),
      carbonEstimate: carbonEstimate.toFixed(2),

      riskScore,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({ message: "Vegetation analysis failed" });
  }
};
