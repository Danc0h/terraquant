import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "RegistryProject",
    {
      registry_id: { type: DataTypes.STRING, primaryKey: true },
      verification_body: { type: DataTypes.STRING, allowNull: false },
      project_name: { type: DataTypes.STRING, allowNull: false },
      country: { type: DataTypes.STRING, allowNull: true },
      status: { type: DataTypes.STRING, defaultValue: "ACTIVE" },
      last_synced: { type: DataTypes.DATE, allowNull: true },
    },
    { timestamps: true, createdAt: "created_at", updatedAt: "updated_at" },
  );
