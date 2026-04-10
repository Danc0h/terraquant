import {
  CarbonBatch,
  Project,
  RegistryProject,
  OwnershipLedger,
} from "../../models/index.js";

import { v4 as uuidv4 } from "uuid";
import { logAction } from "./auditLogService.js";
import { Op } from "sequelize";

/**
 * =========================================
 * CREATE INTERNAL BATCH (COMPANY OWNED)
 * =========================================
 */
export const createBatch = async (companyId, projectId, data) => {
  const project = await Project.findOne({
    where: { id: projectId, company_id: companyId },
  });

  if (!project) throw new Error("Project not found or unauthorized");

  const batch = await CarbonBatch.create({
    id: uuidv4(),
    project_id: projectId,

    vintage_year: data.vintage_year,
    total_quantity: data.total_quantity,
    available_quantity: data.available_quantity ?? data.total_quantity,

    price_per_unit_usd: data.price_per_unit_usd,
    issuance_date: data.issuance_date,

    // Exchange defaults
    spot_price: data.price_per_unit_usd,
    last_trade_price: data.price_per_unit_usd,

    status: data.status || "ACTIVE",

    // ✅ FIXED ENUM LOGIC
    verified_status: "INTERNAL_VERIFIED",
  });

  await logAction(companyId, "CREATE_BATCH", "CarbonBatch", batch.id, {
    projectId,
  });

  return batch;
};

/**
 * =========================================
 * CREATE EXTERNAL VERIFIED BATCH
 * =========================================
 */
export const createVerifiedBatch = async (registryProjectId, data) => {
  const registry = await RegistryProject.findByPk(registryProjectId);
  if (!registry) throw new Error("Registry project not found");

  const batch = await CarbonBatch.create({
    id: uuidv4(),
    project_id: data.project_id,

    vintage_year: data.vintage_year,
    total_quantity: data.total_quantity,
    available_quantity: data.available_quantity ?? data.total_quantity,

    price_per_unit_usd: data.price_per_unit_usd,
    issuance_date: data.issuance_date,

    spot_price: data.price_per_unit_usd,
    last_trade_price: data.price_per_unit_usd,

    status: data.status || "ACTIVE",

    // ✅ VALID ENUM
    verified_status: "EXTERNAL_VERIFIED",
  });

  await logAction(null, "CREATE_VERIFIED_BATCH", "CarbonBatch", batch.id, {
    registryProjectId,
  });

  return batch;
};

/**
 * =========================================
 * LIST BATCHES
 * =========================================
 */
export const listBatches = async (companyId, query = {}) => {
  const { mine } = query;

  // =========================================
  // 🏢 COMPANY INVENTORY
  // =========================================
  if (mine === "true") {
    return await CarbonBatch.findAll({
      include: [
        {
          model: Project,
          as: "project",
          where: { company_id: companyId },
          attributes: ["id", "name", "company_id"],
        },
        {
          model: OwnershipLedger,
          as: "ownership_records",
          required: false,
          where: { company_id: companyId },
          attributes: ["id", "quantity", "created_at"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  // =========================================
  // 🌍 MARKET (EXCHANGE VIEW)
  // =========================================
  return await CarbonBatch.findAll({
    where: {
      status: "ACTIVE",
    },
    include: [
      {
        model: Project,
        as: "project",
        attributes: ["id", "name", "company_id"],
      },
    ],
    order: [["created_at", "DESC"]],
  });
};
