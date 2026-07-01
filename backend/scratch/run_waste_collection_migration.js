const fs = require('fs');
const path = require('path');
const sequelize = require("../config/db");

async function run() {
  try {
    console.log("Running migration: create_waste_collection_requests_table.sql...");
    const filePath = path.join(__dirname, '../migrations/create_waste_collection_requests_table.sql');
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split statements by semicolon
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await sequelize.query(statement);
    }
    console.log("Table created successfully!");

    console.log("Seeding waste_collection_requests permission...");
    
    // Seed permission if not exists
    await sequelize.query(`
      INSERT INTO \`permissions\` (\`permission_name\`, \`created_at\`, \`updated_at\`)
      SELECT 'waste_collection_requests', NOW(), NOW()
      WHERE NOT EXISTS (
          SELECT 1 FROM \`permissions\` WHERE \`permission_name\` = 'waste_collection_requests'
      );
    `);

    // Fetch permission ID
    const [permissions] = await sequelize.query(`SELECT id FROM \`permissions\` WHERE \`permission_name\` = 'waste_collection_requests' LIMIT 1;`);
    const permId = permissions[0].id;

    // Seed RolePermission for Admin (role_id = 1)
    await sequelize.query(`
      INSERT INTO \`role_permissions\` (\`role_id\`, \`permission_id\`, \`created_at\`, \`updated_at\`)
      SELECT 1, ${permId}, NOW(), NOW()
      WHERE NOT EXISTS (
          SELECT 1 FROM \`role_permissions\` 
          WHERE \`role_id\` = 1 
          AND \`permission_id\` = ${permId}
      );
    `);

    // Seed RolePermission for Vendor/Customer (role_id = 3)
    await sequelize.query(`
      INSERT INTO \`role_permissions\` (\`role_id\`, \`permission_id\`, \`created_at\`, \`updated_at\`)
      SELECT 3, ${permId}, NOW(), NOW()
      WHERE NOT EXISTS (
          SELECT 1 FROM \`role_permissions\` 
          WHERE \`role_id\` = 3 
          AND \`permission_id\` = ${permId}
      );
    `);

    console.log("Permissions seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration runner failed:", err);
    process.exit(1);
  }
}

run();
