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
  getCustomerPickups,
  getCustomerPickupHistory,
  getCustomerOrderQR
} = require("../controllers/Client/customerController");

const complaintUpload = upload.single("attachment");

// Multer middleware for customer registration (handles optional file uploads)
const registrationUpload = upload.fields([
  { name: "rwa_file", maxCount: 1 },
  { name: "gst_file", maxCount: 1 },
  { name: "pan_file", maxCount: 1 },
  { name: "trade_license_file", maxCount: 1 },
]);

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

// GET /api/customer/pickup-history
// Fetch authenticated customer's Trip Summary history
router.get(
  "/customer/pickup-history",
  verifyToken,
  getCustomerPickupHistory
);

// HEAD
// GET /api/customer/pickups/:id/qr (Fetch QR code for a specific pickup)
router.get(
  "/customer/pickups/:id/qr",
  verifyToken,
  getCustomerOrderQR
);


const subCategoryController = require("../controllers/Admin/subCategoryController");
const categoryController = require("../controllers/Admin/categoryController");
const businessRegionController = require("../controllers/Admin/businessRegionController");
const businessSubRegionController = require("../controllers/Admin/businessSubRegionController");
const timeSlotController = require("../controllers/Admin/timeSlotController");
const wasteCollectionRequestController = require("../controllers/Admin/wasteCollectionRequestController");

// Public routes for Customer Forms
router.get("/public/sub-categories", subCategoryController.getAllSubCategories);
router.get("/public/categories", categoryController.getAllCategories);
router.get("/public/business-regions", businessRegionController.getAllBusinessRegions);
router.get("/public/business-regions/:id/sub-regions", businessSubRegionController.getSubRegionsByRegion);
router.get("/public/time-slots/active", timeSlotController.getActiveTimeSlots);
router.get("/public/waste-collection-requests/resolve-map-link", wasteCollectionRequestController.resolveMapLink);

// POST /api/customer-registration (Customer Registration Submission)
router.post("/customer-registration", registrationUpload, customerRegistrationController.submitRegistration);


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
