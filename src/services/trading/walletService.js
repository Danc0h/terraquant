import { sequelize, CompanyWallet, WalletLedger } from "../../models/index.js";

export async function creditWallet(walletId, amount, reference = {}, t = null) {
  const transaction = t || (await sequelize.transaction());

  try {
    console.log("➡️ creditWallet called");
    console.log("Wallet ID:", walletId);
    console.log("Amount:", amount);

    // ✅ Atomic update (NO instance mutation)
    await CompanyWallet.update(
      {
        balance: sequelize.literal(`balance + ${parseFloat(amount)}`),
      },
      {
        where: { id: walletId },
        transaction,
      },
    );

    // ✅ Fetch updated wallet
    const updatedWallet = await CompanyWallet.findByPk(walletId, {
      transaction,
    });

    console.log("After balance (DB):", updatedWallet.balance);

    /* await WalletLedger.create(
      {
        wallet_id: walletId,
        type: "deposit",
        amount: amount,
      },
      { transaction },
    );*/

    if (!t) await transaction.commit();

    return updatedWallet;
  } catch (error) {
    console.error("❌ creditWallet ERROR:", error.message);

    if (!t) await transaction.rollback();
    throw error;
  }
}

export async function debitWallet(walletId, amount, reference = {}) {
  const transaction = await sequelize.transaction();

  try {
    const wallet = await CompanyWallet.findByPk(walletId, { transaction });

    if (parseFloat(wallet.balance) < parseFloat(amount)) {
      throw new Error("Insufficient wallet balance");
    }

    wallet.balance = parseFloat(wallet.balance) - parseFloat(amount);

    await wallet.save({ transaction });

    await WalletLedger.create(
      {
        wallet_id: walletId,
        type: "trade_debit",
        amount: -amount,
        reference_type: reference.type || null,
        reference_id: reference.id || null,
        description: reference.description || "Wallet debit",
      },
      { transaction },
    );

    await transaction.commit();

    return wallet;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export const getWallet = async (companyId) => {
  const wallet = await CompanyWallet.findOne({
    where: { company_id: companyId },
  });

  if (!wallet) throw new Error("Wallet not found");

  return wallet;
};
