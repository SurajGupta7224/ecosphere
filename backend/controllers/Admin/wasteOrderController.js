const { WasteOrder, User, Category, SubCategory, SubCategoryVariation, Customer, Corporation, Zone, Ward, CollectionEvent, Employee, WasteCollectionRequest, Vehicle } = require("../../models/index");
const { Op } = require("sequelize");
const sequelize = require("../../config/db");
const QRCode = require("qrcode");

// GET /api/admin/waste-orders - Fetch all orders
const getWasteOrders = async (req, res) => {
  const { page = 1, limit = 500, search = '', status = '', customer_id = '', user_id = '' } = req.query;
  const offset = (page - 1) * limit;
  const where = {};

  if (status !== '') {
    where.status = status;
  }
  if (customer_id) {
    where.customer_id = customer_id;
  }
  if (user_id) {
    where.user_id = user_id;
  }

  const isAdmin = req.user?.role?.role_name?.toLowerCase() === 'admin';
  if (!isAdmin && !customer_id && !user_id) {
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

  try {
    const { count, rows } = await WasteOrder.findAndCountAll({
      where,
      include: [
        { model: User, as: "customer", attributes: ["id", "name", "email", "phone"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
        { model: SubCategory, as: "subCategory", attributes: ["id", "name"] },
        { model: SubCategoryVariation, as: "variation", attributes: ["id", "variation_name", "per_kg_price", "bulk_price"] },
        { model: User, as: "approver", attributes: ["id", "name", "email"] },
        { model: Corporation, as: "corporation", attributes: ["id", "corporation_name"] },
        { model: Zone, as: "zone", attributes: ["id", "zone_name"] },
        { model: Ward, as: "ward", attributes: ["id", "ward_name"] },
        { model: CollectionEvent, as: "collectionEvent", attributes: ["id", "event_name"] },
        { model: User, as: "vendor", attributes: ["id", "name", "email"] },
        { 
          model: Employee, 
          as: "driverEmployee", 
          attributes: ["id", "name", "mobile_number"],
          include: [
            {
              model: Vehicle,
              as: "driverVehicles",
              attributes: ["id", "registration_number", "brand", "model"]
            }
          ]
        },
        { model: User, as: "canceller", attributes: ["id", "name", "email"] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']]
    });

    return res.status(200).json({
      orders: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error("getWasteOrders error:", err);
    return res.status(500).json({ message: "Failed to fetch waste orders" });
  }
};

// GET /api/admin/waste-orders/:id - Fetch single order details
const getWasteOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await WasteOrder.findByPk(id, {
      include: [
        { model: User, as: "customer", attributes: ["id", "name", "email", "phone"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
        { model: SubCategory, as: "subCategory", attributes: ["id", "name"] },
        { model: SubCategoryVariation, as: "variation", attributes: ["id", "variation_name", "per_kg_price", "bulk_price"] },
        { model: User, as: "approver", attributes: ["id", "name", "email"] },
        { model: Corporation, as: "corporation", attributes: ["id", "corporation_name"] },
        { model: Zone, as: "zone", attributes: ["id", "zone_name"] },
        { model: Ward, as: "ward", attributes: ["id", "ward_name"] },
        { model: CollectionEvent, as: "collectionEvent", attributes: ["id", "event_name"] },
        { model: User, as: "vendor", attributes: ["id", "name", "email"] },
        { 
          model: Employee, 
          as: "driverEmployee", 
          attributes: ["id", "name", "mobile_number"],
          include: [
            {
              model: Vehicle,
              as: "driverVehicles",
              attributes: ["id", "registration_number", "brand", "model"]
            }
          ]
        },
        { model: User, as: "canceller", attributes: ["id", "name", "email"] }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: "Waste order not found." });
    }

    return res.status(200).json({ order });
  } catch (err) {
    console.error("getWasteOrderById error:", err);
    return res.status(500).json({ message: "Failed to fetch waste order details" });
  }
};

// PATCH /api/admin/waste-orders/lead/:leadId/cancel - Cancel order
const cancelWasteOrder = async (req, res) => {
  const { leadId } = req.params;
  const { cancel_reason } = req.body;

  if (!cancel_reason || !cancel_reason.trim()) {
    return res.status(400).json({ message: "Cancellation reason is required." });
  }

  const t = await sequelize.transaction();

  try {
    const orders = await WasteOrder.findAll({
      where: { lead_id: leadId, status: 'Booked' }
    });

    if (orders.length === 0) {
      await t.rollback();
      return res.status(404).json({ message: "Active waste order not found for this request." });
    }

    const cancelledBy = req.user ? req.user.id : null;
    const cancelledDate = new Date();

    // Mark orders as Cancelled
    await WasteOrder.update({
      status: 'Cancelled',
      cancel_reason,
      cancelled_by: cancelledBy,
      cancelled_date: cancelledDate
    }, {
      where: { lead_id: leadId },
      transaction: t
    });

    // Revert original request status to 'Approved'
    await WasteCollectionRequest.update({ status: 'Approved' }, {
      where: { lead_id: leadId },
      transaction: t
    });

    await t.commit();

    return res.status(200).json({ message: "Order cancelled successfully." });
  } catch (err) {
    await t.rollback();
    console.error("cancelWasteOrder error:", err);
    return res.status(500).json({ message: "Failed to cancel waste order." });
  }
};

// GET /api/admin/waste-orders/:id/qr - Generate QR code for order
const getWasteOrderQR = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await WasteOrder.findByPk(id, {
      include: [
        { model: User, as: "customer", attributes: ["id", "name", "email", "phone"] },
        { model: Corporation, as: "corporation", attributes: ["id", "corporation_name"] },
        { model: Zone, as: "zone", attributes: ["id", "zone_name"] },
        { model: Ward, as: "ward", attributes: ["id", "ward_name"] },
        { model: User, as: "vendor", attributes: ["id", "name", "email"] },
        { 
          model: Employee, 
          as: "driverEmployee", 
          attributes: ["id", "name", "mobile_number"],
          include: [
            {
              model: Vehicle,
              as: "driverVehicles",
              attributes: ["id", "registration_number", "brand", "model"]
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: "Waste order not found." });
    }

    const qrData = {
      order_id: order.order_id,
      customer: order.customer_legal_name || order.contact_person,
      generator: order.waste_generator_name,
      address: order.complete_address,
      corp: order.corporation?.corporation_name,
      zone: order.zone?.zone_name,
      ward: order.ward?.ward_name,
      vendor: order.vendor?.name,
      driver: order.driverEmployee?.name
    };

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2
    });

    return res.status(200).json({ qr: qrCodeDataUrl });
  } catch (err) {
    console.error("getWasteOrderQR error:", err);
    return res.status(500).json({ message: "Failed to generate QR code." });
  }
};

// PATCH /api/admin/waste-orders/:id/reassign - Reassign vendor/driver for Trip Planner
const reassignWasteOrder = async (req, res) => {
  const { id } = req.params;
  const { vendor_id, driver_id } = req.body;

  if (!vendor_id && !driver_id) {
    return res.status(400).json({ message: "At least one of vendor_id or driver_id is required." });
  }

  try {
    const order = await WasteOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "Waste order not found." });
    }

    const updates = {};
    if (vendor_id) updates.vendor_id = vendor_id;
    if (driver_id) updates.driver_id = driver_id;

    await order.update(updates);

    return res.status(200).json({ message: "Assignment updated successfully.", order });
  } catch (err) {
    console.error("reassignWasteOrder error:", err);
    return res.status(500).json({ message: "Failed to update assignment.", error: err.message });
  }
};

module.exports = {
  getWasteOrders,
  getWasteOrderById,
  cancelWasteOrder,
  getWasteOrderQR,
  reassignWasteOrder
};
