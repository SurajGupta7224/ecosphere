const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class AppSettings extends Model {}

AppSettings.init(
  {
    app_name: { type: DataTypes.STRING, defaultValue: 'Ecosphere' },
    app_short_name: { type: DataTypes.STRING, defaultValue: 'Eco' },
    app_version: { type: DataTypes.STRING, defaultValue: '1.0.0' },
    timezone: { type: DataTypes.STRING, defaultValue: 'Asia/Kolkata' },
    date_format: { type: DataTypes.STRING, defaultValue: 'YYYY-MM-DD' },
    time_format: { type: DataTypes.STRING, defaultValue: 'HH:mm:ss' },
    default_language: { type: DataTypes.STRING, defaultValue: 'en' },
    default_currency: { type: DataTypes.STRING, defaultValue: 'INR' },
  },
  {
    sequelize,
    modelName: "AppSettings",
    tableName: "app_settings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = AppSettings;
