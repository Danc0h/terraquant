import express from "express";
import { createOrder } from "../../services/trading/orderService.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/place", protect, async (req, res, next) => {
  try {
    const { batchId, side, price, quantity } = req.body;

    const order = await createOrder({
      companyId: req.company.id,
      batchId,
      side,
      price,
      quantity,
      orderType: "LIMIT",
      timeInForce: "GTC",
    });

    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.delete("/:orderId", protect, async (req, res, next) => {
  try {
    const order = await cancelOrder(req.params.orderId, req.company.id);

    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.get("/trades/:batchId", async (req, res, next) => {
  try {
    const trades = await getRecentTrades(req.params.batchId);

    res.json(trades);
  } catch (err) {
    next(err);
  }
});

export default router;
