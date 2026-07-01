const express = require("express");
const router = express.Router();
console.log("DEBUG: Loading API routes from routes/index.js");

const { login, generateCaptcha, verify2FA } = require("../controllers/Admin/authController");
const settingsController = require("../controllers/Admin/settingsController");
const { getAllUsers, createUser, updateUser, updateUserStatus, deleteUser, getRoles } = require("../controllers/Admin/userController");
const roleController = require("../controllers/Admin/roleController");
const permissionController = require("../controllers/Admin/permissionController");
const locationController = require("../controllers/Admin/locationController");
const profileController = require("../controllers/Admin/profileController");
const categoryController = require("../controllers/Admin/categoryController");
const subCategoryController = require("../controllers/Admin/subCategoryController");
const corporationController = require("../controllers/Admin/corporationController");
const zoneController = require("../controllers/Admin/zoneController");
const wardController = require("../controllers/Admin/wardController");
const collectionEventController = require("../controllers/Admin/collectionEventController");
const wasteCollectionRequestController = require("../controllers/Admin/wasteCollectionRequestController");
const { acceptTnc } = require("../controllers/Admin/tncController");



const { verifyToken, requirePermission } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const dashboardController = require("../controllers/Admin/dashboardController");

// Setup file upload fields configuration
const userUploads = upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'pan_card_file', maxCount: 1 },
  { name: 'aadhaar_card_file', maxCount: 1 }
]);

const categoryUploads = upload.fields([
  { name: 'category_image', maxCount: 1 }
]);

const subCategoryUploads = upload.fields([
  { name: 'subcategory_image', maxCount: 1 }
]);

const requestUploads = upload.fields([
  { name: 'images', maxCount: 10 }
]);

// Auth routes (public)
router.post("/auth/login", login);
router.get("/auth/captcha", generateCaptcha);
router.post("/auth/2fa/verify", verify2FA);

// Profile routes
router.get("/profile", verifyToken, requirePermission('profile'), profileController.getProfile);
router.put("/profile", verifyToken, requirePermission('profile'), userUploads, profileController.updateProfile);

// Category routes
router.get("/categories", verifyToken, requirePermission(['category_management', 'product_management']), categoryController.getAllCategories);
router.post("/categories", verifyToken, requirePermission('category_management'), categoryUploads, categoryController.createCategory);
router.put("/categories/:id", verifyToken, requirePermission('category_management'), categoryUploads, categoryController.updateCategory);
router.patch("/categories/:id/status", verifyToken, requirePermission('category_management'), categoryController.toggleCategoryStatus);
router.delete("/categories/:id", verifyToken, requirePermission('category_management'), categoryController.deleteCategory);

// Sub-Category routes
router.get("/sub-categories", verifyToken, requirePermission(['sub_category_management', 'product_management']), subCategoryController.getAllSubCategories);
router.post("/sub-categories", verifyToken, requirePermission('sub_category_management'), subCategoryUploads, subCategoryController.createSubCategory);
router.put("/sub-categories/:id", verifyToken, requirePermission('sub_category_management'), subCategoryUploads, subCategoryController.updateSubCategory);
router.patch("/sub-categories/:id/status", verifyToken, requirePermission('sub_category_management'), subCategoryController.toggleSubCategoryStatus);
router.delete("/sub-categories/:id", verifyToken, requirePermission('sub_category_management'), subCategoryController.deleteSubCategory);

// User routes (protected)
// Uses user_management permission
router.get("/users/pending/count", verifyToken, requirePermission('user_management'), require('../controllers/Admin/userController').getPendingUserCount);
router.get("/users/roles", verifyToken, requirePermission('user_management'), getRoles);
router.get("/users", verifyToken, requirePermission('user_management'), getAllUsers);
router.get("/users/:id", verifyToken, requirePermission('user_management'), require('../controllers/Admin/userController').getUserById);
router.post("/users", verifyToken, requirePermission('user_management'), userUploads, createUser);
router.put("/users/:id", verifyToken, requirePermission('user_management'), userUploads, updateUser);
router.patch("/users/:id/status", verifyToken, requirePermission('user_management'), updateUserStatus);
router.delete("/users/:id", verifyToken, requirePermission('user_management'), deleteUser);

// Roles - Uses role_management
router.get("/roles", verifyToken, requirePermission('role_management'), roleController.getAllRoles);
router.post("/roles", verifyToken, requirePermission('role_management'), roleController.createRole);
router.put("/roles/:id", verifyToken, requirePermission('role_management'), roleController.updateRole);
router.delete("/roles/:id", verifyToken, requirePermission('role_management'), roleController.deleteRole);

// Permissions - Uses permission
router.get("/permissions", verifyToken, requirePermission('permission'), permissionController.getAllPermissions);
router.post("/permissions", verifyToken, requirePermission('permission'), permissionController.createPermission);
router.put("/permissions/:id", verifyToken, requirePermission('permission'), permissionController.updatePermission);
router.delete("/permissions/:id", verifyToken, requirePermission('permission'), permissionController.deletePermission);

// Location routes
router.get("/locations/countries", locationController.getCountries);
router.get("/locations/states/:country_id", locationController.getStates);
router.get("/locations/cities/:state_id", locationController.getCities);
router.get("/locations/pincode/:pincode", locationController.getPincodeDetails);
router.get("/locations/pincodes", verifyToken, requirePermission('locations'), locationController.getAllPincodes);
router.get("/locations/pincodes/city/:city_id", verifyToken, requirePermission('locations'), locationController.getPincodesByCity);
router.get("/locations/suggestions", verifyToken, requirePermission('locations'), locationController.getSuggestions);

// BWG Mapping routes
router.get("/corporations", verifyToken, requirePermission('bwg_mapping'), corporationController.getAllCorporations);
router.get("/corporations/:id", verifyToken, requirePermission('bwg_mapping'), corporationController.getCorporationById);
router.post("/corporations", verifyToken, requirePermission('bwg_mapping'), corporationController.createCorporation);
router.put("/corporations/:id", verifyToken, requirePermission('bwg_mapping'), corporationController.updateCorporation);
router.patch("/corporations/:id/status", verifyToken, requirePermission('bwg_mapping'), corporationController.toggleCorporationStatus);
router.delete("/corporations/:id", verifyToken, requirePermission('bwg_mapping'), corporationController.deleteCorporation);

router.get("/zones", verifyToken, requirePermission('bwg_mapping'), zoneController.getAllZones);
router.get("/zones/:id", verifyToken, requirePermission('bwg_mapping'), zoneController.getZoneById);
router.post("/zones", verifyToken, requirePermission('bwg_mapping'), zoneController.createZone);
router.put("/zones/:id", verifyToken, requirePermission('bwg_mapping'), zoneController.updateZone);
router.patch("/zones/:id/status", verifyToken, requirePermission('bwg_mapping'), zoneController.toggleZoneStatus);
router.delete("/zones/:id", verifyToken, requirePermission('bwg_mapping'), zoneController.deleteZone);
router.get("/corporations/:id/zones", verifyToken, requirePermission('bwg_mapping'), zoneController.getZonesByCorporation);

router.get("/wards", verifyToken, requirePermission('bwg_mapping'), wardController.getAllWards);
router.get("/wards/:id", verifyToken, requirePermission('bwg_mapping'), wardController.getWardById);
router.post("/wards", verifyToken, requirePermission('bwg_mapping'), wardController.createWard);
router.put("/wards/:id", verifyToken, requirePermission('bwg_mapping'), wardController.updateWard);
router.patch("/wards/:id/status", verifyToken, requirePermission('bwg_mapping'), wardController.toggleWardStatus);
router.delete("/wards/:id", verifyToken, requirePermission('bwg_mapping'), wardController.deleteWard);
router.get("/zones/:id/wards", verifyToken, requirePermission('bwg_mapping'), wardController.getWardsByZone);

// Collection Event routes
router.get("/collection-events", verifyToken, requirePermission('bwg_mapping'), collectionEventController.getAllCollectionEvents);
router.get("/collection-events/:id", verifyToken, requirePermission('bwg_mapping'), collectionEventController.getCollectionEventById);
router.post("/collection-events", verifyToken, requirePermission('bwg_mapping'), collectionEventController.createCollectionEvent);
router.put("/collection-events/:id", verifyToken, requirePermission('bwg_mapping'), collectionEventController.updateCollectionEvent);
router.patch("/collection-events/:id/status", verifyToken, requirePermission('bwg_mapping'), collectionEventController.toggleCollectionEventStatus);
router.delete("/collection-events/:id", verifyToken, requirePermission('bwg_mapping'), collectionEventController.deleteCollectionEvent);

// Waste Collection Request routes
router.get("/waste-collection-requests", verifyToken, requirePermission('waste_collection_requests'), wasteCollectionRequestController.getWasteCollectionRequests);
router.get("/waste-collection-requests/:id", verifyToken, requirePermission('waste_collection_requests'), wasteCollectionRequestController.getWasteCollectionRequestById);
router.post("/waste-collection-requests", requestUploads, wasteCollectionRequestController.createWasteCollectionRequest);



// Dashboard routes
router.get("/dashboard/stats", verifyToken, dashboardController.getDashboardStats);

// ─── Settings Routes ───────────────────────────────────────────────────────────
const brandingUploads = upload.fields([
  { name: 'company_logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 },
  { name: 'login_logo', maxCount: 1 },
  { name: 'login_bg', maxCount: 1 }
]);

// Public (no auth required - for login page branding/theme)
router.get("/settings/public", settingsController.getPublicSettings);

// Admin-only settings (requires settings_management permission)
router.get("/settings", verifyToken, requirePermission('settings_management'), settingsController.getSettings);
router.put("/settings/general", verifyToken, requirePermission('settings_management'), settingsController.updateGeneralSettings);
router.put("/settings/branding", verifyToken, requirePermission('settings_management'), brandingUploads, settingsController.updateBrandingSettings);
router.put("/settings/theme", verifyToken, requirePermission('settings_management'), settingsController.updateThemeSettings);
router.put("/settings/company", verifyToken, requirePermission('settings_management'), settingsController.updateCompanySettings);
router.put("/settings/email", verifyToken, requirePermission('settings_management'), settingsController.updateEmailSettings);
router.post("/settings/email/test", verifyToken, requirePermission('settings_management'), settingsController.testEmailConfiguration);
router.put("/settings/security", verifyToken, requirePermission('settings_management'), settingsController.updateSecuritySettings);
router.put("/settings/system", verifyToken, requirePermission('settings_management'), settingsController.updateSystemSettings);

// Audit Logs
router.get("/settings/audit-logs", verifyToken, requirePermission('settings_management'), settingsController.getAuditLogs);

// T&C Acceptance
router.post("/tnc/accept", verifyToken, acceptTnc);

module.exports = router;

