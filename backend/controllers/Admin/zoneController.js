const { Zone, Corporation, Ward } = require("../../models/index");
const { Op } = require("sequelize");

// GET /api/zones
const getAllZones = async (req, res) => {
  const { page = 1, limit = 10, search = '', status = '', corporation_id = '', sortField = 'id', sortOrder = 'DESC' } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where.zone_name = { [Op.like]: `%${search}%` };
  }
  if (status) {
    where.status = status;
  }
  if (corporation_id) {
    where.corporation_id = corporation_id;
  }

  const allowedSortFields = ['id', 'zone_name', 'status', 'created_at'];
  const orderField = allowedSortFields.includes(sortField) ? sortField : 'id';
  const orderDir = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

  try {
    const { count, rows } = await Zone.findAndCountAll({
      where,
      include: [
        {
          model: Corporation,
          as: "corporation",
          attributes: ["id", "corporation_name"]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[orderField, orderDir]]
    });

    return res.status(200).json({
      zones: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error("getAllZones error:", err);
    return res.status(500).json({ message: "Failed to fetch zones" });
  }
};

// GET /api/zones/:id
const getZoneById = async (req, res) => {
  const { id } = req.params;
  try {
    const zone = await Zone.findByPk(id, {
      include: [
        {
          model: Corporation,
          as: "corporation",
          attributes: ["id", "corporation_name"]
        }
      ]
    });
    if (!zone) {
      return res.status(404).json({ message: "Zone not found" });
    }
    return res.status(200).json({ zone });
  } catch (err) {
    console.error("getZoneById error:", err);
    return res.status(500).json({ message: "Failed to fetch zone details" });
  }
};

// POST /api/zones
const createZone = async (req, res) => {
  const { corporation_id, zone_name, status } = req.body;

  if (!corporation_id) {
    return res.status(400).json({ message: "Corporation is required" });
  }
  if (!zone_name || !zone_name.trim()) {
    return res.status(400).json({ message: "Zone name is required" });
  }

  try {
    // Verify Corporation is Active
    const corporation = await Corporation.findByPk(corporation_id);
    if (!corporation) {
      return res.status(404).json({ message: "Selected Corporation not found" });
    }
    if (corporation.status !== 'Active') {
      return res.status(400).json({ message: "Selected Corporation is inactive" });
    }

    // Unique check under the selected corporation
    const existing = await Zone.findOne({
      where: { 
        corporation_id, 
        zone_name: zone_name.trim() 
      }
    });
    if (existing) {
      return res.status(400).json({ message: "Zone name already exists under the selected Corporation" });
    }

    const zone = await Zone.create({
      corporation_id,
      zone_name: zone_name.trim(),
      status: status || 'Active'
    });

    return res.status(201).json({ message: "Zone created successfully", zone });
  } catch (err) {
    console.error("createZone error:", err);
    return res.status(500).json({ message: "Failed to create zone" });
  }
};

// PUT /api/zones/:id
const updateZone = async (req, res) => {
  const { id } = req.params;
  const { corporation_id, zone_name, status } = req.body;

  if (!corporation_id) {
    return res.status(400).json({ message: "Corporation is required" });
  }
  if (!zone_name || !zone_name.trim()) {
    return res.status(400).json({ message: "Zone name is required" });
  }

  try {
    const zone = await Zone.findByPk(id);
    if (!zone) {
      return res.status(404).json({ message: "Zone not found" });
    }

    // Unique check excluding self
    const existing = await Zone.findOne({
      where: {
        corporation_id,
        zone_name: zone_name.trim(),
        id: { [Op.ne]: id }
      }
    });
    if (existing) {
      return res.status(400).json({ message: "Zone name already exists under the selected Corporation" });
    }

    await zone.update({
      corporation_id,
      zone_name: zone_name.trim(),
      status: status || zone.status
    });

    return res.status(200).json({ message: "Zone updated successfully", zone });
  } catch (err) {
    console.error("updateZone error:", err);
    return res.status(500).json({ message: "Failed to update zone" });
  }
};

// PATCH /api/zones/:id/status
const toggleZoneStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const zone = await Zone.findByPk(id);
    if (!zone) {
      return res.status(404).json({ message: "Zone not found" });
    }

    await zone.update({ status });
    return res.status(200).json({ message: "Status updated successfully", status });
  } catch (err) {
    console.error("toggleZoneStatus error:", err);
    return res.status(500).json({ message: "Failed to update status" });
  }
};

// DELETE /api/zones/:id
const deleteZone = async (req, res) => {
  const { id } = req.params;

  try {
    const zone = await Zone.findByPk(id);
    if (!zone) {
      return res.status(404).json({ message: "Zone not found" });
    }

    // Check if contains Wards
    const wardCount = await Ward.count({ where: { zone_id: id } });
    if (wardCount > 0) {
      return res.status(400).json({ 
        message: "Cannot delete Zone because it contains active or inactive wards." 
      });
    }

    await zone.destroy();
    return res.status(200).json({ message: "Zone deleted successfully" });
  } catch (err) {
    console.error("deleteZone error:", err);
    return res.status(500).json({ message: "Failed to delete zone" });
  }
};

// GET /api/corporations/:id/zones - Load Active Zones for dependent dropdown
const getZonesByCorporation = async (req, res) => {
  const { id } = req.params;

  try {
    const zones = await Zone.findAll({
      where: {
        corporation_id: id,
        status: 'Active'
      },
      order: [['zone_name', 'ASC']]
    });
    return res.status(200).json({ zones });
  } catch (err) {
    console.error("getZonesByCorporation error:", err);
    return res.status(500).json({ message: "Failed to fetch zones for corporation" });
  }
};

module.exports = {
  getAllZones,
  getZoneById,
  createZone,
  updateZone,
  toggleZoneStatus,
  deleteZone,
  getZonesByCorporation
};
