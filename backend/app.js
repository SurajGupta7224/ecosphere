const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
require("dotenv").config();

// DB import
require("./config/db");
// Load model associations
const sequelize = require("./config/db");
const { SecuritySettings } = require("./models/index");

const app = express();

// Force HTTPS / SSL Redirect Middleware
app.use(async (req, res, next) => {
  try {
    const isLocalhost = req.hostname === "localhost" || req.hostname === "127.0.0.1";
    if (!isLocalhost) {
      const security = await SecuritySettings.findByPk(1);
      if (security && security.force_https) {
        const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https" || req.protocol === "https";
        if (!isHttps) {
          return res.redirect(301, `https://${req.headers.host}${req.url}`);
        }
      }
    }
  } catch (err) {
    console.error("Force HTTPS check error:", err);
  }
  next();
});
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// API Routes
console.log("TRACE: Requiring admin routes...");
const adminRoutes = require("./routes/index");
console.log("TRACE: Routes required successfully.");

// Admin routes (Protected) - Mounted on /api/admin to avoid conflicts
app.use("/api/admin", adminRoutes); 

// Client-side storefront routes
const clientRoutes = require("./routes/client");
app.use("/api", clientRoutes);

// Driver Authentication Routes
const driverRoutes = require("./routes/driver");
app.use("/api/v1/driver", driverRoutes);
app.use("/api/driver", driverRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Ecosphere API Server is running");
});

const PORT = process.env.PORT || 5000;

// Sync Database and then Start Server
console.log("Starting database synchronization...");
sequelize.sync()
  .then(async () => {
    console.log(" Database synced successfully");

    // Ensure contract dates exist in waste_orders table
    try {
      await sequelize.query("ALTER TABLE waste_orders ADD COLUMN contract_start_date DATE NULL;");
      console.log("Added contract_start_date column to waste_orders table");
    } catch (err) {
      // Column might already exist, ignore
    }
    try {
      await sequelize.query("ALTER TABLE waste_orders ADD COLUMN contract_end_date DATE NULL;");
      console.log("Added contract_end_date column to waste_orders table");
    } catch (err) {
      // Column might already exist, ignore
    }

    try {
      await sequelize.query("ALTER TABLE customers ADD COLUMN password VARCHAR(255) NULL;");
      console.log("Added password column to customers table");
    } catch (err) {
      // Column might already exist, ignore
    }

    try {
      await sequelize.query("ALTER TABLE aggregator_vehicles ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending';");
      console.log("Added approval_status column to aggregator_vehicles table");
    } catch (err) {}

    try {
      await sequelize.query("ALTER TABLE aggregator_vehicles ADD COLUMN approved_by INT NULL;");
      console.log("Added approved_by column to aggregator_vehicles table");
    } catch (err) {}

    try {
      await sequelize.query("ALTER TABLE aggregator_vehicles ADD COLUMN approved_date DATETIME NULL;");
      console.log("Added approved_date column to aggregator_vehicles table");
    } catch (err) {}

    try {
      await sequelize.query("ALTER TABLE waste_collection_requests ADD COLUMN occupied_flats INT NULL;");
      console.log("Added occupied_flats column to waste_collection_requests table");
    } catch (err) {}

    try {
      await sequelize.query("ALTER TABLE waste_orders ADD COLUMN occupied_flats INT NULL;");
      console.log("Added occupied_flats column to waste_orders table");
    } catch (err) {}

    // Seed aggregator_employee, aggregator_vehicle, and order_management permissions if not exist
    try {
      const { Permission, RolePermission, Role } = require("./models/index");
      
      const [permEmp, createdEmp] = await Permission.findOrCreate({
        where: { permission_name: 'aggregator_employee' }
      });
      if (createdEmp) console.log("Seeded 'aggregator_employee' permission successfully.");

      // vehicle permission
      const [permVeh, createdVeh] = await Permission.findOrCreate({
        where: { permission_name: 'aggregator_vehicle' }
      });
      if (createdVeh) console.log("Seeded 'aggregator_vehicle' permission successfully.");

      // order_management permission
      const [permOrd, createdOrd] = await Permission.findOrCreate({
        where: { permission_name: 'order_management' }
      });
      if (createdOrd) console.log("Seeded 'order_management' permission successfully.");

      // Fetch all roles from database dynamically
      const roles = await Role.findAll();

      for (const role of roles) {
        // Associate employee permission
        const associationEmp = await RolePermission.findOne({
          where: { role_id: role.id, permission_id: permEmp.id }
        });
        if (!associationEmp) {
          await RolePermission.create({ role_id: role.id, permission_id: permEmp.id });
          console.log(`Associated 'aggregator_employee' permission with role ${role.role_name}.`);
        }

        // Associate vehicle permission
        const associationVeh = await RolePermission.findOne({
          where: { role_id: role.id, permission_id: permVeh.id }
        });
        if (!associationVeh) {
          await RolePermission.create({ role_id: role.id, permission_id: permVeh.id });
          console.log(`Associated 'aggregator_vehicle' permission with role ${role.role_name}.`);
        }

        // Associate order_management permission
        const associationOrd = await RolePermission.findOne({
          where: { role_id: role.id, permission_id: permOrd.id }
        });
        if (!associationOrd) {
          await RolePermission.create({ role_id: role.id, permission_id: permOrd.id });
          console.log(`Associated 'order_management' permission with role ${role.role_name}.`);
        }
      }

    } catch (err) {
      console.error("Error seeding permissions:", err);
    }

    server.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  })

  .catch((err) => {
    console.error(" Database sync failed. Server not started.");
    console.error(err);
    process.exit(1);
  });