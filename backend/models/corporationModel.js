const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class Corporation extends Model {}

Corporation.init(
  {
    corporation_name: { 
      type: DataTypes.STRING(100), 
      allowNull: false, 
      unique: true 
    },
    status: { 
      type: DataTypes.ENUM('Active', 'Inactive'), 
      defaultValue: 'Active' 
    }
  },
  {
    sequelize,
    modelName: "Corporation",
    tableName: "corporations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Corporation;
