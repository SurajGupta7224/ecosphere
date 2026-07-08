const { Corporation, Zone } = require("../../models/index");
const { Op } = require("sequelize");

// GET /api/corporations
const getAllCorporations = async (req, res) => {
  const { page = 1, limit = 10, search = '', status = '', sortField = 'id', sortOrder = 'DESC' } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where.corporation_name = { [Op.like]: `%${search}%` };
  }
  if (status) {
    where.status = status;
  }

  // Ensure sorting matches valid columns
  const allowedSortFields = ['id', 'corporation_name', 'status', 'created_at'];
  const orderField = allowedSortFields.includes(sortField) ? sortField : 'id';
  const orderDir = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

  try {
    const { count, rows } = await Corporation.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[orderField, orderDir]]
    });

    return res.status(200).json({
      corporations: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error("getAllCorporations error:", err);
    return res.status(500).json({ message: "Failed to fetch corporations" });
  }
};

// GET /api/corporations/:id
const getCorporationById = async (req, res) => {
  const { id } = req.params;
  try {
    const corporation = await Corporation.findByPk(id);
    if (!corporation) {
      return res.status(404).json({ message: "Corporation not found" });
    }
    return res.status(200).json({ corporation });
  } catch (err) {
    console.error("getCorporationById error:", err);
    return res.status(500).json({ message: "Failed to fetch corporation details" });
  }
};

// POST /api/corporations
const createCorporation = async (req, res) => {
  const { corporation_name, status } = req.body;

  if (!corporation_name || !corporation_name.trim()) {
    return res.status(400).json({ message: "Corporation name is required" });
  }
  if (corporation_name.length > 100) {
    return res.status(400).json({ message: "Corporation name cannot exceed 100 characters" });
  }

  try {
    // Unique check
    const existing = await Corporation.findOne({
      where: { corporation_name: corporation_name.trim() }
    });
    if (existing) {
      return res.status(400).json({ message: "Corporation name already exists" });
    }

    const corporation = await Corporation.create({
      corporation_name: corporation_name.trim(),
      status: status || 'Active'
    });

    return res.status(201).json({ message: "Corporation created successfully", corporation });
  } catch (err) {
    console.error("createCorporation error:", err);
    return res.status(500).json({ message: "Failed to create corporation" });
  }
};

// PUT /api/corporations/:id
const updateCorporation = async (req, res) => {
  const { id } = req.params;
  const { corporation_name, status } = req.body;

  if (!corporation_name || !corporation_name.trim()) {
    return res.status(400).json({ message: "Corporation name is required" });
  }
  if (corporation_name.length > 100) {
    return res.status(400).json({ message: "Corporation name cannot exceed 100 characters" });
  }

  try {
    const corporation = await Corporation.findByPk(id);
    if (!corporation) {
      return res.status(404).json({ message: "Corporation not found" });
    }

    // Unique check excluding self
    const existing = await Corporation.findOne({
      where: { 
        corporation_name: corporation_name.trim(),
        id: { [Op.ne]: id }
      }
    });
    if (existing) {
      return res.status(400).json({ message: "Corporation name already exists" });
    }

    await corporation.update({
      corporation_name: corporation_name.trim(),
      status: status || corporation.status
    });

    return res.status(200).json({ message: "Corporation updated successfully", corporation });
  } catch (err) {
    console.error("updateCorporation error:", err);
    return res.status(500).json({ message: "Failed to update corporation" });
  }
};

// PATCH /api/corporations/:id/status
const toggleCorporationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const corporation = await Corporation.findByPk(id);
    if (!corporation) {
      return res.status(404).json({ message: "Corporation not found" });
    }

    await corporation.update({ status });
    return res.status(200).json({ message: "Status updated successfully", status });
  } catch (err) {
    console.error("toggleCorporationStatus error:", err);
    return res.status(500).json({ message: "Failed to update status" });
  }
};

// DELETE /api/corporations/:id
const deleteCorporation = async (req, res) => {
  const { id } = req.params;

  try {
    const corporation = await Corporation.findByPk(id);
    if (!corporation) {
      return res.status(404).json({ message: "Corporation not found" });
    }

    // Check if contains Zones
    const zoneCount = await Zone.count({ where: { corporation_id: id } });
    if (zoneCount > 0) {
      return res.status(400).json({ 
        message: "Cannot delete Corporation because it contains active or inactive zones." 
      });
    }

    await corporation.destroy();
    return res.status(200).json({ message: "Corporation deleted successfully" });
  } catch (err) {
    console.error("deleteCorporation error:", err);
    return res.status(500).json({ message: "Failed to delete corporation" });
  }
};

module.exports = {
  getAllCorporations,
  getCorporationById,
  createCorporation,
  updateCorporation,
  toggleCorporationStatus,
  deleteCorporation
};
