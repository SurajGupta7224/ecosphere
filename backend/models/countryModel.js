const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class Country extends Model {}

Country.init(
  {
    country_code: { type: DataTypes.CHAR(3), allowNull: false },
    country_name: { type: DataTypes.STRING(100), allowNull: false },
    trans_status: { type: DataTypes.INTEGER, defaultValue: 1 },
  },
  {
    sequelize,
    modelName: "Country",
    tableName: "country", // Exact match with DB
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Country;
