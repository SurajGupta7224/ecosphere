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
    where.user_id = req.user.id;
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
    pickup_notes,
    pickup_date,
    pickup_time,
    time_slot_id,
    
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
    subcategories
  } = req.body;

  // Validation
  if (!pickup_date) {
    return res.status(400).json({ message: "Preferred pickup date is required." });
  }

  try {
    const { TimeSlot } = require("../../models/index");
    const loggedInId = req.user ? req.user.id : null;
    const isAdmin = req.user?.role?.role_name?.toLowerCase() === 'admin';

    // Time Slot validations
    if (time_slot_id) {
      const timeSlot = await TimeSlot.findByPk(time_slot_id);
      if (!timeSlot) {
        return res.status(404).json({ message: "Selected time slot not found." });
      }
      if (timeSlot.status !== 'Active') {
        return res.status(400).json({ message: "Selected time slot is inactive." });
      }

      // Check for duplicate user booking (same user/email/mobile, same date, same time slot)
      const existingRequest = await WasteCollectionRequest.findOne({
        where: {
          [Op.or]: [
            loggedInId ? { created_by: loggedInId } : null,
            loggedInId ? { user_id: loggedInId } : null,
            mobile_number ? { mobile_number } : null,
            email ? { email } : null
          ].filter(Boolean),
          pickup_date,
          time_slot_id,
          status: { [Op.ne]: 'Rejected' }
        }
      });

      if (existingRequest) {
        return res.status(400).json({ message: "You have already booked this time slot for the selected date." });
      }
    }

    // Process uploaded images
    let imageUrls = [];
    if (req.files && req.files.images) {
      imageUrls = req.files.images.map(f => f.filename);
    }
    const images = imageUrls.length > 0 ? JSON.stringify(imageUrls) : null;

    // Parse subcategories data
    let parsedSubcategories = [];
    const sourceData = subcategories || req.body.variations_data;
    if (sourceData) {
      parsedSubcategories = typeof sourceData === 'string' ? JSON.parse(sourceData) : sourceData;
    }

    if (parsedSubcategories.length === 0) {
      return res.status(400).json({ message: "Please select at least one subcategory." });
    }

    // Generate single unique lead_id for this batch of requests
    const leadId = "LD" + Date.now().toString() + Math.floor(1000 + Math.random() * 9000);
    const createdRequests = [];

    for (const subItem of parsedSubcategories) {
      const category_id = subItem.category_id ? parseInt(subItem.category_id) : null;
      const subcategory_id = subItem.subcategory_id ? parseInt(subItem.subcategory_id) : null;
      const variation_id = subItem.variation_id ? parseInt(subItem.variation_id) : null;
      const expected_waste = parseFloat(subItem.expected_waste || 0);
      const agreed_price = parseFloat(subItem.custom_price || subItem.agreed_price || 0);
      const suggested_price = parseFloat(subItem.suggested_price || 0);

      // Calculations
      const monthly_waste = expected_waste * 30;
      const yearly_waste = expected_waste * 365;
      const monthly_price = monthly_waste * agreed_price;
      const yearly_price = yearly_waste * agreed_price;

      const request = await WasteCollectionRequest.create({
        lead_id: leadId,
        user_id: loggedInId,
        customer_type: customer_type || null,
        authorized_person_name: authorized_person_name || null,
        mobile_number: mobile_number || null,
        email: email || null,
        waste_generator_name: waste_generator_name || null,
        complete_address: complete_address || null,
        area_sqm: area_sqm ? parseFloat(area_sqm) : null,
        dwelling_units: no_of_dwelling_units ? parseInt(no_of_dwelling_units) : null,
        registered_rwa: registered_rwa || null,
        gst_number: gst || null,
        pan_number: pan || null,
        trade_license: trade_license || null,
        pickup_date: pickup_date,
        time_slot_id: time_slot_id ? parseInt(time_slot_id) : null,

        category_id,
        subcategory_id,
        variation_id,
        expected_waste,
        agreed_price,
        suggested_price,
        monthly_waste,
        yearly_waste,
        monthly_price,
        yearly_price,

        pickup_notes: pickup_notes || null,
        pickup_time: pickup_time || null,
        status: 'Pending',
        images: images,
        generated_by: loggedInId,
        created_by: loggedInId,
        created_by_type: loggedInId ? (isAdmin ? 'Admin' : 'Customer') : 'Customer',
        request_source: loggedInId ? (isAdmin ? 'Admin' : 'Customer') : 'Customer',
      });

      createdRequests.push(request);
    }

    return res.status(201).json({
      message: "Waste collection request generated successfully.",
      requests: createdRequests
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
    if (!isAdmin && request.user_id !== req.user.id) {
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
