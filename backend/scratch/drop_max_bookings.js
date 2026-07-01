const sequelize = require("../config/db");

async function run() {
  try {
    console.log("Dropping max_bookings column from time_slots...");
    await sequelize.query("ALTER TABLE `time_slots` DROP COLUMN `max_bookings` ");
    console.log("Column max_bookings dropped successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Failed to drop max_bookings column:", err);
    process.exit(1);
  }
}

run();
