import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Trade = sequelize.define("Trade", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    buy_order_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    sell_order_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    buyer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    seller_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    batch_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    quantity: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
    },
  });

  return Trade;
};
