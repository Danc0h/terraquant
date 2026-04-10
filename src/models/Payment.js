import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "Payment",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      order_id: {
        type: DataTypes.UUID,
        allowNull: true, // ✅ allow deposits
      },
      type: {
        type: DataTypes.ENUM("ORDER", "DEPOSIT"),
        allowNull: false,
      },

      buyer_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      amount_usd: {
        type: DataTypes.DECIMAL(18, 6),
        allowNull: false,
      },

      currency: {
        type: DataTypes.STRING,
        defaultValue: "usd",
      },

      stripe_payment_intent_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      stripe_client_secret: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM(
          "PENDING",
          "REQUIRES_ACTION",
          "SUCCEEDED",
          "FAILED",
          "CANCELED",
          "REFUNDED",
        ),
        defaultValue: "PENDING",
      },

      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },

    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
