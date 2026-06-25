const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class BrandingSettings extends Model {}

BrandingSettings.init(
  {
    company_name: { type: DataTypes.STRING, defaultValue: 'Ecosphere Ltd' },
    company_tagline: { type: DataTypes.STRING, defaultValue: 'Eco-friendly Solutions' },
    company_logo: { type: DataTypes.STRING, allowNull: true },
    favicon: { type: DataTypes.STRING, allowNull: true },
    login_logo: { type: DataTypes.STRING, allowNull: true },
    login_bg: { type: DataTypes.STRING, allowNull: true },
    footer_copyright: { type: DataTypes.STRING, defaultValue: '© 2026 Ecosphere. All rights reserved.' },
    support_email: { type: DataTypes.STRING, defaultValue: 'support@ecosphere.com' },
    support_phone: { type: DataTypes.STRING, defaultValue: '1800-123-4567' },
  },
  {
    sequelize,
    modelName: "BrandingSettings",
    tableName: "branding_settings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = BrandingSettings;
