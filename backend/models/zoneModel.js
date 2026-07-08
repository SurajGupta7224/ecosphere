const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class Zone extends Model {}

Zone.init(
  {
    corporation_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    zone_name: { 
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
    modelName: "Zone",
    tableName: "zones",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Zone;
