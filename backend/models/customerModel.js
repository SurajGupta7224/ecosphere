const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class Customer extends Model {}

Customer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    otp: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "suspended"),
      defaultValue: "active",
      allowNull: false,
    },
    profie_pic: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    referral_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    referral_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notification_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    login_type: {
      type: DataTypes.ENUM("mobile", "email"),
      defaultValue: "email",
      allowNull: false,
    },
    jwt_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    customer_type: {
      type: DataTypes.ENUM("website", "admin"),
      defaultValue: "website",
      allowNull: false,
    },
    created_by: {
      type: DataTypes.ENUM("admin", "customer"),
      defaultValue: "customer",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Customer",
    tableName: "customers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Customer;
