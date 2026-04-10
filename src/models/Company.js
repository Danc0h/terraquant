import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "Company",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      registryBody: { type: DataTypes.STRING, allowNull: true },
      account_id: { type: DataTypes.STRING, allowNull: true },
      account_name: { type: DataTypes.STRING, allowNull: true },
    },
    { timestamps: true, createdAt: "created_at", updatedAt: "updated_at" },
  );
