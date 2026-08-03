const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const WasteCollectionRequest = sequelize.define("WasteCollectionRequest", {
 

  
 
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  lead_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  customer_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  contact_person: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  mobile_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  waste_generator_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  area_sqm: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  dwelling_units: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'flats'
  },
  complete_address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  subcategory_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'sub_categories',
      key: 'id'
    }
  },
  variation_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'subcategory_variations',
      key: 'id'
    }
  },
  expected_waste: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
  },
  agreed_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
  },
  suggested_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
  },
  monthly_waste: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
  },
  yearly_waste: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
  },
  monthly_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
  },
  yearly_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
  },
  registered_rwa: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  gst_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  pan_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  trade_license: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  pickup_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  time_slot_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'time_slots',
      key: 'id'
    }
  },


  // Additional fields for compatibility
  pickup_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pickup_time: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Verified', 'Approved', 'Booked', 'Rejected', 'Completed'),
    defaultValue: 'Pending',
    allowNull: false,
  },
  images: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_by_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  request_source: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  latitude: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  address_search: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  site_request: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  service_center_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  employee_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  billing_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  business_region: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  business_sub_region: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  branch_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  business_lead: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  customer_legal_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  customer_trade_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  contact_person_additional: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  designation: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  phone_number_2: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email_2: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  others_note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  google_map_link: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  landmark: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  pincode: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  billing_address_different: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  },
  billing_details: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  audit_requirement: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  technician_assign: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  technician: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  total_order_value: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: true,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: true,
  },
  discounted_price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: true,
  },
  sez: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  taxibility: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  sector: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  final_price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: true,
  },
  total_yearly_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: true,
  },
  cgst: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: true,
  },
  sgst: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: true,
  },
  gst_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: true,
  },
  mom_agreement_file: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  po_copy_file: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  rwa_file: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  gst_file: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  pan_file: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  trade_license_file: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  email_copy_file: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejected_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  rejected_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejected_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: "waste_collection_requests",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = WasteCollectionRequest;
