const sequelize = require("../config/db");

async function run() {
  try {
    console.log("Starting user location to BWG mapping migration...");

    // Find and drop old foreign key constraints dynamically to prevent errors
    console.log("Checking for old foreign key constraints on users table...");
    const [constraints] = await sequelize.query(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME IN ('country_id', 'state_id', 'city_id')
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    for (const c of constraints) {
      console.log(`Dropping constraint: ${c.CONSTRAINT_NAME} associated with ${c.COLUMN_NAME}...`);
      await sequelize.query(`ALTER TABLE users DROP FOREIGN KEY ${c.CONSTRAINT_NAME}`);
    }

    // Alter table: Drop old columns and add new columns
    console.log("Altering columns in users table...");
    await sequelize.query(`
      ALTER TABLE users 
      DROP COLUMN IF EXISTS country_id,
      DROP COLUMN IF EXISTS state_id,
      DROP COLUMN IF EXISTS city_id,
      ADD COLUMN corporation_id INT NULL AFTER role_id,
      ADD COLUMN zone_id INT NULL AFTER corporation_id,
      ADD COLUMN ward_id INT NULL AFTER zone_id
    `);
    console.log("Columns altered successfully.");

    // Add new foreign key constraints
    console.log("Adding new foreign key constraints referencing corporations, zones, and wards...");
    await sequelize.query(`
      ALTER TABLE users
      ADD CONSTRAINT fk_users_corporation FOREIGN KEY (corporation_id) REFERENCES corporations (id) ON DELETE SET NULL ON UPDATE CASCADE,
      ADD CONSTRAINT fk_users_zone FOREIGN KEY (zone_id) REFERENCES zones (id) ON DELETE SET NULL ON UPDATE CASCADE,
      ADD CONSTRAINT fk_users_ward FOREIGN KEY (ward_id) REFERENCES wards (id) ON DELETE SET NULL ON UPDATE CASCADE
    `);
    console.log("Foreign keys configured successfully.");

    console.log("User migration completed successfully!");
  } catch (err) {
    console.error("Migration execution failed:", err);
  } finally {
    await sequelize.close();
  }
}

run();
