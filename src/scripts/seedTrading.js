import "dotenv/config";
import { v4 as uuidv4 } from "uuid";

import {
  sequelize,
  Company,
  CompanyWallet,
  Project,
  CarbonBatch,
  OwnershipLedger,
} from "../models/index.js";

const seedTrading = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log("🧹 Database cleared and recreated");
    console.log("🚀 Seeding minimal trading state (0 credits)...");

    // =========================
    // 1. COMPANY
    // =========================
    const company = await Company.create({
      id: uuidv4(),
      name: "TerraQuant Demo Company",
      email: "demo@terraquant.com",
      password: "hashedpassword",
    });

    console.log("✅ Company created:", company.id);

    // =========================
    // 2. WALLET
    // =========================
    await CompanyWallet.create({
      company_id: company.id,
      balance: 0,
    });

    console.log("✅ Wallet created");

    // =========================
    // 3. PROJECT
    // =========================
    const polygon = [
      { latitude: -0.716, longitude: 35.248 },
      { latitude: -0.716, longitude: 35.308 },
      { latitude: -0.776, longitude: 35.308 },
      { latitude: -0.776, longitude: 35.248 },
    ];

    const project = await Project.create({
      id: uuidv4(),
      company_id: company.id,
      name: "Chepalungu Forest Conservation and Restoration",

      country: "Kenya",
      methodology: "REDD+",
      verified_status: "VERIFIED",
      lifecycle_status: "ACTIVE",

      polygon,
    });

    console.log("✅ Project created:", project.id);

    // =========================
    // 4. CARBON BATCH
    // =========================
    const batch = await CarbonBatch.create({
      id: uuidv4(),
      project_id: project.id,
      vintage_year: 2026,
      total_quantity: 0,
      issuance_date: new Date(),

      spot_price: 0,
      last_trade_price: 0,

      status: "ACTIVE",
      verified_status: "EXTERNAL_VERIFIED",
    });

    console.log("✅ Batch created:", batch.id);

    // =========================
    // 5. OWNERSHIP (ZERO)
    // =========================
    await OwnershipLedger.create({
      company_id: company.id,
      batch_id: batch.id,
      quantity: 0, // 🔑 explicitly zero credits
    });

    console.log("✅ Ownership ledger created (0 credits)");

    console.log("🎉 Minimal seed complete (no tradable credits)");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
};

seedTrading();
