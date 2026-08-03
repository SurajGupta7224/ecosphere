const WasteCollectionRequest = require("../../models/wasteCollectionRequestModel");
const { generateLeadId } = require("../../services/leadIdService");

const submitRegistration = async (req, res) => {
  try {

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

  // Existing fields
  sector,
  registered_rwa,
  gst_number,
  pan_number,
  trade_license,
  billing_address_different,
  billing_details,
  subcategories
} = req.body;


    // return res.status(200).json({
    //   success: 1,
    //   message: "Data received successfully.",
    //   data: req.body
    // });

    const leadId = await generateLeadId();

const request = await WasteCollectionRequest.create({
  lead_id: leadId,

  // Section 1 - Company Details
  site_request: site_request || null,
  service_center_type: service_center_type || null,
  employee_name: employee_name || null,
  billing_type: billing_type || null,
  business_region: business_region || null,
  business_sub_region: business_sub_region || null,
  branch_code: branch_code || null,

  // Section 2 - Customer Details
  customer_type,
  business_lead: business_lead || null,
  customer_legal_name,
  customer_trade_name,
  contact_person,
  designation: designation || null,
  mobile_number,
  phone_number_2: phone_number_2 || null,
  email,
  email_2: email_2 || null,

  // Section 3 - Location Details
  complete_address,
  address_search: address_search || complete_address,
  landmark: landmark || null,
  city: city || null,
  state: state || null,
  country: country || null,
  pincode: pincode || null,
  latitude: latitude || null,
  longitude: longitude || null,
  google_map_link: google_map_link || null,

  // Section 4 - Service Details
  expected_waste: expected_waste || 0,
  pickup_date: pickup_date || null,
  time_slot_id: time_slot_id || null,

  // Existing mappings
  waste_generator_name: customer_legal_name,

  sector: sector || null,
  registered_rwa: registered_rwa || null,
  gst_number: gst_number || null,
  pan_number: pan_number || null,
  trade_license: trade_license || null,

  billing_address_different: billing_address_different || false,
  billing_details: billing_details || null,

  status: "Pending",
  request_source: "Customer",
  created_by_type: "Customer",
});

return res.status(201).json({
  success: 1,
  message: "Registration submitted successfully.",
  data: request,
});

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: 0,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  submitRegistration,
};