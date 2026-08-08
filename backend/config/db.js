const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || null,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 3,        // Keep max connections under free hosting limit (5)
      min: 0,
      acquire: 30000,
      idle: 10000,
      evict: 15000,  // Evict idle connections after 15s to free up pool
    },
  }
);

sequelize
  .authenticate()
  .then(() => console.log(" MySQL Connected via Sequelize"))
  .catch((err) => console.error(" DB Connection Failed:", err));

module.exports = sequelize;