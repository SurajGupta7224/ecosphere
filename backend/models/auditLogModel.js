const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class AuditLog extends Model {}

AuditLog.init(
  {
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    user_name: { type: DataTypes.STRING, allowNull: true },
    action: { type: DataTypes.STRING, allowNull: false },
    module: { type: DataTypes.STRING, allowNull: false },
    old_value: { type: DataTypes.TEXT, allowNull: true },
    new_value: { type: DataTypes.TEXT, allowNull: true },
    ip_address: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    modelName: "AuditLog",
    tableName: "audit_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false, // Audit log only has created_at
  }
);

module.exports = AuditLog;
