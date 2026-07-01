const { WasteCollectionRequest, User, Category, SubCategory, SubCategoryVariation } = require("../../models/index");
const { Op } = require("sequelize");

// GET /api/waste-collection-requests
const getWasteCollectionRequests = async (req, res) => {
  const { page = 1, limit = 10, search = '', status = '' } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  
  // Status filter
  if (status !== '') {
    where.status = status;
  }

  // Role-based visibility: Non-admins only see their own requests
  const isAdmin = req.user?.role?.role_name?.toLowerCase() === 'admin';
  if (!isAdmin) {
    where.customer_id = req.user.id;
  } else {
    // Admin can search by customer name
    // (We will handle search query below)
  }

  try {
    const { count, rows } = await WasteCollectionRequest.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email", "phone", "company_type"],
          where: (search && isAdmin) ? {
            name: { [Op.like]: `%${search}%` }
          } : undefined
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"]
        },
        {
          model: SubCategory,
          as: "subCategory",
          attributes: ["id", "name"]
        },
        {
          model: SubCategoryVariation,
          as: "variation",
          attributes: ["id", "variation_name", "number_of_sr", "per_kg_price"]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']]
    });

    return res.status(200).json({
      requests: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error("getWasteCollectionRequests error:", err);
    return res.status(500).json({ message: "Failed to fetch waste collection requests" });
  }
};

// POST /api/waste-collection-requests
const createWasteCollectionRequest = async (req, res) => {
  const {
    category_id,
    subcategory_id,
    pickup_notes,
    pickup_date,
    pickup_time,
    
    customer_type,
    authorized_person_name,
    mobile_number,
    email,
    address_search,
    latitude,
    longitude,
    waste_generator_name,
    complete_address,
    area_sqm,
    no_of_dwelling_units,
    registered_rwa,
    gst,
    pan,
    trade_license,
    variations_data
  } = req.body;

  // Validation
  if (!pickup_date) {
    return res.status(400).json({ message: "Preferred pickup date is required." });
  }

  try {
    // Process uploaded images
    let imageUrls = [];
    if (req.files && req.files.images) {
      imageUrls = req.files.images.map(f => f.filename);
    }
    const images = imageUrls.length > 0 ? JSON.stringify(imageUrls) : null;

    // Parse variations data
    let parsedVariations = [];
    if (variations_data) {
      parsedVariations = typeof variations_data === 'string' ? JSON.parse(variations_data) : variations_data;
    }

    // Grab first variation details for table single-variation columns (backward compatibility)
    const firstVar = parsedVariations[0] || {};
    const variation_id = firstVar.variation_id ? parseInt(firstVar.variation_id) : null;
    const suggested_weight = parseFloat(firstVar.suggested_weight || 0);
    const suggested_price = parseFloat(firstVar.suggested_price || 0);
    const manual_weight = firstVar.expected_waste ? parseFloat(firstVar.expected_waste) : null;
    const final_weight = (manual_weight !== null && !isNaN(manual_weight) && manual_weight > 0) 
      ? manual_weight 
      : suggested_weight;

    // Audit context if session exists
    const loggedInId = req.user ? req.user.id : null;
    const isAdmin = req.user?.role?.role_name?.toLowerCase() === 'admin';

    // Create waste collection request
    const request = await WasteCollectionRequest.create({
      customer_id: null, // Public standalone creation, no linked user record
      category_id: category_id ? parseInt(category_id) : null,
      subcategory_id: subcategory_id ? parseInt(subcategory_id) : null,
      variation_id: variation_id,
      suggested_weight: suggested_weight,
      suggested_price: suggested_price,
      manual_weight: manual_weight,
      final_weight: final_weight,
      pickup_notes: pickup_notes || null,
      pickup_date: pickup_date,
      pickup_time: pickup_time || null,
      status: 'Pending',
      images: images,
      generated_by: loggedInId,
      created_by: loggedInId,
      created_by_type: loggedInId ? (isAdmin ? 'Admin' : 'Customer') : 'Customer',
      request_source: loggedInId ? (isAdmin ? 'Admin' : 'Customer') : 'Customer',

      customer_type: customer_type || null,
      authorized_person_name: authorized_person_name || null,
      mobile_number: mobile_number || null,
      email: email || null,
      address_search: address_search || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      waste_generator_name: waste_generator_name || null,
      complete_address: complete_address || null,
      area_sqm: area_sqm ? parseFloat(area_sqm) : null,
      no_of_dwelling_units: no_of_dwelling_units ? parseInt(no_of_dwelling_units) : null,
      registered_rwa: registered_rwa || null,
      gst: gst || null,
      pan: pan || null,
      trade_license: trade_license || null,
      variations_data: JSON.stringify(parsedVariations)
    });

    return res.status(201).json({
      message: "Waste collection request generated successfully.",
      request
    });
  } catch (err) {
    console.error("createWasteCollectionRequest error:", err);
    return res.status(500).json({ message: "Failed to generate waste collection request." });
  }
};

// GET /api/waste-collection-requests/:id
const getWasteCollectionRequestById = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await WasteCollectionRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email", "phone", "company_type"]
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"]
        },
        {
          model: SubCategory,
          as: "subCategory",
          attributes: ["id", "name"]
        },
        {
          model: SubCategoryVariation,
          as: "variation",
          attributes: ["id", "variation_name", "number_of_sr", "per_kg_price"]
        }
      ]
    });

    if (!request) {
      return res.status(404).json({ message: "Waste collection request not found" });
    }

    // Access control: non-admins can only see their own requests
    const isAdmin = req.user?.role?.role_name?.toLowerCase() === 'admin';
    if (!isAdmin && request.customer_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json({ request });
  } catch (err) {
    console.error("getWasteCollectionRequestById error:", err);
    return res.status(500).json({ message: "Failed to fetch request details" });
  }
};

module.exports = {
  getWasteCollectionRequests,
  createWasteCollectionRequest,
  getWasteCollectionRequestById
};
