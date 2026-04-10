import { Sequelize } from "sequelize";
import dotenv from "dotenv";

import CompanyModel from "./Company.js";
import CompanyWalletModel from "./CompanyWallet.js";
import WalletLedgerModel from "./WalletLedger.js";
import ProjectModel from "./Project.js";
import CarbonBatchModel from "./CarbonBatch.js";
import OwnershipLedgerModel from "./OwnershipLedger.js";
import RetirementModel from "./Retirement.js";
import OrderModel from "./Order.js";
import TradeModel from "./Trades.js";
import PaymentModel from "./Payment.js";
import AuditLogModel from "./AuditLog.js";
import RegistryProjectModel from "./RegistryProject.js";
import OrderBookSnapshotModel from "./OrderBookSnapshots.js";

dotenv.config();

/* ============================================================
   SEQUELIZE INSTANCE
============================================================ */

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

/* ============================================================
   INITIALIZE MODELS
============================================================ */

const Company = CompanyModel(sequelize);
const CompanyWallet = CompanyWalletModel(sequelize);
const WalletLedger = WalletLedgerModel(sequelize);
const Project = ProjectModel(sequelize);
const CarbonBatch = CarbonBatchModel(sequelize);
const OwnershipLedger = OwnershipLedgerModel(sequelize);
const Retirement = RetirementModel(sequelize);
const Order = OrderModel(sequelize);
const Trade = TradeModel(sequelize);
const Payment = PaymentModel(sequelize);
const AuditLog = AuditLogModel(sequelize);
const RegistryProject = RegistryProjectModel(sequelize);
const OrderBookSnapshot = OrderBookSnapshotModel(sequelize);

/* ============================================================
   ASSOCIATIONS
============================================================ */

/* COMPANY ↔ WALLET */

Company.hasOne(CompanyWallet, {
  foreignKey: "company_id",
  onDelete: "CASCADE",
});

CompanyWallet.belongsTo(Company, {
  foreignKey: "company_id",
});

/* WALLET ↔ WALLET LEDGER */

CompanyWallet.hasMany(WalletLedger, {
  foreignKey: "wallet_id",
  as: "transactions",
  onDelete: "CASCADE",
});

WalletLedger.belongsTo(CompanyWallet, {
  foreignKey: "wallet_id",
});

/* COMPANY ↔ PROJECT */

Company.hasMany(Project, {
  as: "projects",
  foreignKey: "company_id",
  onDelete: "CASCADE",
});

Project.belongsTo(Company, {
  as: "company",
  foreignKey: "company_id",
});

/* REGISTRY PROJECT ↔ PROJECT */

RegistryProject.hasMany(Project, {
  as: "projects",
  foreignKey: "registry_project_id",
  onDelete: "SET NULL",
});

Project.belongsTo(RegistryProject, {
  as: "registry_project",
  foreignKey: "registry_project_id",
});

/* PROJECT ↔ CARBON BATCH */

Project.hasMany(CarbonBatch, {
  as: "batches",
  foreignKey: "project_id",
  onDelete: "CASCADE",
});

CarbonBatch.belongsTo(Project, {
  as: "project",
  foreignKey: "project_id",
});

/* COMPANY ↔ OWNERSHIP LEDGER */

Company.hasMany(OwnershipLedger, {
  as: "holdings",
  foreignKey: "company_id",
  onDelete: "CASCADE",
});

OwnershipLedger.belongsTo(Company, {
  as: "owner",
  foreignKey: "company_id",
});

/* CARBON BATCH ↔ OWNERSHIP LEDGER */

CarbonBatch.hasMany(OwnershipLedger, {
  as: "ownership_records",
  foreignKey: "batch_id",
  onDelete: "CASCADE",
});

OwnershipLedger.belongsTo(CarbonBatch, {
  as: "batch",
  foreignKey: "batch_id",
});

/* OWNERSHIP LEDGER ↔ RETIREMENT */

OwnershipLedger.hasMany(Retirement, {
  as: "retirements",
  foreignKey: "ledger_id",
  onDelete: "CASCADE",
});

Retirement.belongsTo(OwnershipLedger, {
  as: "ledger_entry",
  foreignKey: "ledger_id",
});

/* CARBON BATCH ↔ ORDER */

CarbonBatch.hasMany(Order, {
  as: "orders",
  foreignKey: "batch_id",
  onDelete: "CASCADE",
});

Order.belongsTo(CarbonBatch, {
  as: "batch",
  foreignKey: "batch_id",
});

/* COMPANY ↔ ORDER */

Company.hasMany(Order, {
  as: "orders",
  foreignKey: "company_id",
  onDelete: "CASCADE",
});

Order.belongsTo(Company, {
  as: "company",
  foreignKey: "company_id",
});

/* TRADE */

CarbonBatch.hasMany(Trade, {
  as: "trades",
  foreignKey: "batch_id",
});

Trade.belongsTo(CarbonBatch, {
  as: "batch",
  foreignKey: "batch_id",
});

Order.hasMany(Trade, {
  as: "buy_trades",
  foreignKey: "buy_order_id",
});

Order.hasMany(Trade, {
  as: "sell_trades",
  foreignKey: "sell_order_id",
});

Trade.belongsTo(Order, {
  as: "buy_order",
  foreignKey: "buy_order_id",
});

Trade.belongsTo(Order, {
  as: "sell_order",
  foreignKey: "sell_order_id",
});

Company.hasMany(Trade, {
  as: "buy_trades",
  foreignKey: "buyer_id",
});

Company.hasMany(Trade, {
  as: "sell_trades",
  foreignKey: "seller_id",
});

Trade.belongsTo(Company, {
  as: "buyer",
  foreignKey: "buyer_id",
});

Trade.belongsTo(Company, {
  as: "seller",
  foreignKey: "seller_id",
});

/* COMPANY ↔ PAYMENT */

Company.hasMany(Payment, {
  as: "payments",
  foreignKey: "company_id",
  onDelete: "CASCADE",
});

Payment.belongsTo(Company, {
  as: "company",
  foreignKey: "company_id",
});

/* COMPANY ↔ AUDIT LOG */

Company.hasMany(AuditLog, {
  as: "audit_logs",
  foreignKey: "company_id",
  onDelete: "CASCADE",
});

AuditLog.belongsTo(Company, {
  as: "company",
  foreignKey: "company_id",
});

/* CARBON BATCH ↔ ORDERBOOK SNAPSHOT */

CarbonBatch.hasMany(OrderBookSnapshot, {
  as: "orderbook_snapshots",
  foreignKey: "batch_id",
  onDelete: "CASCADE",
});

OrderBookSnapshot.belongsTo(CarbonBatch, {
  as: "batch",
  foreignKey: "batch_id",
});

/* ============================================================
   EXPORTS
============================================================ */

export {
  sequelize,
  Company,
  CompanyWallet,
  WalletLedger,
  Project,
  CarbonBatch,
  OwnershipLedger,
  Retirement,
  Order,
  Trade,
  Payment,
  AuditLog,
  RegistryProject,
  OrderBookSnapshot,
};
