const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class EmailSettings extends Model {}

EmailSettings.init(
  {
    smtp_host: { type: DataTypes.STRING, defaultValue: 'smtp.mailtrap.io' },
    smtp_port: { type: DataTypes.INTEGER, defaultValue: 2525 },
    smtp_username: { type: DataTypes.STRING, defaultValue: '' },
    smtp_password: { type: DataTypes.STRING, defaultValue: '' },
    encryption_type: { type: DataTypes.STRING, defaultValue: 'tls' },
    from_email: { type: DataTypes.STRING, defaultValue: 'no-reply@ecosphere.com' },
    from_name: { type: DataTypes.STRING, defaultValue: 'Ecosphere' },
  },
  {
    sequelize,
    modelName: "EmailSettings",
    tableName: "email_settings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = EmailSettings;
