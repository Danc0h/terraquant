// services/trading/verificationService.js
import { syncRegistryProjects } from "./RegistryProjectService.js";
import { fetchRegistryProjectsFromVerra } from "../../utils/verraAPI.js";

export const updateRegistryProjects = async () => {
  try {
    const projects = await fetchRegistryProjectsFromVerra();
    await syncRegistryProjects(projects);
    return projects.length; // optional info
  } catch (error) {
    console.error("Error updating verified projects:", error);
    throw error;
  }
};
