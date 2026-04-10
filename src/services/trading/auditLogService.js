import { AuditLog } from "../../models/index.js";

export const logAction = async (
  companyId,
  actionType,
  entityType,
  entityId,
  metadata = {},
) => {
  try {
    return await AuditLog.create({
      Company_id: companyId,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    });
  } catch (err) {
    console.error("Error logging action:", err);
    throw err;
  }
};
