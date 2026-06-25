const bcrypt = require("bcrypt");
const { User, Role, Country, State, City, SecuritySettings } = require("../../models/index");

// GET /api/users — list all users with their roles
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      include: [
        { model: Role, as: "role", attributes: ["id", "role_name"] },
        { model: Country, as: "country", attributes: ["id", "country_name"] },
        { model: State, as: "state", attributes: ["id", "state_name"] },
        { model: City, as: "city", attributes: ["id", "city_name"] }
      ],
      order: [["created_at", "DESC"]],
    });
    return res.status(200).json({ users });
  } catch (err) {
    console.error("getAllUsers error:", err);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

// POST /api/users — create a new user
const createUser = async (req, res) => {
  const {
    name, email, phone, password, role_id,
    country_id, state_id, city_id,
    company_type, pan_number, aadhaar_number,
    status, profile_status
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  try {
    const security = await SecuritySettings.findByPk(1);
    const minLength = security?.password_min_length || 8;
    if (password.length < minLength) {
      return res.status(400).json({ message: `Password must be at least ${minLength} characters long.` });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Extract file paths if uploaded
    let profile_photo = null, pan_card_file = null, aadhaar_card_file = null;
    if (req.files) {
      if (req.files.profile_photo) profile_photo = req.files.profile_photo[0].filename;
      if (req.files.pan_card_file) pan_card_file = req.files.pan_card_file[0].filename;
      if (req.files.aadhaar_card_file) aadhaar_card_file = req.files.aadhaar_card_file[0].filename;
    }

    const newUser = await User.create({
      name, email, phone: phone || null,
      password: hashedPassword,
      role_id: role_id || 1,
      country_id: country_id || null,
      state_id: state_id || null,
      city_id: city_id || null,
      company_type: company_type || null,
      pan_number: pan_number || null,
      aadhaar_number: aadhaar_number || null,
      profile_photo, pan_card_file, aadhaar_card_file,
      status: status || "active",
      profile_status: profile_status || "pending",
    });

    return res.status(201).json({
      message: "User created successfully",
      userId: newUser.id,
    });
  } catch (err) {
    console.error("createUser error:", err);
    return res.status(500).json({ message: "Failed to create user", error: err.message });
  }
};

// PUT /api/users/:id — update user details
const updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    name, email, phone, password, role_id,
    country_id, state_id, city_id,
    company_type, pan_number, aadhaar_number,
    status, profile_status
  } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: "Email already registered to another user" });
      }
    }

    // Prepare update data
    const updateData = {
      name, email, phone: phone || null, role_id, status, profile_status,
      country_id: country_id || null,
      state_id: state_id || null,
      city_id: city_id || null,
      company_type: company_type || null,
      pan_number: pan_number || null,
      aadhaar_number: aadhaar_number || null
    };

    if (password && password.trim() !== '') {
      const security = await SecuritySettings.findByPk(1);
      const minLength = security?.password_min_length || 8;
      if (password.length < minLength) {
        return res.status(400).json({ message: `Password must be at least ${minLength} characters long.` });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Process new file uploads (overwrite old paths if new files are provided)
    if (req.files) {
      if (req.files.profile_photo) updateData.profile_photo = req.files.profile_photo[0].filename;
      if (req.files.pan_card_file) updateData.pan_card_file = req.files.pan_card_file[0].filename;
      if (req.files.aadhaar_card_file) updateData.aadhaar_card_file = req.files.aadhaar_card_file[0].filename;
    }

    await user.update(updateData);

    return res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error("updateUser error:", err);
    return res.status(500).json({ message: "Failed to update user", error: err.message });
  }
};

// PATCH /api/users/:id/status — update user status string
const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({ status });
    return res.status(200).json({ message: "Status updated successfully" });
  } catch (err) {
    console.error("updateStatus error:", err);
    return res.status(500).json({ message: "Failed to update status", error: err.message });
  }
};

// DELETE /api/users/:id — delete a user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.destroy();
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ message: "Failed to delete user" });
  }
};

// GET /api/users/roles — get all roles for dropdown
const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({ attributes: ["id", "role_name"] });
    return res.status(200).json({ roles });
  } catch (err) {
    console.error("getRoles error:", err);
    return res.status(500).json({ message: "Failed to fetch roles" });
  }
};

// GET /api/users/:id — get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
      include: [
        { model: Role, as: "role", attributes: ["id", "role_name"] },
        { model: Country, as: "country", attributes: ["id", "country_name"] },
        { model: State, as: "state", attributes: ["id", "state_name"] },
        { model: City, as: "city", attributes: ["id", "city_name"] }
      ]
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (err) {
    console.error("getUserById error:", err);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};

// GET /api/users/pending/count
const getPendingUserCount = async (req, res) => {
  try {
    const count = await User.count({
      where: { profile_status: 'pending' },
      include: [
        { 
          model: Role, 
          as: 'role', 
          where: { 
            role_name: { 
              [require('sequelize').Op.or]: ['Vendor', 'Seller'] 
            } 
          } 
        }
      ]
    });
    return res.status(200).json({ count });
  } catch (err) {
    console.error("getPendingUserCount error:", err);
    return res.status(500).json({ message: "Failed to fetch pending count" });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, updateUserStatus, deleteUser, getRoles, getPendingUserCount };
