import express from "express";
import {
  createDepositIntent,
  handleStripeWebhook,
} from "../../services/trading/paymentService.js";

import { getWallet } from "../../services/trading/walletService.js";

import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

// ============================
// WALLET BALANCE
// ============================

router.get("/wallet", protect, async (req, res, next) => {
  try {
    const wallet = await getWallet(req.company.id);

    res.json({
      balance: wallet.balance,
      currency: wallet.currency,
    });
  } catch (err) {
    next(err);
  }
});

// ============================
// CREATE WALLET DEPOSIT
// ============================

router.post("/deposit", protect, async (req, res, next) => {
  try {
    const { amount } = req.body;

    const clientSecret = await createDepositIntent(req.company.id, amount);

    res.json({ clientSecret });
  } catch (err) {
    next(err);
  }
});

// ============================
// STRIPE WEBHOOK
// ============================

router.post("/webhook", async (req, res) => {
  try {
    const response = await handleStripeWebhook(req);

    res.json(response);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router;
