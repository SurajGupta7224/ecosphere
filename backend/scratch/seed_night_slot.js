const sequelize = require("../config/db");

async function run() {
  try {
    console.log("Seeding Night Collection time slot...");
    
    await sequelize.query(
      "INSERT INTO `time_slots` (`slot_name`, `start_time`, `end_time`, `status`, `description`, `created_at`, `updated_at`) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
      {
        replacements: ["Night Collection", "21:00:00", "23:59:00", "Active", "Late night waste collection slot."]
      }
    );

    console.log("Night Collection slot seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding Night Collection failed:", err);
    process.exit(1);
  }
}

run();
