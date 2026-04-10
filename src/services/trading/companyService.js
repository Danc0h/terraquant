import { CarbonBatch, Project, RegistryProject } from "../../models/index.js";
import { v4 as uuidv4 } from "uuid";
import { logAction } from "./auditLogService.js";

/**
 * Create a company-owned batch
 */
export const createBatch = async (companyId, projectId, data) => {
  const project = await Project.findOne({
    where: { id: projectId, company_id: companyId },
  });

  if (!project) throw new Error("Project not found or unauthorized");

  const batch = await CarbonBatch.create({
    id: uuidv4(),
    project_id: projectId,
    vintage_year: data.vintageYear,
    total_quantity: data.totalQuantity,
    available_quantity: data.availableQuantity ?? data.totalQuantity,
    price_per_unit_usd: data.pricePerUnitUSD,
    issuance_date: data.issuanceDate,
    status: data.status || "PENDING",
    verified_status: project.verified_status || "UNVERIFIED",
  });

  await logAction(companyId, "SUBMIT_BATCH", "CarbonBatch", batch.id, {
    projectId,
  });

  return batch;
};

/**
 * Create externally verified batch (from registry projects)
 */
export const createVerifiedBatch = async (RegistryProjectId, data) => {
  const registryProj = await RegistryProject.findByPk(RegistryProjectId);
  if (!registryProj) throw new Error("Verified project not found");

  return await CarbonBatch.create({
    id: uuidv4(),
    project_id: data.projectId ?? null, // optional link to internal project
    vintage_year: data.vintageYear,
    total_quantity: data.totalQuantity,
    available_quantity: data.availableQuantity ?? data.totalQuantity,
    price_per_unit_usd: data.pricePerUnitUSD,
    issuance_date: data.issuanceDate,
    status: data.status || "ACTIVE",
    verified_status: "EXTERNAL_VERIFIED",
  });
};

/**
 * List all tradable batches (marketplace)
 */
export const listBatches = async () => {
  return await CarbonBatch.findAll({
    where: {
      status: "ACTIVE", // only tradable
    },
    include: [
      {
        model: Project,
        as: "project",
        required: false,
      },
      {
        model: RegistryProject,
        as: "verification_record",
        required: false,
      },
    ],
    order: [["created_at", "DESC"]],
  });
};
