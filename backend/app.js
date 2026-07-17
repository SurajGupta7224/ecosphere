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
const clientRoutes = require("./routes/api");
app.use("/api", clientRoutes);

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

    // Seed aggregator_employee and aggregator_vehicle permission if not exists
    try {
      const { Permission, RolePermission, Role } = require("./models/index");
      
      // employee permission
      const [permEmp, createdEmp] = await Permission.findOrCreate({
        where: { permission_name: 'aggregator_employee' }
      });
      if (createdEmp) console.log("Seeded 'aggregator_employee' permission successfully.");

      // vehicle permission
      const [permVeh, createdVeh] = await Permission.findOrCreate({
        where: { permission_name: 'aggregator_vehicle' }
      });
      if (createdVeh) console.log("Seeded 'aggregator_vehicle' permission successfully.");

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