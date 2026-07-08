const sequelize = require("../config/db");

async function run() {
  try {
    console.log("Recreating 24-hour consecutive time slots...");
    
    // Clear existing time slots first to prevent duplicate/overlap errors
    await sequelize.query("DELETE FROM `time_slots` ");
    console.log("Existing time slots cleared.");

    const slots = [
      { slot_name: "Night Collection", start_time: "00:00:00", end_time: "06:00:00", status: "Active", description: "Late night collection (12:00 AM - 06:00 AM)." },
      { slot_name: "Morning Collection", start_time: "06:00:00", end_time: "12:00:00", status: "Active", description: "Morning collection (06:00 AM - 12:00 PM)." },
      { slot_name: "Afternoon Collection", start_time: "12:00:00", end_time: "18:00:00", status: "Active", description: "Afternoon collection (12:00 PM - 06:00 PM)." },
      { slot_name: "Evening Collection", start_time: "18:00:00", end_time: "23:59:00", status: "Active", description: "Evening collection (06:00 PM - 11:59 PM)." }
    ];

    for (const slot of slots) {
      await sequelize.query(
        "INSERT INTO `time_slots` (`slot_name`, `start_time`, `end_time`, `status`, `description`, `created_at`, `updated_at`) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
        {
          replacements: [slot.slot_name, slot.start_time, slot.end_time, slot.status, slot.description]
        }
      );
    }

    console.log("24-hour consecutive slots created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Recreation failed:", err);
    process.exit(1);
  }
}

run();
