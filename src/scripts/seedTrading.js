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

import { createOrder } from "../services/trading/orderService.js";

const seedTrading = async () => {
  try {
    console.log("🚀 Seeding trading liquidity...");

    // =========================
    // 1. SELLER COMPANY
    // =========================
    const seller = await Company.create({
      id: uuidv4(),
      name: "Liquidity Provider",
      email: "chepalungu@terraquant.com",
      password: "hashedpassword",
    });

    console.log("✅ Seller created:", seller.id);

    // =========================
    // 2. WALLET
    // =========================
    await CompanyWallet.create({
      company_id: seller.id,
      balance: 0,
    });

    console.log("✅ Wallet created");

    // =========================
    // 3. PROJECT
    // =========================
    const chepalunguPolygon = [
      { latitude: -0.716, longitude: 35.248 },
      { latitude: -0.716, longitude: 35.308 },
      { latitude: -0.776, longitude: 35.308 },
      { latitude: -0.776, longitude: 35.248 },
    ];

    const project = await Project.create({
      id: uuidv4(),
      company_id: seller.id,
      name: "Chepalungu Forest Conservation and Restoration",

      country: "Kenya",
      methodology: "REDD+",
      verified_status: "VERIFIED",
      lifecycle_status: "ACTIVE",

      polygon: chepalunguPolygon, // 🔥 THIS IS THE KEY ADDITION
    });

    // =========================
    // 4. CARBON BATCH (ASSET)
    // =========================
    const batch = await CarbonBatch.create({
      id: uuidv4(),
      project_id: project.id,
      vintage_year: 2024,
      total_quantity: 1000,
      issuance_date: new Date(),

      spot_price: 10,
      last_trade_price: 10,

      status: "ACTIVE",
      verified_status: "EXTERNAL_VERIFIED",
    });

    console.log("✅ Batch created:", batch.id);

    // =========================
    // 5. OWNERSHIP (CRITICAL)
    // =========================
    await OwnershipLedger.create({
      company_id: seller.id,
      batch_id: batch.id,
      quantity: 1000,
    });

    console.log("✅ Ownership assigned");

    // =========================
    // 6. CREATE SELL ORDERS
    // =========================

    // price ladder
    await createOrder({
      companyId: seller.id,
      batchId: batch.id,
      side: "SELL",
      price: 10,
      quantity: 300,
      orderType: "LIMIT",
      timeInForce: "GTC",
    });

    await createOrder({
      companyId: seller.id,
      batchId: batch.id,
      side: "SELL",
      price: 11,
      quantity: 300,
      orderType: "LIMIT",
      timeInForce: "GTC",
    });

    await createOrder({
      companyId: seller.id,
      batchId: batch.id,
      side: "SELL",
      price: 12,
      quantity: 400,
      orderType: "LIMIT",
      timeInForce: "GTC",
    });

    console.log("✅ Sell orders created");

    console.log("🎉 Trading liquidity READY");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
};

seedTrading();

/*import { sequelize } from "../models/index.js";
import {
  Company,
  CompanyWallet,
  Project,
  CarbonBatch,
  OwnershipLedger,
  Order,
} from "../models/index.js";

async function seed() {
  try {
    // 1️⃣ Sync DB
    await sequelize.sync({ force: true });
    console.log("Database synced ✅");

    // 2️⃣ Create Buyer Company (your current app)
    const buyer = await Company.create({
      name: "Buyer Company",
      email: "buyer@test.com",
      password: "hashedpassword", // hash properly in real app
    });

    const buyerWallet = await CompanyWallet.create({
      company_id: buyer.id,
      balance: 1000, // pre-fund for testing
      currency: "USD",
    });

    console.log("Buyer company & wallet created ✅");

    // 3️⃣ Create Seller Companies
    const sellers = await Promise.all(
      ["Seller One", "Seller Two"].map(async (name) => {
        const company = await Company.create({
          name,
          email: `${name.toLowerCase().replace(" ", "")}@test.com`,
          password: "hashedpassword",
        });

        const wallet = await CompanyWallet.create({
          company_id: company.id,
          balance: 0, // seller starts with 0 USD
          currency: "USD",
        });

        return { company, wallet };
      }),
    );

    console.log("Seller companies & wallets created ✅");

    // 4️⃣ Create Projects
    const projects = await Promise.all(
      sellers.map(async ({ company }, idx) => {
        return Project.create({
          name: `Project ${idx + 1}`,
          company_id: company.id,
        });
      }),
    );

    console.log("Projects created ✅");

    // 5️⃣ Create CarbonBatches for each project
    const batches = [];
    for (const project of projects) {
      const batch = await CarbonBatch.create({
        project_id: project.id,
        available_quantity: 1000,
        total_quantity: 1000,
        price_per_unit_usd: 10 + Math.floor(Math.random() * 10), // random 10-19
        vintage_year: 2023,
        issuance_date: new Date("2023-01-01"),
        spot_price: 10,
        last_trade_price: 10,
        status: "PENDING",
        verified_status: "UNVERIFIED",
      });
      batches.push(batch);
    }

    console.log("CarbonBatches created ✅");

    // 6️⃣ Assign ownership to sellers (so they can sell)
    for (const [i, { company }] of sellers.entries()) {
      await OwnershipLedger.create({
        company_id: company.id,
        batch_id: batches[i].id,
        quantity: 1000, // full batch assigned
      });
    }

    console.log("OwnershipLedger entries created ✅");

    // 7️⃣ Pre-seed SELL Orders for marketplace
    for (const [i, { company }] of sellers.entries()) {
      await Order.create({
        company_id: company.id,
        batch_id: batches[i].id,
        side: "SELL",
        price: batches[i].price_per_unit_usd,
        quantity: 500, // half of batch listed
        remaining_quantity: 500,
        order_type: "LIMIT",
        time_in_force: "GTC",
        status: "OPEN",
      });
    }

    console.log("Pre-seeded SELL orders ✅");

    // 8️⃣ Optional: Buyer places a BUY order for testing
    await Order.create({
      company_id: buyer.id,
      batch_id: batches[0].id,
      side: "BUY",
      price: batches[0].price_per_unit_usd,
      quantity: 300,
      remaining_quantity: 300,
      order_type: "LIMIT",
      time_in_force: "GTC",
      status: "OPEN",
    });

    console.log("Pre-seeded BUY order for buyer ✅");

    console.log("✅ Seed script completed! Marketplace ready for testing.");
  } catch (err) {
    console.error("❌ Seed script error:", err);
  } finally {
    await sequelize.close();
  }
}

seed();*/
