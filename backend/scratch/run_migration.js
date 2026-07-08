const sequelize = require("../config/db");

async function run() {
  try {
    console.log("Running migration: adding 'color' column to sub_categories...");
    await sequelize.query("ALTER TABLE `sub_categories` ADD COLUMN `color` VARCHAR(20) DEFAULT NULL AFTER `name`;");
    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (err) {
    if (err.message.includes("Duplicate column name")) {
      console.log("Column 'color' already exists. Nothing to do.");
      process.exit(0);
    }
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

run();
