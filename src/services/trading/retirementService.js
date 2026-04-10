import { OwnershipLedger, Retirement } from "../../models/index.js";
import { v4 as uuidv4 } from "uuid";
import { logAction } from "./auditLogService.js";
import { sequelize } from "../../models/index.js";

export const retireCredits = async (
  companyId,
  { ledgerId, quantity, reason },
) => {
  return await sequelize.transaction(async (t) => {
    const ledger = await OwnershipLedger.findByPk(ledgerId, { transaction: t });
    if (!ledger) throw new Error("Ledger entry not found");
    if (ledger.company_id !== companyId) throw new Error("Unauthorized");

    if (quantity > parseFloat(ledger.quantity))
      throw new Error("Not enough credits to retire");

    const retirement = await Retirement.create(
      {
        id: uuidv4(),
        ledger_id: ledgerId,
        quantity,
        retirement_reason: reason,
        retired_at: new Date(),
      },
      { transaction: t },
    );

    await logAction(companyId, "RETIRE_CREDITS", "Retirement", retirement.id, {
      ledgerId,
      quantity,
    });
    return retirement;
  });
};
