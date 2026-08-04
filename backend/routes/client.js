const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
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

const complaintUpload = upload.single("attachment");

const customerRegistrationController = require("../controllers/Client/customerRegistrationController");

const customerComplaintController = require("../controllers/Client/customerComplaintController");

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


// POST /api/customer-registration (Customer Registration Submission)
router.post("/customer-registration",customerRegistrationController.submitRegistration);


// POST /api/customer/complaints
router.post("/customer/complaints",verifyToken,complaintUpload,customerComplaintController.createComplaint);

// GET /api/customer/complaints
router.get(
  "/customer/complaints",
  verifyToken,
  customerComplaintController.getMyComplaints
);

// GET /api/customer/complaints/:id
router.get(
  "/customer/complaints/:id",
  verifyToken,
  customerComplaintController.getComplaintById
);

module.exports = router;
