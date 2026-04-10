import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "Project",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      company_id: { type: DataTypes.UUID, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      registry_project_id: { type: DataTypes.STRING, allowNull: true },
      verified_status: { type: DataTypes.STRING, defaultValue: "UNVERIFIED" },
      polygon: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [], // empty array as default
      },

      location_name: {
        type: DataTypes.STRING,
      },

      project_type: {
        type: DataTypes.STRING, // forest, mangrove, etc
      },
    },
    { timestamps: true, createdAt: "created_at", updatedAt: "updated_at" },
  );
