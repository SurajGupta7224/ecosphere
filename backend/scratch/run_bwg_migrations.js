const fs = require('fs');
const path = require('path');
const sequelize = require("../config/db");

async function run() {
  const sqlFiles = [
    'create_corporations_table.sql',
    'create_zones_table.sql',
    'create_wards_table.sql',
    'seed_bwg_permissions.sql'
  ];

  try {
    for (const file of sqlFiles) {
      console.log(`Running migration: ${file}...`);
      const filePath = path.join(__dirname, '../migrations', file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Split statements by semicolon
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        await sequelize.query(statement);
      }
      console.log(`Successfully completed: ${file}`);
    }
    console.log("All migrations executed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration runner failed:", err);
    process.exit(1);
  }
}

run();
