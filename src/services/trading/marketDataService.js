import { Trade } from "../../models/index.js";

export const getRecentTrades = async (batchId) => {
  const trades = await Trade.findAll({
    where: { batch_id: batchId },
    order: [["createdAt", "DESC"]],
    limit: 50,
  });

  return trades;
};

export const getTicker = async (batchId) => {
  const lastTrade = await Trade.findOne({
    where: { batch_id: batchId },
    order: [["createdAt", "DESC"]],
  });

  if (!lastTrade) {
    return { lastPrice: null };
  }

  return {
    lastPrice: lastTrade.price,
    lastQuantity: lastTrade.quantity,
    time: lastTrade.createdAt,
  };
};

import { Op } from "sequelize";

export const get24hVolume = async (batchId) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const volume = await Trade.sum("quantity", {
    where: {
      batch_id: batchId,
      createdAt: { [Op.gte]: since },
    },
  });

  return volume || 0;
};
