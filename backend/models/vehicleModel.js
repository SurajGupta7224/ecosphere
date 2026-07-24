const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class Vehicle extends Model {}

Vehicle.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    registration_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vehicle_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    capacity_kg: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    kerb_weight_kg: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fuel_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    manufacturing_year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    chassis_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    engine_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false
    },
    no_of_axles: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    owner_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vehicle_status: {
      type: DataTypes.STRING,
      defaultValue: "Active"
    },
    approval_status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending"
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    approved_date: {
      type: DataTypes.DATE,
      allowNull: true
    },

    // RC & Photo Scan Filenames
    rc_front_image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rc_back_image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vehicle_front_photo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vehicle_rear_photo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vehicle_left_photo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vehicle_right_photo: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // License & Certificate expirations
    emission_puc_expiry: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    insurance_expiry: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fc_expiry: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    permit_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    permit_expiry: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    road_tax_expiry: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },

    // License & Certificate Scans
    puc_certificate_image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    insurance_certificate_image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fc_certificate_image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    permit_certificate_image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    road_tax_receipt_image: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // Driver & Helper relations
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    helper_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    // Mobile Device Assignment
    device_name_model: {
      type: DataTypes.STRING,
      allowNull: false
    },
    device_brand: {
      type: DataTypes.STRING,
      allowNull: false
    },
    device_imei_1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    device_imei_2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    device_serial_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    device_mobile_number_sim: {
      type: DataTypes.STRING,
      allowNull: false
    },
    device_sim_provider: {
      type: DataTypes.STRING,
      allowNull: true
    },
    device_sim_iccid: {
      type: DataTypes.STRING,
      allowNull: true
    },
    device_purchase_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    device_warranty_expiry: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    device_assigned_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    device_returned_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    device_status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    device_condition: {
      type: DataTypes.STRING,
      allowNull: true
    },
    device_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    device_vendor: {
      type: DataTypes.STRING,
      allowNull: true
    },
    device_invoice_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    device_asset_number_tag: {
      type: DataTypes.STRING,
      allowNull: true
    },
    device_qr_code_tag: {
      type: DataTypes.STRING,
      allowNull: true
    },
    device_gps_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    device_mdm_enrolled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    device_remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    // Mobile Assignment Details
    device_assigned_to: {
      type: DataTypes.STRING,
      allowNull: false
    },
    device_assignment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    device_assignment_status: {
      type: DataTypes.STRING,
      defaultValue: "Active"
    },
    device_lock_status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    device_security_pin_set: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    device_charger_issued: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    device_accessories_issued: {
      type: DataTypes.STRING,
      allowNull: true
    },
    device_additional_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    // Mobile Documents Scans
    device_front_photo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    device_back_photo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    device_imei_sticker_photo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    device_purchase_invoice: {
      type: DataTypes.STRING,
      allowNull: false
    },
    device_warranty_card: {
      type: DataTypes.STRING,
      allowNull: true
    },
    device_box_imei_photo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    device_charger_photo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    device_accessories_photo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    device_other_document: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "Vehicle",
    tableName: "aggregator_vehicles",
    underscored: true,
    timestamps: true
  }
);

module.exports = Vehicle;
