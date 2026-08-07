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

// Trip Summary Routes
router.post(
  "/fetch-order-details",
  verifyDriverToken,
  fetchOrderDetails
);

// Driver Trip Summary Route
router.post(
  "/trip-summary",
  verifyDriverToken,
  submitTripSummary
);

module.exports = router;
