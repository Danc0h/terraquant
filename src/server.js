import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import { sequelize } from "./models/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/trading/authRoutes.js";
import auditLog from "./routes/trading/auditLog.js";
import batchRoutes from "./routes/trading/batches.js";
import ledgerRoutes from "./routes/trading/ledger.js";
import orderRoutes from "./routes/trading/order.js";
import marketRoutes from "./routes/trading/marketRoutes.js";
import paymentRoutes from "./routes/trading/payment.js";
import projectRoutes from "./routes/trading/projects.js";
import analyticsRoutes from "./routes/analytics/analyticsRoutes.js";

import { initEarthEngine } from "../config/earthEngine.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

/* =========================
   SECURITY + BASE MIDDLEWARE
========================= */

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }),
);

app.use(compression());

app.use(express.json({ limit: "10kb" }));

/* =========================
   RATE LIMITING (API PROTECTION)
========================= */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

/* =========================
   LOGGING (DEV ONLY)
========================= */

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* =========================
   STRIPE WEBHOOK (RAW BODY MUST COME FIRST)
========================= */

app.use(
  "/api/trading/payments/webhook",
  express.raw({ type: "application/json" }),
);

/* =========================
   HEALTH CHECK (RENDER USES THIS)
========================= */

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "terraquant-api",
    timestamp: new Date().toISOString(),
  });
});

/* =========================
   ROUTES
========================= */

app.use("/api/trading/auth", authRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/trading/auditlogs", auditLog);
app.use("/api/trading/payments", paymentRoutes);
app.use("/api/trading/projects", projectRoutes);
app.use("/api/trading/batches", batchRoutes);
app.use("/api/trading/ledger", ledgerRoutes);
app.use("/api/trading/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use(errorHandler);

/* =========================
   DATABASE CONNECT (SSL SAFE FOR NEON)
========================= */

const connectDB = async () => {
  let retries = 5;

  while (retries) {
    try {
      await sequelize.authenticate({
        ssl:
          process.env.NODE_ENV === "production"
            ? { require: true, rejectUnauthorized: false }
            : false,
      });

      console.log("🐘 Database connected (Neon/Postgres)");
      return;
    } catch (err) {
      console.error("❌ DB connection failed. Retries left:", retries);
      retries -= 1;

      await new Promise((res) => setTimeout(res, 5000));
    }
  }

  throw new Error("❌ Database connection failed permanently");
};

/* =========================
   STARTUP (FAIL-SAFE)
========================= */

const startServer = async () => {
  try {
    /* -------------------------
       Earth Engine (NON-BLOCKING)
    ------------------------- */
    try {
      await initEarthEngine();
      console.log("🌍 Earth Engine initialized");
    } catch (err) {
      console.warn("⚠️ Earth Engine skipped:", err.message);
    }

    /* -------------------------
       DB CONNECT
    ------------------------- */
    await connectDB();

    /* -------------------------
       START LISTENING
    ------------------------- */
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 TerraQuant API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Fatal server startup error:", error);
    process.exit(1);
  }
};

startServer();
