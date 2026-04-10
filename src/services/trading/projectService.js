import { Project, RegistryProject } from "../../models/index.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a new project for a company
 */
export const createProject = async (companyId, data) => {
  const {
    name,
    country,
    methodology,
    registry_body,
    registry_account_id,
    registry_account_name,
  } = data;

  const project = await Project.create({
    id: uuidv4(),
    company_id: companyId,
    name,
    country,
    methodology,
    registry_body,
    registry_account_id,
    registry_account_name,
    verified_status: "PENDING",
    lifecycle_status: "ACTIVE",
  });

  return project;
};
export const listCompanyProjects = async (companyId) => {
  return await Project.findAll({
    where: { company_id: companyId },
    include: [
      {
        model: CarbonBatch,
        as: "batches",
        required: false,
      },
    ],
    order: [["created_at", "DESC"]],
  });
};

/*
|--------------------------------------------------------------------------
| Marketplace Projects (Sellable Only)
|--------------------------------------------------------------------------
*/
export const listAllProjects = async () => {
  return await Project.findAll({
    where: {
      lifecycle_status: "ACTIVE",
    },
    include: [
      {
        model: CarbonBatch,
        as: "batches",
        where: {
          status: "ACTIVE",
          available_quantity: { [Op.gt]: 0 },
        },
        required: true,
      },
    ],
    order: [["created_at", "DESC"]],
  });
};

/*
|--------------------------------------------------------------------------
| Get Single Project
|--------------------------------------------------------------------------
*/
export const getProjectById = async (projectId, companyId = null) => {
  const project = await Project.findByPk(projectId, {
    include: [
      {
        model: CarbonBatch,
        as: "batches",
      },
    ],
  });

  if (!project) throw new Error("Project not found");

  // Owner sees everything
  if (companyId && project.company_id === companyId) {
    return project;
  }

  // Public / Buyer view → filter sellable batches only
  const filteredBatches = project.batches.filter(
    (b) => b.status === "ACTIVE" && Number(b.available_quantity) > 0,
  );

  return {
    ...project.toJSON(),
    batches: filteredBatches,
  };
};
