const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class State extends Model {}

State.init(
  {
    state_name: { type: DataTypes.STRING(50), allowNull: true },
    state_code: { type: DataTypes.STRING, allowNull: true },
    country_id: { type: DataTypes.INTEGER, allowNull: true },
    trans_status: { type: DataTypes.INTEGER, defaultValue: 1 },
  },
  {
    sequelize,
    modelName: "State",
    tableName: "state", // Exact match with DB
    timestamps: false, // The screenshot didn't show created_at/updated_at for state
  }
);

module.exports = State;
