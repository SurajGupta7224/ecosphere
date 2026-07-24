const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class Notification extends Model {}

Notification.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true // null means targeted at all Admins
    },
    type: {
      type: DataTypes.ENUM("employee_registration", "vehicle_registration", "vendor_approval", "order_booked", "other"),
      defaultValue: "other"
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    reference_type: {
      type: DataTypes.STRING, // "employee" | "vehicle" | "user"
      allowNull: true
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: "Notification",
    tableName: "notifications",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

module.exports = Notification;
