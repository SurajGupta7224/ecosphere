const { WasteCollectionRequest, User, Category, SubCategory, SubCategoryVariation, Customer, Corporation, Zone, Ward, CollectionEvent, Employee, Vehicle, WasteOrder } = require("../../models/index");
const { Op } = require("sequelize");
const sequelize = require("../../config/db");
const axios = require("axios");
const { sendCustomerCredentialsEmail, generateProductionPassword } = require("../../services/emailService");
const bcrypt = require("bcrypt");

const { generateLeadId } = require("../../services/leadIdService");

// GET /api/waste-collection-requests
const getWasteCollectionRequests = async (req, res) => {
  const { page = 1, limit = 10, search = '', status = '', customer_id = '', user_id = '' } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  // Status filter
  if (status !== '') {
    where.status = status;
  }

  // Explicit filters
  if (customer_id) {
    where.customer_id = customer_id;
  }
  if (user_id) {
    where.user_id = user_id;
  }

  // Role-based visibility
  const isAdmin = req.userType === 'admin' || (req.user?.role?.role_name && req.user.role.role_name.toLowerCase().includes('admin'));
  if (!isAdmin && !customer_id && !user_id && req.user) {
    const custRecord = await Customer.findOne({
      where: {
        [Op.or]: [
          req.user.email ? { email: req.user.email } : null,
          req.user.phone ? { mobile: req.user.phone } : null
        ].filter(Boolean)
      }
    });
    const cId = custRecord ? custRecord.id : null;

    where[Op.or] = [
      { user_id: req.user.id },
      cId ? { customer_id: cId } : null,
      req.user.email ? { email: req.user.email } : null,
      req.user.phone ? { mobile_number: req.user.phone } : null
    ].filter(Boolean);
  }

  // Search filter
  if (search && search.trim() !== '') {
    const term = `%${search.trim()}%`;
    where[Op.or] = [
      { lead_id: { [Op.like]: term } },
      { waste_generator_name: { [Op.like]: term } },
      { contact_person: { [Op.like]: term } },
      { mobile_number: { [Op.like]: term } }
    ];
  }

  try {
    const { count, rows } = await WasteCollectionRequest.findAndCountAll({
      where,
      distinct: true,
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email", "phone", "company_type"],
          required: false
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
          required: false
        },
        {
          model: SubCategory,
          as: "subCategory",
          attributes: ["id", "name"],
          required: false
        },
        {
          model: SubCategoryVariation,
          as: "variation",
          attributes: ["id", "variation_name", "number_of_sr", "per_kg_price", "bulk_price"],
          required: false
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "name", "email"],
          required: false
        },
        {
          model: User,
          as: "rejector",
          attributes: ["id", "name", "email"],
          required: false
        },
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
    console.error("getWasteCollectionRequests error:", err.message, err.stack);
    return res.status(500).json({ message: "Failed to fetch waste collection requests", error: err.message });
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
    mobile_number,
    email,
    address_search,
    latitude,
    longitude,
    waste_generator_name,
    complete_address,
    area_sqm,
    no_of_dwelling_units,
    occupied_flats,
    registered_rwa,
    gst,
    gst_number,
    pan,
    pan_number,
    trade_license,
    subcategories,

    // New B2B / location columns
    site_request,
    service_center_type,
    employee_name,
    billing_type,
    business_region,
    business_sub_region,
    branch_code,
    business_lead,
    customer_legal_name,
    customer_trade_name,
    contact_person,
    designation,
    phone_number_2,
    email_2,
    others_note,
    google_map_link,
    landmark,
    city,
    state,
    pincode,
    country,
    billing_address_different,
    audit_requirement,
    technician_assign,
    technician,
    total_order_value,
    discount,
    discounted_price,
    sez,
    taxibility,
    sector,
    cgst,
    sgst,
    gst_amount,
    total_yearly_amount,
    final_price
  } = req.body;

  // Validation for Step 1 (Customer Details) & Step 2 (Property Details)
  if (!customer_type) {
    return res.status(400).json({ message: "Customer type is required." });
  }
  if (!contact_person) {
    return res.status(400).json({ message: "Contact person name is required." });
  }
  if (!mobile_number) {
    return res.status(400).json({ message: "Mobile number is required." });
  }
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  if (!address_search) {
    return res.status(400).json({ message: "Address search is required." });
  }
  if (!latitude || !longitude) {
    return res.status(400).json({ message: "Location coordinates (latitude & longitude) are required." });
  }
  if (!waste_generator_name) {
    return res.status(400).json({ message: "Waste generator name is required." });
  }
  if (!complete_address) {
    return res.status(400).json({ message: "Complete address is required." });
  }

  try {
    const { TimeSlot } = require("../../models/index");
    const loggedInId = req.user ? req.user.id : null;
    const isAdmin = req.user?.role?.role_name?.toLowerCase() === 'admin';

    // Time Slot validations
    if (time_slot_id && pickup_date) {
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

    let momAgreementFile = null;
    if (req.files && req.files.mom_agreement_file && req.files.mom_agreement_file[0]) {
      momAgreementFile = req.files.mom_agreement_file[0].filename;
    } else if (req.body.mom_agreement_file) {
      momAgreementFile = req.body.mom_agreement_file;
    }

    let poCopyFile = null;
    if (req.files && req.files.po_copy_file && req.files.po_copy_file[0]) {
      poCopyFile = req.files.po_copy_file[0].filename;
    } else if (req.body.po_copy_file) {
      poCopyFile = req.body.po_copy_file;
    }

    let emailCopyFile = null;
    if (req.files && req.files.email_copy_file && req.files.email_copy_file[0]) {
      emailCopyFile = req.files.email_copy_file[0].filename;
    } else if (req.body.email_copy_file) {
      emailCopyFile = req.body.email_copy_file;
    }



    let rwaFile = null;
    if (req.files && req.files.rwa_file && req.files.rwa_file[0]) {
      rwaFile = req.files.rwa_file[0].filename;
    } else if (req.body.rwa_file) {
      rwaFile = req.body.rwa_file;
    }

    let gstFile = null;
    if (req.files && req.files.gst_file && req.files.gst_file[0]) {
      gstFile = req.files.gst_file[0].filename;
    } else if (req.body.gst_file) {
      gstFile = req.body.gst_file;
    }

    let panFile = null;
    if (req.files && req.files.pan_file && req.files.pan_file[0]) {
      panFile = req.files.pan_file[0].filename;
    } else if (req.body.pan_file) {
      panFile = req.body.pan_file;
    }

    let tradeLicenseFile = null;
    if (req.files && req.files.trade_license_file && req.files.trade_license_file[0]) {
      tradeLicenseFile = req.files.trade_license_file[0].filename;
    } else if (req.body.trade_license_file) {
      tradeLicenseFile = req.body.trade_license_file;
    }

    let billingDetails = null;
    if (billing_address_different === 'true' || billing_address_different === true || req.body.billing_address_different === 'true' || req.body.billing_address_different === true) {
      const details = {
        customer_legal_name: req.body.billing_customer_legal_name || null,
        customer_trade_name: req.body.billing_customer_trade_name || null,
        contact_person: req.body.billing_contact_person || null,
        designation: req.body.billing_designation || null,
        phone_number_1: req.body.billing_phone_number_1 || null,
        phone_number_2: req.body.billing_phone_number_2 || null,
        email: req.body.billing_email || null,
        email_2: req.body.billing_email_2 || null,
        gstn: req.body.billing_gstn || null,
        complete_address: req.body.billing_complete_address || null,
        others: req.body.billing_others || null,
        city: req.body.billing_city || null,
        state: req.body.billing_state || null,
        pincode: req.body.billing_pincode || null,
        landmark: req.body.billing_landmark || null,
        country: req.body.billing_country || null,
      };
      billingDetails = JSON.stringify(details);
    }

    // Parse subcategories data
    let parsedSubcategories = [];
    const sourceData = subcategories || req.body.variations_data;
    if (sourceData) {
      try {
        parsedSubcategories = typeof sourceData === 'string' ? JSON.parse(sourceData) : sourceData;
      } catch (parseErr) {
        console.error("Failed to parse subcategories JSON:", parseErr);
        parsedSubcategories = [];
      }
    }

    // Create unique Customer record for this lead submission
    let customerId = null;
    let targetUserId = loggedInId;

    const customerModelType = (isAdmin || (customer_type && customer_type.toLowerCase() === 'admin')) ? 'admin' : 'website';
    const customerCreatedBy = isAdmin ? 'admin' : 'customer';

    const newCust = await Customer.create({
      customer_name: contact_person || waste_generator_name || customer_legal_name || 'B2B Customer',
      mobile: mobile_number || null,
      email: email || null,
      customer_type: customerModelType,
      created_by: customerCreatedBy,
      status: 'active'
    });
    customerId = newCust.id;

    if (email || mobile_number) {
      // Find matching User record for this customer
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            email ? { email } : null,
            mobile_number ? { phone: mobile_number } : null
          ].filter(Boolean)
        }
      });
      if (existingUser) {
        targetUserId = existingUser.id;
      }
    }

    // Generate single unique lead_id for this batch of requests
    const leadId = await generateLeadId();
    const createdRequests = [];

    if (parsedSubcategories && parsedSubcategories.length > 0) {
      for (const subItem of parsedSubcategories) {
        const category_id = subItem.category_id ? parseInt(subItem.category_id) : null;
        const subcategory_id = subItem.subcategory_id ? parseInt(subItem.subcategory_id) : null;
        const variation_id = subItem.variation_id ? parseInt(subItem.variation_id) : null;
        const expected_waste = subItem.pricing_mode === 'Bulk' ? 0 : parseFloat(subItem.expected_waste || 0);
        const agreed_price = subItem.pricing_mode === 'Bulk' ? 0 : parseFloat(subItem.custom_price || subItem.agreed_price || 0);
        const suggested_price = subItem.pricing_mode === 'Bulk' ? 0 : parseFloat(subItem.suggested_price || 0);

        // Calculations
        let monthly_waste = expected_waste * 30;
        let yearly_waste = expected_waste * 365;
        let monthly_price = monthly_waste * agreed_price;
        let yearly_price = yearly_waste * agreed_price;

        if (subItem.pricing_mode === 'Bulk') {
          monthly_waste = 0;
          yearly_waste = 0;
          monthly_price = parseFloat(subItem.bulk_monthly_price || 0);
          yearly_price = parseFloat(subItem.bulk_yearly_price || 0);
        }

        const validCustType = (customer_type && customer_type.toLowerCase() !== 'admin') ? customer_type : 'B2B';

        const request = await WasteCollectionRequest.create({
          lead_id: leadId,
          user_id: targetUserId || loggedInId,
          customer_id: customerId,
          customer_type: validCustType,
          contact_person: contact_person || null,
          mobile_number: mobile_number || null,
          email: email || null,
          waste_generator_name: waste_generator_name || null,
          complete_address: complete_address || null,
          area_sqm: area_sqm ? parseFloat(area_sqm) : null,
          dwelling_units: no_of_dwelling_units ? parseInt(no_of_dwelling_units) : null,
          occupied_flats: occupied_flats ? parseInt(occupied_flats) : null,
          registered_rwa: registered_rwa || null,
          gst_number: gst || gst_number || null,
          pan_number: pan || pan_number || null,
          trade_license: trade_license || null,
          pickup_date: pickup_date || null,
          time_slot_id: time_slot_id ? parseInt(time_slot_id) : null,
          latitude: latitude || null,
          longitude: longitude || null,
          address_search: address_search || null,

          // New B2B / location columns
          site_request: site_request || null,
          service_center_type: service_center_type || null,
          employee_name: employee_name || null,
          billing_type: billing_type || null,
          business_region: business_region || null,
          business_sub_region: business_sub_region || null,
          branch_code: branch_code || null,
          business_lead: business_lead || null,
          customer_legal_name: customer_legal_name || null,
          customer_trade_name: customer_trade_name || null,
          contact_person_additional: contact_person || null,
          designation: designation || null,
          phone_number_2: phone_number_2 || null,
          email_2: email_2 || null,
          others_note: others_note || null,
          google_map_link: google_map_link || null,
          landmark: landmark || null,
          city: city || null,
          state: state || null,
          pincode: pincode || null,
          country: country || null,
          billing_address_different: billing_address_different !== undefined ? billing_address_different : false,
          audit_requirement: audit_requirement || null,
          technician_assign: technician_assign || null,
          technician: technician || null,
          total_order_value: total_order_value ? parseFloat(total_order_value) : 0.00,
          discount: discount ? parseFloat(discount) : 0.00,
          discounted_price: discounted_price ? parseFloat(discounted_price) : 0.00,
          sez: sez || null,
          taxibility: taxibility || null,
          sector: sector || null,
          cgst: cgst ? parseFloat(cgst) : 0.00,
          sgst: sgst ? parseFloat(sgst) : 0.00,
          gst_amount: gst_amount ? parseFloat(gst_amount) : 0.00,
          total_yearly_amount: total_yearly_amount ? parseFloat(total_yearly_amount) : 0.00,
          final_price: final_price ? parseFloat(final_price) : 0.00,

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
          pricing_mode: subItem.pricing_mode || 'KG',

          pickup_notes: pickup_notes || null,
          pickup_time: pickup_time || null,
          status: 'Pending',
          images: images,
          mom_agreement_file: momAgreementFile,
          po_copy_file: poCopyFile,
          email_copy_file: emailCopyFile,
          billing_details: billingDetails,
          rwa_file: rwaFile,
          gst_file: gstFile,
          pan_file: panFile,
          trade_license_file: tradeLicenseFile,
          created_by_type: loggedInId ? (isAdmin ? 'Admin' : 'Customer') : 'Customer',
          request_source: loggedInId ? (isAdmin ? 'Admin' : 'Customer') : 'Customer',
        });

        createdRequests.push(request);
      }
    } else {
      // Create a single request with null subcategory details (since expected waste is optional)
      const request = await WasteCollectionRequest.create({
        lead_id: leadId,
        user_id: loggedInId,
        customer_id: customerId,
        customer_type: customer_type || null,
        contact_person: contact_person || null,
        mobile_number: mobile_number || null,
        email: email || null,
        waste_generator_name: waste_generator_name || null,
        complete_address: complete_address || null,
        area_sqm: area_sqm ? parseFloat(area_sqm) : null,
        dwelling_units: no_of_dwelling_units ? parseInt(no_of_dwelling_units) : null,
        occupied_flats: occupied_flats ? parseInt(occupied_flats) : null,
        registered_rwa: registered_rwa || null,
        gst_number: gst || gst_number || null,
        pan_number: pan || pan_number || null,
        trade_license: trade_license || null,
        pickup_date: pickup_date || null,
        time_slot_id: time_slot_id ? parseInt(time_slot_id) : null,
        latitude: latitude || null,
        longitude: longitude || null,
        address_search: address_search || null,

        // New B2B / location columns
        site_request: site_request || null,
        service_center_type: service_center_type || null,
        employee_name: employee_name || null,
        billing_type: billing_type || null,
        business_region: business_region || null,
        business_sub_region: business_sub_region || null,
        branch_code: branch_code || null,
        business_lead: business_lead || null,
        customer_legal_name: customer_legal_name || null,
        customer_trade_name: customer_trade_name || null,
        contact_person_additional: contact_person || null,
        designation: designation || null,
        phone_number_2: phone_number_2 || null,
        email_2: email_2 || null,
        others_note: others_note || null,
        google_map_link: google_map_link || null,
        landmark: landmark || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        country: country || null,
        billing_address_different: billing_address_different !== undefined ? billing_address_different : false,
        audit_requirement: audit_requirement || null,
        technician_assign: technician_assign || null,
        technician: technician || null,
        total_order_value: total_order_value ? parseFloat(total_order_value) : 0.00,
        discount: discount ? parseFloat(discount) : 0.00,
        discounted_price: discounted_price ? parseFloat(discounted_price) : 0.00,
        sez: sez || null,
        taxibility: taxibility || null,
        sector: sector || null,
        cgst: cgst ? parseFloat(cgst) : 0.00,
        sgst: sgst ? parseFloat(sgst) : 0.00,
        gst_amount: gst_amount ? parseFloat(gst_amount) : 0.00,
        total_yearly_amount: total_yearly_amount ? parseFloat(total_yearly_amount) : 0.00,
        final_price: final_price ? parseFloat(final_price) : 0.00,

        category_id: null,
        subcategory_id: null,
        variation_id: null,
        expected_waste: 0,
        agreed_price: 0,
        suggested_price: 0,
        monthly_waste: 0,
        yearly_waste: 0,
        monthly_price: 0,
        yearly_price: 0,

        pickup_notes: pickup_notes || null,
        pickup_time: pickup_time || null,
        status: 'Pending',
        images: images,
        mom_agreement_file: momAgreementFile,
        po_copy_file: poCopyFile,
        email_copy_file: emailCopyFile,
        billing_details: billingDetails,
        rwa_file: rwaFile,
        gst_file: gstFile,
        pan_file: panFile,
        trade_license_file: tradeLicenseFile,
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
    return res.status(500).json({
      message: err.message || "Failed to generate waste collection request.",
      error: err.toString(),
      details: err.errors ? err.errors.map(e => e.message) : undefined
    });
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
          attributes: ["id", "variation_name", "number_of_sr", "per_kg_price", "bulk_price"]
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "name", "email"]
        },
        {
          model: User,
          as: "rejector",
          attributes: ["id", "name", "email"]
        },
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

const updateWasteCollectionRequestByLeadId = async (req, res) => {
  const { leadId } = req.params;
  const {
    customer_type,
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
    pickup_date,
    time_slot_id,
    pickup_notes,
    pickup_time,
    subcategories,

    // B2B fields
    site_request,
    service_center_type,
    employee_name,
    billing_type,
    business_region,
    business_sub_region,
    branch_code,
    business_lead,
    customer_legal_name,
    customer_trade_name,
    contact_person,
    designation,
    phone_number_2,
    email_2,
    others_note,
    google_map_link,
    landmark,
    city,
    state,
    pincode,
    country,
    billing_address_different,
    billing_details,
    audit_requirement,
    technician_assign,
    technician,
    total_order_value,
    discount,
    discounted_price,
    sez,
    taxibility,
    sector,
    cgst,
    sgst,
    gst_amount,
    total_yearly_amount,
    final_price
  } = req.body;

  // Validation for Step 1 (Customer Details) & Step 2 (Property Details)
  if (!customer_type) {
    return res.status(400).json({ message: "Customer type is required." });
  }
  if (!contact_person) {
    return res.status(400).json({ message: "Contact person name is required." });
  }
  if (!mobile_number) {
    return res.status(400).json({ message: "Mobile number is required." });
  }
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  if (!address_search) {
    return res.status(400).json({ message: "Address search is required." });
  }
  if (!latitude || !longitude) {
    return res.status(400).json({ message: "Location coordinates (latitude & longitude) are required." });
  }
  if (!waste_generator_name) {
    return res.status(400).json({ message: "Waste generator name is required." });
  }
  if (!complete_address) {
    return res.status(400).json({ message: "Complete address is required." });
  }

  try {
    const { TimeSlot } = require("../../models/index");

    // Fetch existing request records for this leadId
    const existingRequests = await WasteCollectionRequest.findAll({
      where: { lead_id: leadId }
    });

    if (existingRequests.length === 0) {
      return res.status(404).json({ message: "Waste collection request not found." });
    }

    const firstExisting = existingRequests[0];
    const originalCreatedByType = firstExisting.created_by_type;
    const originalRequestSource = firstExisting.request_source;
    const originalUserId = firstExisting.user_id;
    const originalStatus = firstExisting.status;
    const originalCreatedAt = firstExisting.created_at;

    // Dynamically calculate final list of images
    let finalImages = [];
    if (req.body.existing_images) {
      try {
        finalImages = typeof req.body.existing_images === 'string' ? JSON.parse(req.body.existing_images) : req.body.existing_images;
      } catch (err) {
        console.error("Failed to parse existing_images:", err);
      }
    } else if (firstExisting.images) {
      try {
        finalImages = JSON.parse(firstExisting.images) || [];
      } catch (err) {
        finalImages = [];
      }
    }

    if (req.files && req.files.images) {
      const newImages = req.files.images.map(f => f.filename);
      finalImages = [...finalImages, ...newImages];
    }
    const imagesToSave = finalImages.length > 0 ? JSON.stringify(finalImages) : null;

    const momAgreementFile = req.files && req.files.mom_agreement_file ? req.files.mom_agreement_file[0].filename : firstExisting.mom_agreement_file;
    const poCopyFile = req.files && req.files.po_copy_file ? req.files.po_copy_file[0].filename : firstExisting.po_copy_file;
    const rwaFile = req.files && req.files.rwa_file ? req.files.rwa_file[0].filename : firstExisting.rwa_file;
    const gstFile = req.files && req.files.gst_file ? req.files.gst_file[0].filename : firstExisting.gst_file;
    const panFile = req.files && req.files.pan_file ? req.files.pan_file[0].filename : firstExisting.pan_file;
    const tradeLicenseFile = req.files && req.files.trade_license_file ? req.files.trade_license_file[0].filename : firstExisting.trade_license_file;
    const emailCopyFile = req.files && req.files.email_copy_file ? req.files.email_copy_file[0].filename : firstExisting.email_copy_file;

    // Time Slot validations
    if (time_slot_id && pickup_date) {
      const timeSlot = await TimeSlot.findByPk(time_slot_id);
      if (!timeSlot) {
        return res.status(404).json({ message: "Selected time slot not found." });
      }
      if (timeSlot.status !== 'Active') {
        return res.status(400).json({ message: "Selected time slot is inactive." });
      }
    }

    // Parse subcategories data
    let parsedSubcategories = [];
    if (subcategories) {
      parsedSubcategories = typeof subcategories === 'string' ? JSON.parse(subcategories) : subcategories;
    }

    // Perform database operations inside a Sequelize transaction
    const sequelizeInstance = WasteCollectionRequest.sequelize;
    await sequelizeInstance.transaction(async (t) => {
      // Delete existing records for this lead
      await WasteCollectionRequest.destroy({
        where: { lead_id: leadId },
        transaction: t
      });

      if (parsedSubcategories && parsedSubcategories.length > 0) {
        for (const subItem of parsedSubcategories) {
          const category_id = subItem.category_id ? parseInt(subItem.category_id) : null;
          const subcategory_id = subItem.subcategory_id ? parseInt(subItem.subcategory_id) : null;
          const variation_id = subItem.variation_id ? parseInt(subItem.variation_id) : null;
          const expected_waste = subItem.pricing_mode === 'Bulk' ? 0 : parseFloat(subItem.expected_waste || 0);
          const agreed_price = subItem.pricing_mode === 'Bulk' ? 0 : parseFloat(subItem.custom_price || subItem.agreed_price || 0);
          const suggested_price = subItem.pricing_mode === 'Bulk' ? 0 : parseFloat(subItem.suggested_price || 0);

          // Calculations
          let monthly_waste = expected_waste * 30;
          let yearly_waste = expected_waste * 365;
          let monthly_price = monthly_waste * agreed_price;
          let yearly_price = yearly_waste * agreed_price;

          if (subItem.pricing_mode === 'Bulk') {
            monthly_waste = 0;
            yearly_waste = 0;
            monthly_price = parseFloat(subItem.bulk_monthly_price || 0);
            yearly_price = parseFloat(subItem.bulk_yearly_price || 0);
          }

          await WasteCollectionRequest.create({
            lead_id: leadId,
            user_id: originalUserId,
            customer_type: customer_type || null,
            contact_person,
            mobile_number,
            email,
            waste_generator_name,
            complete_address,
            area_sqm: area_sqm ? parseFloat(area_sqm) : null,
            dwelling_units: no_of_dwelling_units ? parseInt(no_of_dwelling_units) : null,
            occupied_flats: occupied_flats ? parseInt(occupied_flats) : null,
            registered_rwa: registered_rwa || null,
            gst_number: gst || gst_number || null,
            pan_number: pan || pan_number || null,
            trade_license: trade_license || null,
            pickup_date: pickup_date || null,
            time_slot_id: time_slot_id ? parseInt(time_slot_id) : null,
            latitude: latitude || null,
            longitude: longitude || null,
            address_search: address_search || null,

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
            pricing_mode: subItem.pricing_mode || 'KG',

            pickup_notes: pickup_notes || null,
            pickup_time: pickup_time || null,
            status: originalStatus,
            images: imagesToSave,
            created_by_type: originalCreatedByType,
            request_source: originalRequestSource,

            // B2B additions
            site_request: site_request || null,
            service_center_type: service_center_type || null,
            employee_name: employee_name || null,
            billing_type: billing_type || null,
            business_region: business_region || null,
            business_sub_region: business_sub_region || null,
            branch_code: branch_code || null,
            business_lead: business_lead || null,
            customer_legal_name: customer_legal_name || null,
            customer_trade_name: customer_trade_name || null,
            contact_person_additional: contact_person || null,
            designation: designation || null,
            phone_number_2: phone_number_2 || null,
            email_2: email_2 || null,
            others_note: others_note || null,
            google_map_link: google_map_link || null,
            landmark: landmark || null,
            city: city || null,
            state: state || null,
            pincode: pincode || null,
            country: country || null,
            billing_address_different: billing_address_different !== undefined ? (billing_address_different === 'true' || billing_address_different === true) : false,
            billing_details: billing_details || null,
            audit_requirement: audit_requirement || null,
            technician_assign: technician_assign || null,
            technician: technician || null,
            total_order_value: total_order_value ? parseFloat(total_order_value) : 0.00,
            discount: discount ? parseFloat(discount) : 0.00,
            discounted_price: discounted_price ? parseFloat(discounted_price) : 0.00,
            sez: sez || null,
            taxibility: taxibility || null,
            sector: sector || null,
            cgst: cgst ? parseFloat(cgst) : 0.00,
            sgst: sgst ? parseFloat(sgst) : 0.00,
            gst_amount: gst_amount ? parseFloat(gst_amount) : 0.00,
            total_yearly_amount: total_yearly_amount ? parseFloat(total_yearly_amount) : 0.00,
            final_price: final_price ? parseFloat(final_price) : 0.00,

            mom_agreement_file: momAgreementFile,
            po_copy_file: poCopyFile,
            rwa_file: rwaFile,
            gst_file: gstFile,
            pan_file: panFile,
            trade_license_file: tradeLicenseFile,
            email_copy_file: emailCopyFile,

            created_at: originalCreatedAt
          }, { transaction: t });
        }
      } else {
        // Create single request with null subcategory details
        await WasteCollectionRequest.create({
          lead_id: leadId,
          user_id: originalUserId,
          customer_type: customer_type || null,
          contact_person,
          mobile_number,
          email,
          waste_generator_name,
          complete_address,
          area_sqm: area_sqm ? parseFloat(area_sqm) : null,
          dwelling_units: no_of_dwelling_units ? parseInt(no_of_dwelling_units) : null,
          occupied_flats: occupied_flats ? parseInt(occupied_flats) : null,
          registered_rwa: registered_rwa || null,
          gst_number: gst || gst_number || null,
          pan_number: pan || pan_number || null,
          trade_license: trade_license || null,
          pickup_date: pickup_date || null,
          time_slot_id: time_slot_id ? parseInt(time_slot_id) : null,
          latitude: latitude || null,
          longitude: longitude || null,
          address_search: address_search || null,

          category_id: null,
          subcategory_id: null,
          variation_id: null,
          expected_waste: 0,
          agreed_price: 0,
          suggested_price: 0,
          monthly_waste: 0,
          yearly_waste: 0,
          monthly_price: 0,
          yearly_price: 0,

          pickup_notes: pickup_notes || null,
          pickup_time: pickup_time || null,
          status: originalStatus,
          images: imagesToSave,
          created_by_type: originalCreatedByType,
          request_source: originalRequestSource,

          // B2B additions
          site_request: site_request || null,
          service_center_type: service_center_type || null,
          employee_name: employee_name || null,
          billing_type: billing_type || null,
          business_region: business_region || null,
          business_sub_region: business_sub_region || null,
          branch_code: branch_code || null,
          business_lead: business_lead || null,
          customer_legal_name: customer_legal_name || null,
          customer_trade_name: customer_trade_name || null,
          contact_person_additional: contact_person || null,
          designation: designation || null,
          phone_number_2: phone_number_2 || null,
          email_2: email_2 || null,
          others_note: others_note || null,
          google_map_link: google_map_link || null,
          landmark: landmark || null,
          city: city || null,
          state: state || null,
          pincode: pincode || null,
          country: country || null,
          billing_address_different: billing_address_different !== undefined ? (billing_address_different === 'true' || billing_address_different === true) : false,
          billing_details: billing_details || null,
          audit_requirement: audit_requirement || null,
          technician_assign: technician_assign || null,
          technician: technician || null,
          total_order_value: total_order_value ? parseFloat(total_order_value) : 0.00,
          discount: discount ? parseFloat(discount) : 0.00,
          discounted_price: discounted_price ? parseFloat(discounted_price) : 0.00,
          sez: sez || null,
          taxibility: taxibility || null,
          sector: sector || null,
          cgst: cgst ? parseFloat(cgst) : 0.00,
          sgst: sgst ? parseFloat(sgst) : 0.00,
          gst_amount: gst_amount ? parseFloat(gst_amount) : 0.00,
          total_yearly_amount: total_yearly_amount ? parseFloat(total_yearly_amount) : 0.00,
          final_price: final_price ? parseFloat(final_price) : 0.00,

          mom_agreement_file: momAgreementFile,
          po_copy_file: poCopyFile,
          rwa_file: rwaFile,
          gst_file: gstFile,
          pan_file: panFile,
          trade_license_file: tradeLicenseFile,
          email_copy_file: emailCopyFile,

          created_at: originalCreatedAt
        }, { transaction: t });
      }
    });

    return res.status(200).json({
      message: "Waste collection request updated successfully."
    });
  } catch (err) {
    console.error("updateWasteCollectionRequestByLeadId error:", err);
    return res.status(500).json({ message: "Failed to update waste collection request." });
  }
};

const updateWasteCollectionRequestStatus = async (req, res) => {
  const { leadId } = req.params;
  const { status, rejected_reason } = req.body;
  const loggedInId = req.user?.id;

  if (!['Pending', 'Verified', 'Approved', 'Booked', 'Rejected', 'Completed'].includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  if (status === 'Rejected' && (!rejected_reason || !rejected_reason.trim())) {
    return res.status(400).json({ message: "Rejection reason is required when status is Rejected." });
  }

  try {
    const requests = await WasteCollectionRequest.findAll({
      where: { lead_id: leadId }
    });

    if (requests.length === 0) {
      return res.status(404).json({ message: "Waste collection request not found." });
    }

    const updates = {
      status,
    };

    if (status === 'Approved') {
      updates.approved_by = loggedInId;
      updates.approved_date = new Date();
      updates.rejected_by = null;
      updates.rejected_date = null;
      updates.rejected_reason = null;

      // Auto-provision customer user account & send credentials email if email exists
      const targetReq = requests[0];
      if (targetReq && targetReq.email) {
        try {
          const plainPassword = generateProductionPassword();
          const hashedPassword = await bcrypt.hash(plainPassword, 10);

          let userRec = await User.findOne({ where: { email: targetReq.email } });
          let isNewAccount = false;

          if (!userRec) {
            userRec = await User.create({
              name: targetReq.contact_person || targetReq.waste_generator_name || 'Customer',
              email: targetReq.email,
              phone: targetReq.mobile_number || null,
              password: hashedPassword,
              role_id: 3,
              status: 'active'
            });
            isNewAccount = true;
          }

          await sendCustomerCredentialsEmail({
            toEmail: targetReq.email,
            plainPassword,
            orderId: leadId,
            customerName: targetReq.contact_person || targetReq.waste_generator_name || 'Valued Customer',
            isNewAccount
          });
        } catch (emailErr) {
          console.error("Failed to auto-send credentials email on approval:", emailErr);
        }
      }
    } else if (status === 'Rejected') {
      updates.approved_by = null;
      updates.approved_date = null;
      updates.rejected_by = loggedInId;
      updates.rejected_date = new Date();
      updates.rejected_reason = rejected_reason.trim();
    } else if (status !== 'Booked') {
      updates.approved_by = null;
      updates.approved_date = null;
      updates.rejected_by = null;
      updates.rejected_date = null;
      updates.rejected_reason = null;
    }

    await WasteCollectionRequest.update(updates, {
      where: { lead_id: leadId }
    });

    return res.status(200).json({
      message: `Request status updated to ${status} successfully.`,
      status,
      ...updates
    });
  } catch (err) {
    console.error("updateWasteCollectionRequestStatus error:", err);
    return res.status(500).json({ message: "Failed to update request status." });
  }
};

const searchRequestByMobile = async (req, res) => {
  const { mobile, query, search } = req.query;
  const searchTerm = (mobile || query || search || "").trim();

  if (!searchTerm) {
    return res.status(400).json({ message: "Search term (Mobile, Name, or Lead ID) is required." });
  }

  try {
    // 1. Search in WasteCollectionRequest model using valid DB columns
    const requests = await WasteCollectionRequest.findAll({
      where: {
        [Op.or]: [
          { mobile_number: { [Op.like]: `%${searchTerm}%` } },
          { phone_number_2: { [Op.like]: `%${searchTerm}%` } },
          { customer_legal_name: { [Op.like]: `%${searchTerm}%` } },
          { customer_trade_name: { [Op.like]: `%${searchTerm}%` } },
          { contact_person: { [Op.like]: `%${searchTerm}%` } },
          { waste_generator_name: { [Op.like]: `%${searchTerm}%` } },
          { lead_id: { [Op.like]: `%${searchTerm}%` } },
          { email: { [Op.like]: `%${searchTerm}%` } },
          { email_2: { [Op.like]: `%${searchTerm}%` } }
        ]
      },
      order: [['id', 'DESC']]
    });

    if (requests.length > 0) {
      return res.status(200).json({
        success: true,
        requests
      });
    }

    // 2. Fallback search in Customer table by name / mobile / email
    const matchingCustomers = await Customer.findAll({
      where: {
        [Op.or]: [
          { customer_name: { [Op.like]: `%${searchTerm}%` } },
          { mobile: { [Op.like]: `%${searchTerm}%` } },
          { email: { [Op.like]: `%${searchTerm}%` } }
        ]
      }
    });

    if (matchingCustomers.length > 0) {
      const customerMobiles = matchingCustomers.map(c => c.mobile).filter(Boolean);
      const customerEmails = matchingCustomers.map(c => c.email).filter(Boolean);
      const customerIds = matchingCustomers.map(c => c.id).filter(Boolean);

      const customerRequests = await WasteCollectionRequest.findAll({
        where: {
          [Op.or]: [
            ...(customerIds.length > 0 ? [{ customer_id: { [Op.in]: customerIds } }] : []),
            ...(customerMobiles.length > 0 ? [{ mobile_number: { [Op.in]: customerMobiles } }] : []),
            ...(customerEmails.length > 0 ? [{ email: { [Op.in]: customerEmails } }] : [])
          ]
        },
        order: [['id', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        requests: customerRequests
      });
    }

    return res.status(200).json({
      success: true,
      requests: []
    });
  } catch (err) {
    console.error("searchRequestByMobile error:", err);
    return res.status(500).json({ message: "Failed to search customer requests.", error: err.message });
  }
};

const resolveMapLink = async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }

  try {
    const response = await axios.get(url, {
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
      },
      validateStatus: (status) => status >= 200 && status < 400
    });

    const resolvedUrl = response.request.res.responseUrl || url;
    return res.status(200).json({ success: true, resolvedUrl });
  } catch (err) {
    console.error("resolveMapLink error:", err.message);
    try {
      const getRedirect = (targetUrl) => {
        return new Promise((resolve) => {
          const client = targetUrl.startsWith('https') ? require('https') : require('http');
          client.get(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
              resolve(res.headers.location);
            } else {
              resolve(targetUrl);
            }
          }).on('error', () => resolve(targetUrl));
        });
      };
      const resolvedUrl = await getRedirect(url);
      return res.status(200).json({ success: true, resolvedUrl });
    } catch (e) {
      return res.status(200).json({ success: true, resolvedUrl: url });
    }
  }
};

const bookWasteCollectionRequest = async (req, res) => {
  const { leadId } = req.params;
  const {
    corporation_id,
    zone_id,
    ward_id,
    collection_event_id,
    vendor_id,
    driver_id,
    site_request,
    service_center_type,
    employee_name,
    billing_type,
    business_region,
    business_sub_region,
    branch_code,
    business_lead,
    total_order_value,
    discount,
    discounted_price,
    sez,
    taxibility,
    cgst,
    sgst,
    gst_amount,
    final_price,
    pickup_date,
    pickup_time,
    time_slot_id,
    pickup_notes
  } = req.body;

  const t = await sequelize.transaction();

  try {
    const requests = await WasteCollectionRequest.findAll({
      where: { lead_id: leadId }
    });

    if (requests.length === 0) {
      await t.rollback();
      return res.status(404).json({ message: "Waste collection request not found." });
    }

    // Prevent re-booking if lead is already booked
    const existingOrder = await WasteOrder.findOne({ where: { lead_id: leadId } });
    if (existingOrder) {
      await t.rollback();
      return res.status(400).json({
        message: `Order for Lead ID ${leadId} has already been booked (Order ID: ${existingOrder.order_id}).`
      });
    }

    // Handle files if uploaded during booking
    let mom_agreement_file = null;
    let po_copy_file = null;
    let email_copy_file = null;

    if (req.files) {
      if (req.files.mom_agreement_file && req.files.mom_agreement_file[0]) {
        mom_agreement_file = req.files.mom_agreement_file[0].path;
      }
      if (req.files.po_copy_file && req.files.po_copy_file[0]) {
        po_copy_file = req.files.po_copy_file[0].path;
      }
      if (req.files.email_copy_file && req.files.email_copy_file[0]) {
        email_copy_file = req.files.email_copy_file[0].path;
      }
    }

    // Validate Document Requirements: MOM is required, and either PO or Email Copy is required
    const hasMom = Boolean(mom_agreement_file || requests[0]?.mom_agreement_file);
    const hasPo = Boolean(po_copy_file || requests[0]?.po_copy_file);
    const hasEmail = Boolean(email_copy_file || requests[0]?.email_copy_file);

    if (!hasMom) {
      await t.rollback();
      return res.status(400).json({ message: "MOM Copy (Minutes of Meeting) document is required." });
    }

    if (!hasPo && !hasEmail) {
      await t.rollback();
      return res.status(400).json({ message: "Either PO Copy or Email Confirmation Copy document is required." });
    }

    // Prepare update object for admin fields if provided
    const adminUpdates = {};
    if (site_request) adminUpdates.site_request = site_request;
    if (service_center_type) adminUpdates.service_center_type = service_center_type;
    if (employee_name) adminUpdates.employee_name = employee_name;
    if (billing_type) adminUpdates.billing_type = billing_type;
    if (business_region) adminUpdates.business_region = business_region;
    if (business_sub_region) adminUpdates.business_sub_region = business_sub_region;
    if (branch_code) adminUpdates.branch_code = branch_code;
    if (business_lead) adminUpdates.business_lead = business_lead;
    if (total_order_value !== undefined) adminUpdates.total_order_value = parseFloat(total_order_value) || 0;
    if (discount !== undefined) adminUpdates.discount = parseFloat(discount) || 0;
    if (discounted_price !== undefined) adminUpdates.discounted_price = parseFloat(discounted_price) || 0;
    if (sez) adminUpdates.sez = sez;
    if (taxibility) adminUpdates.taxibility = taxibility;
    if (cgst !== undefined) adminUpdates.cgst = parseFloat(cgst) || 0;
    if (sgst !== undefined) adminUpdates.sgst = parseFloat(sgst) || 0;
    if (gst_amount !== undefined) adminUpdates.gst_amount = parseFloat(gst_amount) || 0;
    if (final_price !== undefined) adminUpdates.final_price = parseFloat(final_price) || 0;
    if (pickup_date) adminUpdates.pickup_date = pickup_date;
    if (pickup_time) adminUpdates.pickup_time = pickup_time;
    if (time_slot_id) adminUpdates.time_slot_id = time_slot_id;
    if (pickup_notes) adminUpdates.pickup_notes = pickup_notes;
    if (mom_agreement_file) adminUpdates.mom_agreement_file = mom_agreement_file;
    if (po_copy_file) adminUpdates.po_copy_file = po_copy_file;
    if (email_copy_file) adminUpdates.email_copy_file = email_copy_file;

    if (Object.keys(adminUpdates).length > 0) {
      await WasteCollectionRequest.update(adminUpdates, {
        where: { lead_id: leadId },
        transaction: t
      });
    }

    // Refetch updated request rows
    const updatedRequests = await WasteCollectionRequest.findAll({
      where: { lead_id: leadId },
      transaction: t
    });

    // Parse items_pricing payload if provided
    let itemsPricing = [];
    if (req.body.items_pricing) {
      try {
        itemsPricing = typeof req.body.items_pricing === 'string' ? JSON.parse(req.body.items_pricing) : req.body.items_pricing;
      } catch (e) {
        console.error("Error parsing items_pricing in bookWasteCollectionRequest:", e);
      }
    }

    // Generate unique order ID
    const orderId = 'ORD-' + Date.now().toString().slice(-8) + Math.floor(100 + Math.random() * 900);

    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 365);

    const contract_start_date = start.toISOString().split('T')[0];
    const contract_end_date = end.toISOString().split('T')[0];

    // Create a WasteOrder row for each request row in the group
    for (let i = 0; i < updatedRequests.length; i++) {
      const reqRow = updatedRequests[i];

      // Find matching item pricing info by id or subcategory_id
      const matchedItem = itemsPricing.find(ip =>
        (ip.id && String(ip.id) === String(reqRow.id)) ||
        (ip.subcategory_id && String(ip.subcategory_id) === String(reqRow.subcategory_id))
      ) || itemsPricing[i] || itemsPricing[0] || {};

      const itemVendorId = matchedItem.vendor_id ? parseInt(matchedItem.vendor_id) : (vendor_id ? parseInt(vendor_id) : reqRow.vendor_id);
      const itemVehicleId = matchedItem.vehicle_id ? parseInt(matchedItem.vehicle_id) : (reqRow.vehicle_id || null);

      // Update original request row with specific vendor, vehicle & pricing
      const itemUpdates = {};
      if (itemVendorId) itemUpdates.vendor_id = itemVendorId;
      if (itemVehicleId) itemUpdates.vehicle_id = itemVehicleId;
      if (matchedItem.expected_waste !== undefined && matchedItem.expected_waste !== null) {
        itemUpdates.expected_waste = parseFloat(matchedItem.expected_waste) || 0;
      }
      if (matchedItem.agreed_price !== undefined && matchedItem.agreed_price !== null) {
        itemUpdates.agreed_price = parseFloat(matchedItem.agreed_price) || 0;
      }
      if (matchedItem.pricing_mode) {
        itemUpdates.pricing_mode = matchedItem.pricing_mode;
      }
      if (matchedItem.bulk_monthly_price !== undefined && matchedItem.bulk_monthly_price !== null) {
        itemUpdates.monthly_price = parseFloat(matchedItem.bulk_monthly_price) || 0;
      }

      if (Object.keys(itemUpdates).length > 0) {
        await reqRow.update(itemUpdates, { transaction: t });
      }

      const plainReq = reqRow.get({ plain: true });
      delete plainReq.id;

      await WasteOrder.create({
        ...plainReq,
        order_id: orderId,
        vehicle_id: itemVehicleId || null,
        vendor_id: itemVendorId || null,
        corporation_id: parseInt(corporation_id),
        zone_id: parseInt(zone_id),
        ward_id: parseInt(ward_id),
        collection_event_id: parseInt(collection_event_id),
        status: 'Booked',
        contract_start_date,
        contract_end_date
      }, { transaction: t });
    }

    // Update original requests status to 'Booked'
    await WasteCollectionRequest.update({ status: 'Booked' }, {
      where: { lead_id: leadId },
      transaction: t
    });

    await t.commit();

    try {
      const customerName = requests[0]?.customer_legal_name || requests[0]?.apartment_name || "Customer";
      const { Notification } = require("../../models/index");
      await Notification.create({
        type: "order_booked",
        title: "New Waste Order Booked",
        message: `Waste Order #${orderId} has been booked for ${customerName}.`,
        reference_id: requests[0]?.id || null,
        reference_type: "order"
      });
    } catch (notifErr) {
      console.error("Failed to create order notification:", notifErr);
    }

    // Auto-create/update customer account and send credentials via email
    try {
      const firstReq = requests[0];
      const customerEmail = firstReq?.email || firstReq?.email_2;
      const customerMobile = firstReq?.mobile_number || firstReq?.phone_number_2;
      const customerName = firstReq?.customer_legal_name || firstReq?.customer_trade_name || firstReq?.contact_person || firstReq?.waste_generator_name || "Customer";

      if (customerEmail) {
        let existingCustomer = await Customer.findOne({ where: { email: customerEmail } });
        const plainPassword = generateProductionPassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        let isNewAccount = false;

        if (!existingCustomer) {
          existingCustomer = await Customer.create({
            customer_name: customerName,
            email: customerEmail,
            mobile: customerMobile || null,
            password: hashedPassword,
            login_type: "email",
            status: "active",
            customer_type: "website",
            created_by: "admin",
            notification_status: true
          });
          isNewAccount = true;
        } else {
          // Update customer password with fresh credentials and ensure active status
          await existingCustomer.update({
            password: hashedPassword,
            customer_name: customerName || existingCustomer.customer_name,
            mobile: customerMobile || existingCustomer.mobile,
            status: "active"
          });
          isNewAccount = false;
        }

        sendCustomerCredentialsEmail({
          toEmail: customerEmail,
          plainPassword,
          orderId,
          customerName,
          isNewAccount
        }).catch(e => console.error("Error sending customer credentials email:", e));
      }
    } catch (custErr) {
      console.error("Failed to process customer account/email on order booking:", custErr);
    }

    return res.status(200).json({
      message: "Order booked successfully.",
      order_id: orderId,
      status: 'Booked'
    });
  } catch (err) {
    await t.rollback();
    console.error("bookWasteCollectionRequest error:", err);
    return res.status(500).json({ message: "Failed to book waste collection request." });
  }
};

// PATCH /api/admin/waste-collection-requests/:id/reassign-vendor-vehicle
const reassignVendorVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { vendor_id, vehicle_id } = req.body;

    const request = await WasteCollectionRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: "Waste collection request not found." });
    }

    const updates = {};
    if (vendor_id !== undefined) updates.vendor_id = vendor_id;
    if (vehicle_id !== undefined) updates.vehicle_id = vehicle_id;

    await request.update(updates);

    return res.status(200).json({
      message: "Vendor/Vehicle reassigned successfully.",
      request
    });
  } catch (err) {
    console.error("reassignVendorVehicle error:", err);
    return res.status(500).json({ message: "Failed to reassign vendor/vehicle." });
  }
};

module.exports = {
  getWasteCollectionRequests,
  createWasteCollectionRequest,
  getWasteCollectionRequestById,
  updateWasteCollectionRequestByLeadId,
  updateWasteCollectionRequestStatus,
  searchRequestByMobile,
  resolveMapLink,
  bookWasteCollectionRequest,
  reassignVendorVehicle
};
