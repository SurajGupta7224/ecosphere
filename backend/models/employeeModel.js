const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class Employee extends Model {}

Employee.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    email: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    mobile_number: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    profile_photo: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    gender: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    blood_group: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    marital_status: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    father_husband_name: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    dob: { 
      type: DataTypes.DATEONLY, 
      allowNull: false 
    },
    staff_type: { 
      type: DataTypes.ENUM("driver", "helper"), 
      allowNull: false 
    },
    address: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    },
    
    // Aadhaar Details
    aadhaar_number: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    aadhaar_front_image: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    aadhaar_back_image: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    
    // PAN Details
    pan_card_number: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    pan_card_image: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    
    // EPF and ESI Details
    esi_number: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    epf_number: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    
    // Driving License Details (hidden if staff_type is helper)
    driving_license_number: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    driving_license_front_image: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    driving_license_back_image: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    
    // Police Verification
    police_verification_number: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    police_verification_image: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    
    // Medical Certificate
    medical_certificate_number: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    medical_certificate_image: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    
    // Eyesight Certificate
    eyesight_certificate_number: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    eyesight_certificate_image: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    
    // Approval & Status
    profile_approval_status: { 
      type: DataTypes.ENUM("pending", "approved", "rejected"), 
      defaultValue: "pending" 
    },
    employee_status: { 
      type: DataTypes.ENUM("active", "inactive"), 
      defaultValue: "active" 
    },
    
    // Approval Details
    approved_by: { 
      type: DataTypes.INTEGER, 
      allowNull: true 
    },
    approved_date: { 
      type: DataTypes.DATE, 
      allowNull: true 
    }
  },
  {
    sequelize,
    modelName: "Employee",
    tableName: "aggregator_employees",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Employee;
