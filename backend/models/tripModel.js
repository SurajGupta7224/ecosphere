const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Trip = sequelize.define(
  "Trip",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "trips",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Trip;
