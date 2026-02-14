export function calculateCarbon(ndvi) {
  if (ndvi > 0.6)
    return { vegetationLevel: "High", carbonEstimate: "15 tons CO2/ha/year" };
  if (ndvi > 0.3)
    return { vegetationLevel: "Medium", carbonEstimate: "8 tons CO2/ha/year" };
  return { vegetationLevel: "Low", carbonEstimate: "2 tons CO2/ha/year" };
}
