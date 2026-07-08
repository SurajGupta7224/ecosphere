const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class Ward extends Model {}

Ward.init(
  {
    corporation_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    zone_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    ward_name: { 
      type: DataTypes.STRING(100), 
      allowNull: false 
    },
    status: { 
      type: DataTypes.ENUM('Active', 'Inactive'), 
      defaultValue: 'Active' 
    }
  },
  {
    sequelize,
    modelName: "Ward",
    tableName: "wards",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Ward;
