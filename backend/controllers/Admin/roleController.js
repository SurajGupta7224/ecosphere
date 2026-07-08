const { Role, Permission } = require("../../models/index");

// GET /api/roles — get all roles with their permissions
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [{ model: Permission, as: "permissions", attributes: ["id", "permission_name"], through: { attributes: [] } }],
      order: [["created_at", "DESC"]]
    });
    return res.status(200).json({ roles });
  } catch (err) {
    console.error("getAllRoles err", err);
    return res.status(500).json({ message: "Failed to fetch roles", error: err.message });
  }
};

// POST /api/roles — create role
const createRole = async (req, res) => {
  const { role_name, permission_ids } = req.body;
  
  if (!role_name) {
    return res.status(400).json({ message: "Role name is required" });
  }

  try {
    const role = await Role.create({ role_name });
    
    // Assign permissions if provided
    if (permission_ids && permission_ids.length > 0) {
      await role.setPermissions(permission_ids); // sequelize m2m magic helper
    }

    return res.status(201).json({ message: "Role created", role });
  } catch (err) {
    console.error("createRole err", err);
    return res.status(500).json({ message: "Failed to create role", error: err.message });
  }
};

// PUT /api/roles/:id
const updateRole = async (req, res) => {
  const { id } = req.params;
  const { role_name, permission_ids } = req.body;

  try {
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    await role.update({ role_name });
    
    // Update permissions
    if (Array.isArray(permission_ids)) {
      await role.setPermissions(permission_ids);
    }
    
    return res.status(200).json({ message: "Role updated" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update role", error: err.message });
  }
};

// DELETE /api/roles/:id
const deleteRole = async (req, res) => {
  const { id } = req.params;
  try {
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    await role.destroy();
    return res.status(200).json({ message: "Role deleted successfully" });
  } catch(err) {
    return res.status(500).json({ message: "Failed to delete role", error: err.message });
  }
};

module.exports = { getAllRoles, createRole, updateRole, deleteRole };
