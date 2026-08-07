const {
  TripSummary,
  WasteOrder,
  Driver,
  Vehicle,
  Customer,
  Category,
  SubCategory,
} = require("../../models");


// Driver submits Trip Summary
const submitTripSummary = async (req, res) => {
  try {
    const { order_id, vehicle_id, waste_details, remarks } = req.body;

if (!order_id || !vehicle_id || !Array.isArray(waste_details) || waste_details.length === 0) {
  return res.status(400).json({
    status: 0,
    message: "order_id, vehicle_id and waste_details are required.",
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
    const vehicle = await Vehicle.findByPk(vehicle_id);

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


    // Fetch all waste details for the given Waste Order
    for (const item of waste_details) {

  switch (item.subcategory_id) {

    case 1: // Dry Waste
      dry_waste = Number(item.weight);
      break;

    case 2: // Wet Waste
      wet_waste = Number(item.weight);
      break;

    case 3: // Sanitary Waste
      sanitary_waste = Number(item.weight);
      break;

    case 4: // Special Care Waste
      special_care_waste = Number(item.weight);
      break;

    case 5: // Bulk Waste
      bulk_waste = Number(item.weight);
      break;

    default:
      break;
  }

}


const total_waste =
  wet_waste +
  dry_waste +
  sanitary_waste +
  special_care_waste +
  bulk_waste;


  
// Check if a Trip Summary already exists for this Waste Order and Subcategory

const existingTrip = await TripSummary.findOne({
  where: {
    waste_order_id: wasteOrder.id,
    vehicle_id: vehicle.id,
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
      vehicle_id: vehicle.id,

      
      driver_name: driver.name,

      
      vehicle_number: vehicle.registration_number,

     //subcategory_id: wasteOrder.subcategory_id,

      wet_waste,
      dry_waste,
      sanitary_waste,
      special_care_waste,
      bulk_waste,

     total_waste,

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


// Fetch Order Details for Driver

const fetchOrderDetails = async (req, res) => {
  try {
    const { order_id, vehicle_id } = req.body;

    if (!order_id || !vehicle_id) {
      return res.status(400).json({
        status: 0,
        message: "order_id and vehicle_id are required.",
      });
    }

    
    const orders = await WasteOrder.findAll({
  where: {
    order_id,
    vehicle_id,
  },
  attributes: [
  "order_id",
  "vehicle_id",
  "category_id",
  "subcategory_id",
  "waste_generator_name",
  "latitude",
  "longitude",
],
  include: [
    {
      model: Category,
      as: "category",
      attributes: ["id", "name"],
    },
    {
      model: SubCategory,
      as: "subCategory",
      attributes: ["id", "name"],
    },
    {
    model: Vehicle,
    as: "vehicle",
    attributes: ["registration_number"],
  },
  ],
});

if (!orders.length) {
  return res.status(404).json({
    status: 0,
    message: "No waste categories found for this order and vehicle.",
  });
}

return res.status(200).json({
  status: 1,
  message: "Order details fetched successfully.",
 data: {
  order_id,
  vehicle_id,
  vehicle_number: orders[0].vehicle.registration_number,
  apartment_name: orders[0].waste_generator_name,
  latitude: orders[0].latitude,
  longitude: orders[0].longitude,
  subcategories: orders.map((item) => ({
    category_id: item.category_id,
    category_name: item.category.name,
    subcategory_id: item.subcategory_id,
    subcategory_name: item.subCategory.name,
  })),
},
});

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      status: 0,
      message: "Failed to fetch order details.",
      error: err.message,
    });
  }
};
module.exports = {
  fetchOrderDetails,
  submitTripSummary,
};