const bcrypt = require("bcrypt");
const { User, Role, Corporation, Zone, Ward, SecuritySettings } = require("../../models/index");

// GET /api/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
      include: [
        { model: Role, as: "role", attributes: ["id", "role_name"] },
        { model: Corporation, as: "corporation", attributes: ["id", "corporation_name"] },
        { model: Zone, as: "zone", attributes: ["id", "zone_name"] },
        { model: Ward, as: "ward", attributes: ["id", "ward_name"] }
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
    corporation_id, zone_id, ward_id,
    company_type, pan_number, aadhaar_number
  } = req.body;

  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Role, as: 'role' }]
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {
      name: name || user.name,
      phone: phone || user.phone,
      corporation_id: corporation_id !== undefined ? (corporation_id || null) : user.corporation_id,
      zone_id: zone_id !== undefined ? (zone_id || null) : user.zone_id,
      ward_id: ward_id !== undefined ? (ward_id || null) : user.ward_id,
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
