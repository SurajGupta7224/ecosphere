const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class User extends Model {}

User.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role_id: { type: DataTypes.INTEGER },
    country_id: { type: DataTypes.INTEGER, allowNull: true },
    state_id: { type: DataTypes.INTEGER, allowNull: true },
    city_id: { type: DataTypes.INTEGER, allowNull: true },
    company_type: { type: DataTypes.STRING, allowNull: true },
    profile_photo: { type: DataTypes.STRING, allowNull: true },
    pan_number: { type: DataTypes.STRING, allowNull: true },
    pan_card_file: { type: DataTypes.STRING, allowNull: true },
    aadhaar_number: { type: DataTypes.STRING, allowNull: true },
    aadhaar_card_file: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
    profile_status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    last_login: { type: DataTypes.DATE, allowNull: true },
    login_attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
    locked_until: { type: DataTypes.DATE, allowNull: true },
    password_changed_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = User;
