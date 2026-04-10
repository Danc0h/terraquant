import { getProjectAnalytics } from "./envProjectService.js";
import { getGeoAnalytics } from "./envGeoService.js";

export async function getEnvAnalytics({ projectId, polygon }) {
  if (projectId) {
    return await getProjectAnalytics(projectId);
  }

  if (polygon) {
    return await getGeoAnalytics(polygon);
  }

  return {
    type: "default",
    message: "Select area or project",
  };
}
