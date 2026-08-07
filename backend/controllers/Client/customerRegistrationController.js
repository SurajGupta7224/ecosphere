const WasteCollectionRequest = require("../../models/wasteCollectionRequestModel");
const { Customer, User, SubCategory } = require("../../models/index");
const { generateLeadId } = require("../../services/leadIdService");
const { Op } = require("sequelize");

const submitRegistration = async (req, res) => {
  try {
    // req.body contains text fields (parsed by multer)
    // req.files contains uploaded files keyed by field name
    const {
      // Section 1 - Company Details
      site_request,
      service_center_type,
      employee_name,
      billing_type,
      business_region,
      business_sub_region,
      branch_code,

      // Section 2 - Customer Details
      customer_type,
      business_lead,
      customer_legal_name,
      customer_trade_name,
      contact_person,
      designation,
      mobile_number,
      phone_number_2,
      email,
      email_2,
      others_note,

      // Section 3 - Location Details
      address_search,
      complete_address,
      landmark,
      city,
      state,
      country,
      pincode,
      latitude,
      longitude,
      google_map_link,

      // Section 4 - Service Details
      expected_waste,
      pickup_date,
      time_slot_id,
      pickup_time,
      pickup_notes,

      // Existing fields
      waste_generator_name,
      sector,
      registered_rwa,
      gst,
      gst_number,
      pan,
      pan_number,
      trade_license,
      billing_address_different,

      // Billing sub-fields
      billing_customer_legal_name,
      billing_customer_trade_name,
      billing_contact_person,
      billing_designation,
      billing_phone_number_1,
      billing_phone_number_2,
      billing_email,
      billing_email_2,
      billing_gstn,
      billing_complete_address,
      billing_others,
      billing_city,
      billing_state,
      billing_pincode,
      billing_landmark,
      billing_country,

      // Pricing / property fields
      area_sqm,
      no_of_dwelling_units,
      dwelling_units,
      occupied_flats,
      total_order_value,
      total_yearly_amount,
      discount,
      discounted_price,
      sez,
      taxibility,
      cgst,
      sgst,
      gst_amount,
      final_price,
      audit_requirement,
      technician_assign,
      technician,
      subcategories,
      variations_data
    } = req.body || {};

    // Helper: safely get a single uploaded file path
    const getFilePath = (fieldName) => {
      if (req.files && req.files[fieldName] && req.files[fieldName][0]) {
        return req.files[fieldName][0].filename;
      }
      return null;
    };

    // Compose billing_details as a JSON string from sub-fields
    const billingObj = {
      customer_legal_name: billing_customer_legal_name || null,
      customer_trade_name: billing_customer_trade_name || null,
      contact_person: billing_contact_person || null,
      designation: billing_designation || null,
      phone_number_1: billing_phone_number_1 || null,
      phone_number_2: billing_phone_number_2 || null,
      email: billing_email || null,
      email_2: billing_email_2 || null,
      gstn: billing_gstn || null,
      complete_address: billing_complete_address || null,
      others: billing_others || null,
      city: billing_city || null,
      state: billing_state || null,
      pincode: billing_pincode || null,
      landmark: billing_landmark || null,
      country: billing_country || null,
    };

    const billingDiff = billing_address_different === true || billing_address_different === "true";
    const billingDetails = billingDiff ? JSON.stringify(billingObj) : null;

    // Parse subcategories data if present
    let parsedSubcategories = [];
    const sourceData = subcategories || variations_data;
    if (sourceData) {
      try {
        parsedSubcategories = typeof sourceData === 'string' ? JSON.parse(sourceData) : sourceData;
      } catch (parseErr) {
        console.error("Failed to parse subcategories JSON:", parseErr);
        parsedSubcategories = [];
      }
    }

    // Create Customer record or link existing
    let customerId = null;
    let targetUserId = null;
    const validCustType = (customer_type && customer_type.toLowerCase() !== 'admin') ? customer_type : 'B2B';

    try {
      const custName = contact_person || customer_legal_name || customer_trade_name || 'Customer';
      const newCust = await Customer.create({
        customer_name: custName,
        mobile: mobile_number || null,
        email: email || null,
        customer_type: validCustType,
        created_by: 'customer',
        status: 'active'
      });
      customerId = newCust.id;

      if (email || mobile_number) {
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
    } catch (custErr) {
      console.error("Customer record creation notice:", custErr.message);
    }

    const leadId = await generateLeadId();
    const finalGst = gst || gst_number || null;
    const finalPan = pan || pan_number || null;
    const finalDwelling = no_of_dwelling_units || dwelling_units ? parseInt(no_of_dwelling_units || dwelling_units) : null;
    const finalOccupied = occupied_flats ? parseInt(occupied_flats) : null;

    const baseData = {
      lead_id: leadId,
      user_id: targetUserId,
      customer_id: customerId,

      // Section 1 - Company Details
      site_request: site_request || null,
      service_center_type: service_center_type || null,
      employee_name: employee_name || null,
      billing_type: billing_type || null,
      business_region: business_region || null,
      business_sub_region: business_sub_region || null,
      branch_code: branch_code || null,

      // Section 2 - Customer Details
      customer_type: validCustType,
      business_lead: business_lead || "Web Lead",
      customer_legal_name: customer_legal_name || null,
      customer_trade_name: customer_trade_name || null,
      contact_person: contact_person || null,
      contact_person_additional: contact_person || null,
      designation: designation || null,
      mobile_number: mobile_number || null,
      phone_number_2: phone_number_2 || null,
      email: email || null,
      email_2: email_2 || null,
      others_note: others_note || null,

      // Section 3 - Location Details
      complete_address: complete_address || null,
      address_search: address_search || complete_address || null,
      landmark: landmark || null,
      city: city || null,
      state: state || null,
      country: country || null,
      pincode: pincode || null,
      latitude: latitude || null,
      longitude: longitude || null,
      google_map_link: google_map_link || null,

      // Section 4 - Property & License Details
      waste_generator_name: waste_generator_name || customer_legal_name || null,
      sector: sector || null,
      area_sqm: area_sqm ? parseFloat(area_sqm) : null,
      dwelling_units: finalDwelling,
      occupied_flats: finalOccupied,
      registered_rwa: registered_rwa || null,
      gst_number: finalGst,
      pan_number: finalPan,
      trade_license: trade_license || null,

      // Service & Schedule Details
      pickup_date: pickup_date || null,
      time_slot_id: time_slot_id ? parseInt(time_slot_id) : null,
      pickup_time: pickup_time || null,
      pickup_notes: pickup_notes || null,

      // Billing Details
      billing_address_different: billingDiff,
      billing_details: billingDetails,

      // Financials
      total_order_value: total_order_value ? parseFloat(total_order_value) : 0.00,
      total_yearly_amount: total_yearly_amount ? parseFloat(total_yearly_amount) : 0.00,
      discount: discount ? parseFloat(discount) : 0.00,
      discounted_price: discounted_price ? parseFloat(discounted_price) : 0.00,
      sez: sez || "No",
      taxibility: taxibility || null,
      cgst: cgst ? parseFloat(cgst) : 0.00,
      sgst: sgst ? parseFloat(sgst) : 0.00,
      gst_amount: gst_amount ? parseFloat(gst_amount) : 0.00,
      final_price: final_price ? parseFloat(final_price) : 0.00,
      audit_requirement: audit_requirement || null,
      technician_assign: technician_assign || null,
      technician: technician || null,

      // Uploaded Files
      rwa_file: getFilePath("rwa_file"),
      gst_file: getFilePath("gst_file"),
      pan_file: getFilePath("pan_file"),
      trade_license_file: getFilePath("trade_license_file"),

      status: "Pending",
      request_source: "Customer",
      created_by_type: "Customer",
    };

    const createdRequests = [];

    if (parsedSubcategories && parsedSubcategories.length > 0) {
      for (const subItem of parsedSubcategories) {
        let category_id = subItem.category_id ? parseInt(subItem.category_id) : null;
        const subcategory_id = subItem.subcategory_id ? parseInt(subItem.subcategory_id) : null;
        const variation_id = subItem.variation_id ? parseInt(subItem.variation_id) : null;

        // If category_id was not provided directly in subItem, lookup from SubCategory
        if (!category_id && subcategory_id) {
          try {
            const subCatObj = await SubCategory.findByPk(subcategory_id);
            if (subCatObj) {
              category_id = subCatObj.category_id;
            }
          } catch (e) {}
        }

        const expected_waste = subItem.pricing_mode === 'Bulk' ? 0 : parseFloat(subItem.expected_waste || 0);
        const agreed_price = subItem.pricing_mode === 'Bulk' ? 0 : parseFloat(subItem.custom_price || subItem.agreed_price || 0);
        const suggested_price = subItem.pricing_mode === 'Bulk' ? 0 : parseFloat(subItem.suggested_price || 0);

        let monthly_waste = expected_waste * 30;
        let yearly_waste = expected_waste * 365;
        let monthly_price = monthly_waste * agreed_price;
        let yearly_price = yearly_waste * agreed_price;

        if (subItem.pricing_mode === 'Bulk') {
          monthly_waste = 0;
          yearly_waste = 0;
          monthly_price = parseFloat(subItem.bulk_monthly_price || subItem.monthly_price || 0);
          yearly_price = parseFloat(subItem.bulk_yearly_price || subItem.yearly_price || 0);
        }

        const reqRow = await WasteCollectionRequest.create({
          ...baseData,
          category_id,
          subcategory_id,
          variation_id,
          expected_waste,
          agreed_price,
          suggested_price,
          monthly_waste,
          yearly_waste,
          monthly_price,
          yearly_price
        });
        createdRequests.push(reqRow);
      }
    } else {
      const singleReq = await WasteCollectionRequest.create({
        ...baseData,
        expected_waste: expected_waste ? parseFloat(expected_waste) : 0
      });
      createdRequests.push(singleReq);
    }

    return res.status(201).json({
      success: 1,
      message: "Registration submitted successfully.",
      data: createdRequests[0],
      lead_id: leadId
    });

  } catch (error) {
    console.error("customerRegistrationController.submitRegistration error:", error);

    return res.status(500).json({
      success: 0,
      message: "Internal Server Error",
      error: process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
};

module.exports = {
  submitRegistration,
};