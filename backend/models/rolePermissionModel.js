const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class RolePermission extends Model {}

RolePermission.init(
  {
    role_id: { type: DataTypes.INTEGER },
    permission_id: { type: DataTypes.INTEGER },
  },
  {
    sequelize,
    modelName: "RolePermission",
    tableName: "role_permissions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = RolePermission;
