const sequelize = require("../config/db");

async function fixCartTable() {
  try {
    console.log("Altering cart table to allow NULL for user_id...");
    await sequelize.query("ALTER TABLE cart MODIFY user_id INT NULL;");
    console.log("Successfully altered cart table.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to alter cart table:", error);
    process.exit(1);
  }
}

fixCartTable();
