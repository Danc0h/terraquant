// backend/src/services/analytics/env/envProjectService.js

import { Project, CarbonBatch } from "../../models/index";

// Mock NDVI + conversion factor (MVP)
const MOCK_NDVI = [0.65, 0.67, 0.68, 0.69];
const CARBON_CONVERSION_FACTOR = 2.4;

export async function getProjectAnalytics(projectId) {
  const project = await Project.findByPk(projectId, {
    include: [{ model: CarbonBatch }],
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const areaHa = project.area || 1000;

  const avgNDVI =
    MOCK_NDVI.reduce((sum, val) => sum + val, 0) / MOCK_NDVI.length;

  const carbonEstimate = areaHa * avgNDVI * CARBON_CONVERSION_FACTOR;
  const riskScore = 1 - avgNDVI;
  return {
    type: "project",
    projectName: project.name,

    areaHectares: areaHa, // ✅ rename

    ndvi: avgNDVI, // ✅ unify naming
    vegetationScore: avgNDVI,

    carbonEstimate: Number(carbonEstimate.toFixed(2)), // ✅ rename
    riskScore: Math.floor((1 - avgNDVI) * 100), // ✅ make it %

    ndviTrend: MOCK_NDVI,
  };
}
