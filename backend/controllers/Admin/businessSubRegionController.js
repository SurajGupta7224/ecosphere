const { BusinessSubRegion, BusinessRegion } = require("../../models/index");
const { Op } = require("sequelize");

// GET /api/business-sub-regions
const getAllBusinessSubRegions = async (req, res) => {
  const { page = 1, limit = 10, search = '', business_region_id = '', status = '', sortField = 'id', sortOrder = 'DESC' } = req.query;

  const isDropdown = limit === '1000' || req.query.dropdown === 'true';

  const where = {};
  if (search) {
    where.sub_region_name = { [Op.like]: `%${search}%` };
  }
  if (business_region_id) {
    where.business_region_id = business_region_id;
  }
  if (status) {
    where.status = status;
  }

  const allowedSortFields = ['id', 'sub_region_name', 'status', 'created_at'];
  const orderField = allowedSortFields.includes(sortField) ? sortField : 'id';
  const orderDir = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

  try {
    if (isDropdown) {
      const subRegions = await BusinessSubRegion.findAll({
        where,
        include: [{ model: BusinessRegion, as: 'businessRegion' }],
        order: [[orderField, orderDir]]
      });
      return res.status(200).json({ businessSubRegions: subRegions });
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await BusinessSubRegion.findAndCountAll({
      where,
      include: [{ model: BusinessRegion, as: 'businessRegion' }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[orderField, orderDir]]
    });

    return res.status(200).json({
      businessSubRegions: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error("getAllBusinessSubRegions error:", err);
    return res.status(500).json({ message: "Failed to fetch business sub regions" });
  }
};

// GET /api/business-sub-regions/:id
const getBusinessSubRegionById = async (req, res) => {
  const { id } = req.params;
  try {
    const subRegion = await BusinessSubRegion.findByPk(id, {
      include: [{ model: BusinessRegion, as: 'businessRegion' }]
    });
    if (!subRegion) {
      return res.status(404).json({ message: "Business sub region not found" });
    }
    return res.status(200).json({ businessSubRegion: subRegion });
  } catch (err) {
    console.error("getBusinessSubRegionById error:", err);
    return res.status(500).json({ message: "Failed to fetch business sub region details" });
  }
};

// POST /api/business-sub-regions
const createBusinessSubRegion = async (req, res) => {
  const { 
    business_region_id, 
    sub_region_name, 
    branch_name, 
    office_address, 
    gstn, 
    agri_licence, 
    shop_establishment, 
    contact_person_name, 
    contact_number, 
    email_id, 
    status 
  } = req.body;

  if (!business_region_id) {
    return res.status(400).json({ message: "Business region is required" });
  }
  
  const finalSubRegionName = (sub_region_name || branch_name || '').trim();
  const finalBranchName = (branch_name || sub_region_name || '').trim();

  if (!finalSubRegionName) {
    return res.status(400).json({ message: "Sub region name or branch name is required" });
  }

  try {
    const region = await BusinessRegion.findByPk(business_region_id);
    if (!region) {
      return res.status(404).json({ message: "Business region not found" });
    }

    // Find all regions that share the same state name to validate uniqueness across zones
    const siblingRegions = await BusinessRegion.findAll({
      where: { state: region.state },
      attributes: ['id']
    });
    const regionIds = siblingRegions.map(r => r.id);

    const existing = await BusinessSubRegion.findOne({
      where: { 
        business_region_id: { [Op.in]: regionIds },
        sub_region_name: finalSubRegionName 
      }
    });
    if (existing) {
      return res.status(400).json({ message: "Sub region name already exists under this region/state" });
    }

    // Auto-generate branch code like EC-001, EC-002, etc.
    let nextBranchCode = 'EC-001';
    const lastSubRegion = await BusinessSubRegion.findOne({
      where: {
        branch_code: {
          [Op.like]: 'EC-%'
        }
      },
      order: [
        [BusinessSubRegion.sequelize.literal('LENGTH(branch_code)'), 'DESC'],
        ['branch_code', 'DESC']
      ]
    });
    if (lastSubRegion && lastSubRegion.branch_code) {
      const parts = lastSubRegion.branch_code.split('-');
      if (parts.length === 2) {
        const numPart = parseInt(parts[1], 10);
        if (!isNaN(numPart)) {
          const nextNum = numPart + 1;
          nextBranchCode = `EC-${String(nextNum).padStart(3, '0')}`;
        }
      }
    }

    // Process file uploads
    const gstn_file = req.files && req.files['gstn_file'] ? req.files['gstn_file'][0].filename : null;
    const agri_licence_file = req.files && req.files['agri_licence_file'] ? req.files['agri_licence_file'][0].filename : null;
    const shop_establishment_file = req.files && req.files['shop_establishment_file'] ? req.files['shop_establishment_file'][0].filename : null;

    const subRegion = await BusinessSubRegion.create({
      business_region_id,
      sub_region_name: finalSubRegionName,
      branch_name: finalBranchName,
      branch_code: nextBranchCode,
      office_address: office_address ? office_address.trim() : null,
      gstn: gstn ? gstn.trim() : null,
      agri_licence: agri_licence ? agri_licence.trim() : null,
      shop_establishment: shop_establishment ? shop_establishment.trim() : null,
      contact_person_name: contact_person_name ? contact_person_name.trim() : null,
      contact_number: contact_number ? contact_number.trim() : null,
      email_id: email_id ? email_id.trim() : null,
      gstn_file,
      agri_licence_file,
      shop_establishment_file,
      status: status || 'Active'
    });

    return res.status(201).json({ message: "Business sub region created successfully", businessSubRegion: subRegion });
  } catch (err) {
    console.error("createBusinessSubRegion error:", err);
    return res.status(500).json({ message: "Failed to create business sub region" });
  }
};

// PUT /api/business-sub-regions/:id
const updateBusinessSubRegion = async (req, res) => {
  const { id } = req.params;
  const { 
    business_region_id, 
    sub_region_name, 
    branch_name, 
    office_address, 
    gstn, 
    agri_licence, 
    shop_establishment, 
    contact_person_name, 
    contact_number, 
    email_id, 
    status 
  } = req.body;

  if (!business_region_id) {
    return res.status(400).json({ message: "Business region is required" });
  }

  const finalSubRegionName = (sub_region_name || branch_name || '').trim();
  const finalBranchName = (branch_name || sub_region_name || '').trim();

  if (!finalSubRegionName) {
    return res.status(400).json({ message: "Sub region name or branch name is required" });
  }

  try {
    const subRegion = await BusinessSubRegion.findByPk(id);
    if (!subRegion) {
      return res.status(404).json({ message: "Business sub region not found" });
    }

    const region = await BusinessRegion.findByPk(business_region_id);
    if (!region) {
      return res.status(404).json({ message: "Business region not found" });
    }

    // Find all regions that share the same state name to validate uniqueness across zones
    const siblingRegions = await BusinessRegion.findAll({
      where: { state: region.state },
      attributes: ['id']
    });
    const regionIds = siblingRegions.map(r => r.id);

    const existing = await BusinessSubRegion.findOne({
      where: { 
        business_region_id: { [Op.in]: regionIds },
        sub_region_name: finalSubRegionName,
        id: { [Op.ne]: id }
      }
    });
    if (existing) {
      return res.status(400).json({ message: "Sub region name already exists under this region/state" });
    }

    // Process file uploads
    const gstn_file = req.files && req.files['gstn_file'] ? req.files['gstn_file'][0].filename : subRegion.gstn_file;
    const agri_licence_file = req.files && req.files['agri_licence_file'] ? req.files['agri_licence_file'][0].filename : subRegion.agri_licence_file;
    const shop_establishment_file = req.files && req.files['shop_establishment_file'] ? req.files['shop_establishment_file'][0].filename : subRegion.shop_establishment_file;

    await subRegion.update({
      business_region_id,
      sub_region_name: finalSubRegionName,
      branch_name: finalBranchName,
      office_address: office_address ? office_address.trim() : null,
      gstn: gstn ? gstn.trim() : null,
      agri_licence: agri_licence ? agri_licence.trim() : null,
      shop_establishment: shop_establishment ? shop_establishment.trim() : null,
      contact_person_name: contact_person_name ? contact_person_name.trim() : null,
      contact_number: contact_number ? contact_number.trim() : null,
      email_id: email_id ? email_id.trim() : null,
      gstn_file,
      agri_licence_file,
      shop_establishment_file,
      status: status || subRegion.status
    });

    return res.status(200).json({ message: "Business sub region updated successfully", businessSubRegion: subRegion });
  } catch (err) {
    console.error("updateBusinessSubRegion error:", err);
    return res.status(500).json({ message: "Failed to update business sub region" });
  }
};

// PATCH /api/business-sub-regions/:id/status
const toggleBusinessSubRegionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const subRegion = await BusinessSubRegion.findByPk(id);
    if (!subRegion) {
      return res.status(404).json({ message: "Business sub region not found" });
    }

    await subRegion.update({ status });
    return res.status(200).json({ message: "Status updated successfully", status });
  } catch (err) {
    console.error("toggleBusinessSubRegionStatus error:", err);
    return res.status(500).json({ message: "Failed to update status" });
  }
};

// DELETE /api/business-sub-regions/:id
const deleteBusinessSubRegion = async (req, res) => {
  const { id } = req.params;

  try {
    const subRegion = await BusinessSubRegion.findByPk(id);
    if (!subRegion) {
      return res.status(404).json({ message: "Business sub region not found" });
    }

    await subRegion.destroy();
    return res.status(200).json({ message: "Business sub region deleted successfully" });
  } catch (err) {
    console.error("deleteBusinessSubRegion error:", err);
    return res.status(500).json({ message: "Failed to delete business sub region" });
  }
};

// GET /api/business-regions/:id/sub-regions
const getSubRegionsByRegion = async (req, res) => {
  const { id } = req.params;
  try {
    const region = await BusinessRegion.findByPk(id);
    if (!region) {
      return res.status(404).json({ message: "Business region not found" });
    }

    // Find all regions that share the same state name (case-insensitive) to prevent missing sub-regions
    const siblingRegions = await BusinessRegion.findAll({
      where: { state: region.state },
      attributes: ['id']
    });
    const regionIds = siblingRegions.map(r => r.id);

    const subRegions = await BusinessSubRegion.findAll({
      where: { 
        business_region_id: { [Op.in]: regionIds },
        status: 'Active'
      }
    });
    return res.status(200).json({ subRegions, businessSubRegions: subRegions });
  } catch (err) {
    console.error("getSubRegionsByRegion error:", err);
    return res.status(500).json({ message: "Failed to load sub regions" });
  }
};

const getNextBranchCode = async (req, res) => {
  try {
    let nextBranchCode = 'EC-001';
    const lastSubRegion = await BusinessSubRegion.findOne({
      where: {
        branch_code: {
          [Op.like]: 'EC-%'
        }
      },
      order: [
        [BusinessSubRegion.sequelize.literal('LENGTH(branch_code)'), 'DESC'],
        ['branch_code', 'DESC']
      ]
    });
    if (lastSubRegion && lastSubRegion.branch_code) {
      const parts = lastSubRegion.branch_code.split('-');
      if (parts.length === 2) {
        const numPart = parseInt(parts[1], 10);
        if (!isNaN(numPart)) {
          const nextNum = numPart + 1;
          nextBranchCode = `EC-${String(nextNum).padStart(3, '0')}`;
        }
      }
    }
    return res.status(200).json({ nextBranchCode });
  } catch (err) {
    console.error("getNextBranchCode error:", err);
    return res.status(500).json({ message: "Failed to generate next branch code" });
  }
};

module.exports = {
  getAllBusinessSubRegions,
  getBusinessSubRegionById,
  createBusinessSubRegion,
  updateBusinessSubRegion,
  toggleBusinessSubRegionStatus,
  deleteBusinessSubRegion,
  getSubRegionsByRegion,
  getNextBranchCode
};
