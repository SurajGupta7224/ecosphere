const { BusinessRegion, BusinessSubRegion } = require("../../models/index");
const { Op } = require("sequelize");

// GET /api/business-regions
const getAllBusinessRegions = async (req, res) => {
  const { page = 1, limit = 10, search = '', status = '', sortField = 'id', sortOrder = 'DESC' } = req.query;
  
  // Optional unpaginated query (e.g. for dropdowns)
  const isDropdown = req.query.limit === '1000' || req.query.dropdown === 'true';

  const where = {};
  if (search) {
    where[Op.or] = [
      { state: { [Op.like]: `%${search}%` } },
      { zone: { [Op.like]: `%${search}%` } }
    ];
  }
  if (status) {
    where.status = status === 'Active' ? '1' : '0';
  }

  const allowedSortFields = ['id', 'state', 'zone', 'status', 'created_at'];
  const orderField = allowedSortFields.includes(sortField) ? sortField : 'id';
  const orderDir = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

  try {
    if (isDropdown) {
      const regions = await BusinessRegion.findAll({
        where,
        order: [[orderField, orderDir]]
      });
      return res.status(200).json({ businessRegions: regions });
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await BusinessRegion.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[orderField, orderDir]]
    });

    return res.status(200).json({
      businessRegions: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error("getAllBusinessRegions error:", err);
    return res.status(500).json({ message: "Failed to fetch business regions" });
  }
};

// GET /api/business-regions/:id
const getBusinessRegionById = async (req, res) => {
  const { id } = req.params;
  try {
    const region = await BusinessRegion.findByPk(id);
    if (!region) {
      return res.status(404).json({ message: "Business region not found" });
    }
    return res.status(200).json({ businessRegion: region });
  } catch (err) {
    console.error("getBusinessRegionById error:", err);
    return res.status(500).json({ message: "Failed to fetch business region details" });
  }
};

// POST /api/business-regions
const createBusinessRegion = async (req, res) => {
  const { zone, state, status } = req.body;

  if (!state || !state.trim()) {
    return res.status(400).json({ message: "State/Region name is required" });
  }

  try {
    const existing = await BusinessRegion.findOne({
      where: { 
        zone: zone ? zone.trim() : null,
        state: state.trim() 
      }
    });
    if (existing) {
      return res.status(400).json({ message: "Business region with this Zone and State already exists" });
    }

    const region = await BusinessRegion.create({
      zone: zone ? zone.trim() : null,
      state: state.trim(),
      status: status || 'Active'
    });

    return res.status(201).json({ message: "Business region created successfully", businessRegion: region });
  } catch (err) {
    console.error("createBusinessRegion error:", err);
    return res.status(500).json({ message: "Failed to create business region" });
  }
};

// PUT /api/business-regions/:id
const updateBusinessRegion = async (req, res) => {
  const { id } = req.params;
  const { zone, state, status } = req.body;

  if (!state || !state.trim()) {
    return res.status(400).json({ message: "State/Region name is required" });
  }

  try {
    const region = await BusinessRegion.findByPk(id);
    if (!region) {
      return res.status(404).json({ message: "Business region not found" });
    }

    const existing = await BusinessRegion.findOne({
      where: { 
        zone: zone ? zone.trim() : null,
        state: state.trim(),
        id: { [Op.ne]: id }
      }
    });
    if (existing) {
      return res.status(400).json({ message: "Business region with this Zone and State already exists" });
    }

    await region.update({
      zone: zone ? zone.trim() : null,
      state: state.trim(),
      status: status || region.status
    });

    return res.status(200).json({ message: "Business region updated successfully", businessRegion: region });
  } catch (err) {
    console.error("updateBusinessRegion error:", err);
    return res.status(500).json({ message: "Failed to update business region" });
  }
};

// PATCH /api/business-regions/:id/status
const toggleBusinessRegionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const region = await BusinessRegion.findByPk(id);
    if (!region) {
      return res.status(404).json({ message: "Business region not found" });
    }

    await region.update({ status });
    return res.status(200).json({ message: "Status updated successfully", status });
  } catch (err) {
    console.error("toggleBusinessRegionStatus error:", err);
    return res.status(500).json({ message: "Failed to update status" });
  }
};

// DELETE /api/business-regions/:id
const deleteBusinessRegion = async (req, res) => {
  const { id } = req.params;

  try {
    const region = await BusinessRegion.findByPk(id);
    if (!region) {
      return res.status(404).json({ message: "Business region not found" });
    }

    const subRegionCount = await BusinessSubRegion.count({ where: { business_region_id: id } });
    if (subRegionCount > 0) {
      return res.status(400).json({ 
        message: "Cannot delete Business Region because it contains sub regions." 
      });
    }

    await region.destroy();
    return res.status(200).json({ message: "Business region deleted successfully" });
  } catch (err) {
    console.error("deleteBusinessRegion error:", err);
    return res.status(500).json({ message: "Failed to delete business region" });
  }
};

module.exports = {
  getAllBusinessRegions,
  getBusinessRegionById,
  createBusinessRegion,
  updateBusinessRegion,
  toggleBusinessRegionStatus,
  deleteBusinessRegion
};
