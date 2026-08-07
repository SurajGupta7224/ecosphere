const { TripSummary, WasteOrder } = require("../../models");

// GET All Trip Summaries
const getAllTripSummaries = async (req, res) => {
  try {
    const trips = await TripSummary.findAll({
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      status: 1,
      message: "Trip Summaries fetched successfully.",
      data: trips,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      status: 0,
      message: "Failed to fetch Trip Summaries.",
      error: err.message,
    });
  }
};

// GET Single Trip Summary
const getTripSummaryById = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await TripSummary.findByPk(id);

    if (!trip) {
      return res.status(404).json({
        status: 0,
        message: "Trip Summary not found.",
      });
    }

    return res.status(200).json({
      status: 1,
      message: "Trip Summary fetched successfully.",
      data: trip,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      status: 0,
      message: "Failed to fetch Trip Summary.",
      error: err.message,
    });
  }
};


// PATCH /api/admin/trip-summaries/:id
const updateTripSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await TripSummary.findByPk(id);

    if (!trip) {
      return res.status(404).json({
        status: 0,
        message: "Trip Summary not found.",
      });
    }

    // Check if the Trip Summary is already approved
    if (trip.status === "Approved") {
  return res.status(400).json({
    status: 0,
    message: "Approved Trip Summary cannot be edited.",
  });
}

    const {
      wet_waste,
      dry_waste,
      sanitary_waste,
      special_care_waste,
      bulk_waste,
      remarks,
    } = req.body;

    // Update values
    trip.wet_waste = wet_waste ?? trip.wet_waste;
    trip.dry_waste = dry_waste ?? trip.dry_waste;
    trip.sanitary_waste = sanitary_waste ?? trip.sanitary_waste;
    trip.special_care_waste =
      special_care_waste ?? trip.special_care_waste;
    trip.bulk_waste = bulk_waste ?? trip.bulk_waste;

    trip.remarks = remarks ?? trip.remarks;

    // Recalculate Total
    trip.total_waste =
      Number(trip.wet_waste) +
      Number(trip.dry_waste) +
      Number(trip.sanitary_waste) +
      Number(trip.special_care_waste) +
      Number(trip.bulk_waste);

    await trip.save();

    return res.status(200).json({
      status: 1,
      message: "Trip Summary updated successfully.",
      data: trip,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      status: 0,
      message: "Failed to update Trip Summary.",
      error: err.message,
    });
  }
};




// PATCH /api/admin/trip-summaries/:id/approve
const approveTripSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await TripSummary.findByPk(id);

    if (!trip) {
      return res.status(404).json({
        status: 0,
        message: "Trip Summary not found.",
      });
    }


    // Check if the Trip Summary is already approved
    if (trip.status === "Approved") {
  return res.status(400).json({
    status: 0,
    message: "Approved Trip Summary cannot be edited.",
  });
}

    // Approve Trip Summary
    trip.status = "Approved";
    trip.approved_by = req.user.id;
    trip.approved_at = new Date();

    await trip.save();

    // Update Waste Order Status
    const wasteOrder = await WasteOrder.findByPk(trip.waste_order_id);

    if (wasteOrder) {
      wasteOrder.status = "Completed";
      await wasteOrder.save();
    }

    return res.status(200).json({
      status: 1,
      message: "Trip Summary approved successfully.",
      data: trip,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      status: 0,
      message: "Failed to approve Trip Summary.",
      error: err.message,
    });
  }
};


module.exports = {
  getAllTripSummaries,
  getTripSummaryById,
   updateTripSummary,
   approveTripSummary,
};