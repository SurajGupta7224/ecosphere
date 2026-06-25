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

// User Locations
User.belongsTo(Country, { foreignKey: "country_id", as: "country" });
User.belongsTo(State, { foreignKey: "state_id", as: "state" });
User.belongsTo(City, { foreignKey: "city_id", as: "city" });

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

module.exports = { 
  User, Role, Permission, RolePermission,
  Country, State, City, Pincode, Category, SubCategory, SubCategoryVariation,
  AppSettings, BrandingSettings, ThemeSettings, CompanySettings,
  EmailSettings, SecuritySettings, SystemSettings, AuditLog
};


