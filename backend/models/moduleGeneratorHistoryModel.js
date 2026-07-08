const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class ModuleGeneratorHistory extends Model {}

ModuleGeneratorHistory.init(
  {
    module_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    display_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    table_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    menu_group: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    config: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    files_generated: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Success", "Failed"),
      defaultValue: "Success",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "ModuleGeneratorHistory",
    tableName: "module_generator_history",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = ModuleGeneratorHistory;
