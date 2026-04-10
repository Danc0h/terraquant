export const settleTrade = async (
  sellerId,
  buyerId,
  batchId,
  quantity,
  price,
  t,
) => {
  const value = quantity * price;

  await debitWallet(buyerId, value, t);

  await creditWallet(sellerId, value, t);

  await transferCredits(sellerId, buyerId, batchId, quantity, t);
};
