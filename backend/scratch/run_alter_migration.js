const fs = require('fs');
const path = require('path');
const sequelize = require("../config/db");

async function run() {
  try {
    console.log("Running migration: alter_waste_collection_requests_table.sql...");
    const filePath = path.join(__dirname, '../migrations/alter_waste_collection_requests_table.sql');
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split statements by semicolon
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await sequelize.query(statement);
    }
    console.log("Alter migration executed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Alter migration runner failed:", err);
    process.exit(1);
  }
}

run();
