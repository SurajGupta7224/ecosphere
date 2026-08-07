const {
  TripSummary,
  WasteOrder,
  Driver,
  Vehicle,
  Customer,
} = require("../../models");

// Driver submits Trip Summary
const submitTripSummary = async (req, res) => {
  try {
    const { order_id, collected_weight, remarks } = req.body;

    if (!order_id || collected_weight == null) {
      return res.status(400).json({
        status: 0,
        message: "Order ID and collected weight are required.",
      });
    }

    // Logged-in driver
    const driver = req.driver;

    // Find Waste Order using QR Order ID
    const wasteOrder = await WasteOrder.findOne({
      where: { order_id },
    });

    if (!wasteOrder) {
      return res.status(404).json({
        status: 0,
        message: "Waste Order not found.",
      });
    }

    // Find Vehicle assigned to driver
    const vehicle = await Vehicle.findOne({
      where: {
        driver_id: driver.employee_id,
      },
    });

    if (!vehicle) {
      return res.status(404).json({
        status: 0,
        message: "Vehicle not assigned.",
      });
    }

    // Customer Details
    const customer = await Customer.findByPk(wasteOrder.customer_id);

    // Initialize all waste fields with 0
    let wet_waste = 0;
    let dry_waste = 0;
    let sanitary_waste = 0;
    let special_care_waste = 0;
    let bulk_waste = 0;

    // Set only the collected category
    // Set only the collected waste type
switch (wasteOrder.subcategory_id) {
  case 1: // Dry Waste
    dry_waste = collected_weight;
    break;

  case 2: // Wet Waste
    wet_waste = collected_weight;
    break;

  case 3: // Sanitary Waste
    sanitary_waste = collected_weight;
    break;

  default:
    break;
}



  
// Check if a Trip Summary already exists for this Waste Order and Subcategory

const existingTrip = await TripSummary.findOne({
  where: {
    waste_order_id: wasteOrder.id,
    subcategory_id: wasteOrder.subcategory_id,
  },
});

if (existingTrip) {
  return res.status(400).json({
    status: 0,
    message: "Trip Summary already submitted for this waste type.",
  });
}



    // Create Trip Summary
    const tripSummary = await TripSummary.create({
      order_id: wasteOrder.order_id,
      waste_order_id: wasteOrder.id,
      lead_id: wasteOrder.lead_id,

      customer_id: wasteOrder.customer_id,
      customer_name: customer?.customer_name || customer?.name || "",

      vendor_id: wasteOrder.vendor_id,

      
      driver_name: driver.name,

      
      vehicle_number: vehicle.registration_number,

     subcategory_id: wasteOrder.subcategory_id,

      wet_waste,
      dry_waste,
      sanitary_waste,
      special_care_waste,
      bulk_waste,

      total_waste: Number(collected_weight),

      remarks,

      status: "Pending",

      submitted_at: new Date(),
    });

    return res.status(201).json({
      status: 1,
      message: "Trip Summary submitted successfully.",
      data: tripSummary,
    });
  } catch (err) {
    console.error("submitTripSummary Error:", err);

    return res.status(500).json({
      status: 0,
      message: "Failed to submit Trip Summary.",
      error: err.message,
    });
  }
};

module.exports = {
  submitTripSummary,
};