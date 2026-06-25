const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
require("dotenv").config();

// DB import
require("./config/db");
// Load model associations
const sequelize = require("./config/db");
require("./models/index");

const app = express();
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

// Root route
app.get("/", (req, res) => {
  res.send("Ecosphere API Server is running");
});

const PORT = process.env.PORT || 5000;

// Sync Database and then Start Server
console.log("Starting database synchronization...");
sequelize.sync()
  .then(() => {
    console.log(" Database synced successfully");

    server.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" Database sync failed. Server not started.");
    console.error(err);
    process.exit(1);
  });