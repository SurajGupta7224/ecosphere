const { Permission, RolePermission } = require("../models/index");

async function seed() {
  try {
    const [perm] = await Permission.findOrCreate({
      where: { permission_name: "module_creation" }
    });
    console.log("Permission 'module_creation' found or created.");

    const [rolePerm] = await RolePermission.findOrCreate({
      where: { role_id: 1, permission_id: perm.id }
    });
    console.log("Permission linked to Super Admin (role_id = 1).");
    process.exit(0);
  } catch (err) {
    console.error("Seeder failed:", err);
    process.exit(1);
  }
}

seed();
