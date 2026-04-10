import { OwnershipLedger, CarbonBatch, Company } from "../../models/index.js";

/**
 * Get ledger for a company with batch info
 */
export const getLedger = async (companyId) => {
  return await OwnershipLedger.findAll({
    where: { company_id: companyId },
    include: [
      {
        model: CarbonBatch,
        as: "batch",
        attributes: ["id", "name", "quantity", "created_at"], // select only needed columns
      },
      {
        model: Company,
        as: "owner",
        attributes: ["id", "name"],
      },
    ],
    order: [["created_at", "DESC"]],
  });
};
