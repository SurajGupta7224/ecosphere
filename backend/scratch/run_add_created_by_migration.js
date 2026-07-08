const fs = require('fs');
const path = require('path');
const sequelize = require("../config/db");

async function run() {
  try {
    console.log("Running migration: add_created_by_to_waste_collection_requests.sql...");
    const filePath = path.join(__dirname, '../migrations/add_created_by_to_waste_collection_requests.sql');
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split statements by semicolon
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await sequelize.query(statement);
    }
    console.log("Migration executed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration runner failed:", err);
    process.exit(1);
  }
}

run();
