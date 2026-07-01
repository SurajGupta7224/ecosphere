const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TimeSlot = sequelize.define("TimeSlot", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  slot_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active',
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: "time_slots",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = TimeSlot;
