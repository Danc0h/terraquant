import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "AuditLog",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      Company_id: { type: DataTypes.UUID, allowNull: false },
      action_type: { type: DataTypes.STRING, allowNull: false },
      entity_type: { type: DataTypes.STRING, allowNull: false },
      entity_id: { type: DataTypes.UUID, allowNull: false },
      metadata: { type: DataTypes.JSON, allowNull: true },
    },
    { timestamps: true, createdAt: "created_at", updatedAt: "updated_at" },
  );
