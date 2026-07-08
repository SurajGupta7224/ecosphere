const sequelize = require("../config/db");

async function run() {
  try {
    console.log("Running migration: adding 'per_kg_price' column to subcategory_variations...");
    await sequelize.query("ALTER TABLE `subcategory_variations` ADD COLUMN `per_kg_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER `schedule_after_days`;");
    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (err) {
    if (err.message.includes("Duplicate column name")) {
      console.log("Column 'per_kg_price' already exists. Nothing to do.");
      process.exit(0);
    }
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

run();
