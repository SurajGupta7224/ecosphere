const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class City extends Model {}

City.init(
  {
    city_name: { type: DataTypes.STRING(100), allowNull: true },
    area: { type: DataTypes.STRING(100), allowNull: false },
    district: { type: DataTypes.STRING(100), allowNull: false },
    region: { type: DataTypes.STRING(100), allowNull: true },
    trans_status: { type: DataTypes.INTEGER, defaultValue: 1 },
    state_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    modelName: "City",
    tableName: "city", // Exact match with DB
    timestamps: false, // The screenshot didn't show timestamps for city
  }
);

module.exports = City;
