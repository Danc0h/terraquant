import { Order, OrderBookSnapshot, CarbonBatch } from "../../models/index.js";
import { Op } from "sequelize";

export const snapshotOrderBook = async (batchId, t = null) => {
  const bids = await Order.findAll({
    where: {
      batch_id: batchId,
      side: "BUY",
      status: "OPEN",
    },
    attributes: ["price", "remaining_quantity"],
    order: [["price", "DESC"]],
    transaction: t,
  });

  const asks = await Order.findAll({
    where: {
      batch_id: batchId,
      side: "SELL",
      status: "OPEN",
    },
    attributes: ["price", "remaining_quantity"],
    order: [["price", "ASC"]],
    transaction: t,
  });

  const format = (orders) => {
    const book = {};

    orders.forEach((o) => {
      const price = parseFloat(o.price);

      if (!book[price]) {
        book[price] = 0;
      }

      book[price] += parseFloat(o.remaining_quantity);
    });

    return Object.entries(book).map(([price, quantity]) => ({
      price: parseFloat(price),
      quantity,
    }));
  };

  const formattedBids = format(bids);
  const formattedAsks = format(asks);

  const snapshot = await OrderBookSnapshot.create(
    {
      batch_id: batchId,
      bids: formattedBids,
      asks: formattedAsks,
    },
    { transaction: t },
  );

  // -------- SPOT PRICE --------

  const bestBid = formattedBids[0]?.price || null;
  const bestAsk = formattedAsks[0]?.price || null;

  let spot = null;

  if (bestBid !== null && bestAsk !== null) {
    spot = (bestBid + bestAsk) / 2;
  }
  {
    spot = (bestBid + bestAsk) / 2;
  }

  await CarbonBatch.update(
    { spot_price: spot },
    { where: { id: batchId }, transaction: t },
  );

  return snapshot;
};
