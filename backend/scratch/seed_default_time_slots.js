const sequelize = require("../config/db");

async function run() {
  try {
    console.log("Seeding default time slots...");
    
    // Check if slots already exist
    const [existing] = await sequelize.query("SELECT COUNT(*) as count FROM `time_slots`");
    if (existing[0].count > 0) {
      console.log("Time slots already exist. Skipping seed.");
      process.exit(0);
    }

    const slots = [
      { slot_name: "Morning Collection", start_time: "09:00:00", end_time: "12:00:00", status: "Active", description: "Early morning waste collection slot." },
      { slot_name: "Afternoon Collection", start_time: "13:00:00", end_time: "16:00:00", status: "Active", description: "Mid-day waste collection slot." },
      { slot_name: "Evening Collection", start_time: "17:00:00", end_time: "20:00:00", status: "Active", description: "Late afternoon / evening collection slot." }
    ];

    for (const slot of slots) {
      await sequelize.query(
        "INSERT INTO `time_slots` (`slot_name`, `start_time`, `end_time`, `status`, `description`, `created_at`, `updated_at`) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
        {
          replacements: [slot.slot_name, slot.start_time, slot.end_time, slot.status, slot.description]
        }
      );
    }

    console.log("Default time slots seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

run();
