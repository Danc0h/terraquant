import ee from "@google/earthengine";

// =========================
// 🌿 NDVI TILE GENERATOR
// =========================
export const getNDVITile = (image, region) => {
  return new Promise((resolve, reject) => {
    try {
      const ndvi = image.normalizedDifference(["B8", "B4"]);

      const visParams = {
        min: 0,
        max: 1,
        palette: ["red", "yellow", "green"],
      };

      ndvi.getMap(visParams, (map, err) => {
        if (err) return reject(err);

        resolve({
          mapId: map.mapid,
          token: map.token,
        });
      });
    } catch (err) {
      reject(err);
    }
  });
};

// =========================
// 🌿 MAIN VEGETATION SERVICE
// =========================
export const getVegetationIndices = async (coordinates) => {
  return new Promise((resolve, reject) => {
    try {
      const region = ee.Geometry.Polygon([coordinates]);

      const image = ee
        .ImageCollection("COPERNICUS/S2_SR")
        .filterBounds(region)
        .filterDate("2023-01-01", "2023-12-31")
        .sort("CLOUDY_PIXEL_PERCENTAGE")
        .first();
      if (!image) {
        return resolve({
          ndvi: 0,
          evi: 0,
          ndviTile: null,
        });
      }
      // =========================
      // NDVI
      // =========================
      const ndvi = image.normalizedDifference(["B8", "B4"]);

      // =========================
      // EVI
      // =========================
      const evi = image.expression(
        "2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))",
        {
          NIR: image.select("B8"),
          RED: image.select("B4"),
          BLUE: image.select("B2"),
        },
      );

      // =========================
      // 📊 REDUCE REGION (NUMBERS)
      // =========================
      const stats = ee.Image.cat([
        ndvi.rename("ndvi"),
        evi.rename("evi"),
      ]).reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: region,
        scale: 10,
        maxPixels: 1e9,
      });

      stats.evaluate(async (result) => {
        try {
          // =========================
          // 🗺️ NDVI TILE (VISUAL)
          // =========================
          const tile = await getNDVITile(image, region);

          resolve({
            ndvi: result?.ndvi || 0,
            evi: result?.evi || 0,

            // 🔥 include tile
            ndviTile: tile,
          });
        } catch (tileErr) {
          reject(tileErr);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};
