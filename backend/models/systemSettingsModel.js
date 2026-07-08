const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class SystemSettings extends Model {}

SystemSettings.init(
  {
    development_mode: { type: DataTypes.BOOLEAN, defaultValue: true },
    debug_mode: { type: DataTypes.BOOLEAN, defaultValue: false },
    maintenance_mode: { type: DataTypes.BOOLEAN, defaultValue: false },
    app_version: { type: DataTypes.STRING, defaultValue: '1.0.0' },
    build_number: { type: DataTypes.STRING, defaultValue: '1001' },
  },
  {
    sequelize,
    modelName: "SystemSettings",
    tableName: "system_settings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = SystemSettings;
