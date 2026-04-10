import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "OwnershipLedger",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      company_id: { type: DataTypes.UUID, allowNull: false },
      batch_id: { type: DataTypes.UUID, allowNull: false },
      quantity: { type: DataTypes.DECIMAL(18, 6), allowNull: false },
      locked_quantity: {
        type: DataTypes.DECIMAL(18, 6),
        defaultValue: 0,
      },
    },
    { timestamps: true, createdAt: "created_at", updatedAt: "updated_at" },
  );
