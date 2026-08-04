const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CustomerComplaint = sequelize.define(
  "CustomerComplaint",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    complaint_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },

    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    customer_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    customer_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    attachment: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "Pending",
        "In Progress",
        "Resolved",
        "Closed"
      ),
      defaultValue: "Pending",
    },

    admin_reply: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    replied_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    replied_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "customer_complaints",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = CustomerComplaint;