const { Vehicle, Employee } = require("../../models/index");
const { Op } = require("sequelize");

// GET /api/aggregator-vehicles - List all vehicles
const getAllVehicles = async (req, res) => {
  try {
    const { status, vehicle_type, fuel_type } = req.query;
    const where = {};
    if (status) where.vehicle_status = status;
    if (vehicle_type) where.vehicle_type = vehicle_type;
    if (fuel_type) where.fuel_type = fuel_type;

    const isAdmin = req.user?.role?.role_name?.toLowerCase() === 'admin';
    if (!isAdmin) {
      where.user_id = req.user.id;
    }

    const vehicles = await Vehicle.findAll({
      where,
      include: [
        { model: Employee, as: "driver", attributes: ["id", "name", "mobile_number", "driving_license_number"] },
        { model: Employee, as: "helper", attributes: ["id", "name", "mobile_number"] }
      ],
      order: [["created_at", "DESC"]]
    });

    return res.status(200).json({ vehicles });
  } catch (err) {
    console.error("getAllVehicles error:", err);
    return res.status(500).json({ message: "Failed to fetch vehicles database" });
  }
};

// GET /api/aggregator-vehicles/:id - Get details of a single vehicle
const getVehicleById = async (req, res) => {
  const { id } = req.params;
  try {
    const vehicle = await Vehicle.findByPk(id, {
      include: [
        { model: Employee, as: "driver", attributes: ["id", "name", "mobile_number", "driving_license_number"] },
        { model: Employee, as: "helper", attributes: ["id", "name", "mobile_number"] }
      ]
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle record not found" });
    }

    return res.status(200).json({ vehicle });
  } catch (err) {
    console.error("getVehicleById error:", err);
    return res.status(500).json({ message: "Failed to fetch vehicle details" });
  }
};

// POST /api/aggregator-vehicles - Create new vehicle record
const createVehicle = async (req, res) => {
  try {
    const {
      registration_number, brand, model, vehicle_type, capacity_kg, kerb_weight_kg,
      fuel_type, manufacturing_year, chassis_number, engine_number, color, no_of_axles,
      owner_type, vehicle_status,
      
      emission_puc_expiry, insurance_expiry, fc_expiry, permit_number, permit_expiry, road_tax_expiry,
      driver_id, helper_id,

      device_name_model, device_brand, device_imei_1, device_imei_2, device_serial_number,
      device_mobile_number_sim, device_sim_provider, device_sim_iccid, device_purchase_date,
      device_warranty_expiry, device_assigned_date, device_returned_date, device_status,
      device_condition, device_cost, device_vendor, device_invoice_number, device_asset_number_tag,
      device_qr_code_tag, device_gps_enabled, device_mdm_enrolled, device_remarks,
      
      device_assigned_to, device_assignment_date, device_assignment_status, device_lock_status,
      device_security_pin_set, device_charger_issued, device_accessories_issued, device_additional_notes
    } = req.body;

    // Required fields check (matching form details)
    if (
      !registration_number || !brand || !model || !vehicle_type || !capacity_kg || !kerb_weight_kg ||
      !fuel_type || !manufacturing_year || !chassis_number || !engine_number || !color || !no_of_axles ||
      !owner_type || !emission_puc_expiry || !insurance_expiry || !fc_expiry ||
      !device_name_model || !device_brand || !device_imei_1 || !device_mobile_number_sim ||
      !device_assigned_date || !device_status || !device_assigned_to || !device_assignment_date
    ) {
      return res.status(400).json({ message: "Please fill in all mandatory fields" });
    }

    // Check unique registration_number (Only on create!)
    const existing = await Vehicle.findOne({
      where: { registration_number }
    });

    if (existing) {
      return res.status(400).json({
        message: `Registration number is already registered by vehicle ${existing.brand} ${existing.model} (ID: VEH-${existing.id})`
      });
    }

    // Process files
    const fileFields = [
      'rc_front_image', 'rc_back_image', 'vehicle_front_photo', 'vehicle_rear_photo',
      'vehicle_left_photo', 'vehicle_right_photo', 'puc_certificate_image', 'insurance_certificate_image',
      'fc_certificate_image', 'permit_certificate_image', 'road_tax_receipt_image',
      'device_front_photo', 'device_back_photo', 'device_imei_sticker_photo', 'device_purchase_invoice',
      'device_warranty_card', 'device_box_imei_photo', 'device_charger_photo', 'device_accessories_photo',
      'device_other_document'
    ];

    const fileData = {};
    if (req.files) {
      fileFields.forEach(field => {
        if (req.files[field] && req.files[field][0]) {
          fileData[field] = req.files[field][0].filename;
        }
      });
    }

    // Verify required files are uploaded
    const requiredFiles = [
      'rc_front_image', 'rc_back_image', 'puc_certificate_image', 'insurance_certificate_image',
      'fc_certificate_image', 'device_front_photo', 'device_back_photo', 'device_imei_sticker_photo',
      'device_purchase_invoice'
    ];

    for (const fileKey of requiredFiles) {
      if (!fileData[fileKey]) {
        return res.status(400).json({ message: `Mandatory file upload is missing: ${fileKey.replace(/_/g, ' ').toUpperCase()}` });
      }
    }

    const vehicle = await Vehicle.create({
      user_id: req.user.id,
      registration_number, brand, model, vehicle_type,
      capacity_kg: parseInt(capacity_kg) || 0,
      kerb_weight_kg: parseInt(kerb_weight_kg) || 0,
      fuel_type,
      manufacturing_year: parseInt(manufacturing_year) || 2026,
      chassis_number, engine_number, color,
      no_of_axles: parseInt(no_of_axles) || 2,
      owner_type,
      vehicle_status: vehicle_status || "Active",
      
      emission_puc_expiry, insurance_expiry, fc_expiry,
      permit_number: permit_number || null,
      permit_expiry: permit_expiry || null,
      road_tax_expiry: road_tax_expiry || null,
      
      driver_id: driver_id ? parseInt(driver_id) : null,
      helper_id: helper_id ? parseInt(helper_id) : null,

      device_name_model, device_brand, device_imei_1,
      device_imei_2: device_imei_2 || null,
      device_serial_number: device_serial_number || null,
      device_mobile_number_sim,
      device_sim_provider: device_sim_provider || null,
      device_sim_iccid: device_sim_iccid || null,
      device_purchase_date: device_purchase_date || null,
      device_warranty_expiry: device_warranty_expiry || null,
      device_assigned_date,
      device_returned_date: device_returned_date || null,
      device_status,
      device_condition: device_condition || null,
      device_cost: device_cost ? parseFloat(device_cost) : null,
      device_vendor: device_vendor || null,
      device_invoice_number: device_invoice_number || null,
      device_asset_number_tag: device_asset_number_tag || null,
      device_qr_code_tag: device_qr_code_tag || null,
      device_gps_enabled: device_gps_enabled === "true" || device_gps_enabled === true,
      device_mdm_enrolled: device_mdm_enrolled === "true" || device_mdm_enrolled === true,
      device_remarks: device_remarks || null,
      
      device_assigned_to, device_assignment_date,
      device_assignment_status: device_assignment_status || "Active",
      device_lock_status: device_lock_status || null,
      device_security_pin_set: device_security_pin_set === "true" || device_security_pin_set === true,
      device_charger_issued: device_charger_issued === "true" || device_charger_issued === true,
      device_accessories_issued: device_accessories_issued || null,
      device_additional_notes: device_additional_notes || null,

      // Files data
      ...fileData
    });

    return res.status(201).json({ message: "Vehicle registered successfully", vehicleId: vehicle.id });
  } catch (err) {
    console.error("createVehicle error:", err);
    return res.status(500).json({ message: "Failed to create vehicle record", error: err.message });
  }
};

// PUT /api/aggregator-vehicles/:id - Update existing vehicle record
const updateVehicle = async (req, res) => {
  const { id } = req.params;
  try {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle record not found" });
    }

    const {
      registration_number, brand, model, vehicle_type, capacity_kg, kerb_weight_kg,
      fuel_type, manufacturing_year, chassis_number, engine_number, color, no_of_axles,
      owner_type, vehicle_status,
      
      emission_puc_expiry, insurance_expiry, fc_expiry, permit_number, permit_expiry, road_tax_expiry,
      driver_id, helper_id,

      device_name_model, device_brand, device_imei_1, device_imei_2, device_serial_number,
      device_mobile_number_sim, device_sim_provider, device_sim_iccid, device_purchase_date,
      device_warranty_expiry, device_assigned_date, device_returned_date, device_status,
      device_condition, device_cost, device_vendor, device_invoice_number, device_asset_number_tag,
      device_qr_code_tag, device_gps_enabled, device_mdm_enrolled, device_remarks,
      
      device_assigned_to, device_assignment_date, device_assignment_status, device_lock_status,
      device_security_pin_set, device_charger_issued, device_accessories_issued, device_additional_notes
    } = req.body;

    const updateData = {
      registration_number, brand, model, vehicle_type,
      capacity_kg: parseInt(capacity_kg) || 0,
      kerb_weight_kg: parseInt(kerb_weight_kg) || 0,
      fuel_type,
      manufacturing_year: parseInt(manufacturing_year) || 2026,
      chassis_number, engine_number, color,
      no_of_axles: parseInt(no_of_axles) || 2,
      owner_type,
      vehicle_status: vehicle_status || vehicle.vehicle_status,
      
      emission_puc_expiry, insurance_expiry, fc_expiry,
      permit_number: permit_number || null,
      permit_expiry: permit_expiry || null,
      road_tax_expiry: road_tax_expiry || null,
      
      driver_id: driver_id ? parseInt(driver_id) : null,
      helper_id: helper_id ? parseInt(helper_id) : null,

      device_name_model, device_brand, device_imei_1,
      device_imei_2: device_imei_2 || null,
      device_serial_number: device_serial_number || null,
      device_mobile_number_sim,
      device_sim_provider: device_sim_provider || null,
      device_sim_iccid: device_sim_iccid || null,
      device_purchase_date: device_purchase_date || null,
      device_warranty_expiry: device_warranty_expiry || null,
      device_assigned_date,
      device_returned_date: device_returned_date || null,
      device_status,
      device_condition: device_condition || null,
      device_cost: device_cost ? parseFloat(device_cost) : null,
      device_vendor: device_vendor || null,
      device_invoice_number: device_invoice_number || null,
      device_asset_number_tag: device_asset_number_tag || null,
      device_qr_code_tag: device_qr_code_tag || null,
      device_gps_enabled: device_gps_enabled === "true" || device_gps_enabled === true,
      device_mdm_enrolled: device_mdm_enrolled === "true" || device_mdm_enrolled === true,
      device_remarks: device_remarks || null,
      
      device_assigned_to, device_assignment_date,
      device_assignment_status: device_assignment_status || vehicle.device_assignment_status,
      device_lock_status: device_lock_status || null,
      device_security_pin_set: device_security_pin_set === "true" || device_security_pin_set === true,
      device_charger_issued: device_charger_issued === "true" || device_charger_issued === true,
      device_accessories_issued: device_accessories_issued || null,
      device_additional_notes: device_additional_notes || null
    };

    // Process uploaded files
    if (req.files) {
      const fileFields = [
        'rc_front_image', 'rc_back_image', 'vehicle_front_photo', 'vehicle_rear_photo',
        'vehicle_left_photo', 'vehicle_right_photo', 'puc_certificate_image', 'insurance_certificate_image',
        'fc_certificate_image', 'permit_certificate_image', 'road_tax_receipt_image',
        'device_front_photo', 'device_back_photo', 'device_imei_sticker_photo', 'device_purchase_invoice',
        'device_warranty_card', 'device_box_imei_photo', 'device_charger_photo', 'device_accessories_photo',
        'device_other_document'
      ];
      fileFields.forEach(field => {
        if (req.files[field] && req.files[field][0]) {
          updateData[field] = req.files[field][0].filename;
        }
      });
    }

    await vehicle.update(updateData);
    return res.status(200).json({ message: "Vehicle details updated successfully", vehicle });
  } catch (err) {
    console.error("updateVehicle error:", err);
    return res.status(500).json({ message: "Failed to update vehicle record", error: err.message });
  }
};

// PATCH /api/aggregator-vehicles/:id/status - Toggle status
const updateVehicleStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["Active", "Inactive"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle record not found" });
    }

    await vehicle.update({ vehicle_status: status });
    return res.status(200).json({ message: "Vehicle status updated successfully" });
  } catch (err) {
    console.error("updateVehicleStatus error:", err);
    return res.status(500).json({ message: "Failed to update status" });
  }
};

// DELETE /api/aggregator-vehicles/:id - Delete record
const deleteVehicle = async (req, res) => {
  const { id } = req.params;
  try {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle record not found" });
    }

    await vehicle.destroy();
    return res.status(200).json({ message: "Vehicle record deleted successfully" });
  } catch (err) {
    console.error("deleteVehicle error:", err);
    return res.status(500).json({ message: "Failed to delete vehicle record" });
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  updateVehicleStatus,
  deleteVehicle
};
