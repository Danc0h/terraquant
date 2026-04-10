import { placeOrder } from "./matchingEngine.js";
import { snapshotOrderBook } from "./OrderBookService.js";

export const createOrder = async ({
  companyId,
  batchId,
  side,
  price,
  quantity,
  orderType,
  timeInForce,
}) => {
  const order = await placeOrder({
    companyId,
    batchId,
    side,
    price,
    quantity,
    orderType,
    timeInForce,
  });

  await snapshotOrderBook(batchId);

  return order;
};

export const cancelOrder = async (orderId, companyId) => {
  const order = await Order.findByPk(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.company_id !== companyId) {
    throw new Error("Unauthorized");
  }

  if (order.status === "FILLED" || order.status === "CANCELLED") {
    throw new Error("Order cannot be cancelled");
  }

  // unlock credits if SELL order
  if (order.side === "SELL") {
    const ledger = await OwnershipLedger.findOne({
      where: {
        company_id: companyId,
        batch_id: order.batch_id,
      },
    });

    ledger.locked_quantity -= order.remaining_quantity;

    await ledger.save();
  }

  order.status = "CANCELLED";

  await order.save();

  await snapshotOrderBook(order.batch_id);

  return order;
};
