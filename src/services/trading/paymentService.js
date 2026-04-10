import Stripe from "stripe";
import { Payment, CompanyWallet, sequelize } from "../../models/index.js";

import { creditWallet } from "./walletService.js";
//import { logAction } from "./auditLogService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create Stripe Deposit Intent
 */
export const createDepositIntent = async (companyId, amount) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    metadata: {
      companyId,
      type: "DEPOSIT",
    },
  });

  await Payment.create({
    order_id: null, // ✅ explicit
    buyer_id: companyId,
    amount_usd: amount,
    currency: "usd",
    type: "DEPOSIT", // ✅ NEW
    stripe_payment_intent_id: paymentIntent.id,
    stripe_client_secret: paymentIntent.client_secret,
    status: "PENDING",
  });

  return paymentIntent.client_secret;
};

/**
 * Stripe Webhook Handler
 */
export const handleStripeWebhook = async (req) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    throw new Error("Webhook signature verification failed");
  }

  // ===============================
  // HANDLE SUCCESSFUL DEPOSIT
  // ===============================

  if (event.type === "payment_intent.succeeded") {
    console.log("🔥 Webhook triggered");

    const paymentIntent = event.data.object;

    console.log("👉 PaymentIntent ID:", paymentIntent.id);
    console.log("👉 Metadata:", paymentIntent.metadata);

    const companyId = paymentIntent.metadata.companyId;

    const payment = await Payment.findOne({
      where: { stripe_payment_intent_id: paymentIntent.id },
    });

    console.log("👉 Payment found:", payment ? "YES" : "NO");

    if (!payment) return { received: true };

    if (payment.status === "SUCCEEDED") {
      console.log("⚠️ Already processed");
      return { received: true };
    }

    const wallet = await CompanyWallet.findOne({
      where: { company_id: companyId },
    });

    console.log("👉 Wallet found:", wallet ? "YES" : "NO");

    if (!wallet) {
      console.log("❌ Wallet missing for company:", companyId);
      throw new Error("Wallet not found");
    }

    console.log("💰 Before balance:", wallet.balance);

    await creditWallet(wallet.id, payment.amount_usd);

    const updatedWallet = await CompanyWallet.findByPk(wallet.id);

    console.log("💰 After balance:", updatedWallet.balance);

    payment.status = "SUCCEEDED";
    await payment.save();

    console.log("✅ Deposit completed");

    return { received: true };
  }

  return { received: true };
};
