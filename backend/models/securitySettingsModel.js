const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class SecuritySettings extends Model {}

SecuritySettings.init(
  {
    session_timeout: { type: DataTypes.INTEGER, defaultValue: 30 },
    max_login_attempts: { type: DataTypes.INTEGER, defaultValue: 5 },
    lockout_duration: { type: DataTypes.INTEGER, defaultValue: 30 },
    password_expiry_days: { type: DataTypes.INTEGER, defaultValue: 90 },
    password_min_length: { type: DataTypes.INTEGER, defaultValue: 8 },
    enable_2fa: { type: DataTypes.BOOLEAN, defaultValue: false },
    enable_ip_restriction: { type: DataTypes.BOOLEAN, defaultValue: false },
    enable_login_activity: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    modelName: "SecuritySettings",
    tableName: "security_settings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = SecuritySettings;
