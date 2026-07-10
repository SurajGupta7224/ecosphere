// Central place to define all model associations
const User = require("./userModel");
const Role = require("./roleModel");
const Permission = require("./permissionModel");
const RolePermission = require("./rolePermissionModel");
const Country = require("./countryModel");
const State = require("./stateModel");
const City = require("./cityModel");
const Pincode = require("./pincodeModel");
const Category = require("./categoryModel");
const SubCategory = require("./subCategoryModel");
const SubCategoryVariation = require("./subCategoryVariationModel");
const AppSettings = require("./appSettingsModel");
const BrandingSettings = require("./brandingSettingsModel");
const ThemeSettings = require("./themeSettingsModel");
const CompanySettings = require("./companySettingsModel");
const EmailSettings = require("./emailSettingsModel");
const SecuritySettings = require("./securitySettingsModel");
const SystemSettings = require("./systemSettingsModel");
const AuditLog = require("./auditLogModel");
const Corporation = require("./corporationModel");
const Zone = require("./zoneModel");
const Ward = require("./wardModel");
const CollectionEvent = require("./collectionEventModel");
const WasteCollectionRequest = require("./wasteCollectionRequestModel");
const TimeSlot = require("./timeSlotModel");
const ModuleGeneratorHistory = require("./moduleGeneratorHistoryModel");
const Customer = require("./customerModel");



// User ↔ Role
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });
Role.hasMany(User, { foreignKey: "role_id", as: "users" });

// Role ↔ Permission (Many-to-Many via RolePermission)
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: "role_id", as: "permissions" });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: "permission_id", as: "roles" });

// Country ↔ State
Country.hasMany(State, { foreignKey: "country_id", as: "states" });
State.belongsTo(Country, { foreignKey: "country_id", as: "country" });

// State ↔ City
State.hasMany(City, { foreignKey: "state_id", as: "cities" });
City.belongsTo(State, { foreignKey: "state_id", as: "state" });

// User Location Mappings (BWG)
User.belongsTo(Corporation, { foreignKey: "corporation_id", as: "corporation" });
User.belongsTo(Zone, { foreignKey: "zone_id", as: "zone" });
User.belongsTo(Ward, { foreignKey: "ward_id", as: "ward" });

// Pincode Locations
Pincode.belongsTo(Country, { foreignKey: "country_id", as: "country" });
Pincode.belongsTo(State, { foreignKey: "state_id", as: "state" });
Pincode.belongsTo(City, { foreignKey: "city_id", as: "city" });

// Category ↔ SubCategory
Category.hasMany(SubCategory, { foreignKey: "category_id", as: "subCategories" });
SubCategory.belongsTo(Category, { foreignKey: "category_id", as: "category" });

// SubCategory ↔ SubCategoryVariation
SubCategory.hasMany(SubCategoryVariation, { foreignKey: "subcategory_id", as: "variations", onDelete: "CASCADE" });
SubCategoryVariation.belongsTo(SubCategory, { foreignKey: "subcategory_id", as: "subCategory" });

// Ownership Associations
Category.belongsTo(User, { foreignKey: "user_id", as: "user" });
SubCategory.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Category, { foreignKey: "user_id", as: "categories" });
User.hasMany(SubCategory, { foreignKey: "user_id", as: "subCategories" });

// Audit Logs User Association
AuditLog.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(AuditLog, { foreignKey: "user_id", as: "auditLogs" });

// Corporation ↔ Zone
Corporation.hasMany(Zone, { foreignKey: "corporation_id", as: "zones" });
Zone.belongsTo(Corporation, { foreignKey: "corporation_id", as: "corporation" });

// Corporation ↔ Ward
Corporation.hasMany(Ward, { foreignKey: "corporation_id", as: "wards" });
Ward.belongsTo(Corporation, { foreignKey: "corporation_id", as: "corporation" });

// Zone ↔ Ward
Zone.hasMany(Ward, { foreignKey: "zone_id", as: "wards" });
Ward.belongsTo(Zone, { foreignKey: "zone_id", as: "zone" });

// Corporation ↔ CollectionEvent
Corporation.hasMany(CollectionEvent, { foreignKey: "corporation_id", as: "collectionEvents" });
CollectionEvent.belongsTo(Corporation, { foreignKey: "corporation_id", as: "corporation" });

// Zone ↔ CollectionEvent
Zone.hasMany(CollectionEvent, { foreignKey: "zone_id", as: "collectionEvents" });
CollectionEvent.belongsTo(Zone, { foreignKey: "zone_id", as: "zone" });

// Ward ↔ CollectionEvent
Ward.hasMany(CollectionEvent, { foreignKey: "ward_id", as: "collectionEvents" });
CollectionEvent.belongsTo(Ward, { foreignKey: "ward_id", as: "ward" });

// Waste Collection Request associations
WasteCollectionRequest.belongsTo(User, { foreignKey: "user_id", as: "customer" });
User.hasMany(WasteCollectionRequest, { foreignKey: "user_id", as: "wasteRequests" });

WasteCollectionRequest.belongsTo(Category, { foreignKey: "category_id", as: "category" });
WasteCollectionRequest.belongsTo(SubCategory, { foreignKey: "subcategory_id", as: "subCategory" });
WasteCollectionRequest.belongsTo(SubCategoryVariation, { foreignKey: "variation_id", as: "variation" });

WasteCollectionRequest.belongsTo(User, { foreignKey: "generated_by", as: "creator" });
WasteCollectionRequest.belongsTo(User, { foreignKey: "created_by", as: "creatorUser" });

// Waste Collection Request ↔ TimeSlot
WasteCollectionRequest.belongsTo(TimeSlot, { foreignKey: "time_slot_id", as: "timeSlot" });
TimeSlot.hasMany(WasteCollectionRequest, { foreignKey: "time_slot_id", as: "wasteRequests" });

// Module Generator History ↔ User
ModuleGeneratorHistory.belongsTo(User, { foreignKey: "created_by", as: "creator" });
User.hasMany(ModuleGeneratorHistory, { foreignKey: "created_by", as: "generatedModules" });









module.exports = { 
  User, Role, Permission, RolePermission,
  Country, State, City, Pincode, Category, SubCategory, SubCategoryVariation,
  AppSettings, BrandingSettings, ThemeSettings, CompanySettings,
  EmailSettings, SecuritySettings, SystemSettings, AuditLog,
  Corporation, Zone, Ward, CollectionEvent, WasteCollectionRequest,
  TimeSlot, ModuleGeneratorHistory, Customer
};


