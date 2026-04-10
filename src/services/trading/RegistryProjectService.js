import { RegistryProject } from "../../models/index.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Sync verified projects (upsert)
 */
export const syncRegistryProjects = async (projects) => {
  for (const p of projects) {
    await RegistryProject.upsert({
      id: uuidv4(),
      registry_id: p.id,
      verification_body: p.verification_body,
      project_name: p.name,
      country: p.country,
      status: p.status,
      last_synced: new Date(),
    });
  }
};

/**
 * List verified projects with optional filters
 */
export const listRegistryProjects = async (filters = {}) => {
  const where = {};
  if (filters.registry_body) where.verification_body = filters.registry_body;
  if (filters.country) where.country = filters.country;

  return await RegistryProject.findAll({
    where,
    order: [["last_synced", "DESC"]],
  });
};
