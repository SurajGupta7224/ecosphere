const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SubCategoryVariation = sequelize.define("SubCategoryVariation", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  subcategory_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sub_categories',
      key: 'id'
    }
  },
  variation_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  number_of_sr: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  schedule_after_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  per_kg_price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active',
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  }
}, {
  tableName: "subcategory_variations",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = SubCategoryVariation;
