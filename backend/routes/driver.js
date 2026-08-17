const express = require("express");
const router = express.Router();
const {
  loginDriver,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getDriverProfile
} = require("../controllers/Driver/driverAuthController");
const { verifyDriverToken } = require("../middleware/authMiddleware");

const {
  fetchOrderDetails,
  submitTripSummary,
  getVehicleTripSummaries,
  getVehicleWasteSummary,
} = require("../controllers/Driver/tripSummaryController");

// Driver Authentication Routes
// POST /api/v1/driver/login - Driver Login API
router.post("/login", loginDriver);

// POST /api/v1/driver/forgot-password - Request Forgot Password OTP
router.post("/forgot-password", forgotPassword);

// POST /api/v1/driver/verify-otp - Verify OTP
router.post("/verify-otp", verifyOtp);

// POST /api/v1/driver/reset-password - Reset Password
router.post("/reset-password", resetPassword);

// GET /api/v1/driver/me - Authenticated Driver Profile (Protected Route Test)
router.get("/me", verifyDriverToken, getDriverProfile);
router.get("/profile", verifyDriverToken, getDriverProfile);

const upload = require("../middleware/uploadMiddleware");

// POST /api/v1/driver/fetch-order-details - Fetch Order Subcategories for Driver
router.post(
  "/fetch-order-details",
  verifyDriverToken,
  fetchOrderDetails
);


// POST /api/v1/driver/vehicle-trip-summary
// Fetch Trip Summary records using vehicle number
router.post(
  "/vehicle-trip-summary",
  verifyDriverToken,
  getVehicleTripSummaries
);


// POST /api/v1/driver/create-trip-summary - Submit Waste Collection Trip Summary
router.post(
  "/create-trip-summary",
  verifyDriverToken,
  upload.any(),
  submitTripSummary
);



// POST /api/v1/driver/vehicle-waste-summary
router.post(
  "/vehicle-waste-summary",
  verifyDriverToken,
  getVehicleWasteSummary
);

module.exports = router;
