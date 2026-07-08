const { Permission } = require("../../models/index");

// GET /api/permissions
const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({ order: [["created_at", "DESC"]] });
    return res.status(200).json({ permissions });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch permissions", error: err.message });
  }
};

// POST /api/permissions
const createPermission = async (req, res) => {
  const { permission_name } = req.body;
  if (!permission_name) return res.status(400).json({ message: "Permission name is required" });

  try {
    const perm = await Permission.create({ permission_name });
    return res.status(201).json({ message: "Permission created", perm });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create permission", error: err.message });
  }
};

// PUT /api/permissions/:id
const updatePermission = async (req, res) => {
  const { id } = req.params;
  const { permission_name } = req.body;
  try {
    const perm = await Permission.findByPk(id);
    if (!perm) return res.status(404).json({ message: "Permission not found" });

    await perm.update({ permission_name });
    return res.status(200).json({ message: "Permission updated" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update permission", error: err.message });
  }
};

// DELETE /api/permissions/:id
const deletePermission = async (req, res) => {
  const { id } = req.params;
  try {
    const perm = await Permission.findByPk(id);
    if (!perm) return res.status(404).json({ message: "Permission not found" });

    await perm.destroy();
    return res.status(200).json({ message: "Permission deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete permission", error: err.message });
  }
};

module.exports = { getAllPermissions, createPermission, updatePermission, deletePermission };
