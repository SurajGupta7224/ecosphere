const { Op } = require("sequelize");
const sequelize = require("../../config/db");
const {
  TripSummary,
  Trip,
  Customer,
  User,
  Vehicle,
  Employee,
  Category,
  SubCategory,
  WasteOrder,
} = require("../../models");

// GET /api/trip-summaries/stats - Summary Cards Statistics
const getTripSummaryStats = async (req, res) => {
  try {
    const totalCollections = await TripSummary.count();

    const distinctTrips = await TripSummary.count({
      distinct: true,
      col: "trip_id",
    });

    const totalWasteRes = await TripSummary.sum("total_waste_kg");
    const totalWasteKg = Number(totalWasteRes || 0).toFixed(2);

    const pendingCount = await TripSummary.count({ where: { status: "Pending" } });
    const approvedCount = await TripSummary.count({ where: { status: "Approved" } });
    const rejectedCount = await TripSummary.count({ where: { status: "Rejected" } });

    // Fetch all master subcategories from SubCategory model to ensure 100% dynamic card generation
    const allMasterSubcategories = await SubCategory.findAll({
      attributes: ["id", "name"],
      raw: true,
    });

    // Group stats by subcategory from trip_summaries
    const subcategoryRows = await TripSummary.findAll({
      attributes: [
        "subcategory_id",
        "subcategory_name",
        "status",
        [sequelize.fn("SUM", sequelize.col("total_waste_kg")), "sum_kg"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count_val"],
      ],
      group: ["subcategory_id", "subcategory_name", "status"],
      raw: true,
    });

    const subMap = {};

    // 1. Initialize map with ALL master subcategories from database catalog
    allMasterSubcategories.forEach((masterSub) => {
      subMap[masterSub.id] = {
        subcategory_id: masterSub.id,
        subcategory_name: masterSub.name,
        total_waste_kg: 0,
        total_count: 0,
        pending_kg: 0,
        pending_count: 0,
        approved_kg: 0,
        approved_count: 0,
        rejected_kg: 0,
        rejected_count: 0,
      };
    });

    // 2. Merge actual collection stats from trip_summaries
    subcategoryRows.forEach((row) => {
      const subId = row.subcategory_id;
      const subName = row.subcategory_name || "General Waste";
      const status = row.status || "Pending";
      const sumKg = Number(row.sum_kg || 0);
      const countVal = Number(row.count_val || 0);

      if (!subMap[subId]) {
        subMap[subId] = {
          subcategory_id: subId,
          subcategory_name: subName,
          total_waste_kg: 0,
          total_count: 0,
          pending_kg: 0,
          pending_count: 0,
          approved_kg: 0,
          approved_count: 0,
          rejected_kg: 0,
          rejected_count: 0,
        };
      }

      subMap[subId].total_waste_kg += sumKg;
      subMap[subId].total_count += countVal;

      if (status === "Pending") {
        subMap[subId].pending_kg += sumKg;
        subMap[subId].pending_count += countVal;
      } else if (status === "Approved") {
        subMap[subId].approved_kg += sumKg;
        subMap[subId].approved_count += countVal;
      } else if (status === "Rejected") {
        subMap[subId].rejected_kg += sumKg;
        subMap[subId].rejected_count += countVal;
      }
    });

    const bySubcategory = Object.values(subMap).map((item) => ({
      ...item,
      total_waste_kg: Number(item.total_waste_kg.toFixed(2)),
      pending_kg: Number(item.pending_kg.toFixed(2)),
      approved_kg: Number(item.approved_kg.toFixed(2)),
      rejected_kg: Number(item.rejected_kg.toFixed(2)),
    }));

    return res.status(200).json({
      status: 1,
      message: "Trip Summary statistics fetched successfully.",
      stats: {
        total_trips: distinctTrips,
        total_collections: totalCollections,
        total_waste_kg: Number(totalWasteKg),
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        by_subcategory: bySubcategory,
      },
    });
  } catch (err) {
    console.error("getTripSummaryStats error:", err);
    return res.status(500).json({
      status: 0,
      message: "Failed to fetch Trip Summary statistics.",
      error: err.message,
    });
  }
};

// GET /api/trip-summaries - Listing with server-side search, filters, pagination
const getAllTripSummaries = async (req, res) => {
  try {
    const {
      search,
      trip_id,
      order_id,
      customer_id,
      vehicle_id,
      driver_id,
      category_id,
      subcategory_id,
      status,
      from_date,
      to_date,
      page = 1,
      limit = 25,
      sort = "created_at",
      order = "DESC",
    } = req.query;

    const where = {};

    // Exact Filters
    if (trip_id) where.trip_id = trip_id;
    if (order_id) where.order_id = { [Op.like]: `%${order_id.trim()}%` };
    if (customer_id) where.customer_id = customer_id;
    if (vehicle_id) where.vehicle_id = vehicle_id;
    if (driver_id) where.driver_id = driver_id;
    if (category_id) where.category_id = category_id;
    if (subcategory_id) where.subcategory_id = subcategory_id;

    if (status && status !== "All Status" && status !== "all") {
      where.status = status;
    }

    // Date Range Filter (submitted_at or created_at)
    if (from_date || to_date) {
      const dateCondition = {};
      if (from_date) {
        dateCondition[Op.gte] = new Date(`${from_date}T00:00:00.000Z`);
      }
      if (to_date) {
        dateCondition[Op.lte] = new Date(`${to_date}T23:59:59.999Z`);
      }
      where[Op.or] = [
        { submitted_at: dateCondition },
        { created_at: dateCondition },
      ];
    }

    // Global Search
    if (search && search.trim() !== "") {
      const term = `%${search.trim()}%`;
      const searchConditions = [
        sequelize.where(sequelize.cast(sequelize.col("TripSummary.trip_id"), "CHAR"), { [Op.like]: term }),
        { order_id: { [Op.like]: term } },
        { driver_name: { [Op.like]: term } },
        { subcategory_name: { [Op.like]: term } },
        { category_name: { [Op.like]: term } },
        { "$customer.customer_name$": { [Op.like]: term } },
        { "$vehicle.registration_number$": { [Op.like]: term } },
      ];

      if (where[Op.or]) {
        where[Op.and] = [
          { [Op.or]: where[Op.or] },
          { [Op.or]: searchConditions }
        ];
        delete where[Op.or];
      } else {
        where[Op.or] = searchConditions;
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 25;
    const offset = (pageNum - 1) * limitNum;

    const includeModels = [
      { model: Customer, as: "customer", attributes: ["id", "customer_name", "mobile", "email"], required: false },
      { model: User, as: "user", attributes: ["id", "name", "email"], required: false },
      { model: Vehicle, as: "vehicle", attributes: ["id", "registration_number", "brand", "model"], required: false },
      { model: Employee, as: "driver", attributes: ["id", "name", "mobile_number"], required: false },
      { model: Category, as: "category", attributes: ["id", "name"], required: false },
      { model: SubCategory, as: "subCategory", attributes: ["id", "name"], required: false },
      { model: User, as: "approver", attributes: ["id", "name", "email"], required: false },
    ];

    // If filter conditions are applied, find matching trip_ids so ALL collection subcategories for matched trips are retrieved
    let finalWhere = { ...where };
    if (Object.keys(where).length > 0) {
      const matchedRows = await TripSummary.findAll({
        where,
        include: includeModels,
        attributes: ["trip_id"],
        subQuery: false,
      });
      const matchedTripIds = [...new Set(matchedRows.map((r) => r.trip_id))];
      finalWhere = {
        trip_id: { [Op.in]: matchedTripIds.length > 0 ? matchedTripIds : [0] },
      };
    }

    const { count, rows } = await TripSummary.findAndCountAll({
      where: finalWhere,
      limit: limitNum,
      offset,
      order: [["trip_id", "DESC"], [sort, order.toUpperCase()]],
      include: includeModels,
      subQuery: false,
    });

    const processedRows = await Promise.all(
      rows.map(async (r) => {
        const item = r.toJSON();
        item.formatted_trip_id = String(item.trip_id).padStart(3, "0");
        if (!item.customer_name && (!item.customer || !item.customer.customer_name) && item.order_id) {
          try {
            const orderObj = await WasteOrder.findOne({
              where: { order_id: item.order_id },
              attributes: ["customer_legal_name", "contact_person", "customer_id"],
            });
            if (orderObj) {
              const custName = orderObj.customer_legal_name || orderObj.contact_person;
              if (custName) {
                item.customer_name = custName;
                if (!item.customer) item.customer = { id: orderObj.customer_id, customer_name: custName };
              }
            }
          } catch (e) {}
        }
        return item;
      })
    );

    return res.status(200).json({
      status: 1,
      message: "Trip Summaries fetched successfully.",
      data: processedRows,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (err) {
    console.error("getAllTripSummaries error:", err);
    return res.status(500).json({
      status: 0,
      message: "Failed to fetch Trip Summaries.",
      error: err.message,
    });
  }
};

// GET /api/trip-summaries/:id - Detailed view including sibling trip items
const getTripSummaryById = async (req, res) => {
  try {
    const { id } = req.params;

    const tripSummary = await TripSummary.findByPk(id, {
      include: [
        { model: Customer, as: "customer", attributes: ["id", "customer_name", "mobile", "email"] },
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: Vehicle, as: "vehicle", attributes: ["id", "registration_number", "brand", "model"] },
        { model: Employee, as: "driver", attributes: ["id", "name", "mobile_number"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
        { model: SubCategory, as: "subCategory", attributes: ["id", "name"] },
        { model: User, as: "approver", attributes: ["id", "name", "email"] },
      ],
    });

    if (!tripSummary) {
      return res.status(404).json({
        status: 0,
        message: "Trip Summary not found.",
      });
    }

    // Fetch all subcategory items collected for this same trip_id
    const siblingItems = await TripSummary.findAll({
      where: { trip_id: tripSummary.trip_id },
      include: [
        { model: Category, as: "category", attributes: ["id", "name"] },
        { model: SubCategory, as: "subCategory", attributes: ["id", "name"] },
      ],
    });

    const totalWasteKgSum = siblingItems
      .reduce((sum, item) => sum + Number(item.total_waste_kg || 0), 0)
      .toFixed(2);

    return res.status(200).json({
      status: 1,
      message: "Trip Summary details fetched successfully.",
      data: {
        ...tripSummary.toJSON(),
        trip_items: siblingItems,
        total_trip_waste_kg: Number(totalWasteKgSum),
      },
    });
  } catch (err) {
    console.error("getTripSummaryById error:", err);
    return res.status(500).json({
      status: 0,
      message: "Failed to fetch Trip Summary details.",
      error: err.message,
    });
  }
};

// POST /api/trip-summaries - Manual creation by Admin
const createTripSummary = async (req, res) => {
  try {
    const {
      trip_id,
      order_id,
      customer_id,
      user_id,
      vehicle_id,
      driver_id,
      category_id,
      subcategory_id,
      total_waste_kg,
      image,
      remarks,
    } = req.body;

    if (!trip_id || !order_id || !vehicle_id || !subcategory_id) {
      return res.status(400).json({
        status: 0,
        message: "trip_id, order_id, vehicle_id, and subcategory_id are required fields.",
      });
    }

    // Ensure Trip master record exists
    await Trip.findOrCreate({
      where: { id: trip_id },
      defaults: { id: trip_id, order_id },
    });

    // Lookup Master Data for names
    let driver_name = req.body.driver_name || null;
    if (!driver_name && driver_id) {
      const emp = await Employee.findByPk(driver_id);
      if (emp) driver_name = emp.name;
    }

    let category_name = req.body.category_name || null;
    if (!category_name && category_id) {
      const cat = await Category.findByPk(category_id);
      if (cat) category_name = cat.name;
    }

    let subcategory_name = req.body.subcategory_name || "";
    if (subcategory_id) {
      const sub = await SubCategory.findByPk(subcategory_id);
      if (sub) {
        subcategory_name = sub.name;
        if (!category_id) category_id = sub.category_id;
      }
    }

    const record = await TripSummary.create({
      trip_id,
      order_id,
      customer_id: customer_id || null,
      user_id: user_id || req.user.id,
      vehicle_id,
      driver_id: driver_id || null,
      driver_name,
      category_id: category_id || null,
      category_name,
      subcategory_id,
      subcategory_name,
      total_waste_kg: Number(total_waste_kg || 0),
      image: image || null,
      remarks: remarks || null,
      status: "Pending",
      submitted_at: new Date(),
    });

    return res.status(201).json({
      status: 1,
      message: "Trip Summary record created successfully.",
      data: record,
    });
  } catch (err) {
    console.error("createTripSummary error:", err);
    return res.status(500).json({
      status: 0,
      message: "Failed to create Trip Summary record.",
      error: err.message,
    });
  }
};

// PUT /api/trip-summaries/:id - Update existing record
const updateTripSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await TripSummary.findByPk(id);
    if (!record) {
      return res.status(404).json({
        status: 0,
        message: "Trip Summary record not found.",
      });
    }

    const {
      total_waste_kg,
      remarks,
      vehicle_id,
      driver_id,
      category_id,
      subcategory_id,
    } = req.body;

    if (total_waste_kg !== undefined) record.total_waste_kg = Number(total_waste_kg);
    if (remarks !== undefined) record.remarks = remarks;
    if (vehicle_id) record.vehicle_id = vehicle_id;
    if (driver_id) {
      record.driver_id = driver_id;
      const emp = await Employee.findByPk(driver_id);
      if (emp) record.driver_name = emp.name;
    }
    if (subcategory_id) {
      record.subcategory_id = subcategory_id;
      const sub = await SubCategory.findByPk(subcategory_id);
      if (sub) record.subcategory_name = sub.name;
    }
    if (category_id) {
      record.category_id = category_id;
      const cat = await Category.findByPk(category_id);
      if (cat) record.category_name = cat.name;
    }

    if (req.body.image) record.image = req.body.image;

    await record.save();

    return res.status(200).json({
      status: 1,
      message: "Trip Summary updated successfully.",
      data: record,
    });
  } catch (err) {
    console.error("updateTripSummary error:", err);
    return res.status(500).json({
      status: 0,
      message: "Failed to update Trip Summary.",
      error: err.message,
    });
  }
};

// DELETE /api/trip-summaries/:id - Delete single record
const deleteTripSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await TripSummary.findByPk(id);
    if (!record) {
      return res.status(404).json({
        status: 0,
        message: "Trip Summary record not found.",
      });
    }

    await record.destroy();

    return res.status(200).json({
      status: 1,
      message: "Trip Summary record deleted successfully.",
    });
  } catch (err) {
    console.error("deleteTripSummary error:", err);
    return res.status(500).json({
      status: 0,
      message: "Failed to delete Trip Summary record.",
      error: err.message,
    });
  }
};

// POST /api/trip-summaries/:id/approve - Approve record
const approveTripSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await TripSummary.findByPk(id);
    if (!record) {
      return res.status(404).json({
        status: 0,
        message: "Trip Summary record not found.",
      });
    }

    record.status = "Approved";
    record.approved_by = req.user?.id || null;
    record.approved_at = new Date();

    await record.save();

    return res.status(200).json({
      status: 1,
      message: "Trip Summary approved successfully.",
      data: record,
    });
  } catch (err) {
    console.error("approveTripSummary error:", err);
    return res.status(500).json({
      status: 0,
      message: "Failed to approve Trip Summary.",
      error: err.message,
    });
  }
};

// POST /api/trip-summaries/:id/reject - Reject record
const rejectTripSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason, remarks } = req.body;

    const record = await TripSummary.findByPk(id);
    if (!record) {
      return res.status(404).json({
        status: 0,
        message: "Trip Summary record not found.",
      });
    }

    const reason = rejection_reason || remarks;
    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        status: 0,
        message: "A rejection reason/remark is required when rejecting a record.",
      });
    }

    record.status = "Rejected";
    record.approved_by = req.user?.id || null;
    record.approved_at = new Date();
    record.remarks = `[Rejection Reason]: ${reason.trim()}` + (record.remarks ? ` | ${record.remarks}` : "");

    await record.save();

    return res.status(200).json({
      status: 1,
      message: "Trip Summary rejected successfully.",
      data: record,
    });
  } catch (err) {
    console.error("rejectTripSummary error:", err);
    return res.status(500).json({
      status: 0,
      message: "Failed to reject Trip Summary.",
      error: err.message,
    });
  }
};

// PUT /api/trip-summaries/trip/:tripId - Update all items for a trip simultaneously
const updateTripByTripId = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { vehicle_id, driver_id, remarks, items } = req.body;

    const records = await TripSummary.findAll({ where: { trip_id: tripId } });
    if (!records.length) {
      return res.status(404).json({
        status: 0,
        message: "No Trip Summary records found for this Trip ID.",
      });
    }

    let driverName = null;
    if (driver_id) {
      const emp = await Employee.findByPk(driver_id);
      if (emp) driverName = emp.name;
    }

    for (const record of records) {
      if (vehicle_id) record.vehicle_id = vehicle_id;
      if (driver_id) {
        record.driver_id = driver_id;
        if (driverName) record.driver_name = driverName;
      }
      if (remarks) record.remarks = remarks;

      if (Array.isArray(items)) {
        const itemUpdate = items.find((i) => String(i.id) === String(record.id));
        if (itemUpdate) {
          if (itemUpdate.total_waste_kg !== undefined) {
            record.total_waste_kg = Number(itemUpdate.total_waste_kg);
          }
          if (itemUpdate.remarks !== undefined) {
            record.remarks = itemUpdate.remarks;
          }
        }
      }
      await record.save();
    }

    return res.status(200).json({
      status: 1,
      message: `Updated all collection items for Trip #${tripId} successfully.`,
    });
  } catch (err) {
    console.error("updateTripByTripId error:", err);
    return res.status(500).json({
      status: 0,
      message: "Failed to update Trip Summaries.",
      error: err.message,
    });
  }
};

// POST /api/trip-summaries/trip/:tripId/approve - Approve all items for a trip simultaneously
const approveTripByTripId = async (req, res) => {
  try {
    const { tripId } = req.params;

    const records = await TripSummary.findAll({ where: { trip_id: tripId } });
    if (!records.length) {
      return res.status(404).json({
        status: 0,
        message: "No Trip Summary records found for this Trip ID.",
      });
    }

    for (const record of records) {
      record.status = "Approved";
      record.approved_by = req.user?.id || null;
      record.approved_at = new Date();
      await record.save();
    }

    return res.status(200).json({
      status: 1,
      message: `Approved all collection items for Trip #${tripId} successfully.`,
    });
  } catch (err) {
    console.error("approveTripByTripId error:", err);
    return res.status(500).json({
      status: 0,
      message: "Failed to approve Trip Summaries.",
      error: err.message,
    });
  }
};

// POST /api/trip-summaries/trip/:tripId/reject - Reject all items for a trip simultaneously
const rejectTripByTripId = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { rejection_reason, remarks } = req.body;

    const reason = rejection_reason || remarks;
    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        status: 0,
        message: "A rejection reason/remark is required when rejecting a trip.",
      });
    }

    const records = await TripSummary.findAll({ where: { trip_id: tripId } });
    if (!records.length) {
      return res.status(404).json({
        status: 0,
        message: "No Trip Summary records found for this Trip ID.",
      });
    }

    for (const record of records) {
      record.status = "Rejected";
      record.approved_by = req.user?.id || null;
      record.approved_at = new Date();
      record.remarks = `[Rejection Reason]: ${reason.trim()}` + (record.remarks ? ` | ${record.remarks}` : "");
      await record.save();
    }

    return res.status(200).json({
      status: 1,
      message: `Rejected all collection items for Trip #${tripId} successfully.`,
    });
  } catch (err) {
    console.error("rejectTripByTripId error:", err);
    return res.status(500).json({
      status: 0,
      message: "Failed to reject Trip Summaries.",
      error: err.message,
    });
  }
};

module.exports = {
  getTripSummaryStats,
  getAllTripSummaries,
  getTripSummaryById,
  createTripSummary,
  updateTripSummary,
  deleteTripSummary,
  approveTripSummary,
  rejectTripSummary,
  updateTripByTripId,
  approveTripByTripId,
  rejectTripByTripId,
};