const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class Role extends Model {}

Role.init(
  {
    role_name: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: "Role",
    tableName: "roles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Role;
