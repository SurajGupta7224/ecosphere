const sequelize = require("../config/db");
const { Permission, RolePermission } = require("../models/index");

async function cleanup() {
  try {
    // 1. Drop orphaned tables
    await sequelize.query("DROP TABLE IF EXISTS `login historyss` ;");
    await sequelize.query("DROP TABLE IF EXISTS `login_historys` ;");
    console.log("Dropped tables `login historyss` and `login_historys`.");

    // 2. Delete orphaned permissions
    const orphanedPerms = [
      "login historys_view",
      "login historys_add",
      "login historys_edit",
      "login historys_delete",
      "login historys_export",
      "login-history_view",
      "login-history_add",
      "login-history_edit",
      "login-history_delete",
      "login-history_export"
    ];

    for (const pName of orphanedPerms) {
      const perm = await Permission.findOne({ where: { permission_name: pName } });
      if (perm) {
        await RolePermission.destroy({ where: { permission_id: perm.id } });
        await perm.destroy();
        console.log(`Deleted permission: ${pName}`);
      }
    }

    console.log("Cleanup completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Cleanup failed:", err);
    process.exit(1);
  }
}

cleanup();
