import { DataTypes } from "sequelize";

export default (sequelize) => {
  const OrderBookSnapshot = sequelize.define("OrderBookSnapshot", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    batch_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    bids: {
      type: DataTypes.JSONB,
      allowNull: false,
    },

    asks: {
      type: DataTypes.JSONB,
      allowNull: false,
    },

    snapshot_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return OrderBookSnapshot;
};
