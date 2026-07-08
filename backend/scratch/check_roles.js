const sequelize = require("../config/db");

async function check() {
  try {
    const [roles] = await sequelize.query("SELECT * FROM roles;");
    const [permissions] = await sequelize.query("SELECT * FROM permissions LIMIT 10;");
    console.log("ROLES IN DB:", roles);
    console.log("PERMISSIONS IN DB (LIMIT 10):", permissions);
    process.exit(0);
  } catch (err) {
    console.error("Diagnostic failed:", err);
    process.exit(1);
  }
}

check();
