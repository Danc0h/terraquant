import { Order, Trade, sequelize } from "../../models/index.js";
import { settleTrade } from "./settlementService.js";
import { CarbonBatch } from "../../models/index.js";
import { Op } from "sequelize";

export const placeOrder = async ({
  companyId,
  batchId,
  side,
  price,
  quantity,
}) => {
  return await sequelize.transaction(async (t) => {
    const order = await Order.create(
      {
        company_id: companyId,
        batch_id: batchId,
        side,
        price,
        quantity,
        remaining_quantity: quantity,
        status: "OPEN",
      },
      { transaction: t },
    );

    await matchOrders(order, t);

    return order;
  });
};

const matchOrders = async (incomingOrder, t) => {
  const oppositeSide = incomingOrder.side === "BUY" ? "SELL" : "BUY";

  const priceCondition =
    incomingOrder.side === "BUY"
      ? { price: { [Op.lte]: incomingOrder.price } }
      : { price: { [Op.gte]: incomingOrder.price } };

  const bookOrders = await Order.findAll({
    where: {
      batch_id: incomingOrder.batch_id,
      side: oppositeSide,
      status: "OPEN",
      ...priceCondition,
    },
    order: [
      ["price", incomingOrder.side === "BUY" ? "ASC" : "DESC"],
      ["createdAt", "ASC"],
    ],
    transaction: t,
  });

  for (const bookOrder of bookOrders) {
    if (incomingOrder.remaining_quantity <= 0) break;

    const tradeQty = Math.min(
      incomingOrder.remaining_quantity,
      bookOrder.remaining_quantity,
    );

    const tradePrice = bookOrder.price;

    await executeTrade(
      {
        buyOrder: incomingOrder.side === "BUY" ? incomingOrder : bookOrder,
        sellOrder: incomingOrder.side === "SELL" ? incomingOrder : bookOrder,
        price: tradePrice,
        quantity: tradeQty,
      },
      t,
    );

    incomingOrder.remaining_quantity -= tradeQty;
    bookOrder.remaining_quantity -= tradeQty;

    if (bookOrder.remaining_quantity === 0) {
      bookOrder.status = "FILLED";
    } else {
      bookOrder.status = "PARTIAL";
    }

    await bookOrder.save({ transaction: t });
  }

  if (incomingOrder.remaining_quantity === 0) {
    incomingOrder.status = "FILLED";
  } else if (incomingOrder.remaining_quantity < incomingOrder.quantity) {
    incomingOrder.status = "PARTIAL";
  }

  await incomingOrder.save({ transaction: t });
};

const executeTrade = async ({ buyOrder, sellOrder, price, quantity }, t) => {
  await Trade.create(
    {
      buy_order_id: buyOrder.id,
      sell_order_id: sellOrder.id,
      buyer_id: buyOrder.company_id,
      seller_id: sellOrder.company_id,
      batch_id: buyOrder.batch_id,
      price,
      quantity,
    },
    { transaction: t },
  );

  // update last trade price
  await CarbonBatch.update(
    { last_trade_price: price },
    { where: { id: buyOrder.batch_id }, transaction: t },
  );

  await settleTrade(
    sellOrder.company_id,
    buyOrder.company_id,
    buyOrder.batch_id,
    quantity,
    price,
    t,
  );
};
