const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  registerCustomer,
  loginCustomer,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp
} = require("../controllers/Client/authController");
const {
  getProfile,
  updateProfile,
  getCustomerPickups
} = require("../controllers/Client/customerController");

// Storefront / Client Customer Authentication & Profile Routes

// POST /api/customer/register (Email/Password registration)
router.post("/customer/register", registerCustomer);

// POST /api/customer/login (Email/Password login)
router.post("/customer/login", loginCustomer);

// POST /api/customer/forgot-password (Request reset OTP)
router.post("/customer/forgot-password", forgotPassword);

// POST /api/customer/reset-password (Reset password with OTP verification)
router.post("/customer/reset-password", resetPassword);

// POST /api/customer/send-otp (Signup / Login Trigger)
router.post("/customer/send-otp", sendOtp);

// POST /api/customer/verify-otp (Verify & Login)
router.post("/customer/verify-otp", verifyOtp);

// GET /api/customer/profile (Fetch authenticated customer details)
router.get("/customer/profile", verifyToken, getProfile);

// PUT /api/customer/profile (Update authenticated customer details)
router.put("/customer/profile", verifyToken, updateProfile);

// GET /api/customer/pickups (Fetch authenticated customer's pickups)
router.get("/customer/pickups", verifyToken, getCustomerPickups);

module.exports = router;
