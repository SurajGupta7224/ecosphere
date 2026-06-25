const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SubCategory = sequelize.define("SubCategory", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  alt_tag: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  meta_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  meta_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.TINYINT(1),
    defaultValue: 1,
  },
}, {
  tableName: "sub_categories",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = SubCategory;
