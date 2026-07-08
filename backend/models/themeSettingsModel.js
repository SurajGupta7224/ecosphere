const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class ThemeSettings extends Model {}

ThemeSettings.init(
  {
    theme_type: { type: DataTypes.STRING, defaultValue: 'system' }, // light, dark, system
    primary_color: { type: DataTypes.STRING, defaultValue: '#7c3aed' },
    secondary_color: { type: DataTypes.STRING, defaultValue: '#4f46e5' },
    sidebar_color: { type: DataTypes.STRING, defaultValue: '#1e133c' },
    sidebar_text_color: { type: DataTypes.STRING, defaultValue: '#cbd5e1' },
    sidebar_active_bg_color: { type: DataTypes.STRING, defaultValue: '#7c3aed' },
    sidebar_active_text_color: { type: DataTypes.STRING, defaultValue: '#ffffff' },
    navbar_color: { type: DataTypes.STRING, defaultValue: '#ffffff' },
    card_bg_color: { type: DataTypes.STRING, defaultValue: '#ffffff' },
    button_color: { type: DataTypes.STRING, defaultValue: '#7c3aed' },
    text_color: { type: DataTypes.STRING, defaultValue: '#ffffff' },
  },
  {
    sequelize,
    modelName: "ThemeSettings",
    tableName: "theme_settings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = ThemeSettings;
