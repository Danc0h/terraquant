import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      company_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      batch_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      side: {
        type: DataTypes.ENUM("BUY", "SELL"),
        allowNull: false,
      },

      order_type: {
        type: DataTypes.ENUM("LIMIT", "MARKET"),
        defaultValue: "LIMIT",
      },

      time_in_force: {
        type: DataTypes.ENUM("GTC", "IOC", "FOK"),
        defaultValue: "GTC",
      },

      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true, // null for MARKET orders
      },

      quantity: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
      },

      remaining_quantity: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM("OPEN", "PARTIAL", "FILLED", "CANCELLED"),
        defaultValue: "OPEN",
      },
    },
    {
      indexes: [
        { fields: ["batch_id", "side", "status"] },
        { fields: ["price"] },
      ],
    },
  );

  return Order;
};
