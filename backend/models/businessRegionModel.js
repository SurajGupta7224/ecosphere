const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class BusinessRegion extends Model {}

BusinessRegion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    zone: { 
      type: DataTypes.STRING(50), 
      allowNull: true 
    },
    state: { 
      type: DataTypes.STRING(256), 
      allowNull: true 
    },
    status: { 
      type: DataTypes.STRING(50), 
      defaultValue: '1',
      get() {
        const rawVal = this.getDataValue('status');
        return rawVal === '1' || rawVal === 'Active' ? 'Active' : 'Inactive';
      },
      set(val) {
        this.setDataValue('status', val === 'Active' || val === '1' ? '1' : '0');
      }
    },
    region_name: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.zone ? `${this.zone} - ${this.state}` : this.state;
      }
    }
  },
  {
    sequelize,
    modelName: "BusinessRegion",
    tableName: "business_region",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = BusinessRegion;
