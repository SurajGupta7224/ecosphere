const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class BusinessSubRegion extends Model {}

BusinessSubRegion.init(
  {
    business_region_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    sub_region_name: { 
      type: DataTypes.STRING(100), 
      allowNull: false 
    },
    branch_name: { 
      type: DataTypes.STRING(100), 
      allowNull: true 
    },
    branch_code: { 
      type: DataTypes.STRING(50), 
      allowNull: true 
    },
    office_address: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    gstn: { 
      type: DataTypes.STRING(50), 
      allowNull: true 
    },
    agri_licence: { 
      type: DataTypes.STRING(50), 
      allowNull: true 
    },
    shop_establishment: { 
      type: DataTypes.STRING(50), 
      allowNull: true 
    },
    contact_person_name: { 
      type: DataTypes.STRING(100), 
      allowNull: true 
    },
    contact_number: { 
      type: DataTypes.STRING(20), 
      allowNull: true 
    },
    email_id: { 
      type: DataTypes.STRING(100), 
      allowNull: true 
    },
    gstn_file: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    agri_licence_file: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    shop_establishment_file: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    status: { 
      type: DataTypes.ENUM('Active', 'Inactive'), 
      defaultValue: 'Active' 
    }
  },
  {
    sequelize,
    modelName: "BusinessSubRegion",
    tableName: "business_sub_regions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = BusinessSubRegion;
