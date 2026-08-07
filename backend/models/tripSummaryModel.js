const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TripSummary = sequelize.define(
  "TripSummary",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    // Order Details
    order_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    waste_order_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    lead_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    // Customer
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    customer_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    // Vendor
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Driver

    driver_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    // Vehicle

    vehicle_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    vehicle_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
},


/// Waste Sub Category
// subcategory_id: {
//   type: DataTypes.INTEGER,
//   allowNull: false,
//   references: {
//     model: "sub_categories",
//     key: "id",
//   },
// },

    // Waste Collected
    wet_waste: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    dry_waste: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    sanitary_waste: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    special_care_waste: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    bulk_waste: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    total_waste: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "Pending",
        "Approved",
        "Rejected"
      ),
      defaultValue: "Pending",
    },

    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "trip_summaries",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = TripSummary;