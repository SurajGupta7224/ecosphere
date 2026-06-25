const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class CompanySettings extends Model {}

CompanySettings.init(
  {
    company_name: { type: DataTypes.STRING, defaultValue: 'Ecosphere Ltd' },
    gst_number: { type: DataTypes.STRING, allowNull: true },
    pan_number: { type: DataTypes.STRING, allowNull: true },
    address_line1: { type: DataTypes.STRING, allowNull: true },
    address_line2: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, defaultValue: 'India' },
    state: { type: DataTypes.STRING, defaultValue: 'Maharashtra' },
    city: { type: DataTypes.STRING, defaultValue: 'Mumbai' },
    pincode: { type: DataTypes.STRING, allowNull: true },
    website_url: { type: DataTypes.STRING, defaultValue: 'https://ecosphere.com' },
  },
  {
    sequelize,
    modelName: "CompanySettings",
    tableName: "company_settings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = CompanySettings;
