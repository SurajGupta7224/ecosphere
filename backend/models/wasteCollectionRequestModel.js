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
  customer_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  authorized_person_name: {
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
    type: DataTypes.ENUM('Pending', 'Verified', 'Approved', 'Rejected', 'Completed'),
    defaultValue: 'Pending',
    allowNull: false,
  },
  images: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  created_by_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  request_source: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  generated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
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
  }
}, {
  tableName: "waste_collection_requests",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = WasteCollectionRequest;
