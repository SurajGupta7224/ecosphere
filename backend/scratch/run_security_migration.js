const fs = require("fs");
const path = require("path");
const sequelize = require("../config/db");

async function run() {
  try {
    console.log("Loading migration SQL file...");
    const sqlFilePath = path.join(__dirname, "../migrations/add_security_features_columns.sql");
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

    // Split queries by semicolon (ensuring we ignore empty statements)
    const queries = sqlContent
      .split(";")
      .map(q => q.trim())
      .filter(q => q.length > 0);

    console.log(`Executing ${queries.length} queries...`);

    for (let i = 0; i < queries.length; i++) {
      console.log(`Executing query #${i + 1}:`);
      console.log(queries[i]);
      await sequelize.query(queries[i]);
      console.log("Query executed successfully.\n");
    }

    console.log("Migration executed successfully!");
  } catch (err) {
    console.error("Migration execution failed:", err);
  } finally {
    await sequelize.close();
  }
}

run();
