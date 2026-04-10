import { DataTypes } from "sequelize";

export default (sequelize) => {
  const CompanyWallet = sequelize.define(
    "CompanyWallet",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      company_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      currency: {
        type: DataTypes.STRING,
        defaultValue: "USD",
      },

      balance: {
        type: DataTypes.DECIMAL(18, 2),
        defaultValue: 0,
      },
    },
    {
      tableName: "company_wallets",
      timestamps: true,
    },
  );

  return CompanyWallet;
};
