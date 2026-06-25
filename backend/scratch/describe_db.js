const sequelize = require("../config/db");
const { SecuritySettings, User } = require("../models/index");

async function run() {
  try {
    const [securityColumns] = await sequelize.query("DESCRIBE security_settings");
    console.log("COLUMNS IN security_settings:");
    console.log(JSON.stringify(securityColumns, null, 2));

    const [userColumns] = await sequelize.query("DESCRIBE users");
    console.log("\nCOLUMNS IN users:");
    console.log(JSON.stringify(userColumns, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

run();
