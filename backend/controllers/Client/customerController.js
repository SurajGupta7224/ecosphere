// const { Customer, AuditLog, WasteCollectionRequest, WasteOrder } = require("../../models/index");
// const { Op } = require("sequelize");

const {
  Customer,
  AuditLog,
  WasteCollectionRequest,
  WasteOrder,
  User,
  Corporation,
  Zone,
  Ward,
  Employee,
  Vehicle
} = require("../../models/index");

const { Op } = require("sequelize");
const QRCode = require("qrcode");

// Helper to write audit log
const writeAuditLog = async (req, action, module, oldValue, newValue) => {
  try {
    const userId = req.user ? req.user.id : null;
    const userName = req.user ? req.user.name : "System";
    const ipAddress = req.ip || req.connection.remoteAddress;

    await AuditLog.create({
      user_id: userId,
      user_name: userName,
      action,
      module,
      old_value: oldValue ? (typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue)) : null,
      new_value: newValue ? (typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue)) : null,
      ip_address: ipAddress
    });
  } catch (err) {
    console.error("Audit log writing failed:", err);
  }
};

// GET /api/customer/profile (Fetch authenticated customer details)
const getProfile = async (req, res) => {
  try {
    // req.user contains the verified customer object from authMiddleware
    return res.status(200).json({
      success: true,
      customer: req.user
    });
  } catch (err) {
    console.error("profile fetch error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};

// PUT /api/customer/profile (Update authenticated customer details)
const updateProfile = async (req, res) => {
  const { customer_name, profie_pic, notification_status } = req.body || {};

  try {
    const customer = await Customer.findByPk(req.user.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer profile not found" });
    }

    await customer.update({
      customer_name: customer_name !== undefined ? customer_name : customer.customer_name,
      profie_pic: profie_pic !== undefined ? profie_pic : customer.profie_pic,
      notification_status: notification_status !== undefined ? notification_status : customer.notification_status
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      customer
    });
  } catch (err) {
    console.error("profile update error:", err);
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

// GET /api/customers — list all customers
const getAllCustomers = async (req, res) => {
  try {
    const { status, customer_type, created_by } = req.query;
    const where = {};
    if (status) where.status = status;
    if (customer_type) where.customer_type = customer_type;
    if (created_by) where.created_by = created_by;

    const customers = await Customer.findAll({
      where,
      order: [["created_at", "DESC"]],
    });
    return res.status(200).json({ customers });
  } catch (err) {
    console.error("getAllCustomers error:", err);
    return res.status(500).json({ message: "Failed to fetch customers" });
  }
};

// GET /api/customers/:id — get customer details
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    return res.status(200).json({ customer });
  } catch (err) {
    console.error("getCustomerById error:", err);
    return res.status(500).json({ message: "Failed to fetch customer details" });
  }
};

// POST /api/customers — create customer
const createCustomer = async (req, res) => {
  const {
    customer_name, mobile, email, status,
    profie_pic, referral_code, referral_id,
    notification_status, login_type, customer_type, created_by
  } = req.body;

  if (!customer_name) {
    return res.status(400).json({ message: "Customer name is required" });
  }

  try {
    const existing = await Customer.findOne({
      where: {
        email: email || null,
        mobile: mobile || null
      }
    });
    if (existing && (email || mobile)) {
      return res.status(409).json({ message: "Customer with this email or mobile already exists" });
    }

    const validCustType = (customer_type && customer_type.toLowerCase() !== 'admin') ? customer_type : "B2B";

    const newCustomer = await Customer.create({
      customer_name,
      mobile: mobile || null,
      email: email || null,
      status: status || "active",
      profie_pic: profie_pic || null,
      referral_code: referral_code || null,
      referral_id: referral_id || null,
      notification_status: notification_status !== undefined ? notification_status : true,
      login_type: login_type || "email",
      customer_type: validCustType,
      created_by: created_by || (req.user ? req.user.name : "system")
    });

    // Write audit log
    await writeAuditLog(req, "CREATE", "Customer", null, newCustomer.toJSON());

    return res.status(201).json({
      message: "Customer created successfully",
      customer: newCustomer
    });
  } catch (err) {
    console.error("createCustomer error:", err);
    return res.status(500).json({ message: "Failed to create customer", error: err.message });
  }
};

// PUT /api/customers/:id — update customer details
const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const {
    customer_name, mobile, email, status,
    profie_pic, referral_code, referral_id,
    notification_status, login_type, customer_type, created_by
  } = req.body;

  try {
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const oldValues = customer.toJSON();

    await customer.update({
      customer_name: customer_name !== undefined ? customer_name : customer.customer_name,
      mobile: mobile !== undefined ? mobile : customer.mobile,
      email: email !== undefined ? email : customer.email,
      status: status !== undefined ? status : customer.status,
      profie_pic: profie_pic !== undefined ? profie_pic : customer.profie_pic,
      referral_code: referral_code !== undefined ? referral_code : customer.referral_code,
      referral_id: referral_id !== undefined ? referral_id : customer.referral_id,
      notification_status: notification_status !== undefined ? notification_status : customer.notification_status,
      login_type: login_type !== undefined ? login_type : customer.login_type,
      customer_type: customer_type !== undefined ? customer_type : customer.customer_type,
      created_by: created_by !== undefined ? created_by : customer.created_by
    });

    // Write audit log
    await writeAuditLog(req, "UPDATE", "Customer", oldValues, customer.toJSON());

    return res.status(200).json({
      message: "Customer updated successfully",
      customer
    });
  } catch (err) {
    console.error("updateCustomer error:", err);
    return res.status(500).json({ message: "Failed to update customer", error: err.message });
  }
};

// DELETE /api/customers/:id — delete customer
const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const oldValues = customer.toJSON();
    await customer.destroy();

    // Write audit log
    await writeAuditLog(req, "DELETE", "Customer", oldValues, null);

    return res.status(200).json({ message: "Customer deleted successfully" });
  } catch (err) {
    console.error("deleteCustomer error:", err);
    return res.status(500).json({ message: "Failed to delete customer" });
  }
};

// GET /api/customer/pickups (Fetch authenticated customer's pickups - both requests & orders)
const getCustomerPickups = async (req, res) => {
  try {
    const customerId = req.user.id;
    const email = req.user.email;
    const mobile = req.user.mobile;

    
    // Fetch un-booked/non-booked waste collection requests for this customer
    const requests = await WasteCollectionRequest.findAll({
      where: {
        status: {
          [Op.ne]: 'Booked'
        },
        [Op.or]: [
          { customer_id: customerId },
          email ? { email: email } : null,
          mobile ? { mobile_number: mobile } : null
        ].filter(Boolean)
      },
      order: [["created_at", "DESC"]]
    });

    // Fetch waste orders for this customer (Booked, Completed, Cancelled)
    const orders = await WasteOrder.findAll({
      where: {
        [Op.or]: [
          { customer_id: customerId },
          email ? { email: email } : null,
          mobile ? { mobile_number: mobile } : null
        ].filter(Boolean)
      },
      order: [["created_at", "DESC"]]
    });

    // Deduplicate requests by lead_id — keep only the first (most recent) per lead
    const seenRequestLeads = new Set();
    const uniqueRequests = requests.filter(reqItem => {
      if (seenRequestLeads.has(reqItem.lead_id)) return false;
      seenRequestLeads.add(reqItem.lead_id);
      return true;
    });

    // Format unique requests
    const formattedRequests = uniqueRequests.map(reqItem => ({
      id: `req-${reqItem.id}`,
      lead_id: reqItem.lead_id,
      waste_generator_name: reqItem.waste_generator_name || 'Waste Collection Request',
      pickup_date: reqItem.pickup_date,
      pickup_time: reqItem.pickup_time,
      status: reqItem.status,
      created_at: reqItem.created_at
    }));

    // Deduplicate orders by order_id — keep only the first (most recent) per order
    const seenOrderIds = new Set();
    const uniqueOrders = orders.filter(ordItem => {
      if (seenOrderIds.has(ordItem.order_id)) return false;
      seenOrderIds.add(ordItem.order_id);
      return true;
    });

    // Format unique orders
    const formattedOrders = uniqueOrders.map(ordItem => ({
      id: `ord-${ordItem.order_id}`,
      lead_id: ordItem.lead_id,
      waste_generator_name: ordItem.waste_generator_name || 'Waste Order',
      pickup_date: ordItem.pickup_date,
      pickup_time: ordItem.pickup_time,
      status: ordItem.status,
      created_at: ordItem.created_at
    }));

    // Combine and sort by created_at descending
    const combinedPickups = [...formattedRequests, ...formattedOrders].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    return res.status(200).json({
      success: true,
      orders: combinedPickups
    });
  } catch (err) {
    console.error("getCustomerPickups error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch customer pickups" });
  }
};

// GET /api/customer/pickups/:id/qr (Fetch QR code for a specific pickup)

    // Fetch waste orders for this customer (Booked, Completed, Cancelled)
const getCustomerOrderQR = async (req, res) => {
  const { id } = req.params;

  try {
    // Client sends: ord-ORD-57934800445
    // Convert it back to the actual order_id
    const orderId = id.startsWith("ord-")
      ? id.substring(4)
      : id;

    const order = await WasteOrder.findOne({
      where: {
        order_id: orderId
      },
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email", "phone"]
        },
        {
          model: Corporation,
          as: "corporation",
          attributes: ["id", "corporation_name"]
        },
        {
          model: Zone,
          as: "zone",
          attributes: ["id", "zone_name"]
        },
        {
          model: Ward,
          as: "ward",
          attributes: ["id", "ward_name"]
        },
        {
          model: User,
          as: "vendor",
          attributes: ["id", "name", "email"]
        },
        {
          model: Employee,
          as: "driverEmployee",
          attributes: ["id", "name", "mobile_number"],
          include: [
            {
              model: Vehicle,
              as: "driverVehicles",
              attributes: [
                "id",
                "registration_number",
                "brand",
                "model"
              ]
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        message: "Waste order not found."
      });
    }

    // SAME QR DATA AS ADMIN
    const qrData = {
      order_id: order.order_id,
      customer:
        order.customer_legal_name ||
        order.contact_person,
      generator: order.waste_generator_name,
      address: order.complete_address,
      corp: order.corporation?.corporation_name,
      zone: order.zone?.zone_name,
      ward: order.ward?.ward_name,
      vendor: order.vendor?.name,
      driver: order.driverEmployee?.name
    };

    const qrCodeDataUrl = await QRCode.toDataURL(
      JSON.stringify(qrData),
      {
        errorCorrectionLevel: "H",
        width: 300,
        margin: 2
      }
    );

    return res.status(200).json({
      qr: qrCodeDataUrl
    });

  } catch (err) {
    console.error("getCustomerOrderQR error:", err);

    return res.status(500).json({
      message: "Failed to generate customer QR code."
    });
  }
};
module.exports = {
  getProfile,
  updateProfile,
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerPickups,
  getCustomerOrderQR
};
