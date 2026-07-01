const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const WasteCollectionRequest = sequelize.define("WasteCollectionRequest", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
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
  suggested_weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  suggested_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  manual_weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  final_weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  pickup_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pickup_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  pickup_time: {
    type: DataTypes.STRING(20),
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
  address_search: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  waste_generator_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  complete_address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  area_sqm: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  no_of_dwelling_units: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  registered_rwa: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  gst: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  pan: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  trade_license: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  variations_data: {
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
