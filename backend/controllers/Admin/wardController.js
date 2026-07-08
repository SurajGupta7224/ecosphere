const { Ward, Zone, Corporation } = require("../../models/index");
const { Op } = require("sequelize");

// GET /api/wards
const getAllWards = async (req, res) => {
  const { page = 1, limit = 10, search = '', status = '', corporation_id = '', zone_id = '', sortField = 'id', sortOrder = 'DESC' } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where.ward_name = { [Op.like]: `%${search}%` };
  }
  if (status) {
    where.status = status;
  }
  if (corporation_id) {
    where.corporation_id = corporation_id;
  }
  if (zone_id) {
    where.zone_id = zone_id;
  }

  const allowedSortFields = ['id', 'ward_name', 'status', 'created_at'];
  const orderField = allowedSortFields.includes(sortField) ? sortField : 'id';
  const orderDir = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

  try {
    const { count, rows } = await Ward.findAndCountAll({
      where,
      include: [
        {
          model: Corporation,
          as: "corporation",
          attributes: ["id", "corporation_name"]
        },
        {
          model: Zone,
          as: "zone",
          attributes: ["id", "zone_name"]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[orderField, orderDir]]
    });

    return res.status(200).json({
      wards: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error("getAllWards error:", err);
    return res.status(500).json({ message: "Failed to fetch wards" });
  }
};

// GET /api/wards/:id
const getWardById = async (req, res) => {
  const { id } = req.params;
  try {
    const ward = await Ward.findByPk(id, {
      include: [
        {
          model: Corporation,
          as: "corporation",
          attributes: ["id", "corporation_name"]
        },
        {
          model: Zone,
          as: "zone",
          attributes: ["id", "zone_name"]
        }
      ]
    });
    if (!ward) {
      return res.status(404).json({ message: "Ward not found" });
    }
    return res.status(200).json({ ward });
  } catch (err) {
    console.error("getWardById error:", err);
    return res.status(500).json({ message: "Failed to fetch ward details" });
  }
};

// POST /api/wards
const createWard = async (req, res) => {
  const { corporation_id, zone_id, ward_name, status } = req.body;

  if (!corporation_id) {
    return res.status(400).json({ message: "Corporation is required" });
  }
  if (!zone_id) {
    return res.status(400).json({ message: "Zone is required" });
  }
  if (!ward_name || !ward_name.trim()) {
    return res.status(400).json({ message: "Ward name is required" });
  }

  try {
    // Verify Corporation and Zone exist and are active
    const corporation = await Corporation.findByPk(corporation_id);
    if (!corporation || corporation.status !== 'Active') {
      return res.status(400).json({ message: "Selected Corporation must be active" });
    }

    const zone = await Zone.findByPk(zone_id);
    if (!zone || zone.status !== 'Active') {
      return res.status(400).json({ message: "Selected Zone must be active" });
    }

    // Verify Zone belongs to Corporation
    if (zone.corporation_id !== parseInt(corporation_id)) {
      return res.status(400).json({ message: "Selected Zone does not belong to the selected Corporation" });
    }

    // Unique check under the selected zone
    const existing = await Ward.findOne({
      where: { 
        zone_id, 
        ward_name: ward_name.trim() 
      }
    });
    if (existing) {
      return res.status(400).json({ message: "Ward name already exists under the selected Zone" });
    }

    const ward = await Ward.create({
      corporation_id,
      zone_id,
      ward_name: ward_name.trim(),
      status: status || 'Active'
    });

    return res.status(201).json({ message: "Ward created successfully", ward });
  } catch (err) {
    console.error("createWard error:", err);
    return res.status(500).json({ message: "Failed to create ward" });
  }
};

// PUT /api/wards/:id
const updateWard = async (req, res) => {
  const { id } = req.params;
  const { corporation_id, zone_id, ward_name, status } = req.body;

  if (!corporation_id) {
    return res.status(400).json({ message: "Corporation is required" });
  }
  if (!zone_id) {
    return res.status(400).json({ message: "Zone is required" });
  }
  if (!ward_name || !ward_name.trim()) {
    return res.status(400).json({ message: "Ward name is required" });
  }

  try {
    const ward = await Ward.findByPk(id);
    if (!ward) {
      return res.status(404).json({ message: "Ward not found" });
    }

    // Verify Corporation and Zone exist
    const corporation = await Corporation.findByPk(corporation_id);
    if (!corporation) {
      return res.status(400).json({ message: "Selected Corporation not found" });
    }

    const zone = await Zone.findByPk(zone_id);
    if (!zone) {
      return res.status(400).json({ message: "Selected Zone not found" });
    }

    // Verify Zone belongs to Corporation
    if (zone.corporation_id !== parseInt(corporation_id)) {
      return res.status(400).json({ message: "Selected Zone does not belong to the selected Corporation" });
    }

    // Unique check under the selected zone excluding self
    const existing = await Ward.findOne({
      where: {
        zone_id,
        ward_name: ward_name.trim(),
        id: { [Op.ne]: id }
      }
    });
    if (existing) {
      return res.status(400).json({ message: "Ward name already exists under the selected Zone" });
    }

    await ward.update({
      corporation_id,
      zone_id,
      ward_name: ward_name.trim(),
      status: status || ward.status
    });

    return res.status(200).json({ message: "Ward updated successfully", ward });
  } catch (err) {
    console.error("updateWard error:", err);
    return res.status(500).json({ message: "Failed to update ward" });
  }
};

// PATCH /api/wards/:id/status
const toggleWardStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const ward = await Ward.findByPk(id);
    if (!ward) {
      return res.status(404).json({ message: "Ward not found" });
    }

    await ward.update({ status });
    return res.status(200).json({ message: "Status updated successfully", status });
  } catch (err) {
    console.error("toggleWardStatus error:", err);
    return res.status(500).json({ message: "Failed to update status" });
  }
};

// DELETE /api/wards/:id
const deleteWard = async (req, res) => {
  const { id } = req.params;

  try {
    const ward = await Ward.findByPk(id);
    if (!ward) {
      return res.status(404).json({ message: "Ward not found" });
    }

    await ward.destroy();
    return res.status(200).json({ message: "Ward deleted successfully" });
  } catch (err) {
    console.error("deleteWard error:", err);
    return res.status(500).json({ message: "Failed to delete ward" });
  }
};

// GET /api/zones/:id/wards - Load Active Wards for dependent dropdown
const getWardsByZone = async (req, res) => {
  const { id } = req.params;

  try {
    const wards = await Ward.findAll({
      where: {
        zone_id: id,
        status: 'Active'
      },
      order: [['ward_name', 'ASC']]
    });
    return res.status(200).json({ wards });
  } catch (err) {
    console.error("getWardsByZone error:", err);
    return res.status(500).json({ message: "Failed to fetch wards for zone" });
  }
};

module.exports = {
  getAllWards,
  getWardById,
  createWard,
  updateWard,
  toggleWardStatus,
  deleteWard,
  getWardsByZone
};
