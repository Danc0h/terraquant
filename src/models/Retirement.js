import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "Retirement",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      ledger_id: { type: DataTypes.UUID, allowNull: false },
      quantity: { type: DataTypes.DECIMAL(18, 6), allowNull: false },
      retirement_reason: { type: DataTypes.STRING, allowNull: false },
      retired_at: { type: DataTypes.DATE, allowNull: false },
    },
    { timestamps: true, createdAt: "created_at", updatedAt: "updated_at" },
  );
