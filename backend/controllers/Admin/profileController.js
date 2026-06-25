const bcrypt = require("bcrypt");
const { User, Role, Country, State, City, SecuritySettings } = require("../../models/index");

// GET /api/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
      include: [
        { model: Role, as: "role", attributes: ["id", "role_name"] },
        { model: Country, as: "country", attributes: ["id", "country_name"] },
        { model: State, as: "state", attributes: ["id", "state_name"] },
        { model: City, as: "city", attributes: ["id", "city_name"] }
      ]
    });
    return res.status(200).json({ user });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// PUT /api/profile
const updateProfile = async (req, res) => {
  const { 
    name, email, phone, password, 
    country_id, state_id, city_id,
    company_type, pan_number, aadhaar_number
  } = req.body;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check email uniqueness if changed
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: "Email already registered to another user" });
      }
    }

    const updateData = {
      name: name || user.name,
      email: email || user.email,
      phone: phone || user.phone,
      country_id: country_id || user.country_id,
      state_id: state_id || user.state_id,
      city_id: city_id || user.city_id,
      company_type: company_type || user.company_type,
      pan_number: pan_number || user.pan_number,
      aadhaar_number: aadhaar_number || user.aadhaar_number
    };

    if (password && password.trim() !== "") {
      const security = await SecuritySettings.findByPk(1);
      const minLength = security?.password_min_length || 8;
      if (password.length < minLength) {
        return res.status(400).json({ message: `Password must be at least ${minLength} characters long.` });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Process file uploads
    if (req.files) {
      if (req.files.profile_photo) updateData.profile_photo = req.files.profile_photo[0].filename;
      if (req.files.pan_card_file) updateData.pan_card_file = req.files.pan_card_file[0].filename;
      if (req.files.aadhaar_card_file) updateData.aadhaar_card_file = req.files.aadhaar_card_file[0].filename;
    }

    // If user is a vendor, reset profile_status to pending on update
    const isVendor = user.role?.role_name?.toLowerCase().includes('vendor') || user.role?.role_name?.toLowerCase().includes('seller');
    if (isVendor) {
      updateData.profile_status = 'pending';
    }

    await user.update(updateData);

    return res.status(200).json({ 
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_photo: user.profile_photo,
        profile_status: user.profile_status
      }
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
};

module.exports = { getProfile, updateProfile };
