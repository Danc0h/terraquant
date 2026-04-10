import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "CarbonBatch",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      // =========================
      // ASSET IDENTITY
      // =========================

      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      vintage_year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      issuance_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      // =========================
      // SUPPLY (STATIC)
      // =========================

      total_quantity: {
        type: DataTypes.DECIMAL(18, 6),
        allowNull: false,
      },

      // 🔥 REMOVE available_quantity (handled by ownership + orders)

      // =========================
      // MARKET DATA (DYNAMIC)
      // =========================

      spot_price: {
        type: DataTypes.DECIMAL(18, 6),
        allowNull: true,
      },

      last_trade_price: {
        type: DataTypes.DECIMAL(18, 6),
        allowNull: true,
      },

      // =========================
      // STATUS
      // =========================

      status: {
        type: DataTypes.ENUM("PENDING", "ACTIVE", "CLOSED"),
        defaultValue: "PENDING",
      },

      verified_status: {
        type: DataTypes.ENUM(
          "UNVERIFIED",
          "INTERNAL_VERIFIED",
          "EXTERNAL_VERIFIED",
        ),
        defaultValue: "UNVERIFIED",
      },

      // =========================
      // OPTIONAL METADATA
      // =========================

      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      tableName: "carbon_batches",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
