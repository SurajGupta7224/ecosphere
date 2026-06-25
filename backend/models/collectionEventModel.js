const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class CollectionEvent extends Model {}

CollectionEvent.init(
  {
    corporation_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    zone_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    ward_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    event_name: { 
      type: DataTypes.STRING(150), 
      allowNull: false 
    },
    categories: { 
      type: DataTypes.JSON, 
      allowNull: false 
    },
    address: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    },
    landmark: { 
      type: DataTypes.STRING(150), 
      allowNull: true 
    },
    google_map_url: { 
      type: DataTypes.STRING(255), 
      allowNull: true 
    },
    latitude: { 
      type: DataTypes.DECIMAL(10, 8), 
      allowNull: true 
    },
    longitude: { 
      type: DataTypes.DECIMAL(11, 8), 
      allowNull: true 
    },
    status: { 
      type: DataTypes.ENUM('Active', 'Inactive'), 
      defaultValue: 'Active' 
    }
  },
  {
    sequelize,
    modelName: "CollectionEvent",
    tableName: "collection_events",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = CollectionEvent;
