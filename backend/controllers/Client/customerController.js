const { Customer, AuditLog } = require("../../models/index");

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

module.exports = {
  getProfile,
  updateProfile,
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
