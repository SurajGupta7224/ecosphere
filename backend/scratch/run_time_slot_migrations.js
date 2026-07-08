const fs = require('fs');
const path = require('path');
const sequelize = require("../config/db");

async function executeMigration(filename) {
  console.log(`Running migration: ${filename}...`);
  const filePath = path.join(__dirname, '../migrations', filename);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Split statements by semicolon
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    await sequelize.query(statement);
  }
}

async function run() {
  try {
    await executeMigration('create_time_slots_table.sql');
    await executeMigration('seed_time_slot_permission.sql');
    console.log("Time Slot migrations executed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Time Slot migrations runner failed:", err);
    process.exit(1);
  }
}

run();
