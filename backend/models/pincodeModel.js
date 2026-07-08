const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class Pincode extends Model {}

Pincode.init(
  {
    pincode: { type: DataTypes.STRING(255), allowNull: true },
    city_id: { type: DataTypes.INTEGER, allowNull: true },
    state_id: { type: DataTypes.INTEGER, allowNull: true },
    country_id: { type: DataTypes.INTEGER, allowNull: true },
    trans_status: { type: DataTypes.INTEGER, defaultValue: 1 },
  },
  {
    sequelize,
    modelName: "Pincode",
    tableName: "pincodes", // Exact match with DB
    timestamps: false,
  }
);

module.exports = Pincode;
