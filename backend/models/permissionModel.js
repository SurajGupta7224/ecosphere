const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class Permission extends Model {}

Permission.init(
  {
    permission_name: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: "Permission",
    tableName: "permissions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Permission;
