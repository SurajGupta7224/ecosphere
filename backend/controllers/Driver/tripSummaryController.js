const sequelize = require("../../config/db");
const { Op } = require("sequelize");
const {
  TripSummary,
  Trip,
  WasteOrder,
  Driver,
  Vehicle,
  Employee,
  Customer,
  Category,
  SubCategory,
} = require("../../models");

// Driver submits multi-item Trip Summary (Mobile collection API)
const submitTripSummary = async (req, res) => {
  const transaction = await sequelize.transaction();
  const body = req.body || {};
  try {
    const {
      trip_id,
      order_id,
      vehicle_id,
      driver_id,
      customer_id,
      user_id,
      items,
      remarks,
    } = body;

    // Handle legacy single-item array or new items array
    let itemsList = items;
    if (!itemsList && body.waste_details) {
      itemsList = body.waste_details.map((wd) => ({
        category_id: wd.category_id || 1,
        subcategory_id: wd.subcategory_id,
        total_waste_kg: wd.total_waste_kg || wd.weight || 0,
        image: wd.image || null,
      }));
    }

    if (!order_id || !vehicle_id || !Array.isArray(itemsList) || itemsList.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        status: 0,
        message: "order_id, vehicle_id, and items array are required.",
      });
    }

    // Determine numerical trip_id (use provided trip_id or auto-generate sequential 001, 002... trip_id in backend)
    let activeTripId = trip_id;
    let wasteOrder = await WasteOrder.findOne({ where: { order_id }, transaction });

    if (!activeTripId || isNaN(activeTripId)) {
      // Find highest existing trip_id in database to generate next sequential trip ID
      const maxTripResult = await TripSummary.max("trip_id", { transaction });
      const nextId = (maxTripResult && !isNaN(maxTripResult) ? Number(maxTripResult) : 0) + 1;
      activeTripId = nextId;
    }

    // Ensure master trip record exists inside transaction
    await Trip.findOrCreate({
      where: { id: activeTripId },
      defaults: { id: activeTripId, order_id },
      transaction,
    });

    // Determine Driver & Vehicle details
    const reqDriver = req.driver;
    const finalDriverId = driver_id || reqDriver?.employee_id || reqDriver?.id || null;
    let driverName = body.driver_name || reqDriver?.name || null;

    if (!driverName && finalDriverId) {
      const emp = await Employee.findByPk(finalDriverId);
      if (emp) driverName = emp.name;
    }

    const vehicle = await Vehicle.findByPk(vehicle_id);
    if (!vehicle) {
      await transaction.rollback();
      return res.status(404).json({
        status: 0,
        message: `Vehicle with ID ${vehicle_id} not found.`,
      });
    }

    // Determine Customer ID
    let finalCustomerId = customer_id || null;
    if (!finalCustomerId && wasteOrder) {
      finalCustomerId = wasteOrder.customer_id;
    }

    // Process & Validate Items
    const createdRecords = [];

    for (const item of itemsList) {
      const subcatId = item.subcategory_id;
      const totalWasteKg = Number(item.total_waste_kg || item.weight || item.waste_kg || 0);

      if (!subcatId) {
        await transaction.rollback();
        return res.status(400).json({
          status: 0,
          message: "Each item in items array must specify a subcategory_id.",
        });
      }

      // Validate SubCategory existence in database
      const subcatObj = await SubCategory.findByPk(subcatId);
      if (!subcatObj) {
        await transaction.rollback();
        return res.status(400).json({
          status: 0,
          message: `SubCategory with ID ${subcatId} does not exist in the database.`,
        });
      }

      let categoryId = item.category_id || subcatObj.category_id;

      // Validate Category existence in database
      const catObj = await Category.findByPk(categoryId);
      if (!catObj) {
        await transaction.rollback();
        return res.status(400).json({
          status: 0,
          message: `Category with ID ${categoryId} does not exist in the database.`,
        });
      }

      const categoryName = catObj.name;
      const subcategoryName = subcatObj.name;

      // Check if image uploaded via file or passed in body string
      let imagePath = item.image || null;
      if (req.files && req.files[item.image_field]) {
        imagePath = req.files[item.image_field][0].path.replace(/\\/g, "/");
      }

      const newRecord = await TripSummary.create(
        {
          trip_id: activeTripId,
          order_id,
          customer_id: finalCustomerId,
          user_id: user_id || null,
          vehicle_id: vehicle.id,
          driver_id: finalDriverId,
          driver_name: driverName,
          category_id: categoryId,
          category_name: categoryName,
          subcategory_id: subcatId,
          subcategory_name: subcategoryName,
          total_waste_kg: totalWasteKg,
          image: imagePath,
          remarks: remarks || item.remarks || null,
          status: "Pending",
          submitted_at: new Date(),
        },
        { transaction }
      );

      createdRecords.push(newRecord);
    }

    // Commit Transaction
    await transaction.commit();

    const formattedTripId = String(activeTripId).padStart(3, "0");

    return res.status(201).json({
      status: 1,
      message: `${createdRecords.length} Trip Summary collection item(s) submitted successfully.`,
    });
  } catch (err) {
    await transaction.rollback();
    console.error("submitTripSummary error:", err);
    return res.status(500).json({
      status: 0,
      message: "Failed to submit Trip Summary collection data.",
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
        vehicle_number: orders[0].vehicle?.registration_number || "",
        apartment_name: orders[0].waste_generator_name,
        latitude: orders[0].latitude,
        longitude: orders[0].longitude,
        subcategories: orders.map((item) => ({
          category_id: item.category_id,
          category_name: item.category?.name || "",
          subcategory_id: item.subcategory_id,
          subcategory_name: item.subCategory?.name || "",
        })),
      },
    });
  } catch (err) {
    console.error("fetchOrderDetails error:", err);
    return res.status(500).json({
      status: 0,
      message: "Failed to fetch order details.",
      error: err.message,
    });
  }
};




// POST /api/v1/driver/vehicle-trip-summary
// Fetch Trip Summary records using vehicle number
const getVehicleTripSummaries = async (req, res) => {
  try {
    const { vehicle_id, date, status } = req.body;

   if (!vehicle_id) {
  return res.status(400).json({
    status: 0,
    message: "vehicle_id is required.",
  });
}

// Find vehicle using vehicle ID
const vehicle = await Vehicle.findByPk(vehicle_id);

if (!vehicle) {
  return res.status(404).json({
    status: 0,
    message: "Vehicle not found.",
  });
}

    // Build Trip Summary filters
    const whereCondition = {
      vehicle_id: vehicle.id,
    };

    // Optional status filter
    if (status) {
      const allowedStatuses = ["Pending", "Approved", "Rejected"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          status: 0,
          message: "Invalid status. Use Pending, Approved, or Rejected.",
        });
      }

      whereCondition.status = status;
    }

    // Optional date filter
    if (date) {
      whereCondition.submitted_at = {
        [Op.gte]: `${date} 00:00:00`,
        [Op.lt]: `${date} 23:59:59`,
      };
    }

    // Find Trip Summary records
    const tripSummaries = await TripSummary.findAll({
      where: whereCondition,
      order: [["submitted_at", "DESC"]],
    });

    return res.status(200).json({
      status: 1,
      message: "Vehicle trip summary fetched successfully.",
      data: {
        vehicle_id: vehicle.id,
        vehicle_number: vehicle.registration_number,
        trip_summaries: tripSummaries,
      },
    });

  } catch (err) {
    console.error("getVehicleTripSummaries error:", err);

    return res.status(500).json({
      status: 0,
      message: "Failed to fetch vehicle trip summaries.",
      error: err.message,
    });
  }
};



// POST /api/v1/driver/vehicle-waste-summary
// Fetch total waste collected by vehicle, with subcategory-wise breakdown
const getVehicleWasteSummary = async (req, res) => {
  try {
    const { vehicle_id, date, status } = req.body;

    if (!vehicle_id) {
      return res.status(400).json({
        status: 0,
        message: "vehicle_id is required.",
      });
    }

    // Find vehicle
    const vehicle = await Vehicle.findByPk(vehicle_id);

    if (!vehicle) {
      return res.status(404).json({
        status: 0,
        message: "Vehicle not found.",
      });
    }

    // Build filters
    const whereCondition = {
      vehicle_id: vehicle.id,
    };

    // Status filter
    if (status) {
      const allowedStatuses = ["Pending", "Approved", "Rejected"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          status: 0,
          message: "Invalid status. Use Pending, Approved, or Rejected.",
        });
      }

      whereCondition.status = status;
    }

    // Date filter
    if (date) {
      whereCondition.submitted_at = {
        [Op.gte]: `${date} 00:00:00`,
        [Op.lt]: `${date} 23:59:59`,
      };
    }

    // Get matching Trip Summary records
    const tripSummaries = await TripSummary.findAll({
      where: whereCondition,
      attributes: [
        "subcategory_id",
        "subcategory_name",
        "total_waste_kg",
      ],
    });

    

    // Calculate subcategory-wise totals
    // Get all 5 subcategories
const allSubcategories = await SubCategory.findAll({
  where: {
    id: [1, 2, 3, 4, 5],
  },
  attributes: ["id", "name"],
  order: [["id", "ASC"]],
});

// Calculate totals from Trip Summary records
let totalWaste = 0;

const subcategoryTotals = {};

for (const subcategory of allSubcategories) {
  subcategoryTotals[subcategory.id] = {
    subcategory_id: subcategory.id,
    subcategory_name: subcategory.name,
    total_waste_kg: 0,
  };
}

for (const trip of tripSummaries) {
  const weight = Number(trip.total_waste_kg || 0);

  totalWaste += weight;

  const subcategoryId = trip.subcategory_id;

  if (subcategoryTotals[subcategoryId]) {
    subcategoryTotals[subcategoryId].total_waste_kg += weight;
  }
}


    return res.status(200).json({
      status: 1,
      message: "Vehicle waste summary fetched successfully.",
      data: {
        vehicle_id: vehicle.id,
        vehicle_number: vehicle.registration_number,
        total_waste_kg: Number(totalWaste.toFixed(2)),
        subcategory_wise: Object.values(subcategoryTotals).map((item) => ({
          ...item,
          total_waste_kg: Number(item.total_waste_kg.toFixed(2)),
        })),
      },
    });

  } catch (err) {
    console.error("getVehicleWasteSummary error:", err);

    return res.status(500).json({
      status: 0,
      message: "Failed to fetch vehicle waste summary.",
      error: err.message,
    });
  }
};


module.exports = {
  fetchOrderDetails,
  submitTripSummary,
  getVehicleTripSummaries,
  getVehicleWasteSummary,
};