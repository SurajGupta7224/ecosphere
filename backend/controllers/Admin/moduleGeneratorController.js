const fs = require("fs");
const path = require("path");
const sequelize = require("../../config/db");
const { User, Permission, RolePermission, ModuleGeneratorHistory } = require("../../models/index");

// GET /api/admin/developer/history
const getHistory = async (req, res) => {
  try {
    const history = await ModuleGeneratorHistory.findAll({
      include: [{ model: User, as: "creator", attributes: ["id", "name", "email"] }],
      order: [["created_at", "DESC"]],
    });
    return res.status(200).json({ history });
  } catch (err) {
    console.error("getHistory error:", err);
    return res.status(500).json({ message: "Failed to fetch module generation history" });
  }
};

// DELETE /api/admin/developer/history/:id
const deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await ModuleGeneratorHistory.findByPk(id);
    if (!record) return res.status(404).json({ message: "History record not found" });
    await record.destroy();
    return res.status(200).json({ message: "History record deleted successfully" });
  } catch (err) {
    console.error("deleteHistory error:", err);
    return res.status(500).json({ message: "Failed to delete history record" });
  }
};

// POST /api/admin/developer/generate
const generateModule = async (req, res) => {
  const config = req.body;
  let {
    moduleName,
    displayName,
    slug,
    tableName,
    description,
    menuGroup,
    menuIcon = "ClipboardList",
    menuOrder = 1,
    status = "Active",
    options = {},
    fields = []
  } = config;

  if (!moduleName || !displayName || !slug || !tableName) {
    return res.status(400).json({ message: "Module name, display name, slug, and table name are required" });
  }

  // Sanitize moduleName to PascalCase
  moduleName = moduleName
    .split(/[\s_\-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")
    .replace(/[^a-zA-Z0-9]/g, "");

  // Sanitize slug to lowercase-hyphenated
  slug = slug
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");

  // Sanitize tableName to snake_case
  tableName = tableName
    .toLowerCase()
    .trim()
    .replace(/[\s\-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  // Helper to convert any string to camelCase (valid JS identifier)
  const toCamelCase = (str) => {
    if (!str) return str;
    const result = str
      .trim()
      .replace(/[\s_\-]+([a-zA-Z0-9])/g, (m, chr) => chr.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, "");
    return result ? result.charAt(0).toLowerCase() + result.slice(1) : result;
  };

  // Sanitize fieldName to camelCase
  fields.forEach(field => {
    if (field.fieldName) {
      field.fieldName = toCamelCase(field.fieldName);
    }
    // Sanitize foreignKeyConfig.displayColumn to camelCase (used in JSX as object property)
    if (field.foreignKeyConfig && field.foreignKeyConfig.displayColumn) {
      field.foreignKeyConfig.displayColumn = toCamelCase(field.foreignKeyConfig.displayColumn);
    }
  });


  const logs = [];
  const createdFiles = [];
  let dbTableCreated = false;
  let permissionsCreated = [];
  
  // Backup file contents for rollback
  const appJsxPath = path.join(__dirname, "../../../frontend/src/App.jsx");
  const dashboardLayoutPath = path.join(__dirname, "../../../frontend/src/layouts/DashboardLayout.jsx");
  const modelsIndexPath = path.join(__dirname, "../../models/index.js");
  const routesIndexPath = path.join(__dirname, "../../routes/index.js");

  let appJsxBackup = "";
  let dashboardLayoutBackup = "";
  let modelsIndexBackup = "";
  let routesIndexBackup = "";

  try {
    if (fs.existsSync(appJsxPath)) appJsxBackup = fs.readFileSync(appJsxPath, "utf8");
    if (fs.existsSync(dashboardLayoutPath)) dashboardLayoutBackup = fs.readFileSync(dashboardLayoutPath, "utf8");
    if (fs.existsSync(modelsIndexPath)) modelsIndexBackup = fs.readFileSync(modelsIndexPath, "utf8");
    if (fs.existsSync(routesIndexPath)) routesIndexBackup = fs.readFileSync(routesIndexPath, "utf8");
  } catch (err) {
    console.error("Failed to backup files:", err);
    return res.status(500).json({ message: "Failed to backup config files for rollback protection" });
  }

  // Log function
  const addLog = (msg) => {
    console.log(`[GENERATOR] ${msg}`);
    logs.push(msg);
  };

  try {
    // -------------------------------------------------------------
    // Step 1: Create Database Table / Migration
    // -------------------------------------------------------------
    addLog(`Generating database table '${tableName}'...`);
    const sqlFields = [];
    const sqlConstraints = [];
    const sqlIndexes = [];

    // Add Primary Key / Auto Increment
    sqlFields.push("`id` INT AUTO_INCREMENT PRIMARY KEY");

    fields.forEach(field => {
      if (field.databaseColumn.toLowerCase() === "id") return;
      let fieldDef = `\`${field.databaseColumn}\` `;
      
       // Map database types
      const typesWithLength = ["VARCHAR", "CHAR", "DECIMAL", "NUMERIC", "FLOAT", "DOUBLE", "INT", "BIGINT"];
      let lengthStr = (field.length && typesWithLength.includes(field.databaseType)) ? `(${field.length})` : "";
      if (field.databaseType === "VARCHAR") {
        fieldDef += `VARCHAR${field.length ? `(${field.length})` : "(255)"}`;
      } else if (field.databaseType === "ENUM") {
        const enumVals = field.placeholder ? field.placeholder.split(",").map(v => `'${v.trim()}'`).join(",") : "'Active','Inactive'";
        fieldDef += `ENUM(${enumVals})`;
      } else {
        fieldDef += field.databaseType + lengthStr;
      }

      // Nullable
      if (!field.nullable) {
        fieldDef += " NOT NULL";
      } else {
        fieldDef += " NULL";
      }

      // Unique
      if (field.unique) {
        fieldDef += " UNIQUE";
      }

      // Default value
      if (field.defaultValue !== undefined && field.defaultValue !== null && field.defaultValue !== "") {
        const upperDefault = String(field.defaultValue).trim().toUpperCase();
        if (upperDefault === "CURRENT_TIMESTAMP" || upperDefault === "NOW()") {
          fieldDef += ` DEFAULT CURRENT_TIMESTAMP`;
        } else if (field.databaseType === "BOOLEAN") {
          fieldDef += ` DEFAULT ${field.defaultValue === "true" || field.defaultValue === "1" ? 1 : 0}`;
        } else if (["INT", "BIGINT", "FLOAT", "DOUBLE", "DECIMAL"].includes(field.databaseType)) {
          fieldDef += ` DEFAULT ${field.defaultValue}`;
        } else {
          fieldDef += ` DEFAULT '${field.defaultValue}'`;
        }
      }

      sqlFields.push(fieldDef);

      // Indexes
      if (field.indexed && !field.primaryKey) {
        sqlIndexes.push(`CREATE INDEX \`idx_${tableName}_${field.databaseColumn}\` ON \`${tableName}\` (\`${field.databaseColumn}\`);`);
      }

      // Foreign Keys
      if (field.fieldType === "Foreign Key" && field.foreignKeyConfig) {
        const fk = field.foreignKeyConfig;
        sqlConstraints.push(`ALTER TABLE \`${tableName}\` ADD CONSTRAINT \`fk_${tableName}_${field.databaseColumn}\` FOREIGN KEY (\`${field.databaseColumn}\`) REFERENCES \`${fk.referencedTable}\` (\`${fk.referencedColumn}\`) ON DELETE ${fk.onDelete || "CASCADE"} ON UPDATE ${fk.onUpdate || "CASCADE"};`);
        // Always index foreign keys
        sqlIndexes.push(`CREATE INDEX \`idx_${tableName}_${field.databaseColumn}\` ON \`${tableName}\` (\`${field.databaseColumn}\`);`);
      }
    });

    // Add Timestamps
    sqlFields.push("`created_at` DATETIME NOT NULL");
    sqlFields.push("`updated_at` DATETIME NOT NULL");

    const createTableSql = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n  ${sqlFields.join(",\n  ")}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
    
    // Execute SQL Table Creation
    await sequelize.query(createTableSql);
    dbTableCreated = true;
    addLog(`Database table '${tableName}' created successfully.`);

    // Run constraints & indexes
    for (const constraintSql of sqlConstraints) {
      await sequelize.query(constraintSql);
    }
    for (const indexSql of sqlIndexes) {
      // Use try-catch for index creation in case index already exists
      try {
        await sequelize.query(indexSql);
      } catch (err) {
        addLog(`Index already exists or failed: ${err.message}`);
      }
    }

    // Write migration file
    if (options.createMigration) {
      const migrationDir = path.join(__dirname, "../../migrations");
      if (!fs.existsSync(migrationDir)) fs.mkdirSync(migrationDir, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
      
      const migrationUpFile = path.join(migrationDir, `${timestamp}_create_${tableName}_table.sql`);
      fs.writeFileSync(migrationUpFile, createTableSql + "\n\n" + sqlConstraints.join("\n") + "\n\n" + sqlIndexes.join("\n"), "utf8");
      createdFiles.push(migrationUpFile);

      const migrationDownFile = path.join(migrationDir, `${timestamp}_drop_${tableName}_table.sql`);
      fs.writeFileSync(migrationDownFile, `DROP TABLE IF EXISTS \`${tableName}\`;`, "utf8");
      createdFiles.push(migrationDownFile);
      
      addLog(`Migration files created in backend/migrations.`);
    }

    // -------------------------------------------------------------
    // Step 2: Create Sequelize Model
    // -------------------------------------------------------------
    addLog(`Creating Sequelize Model '${moduleName}Model.js'...`);
    const modelFields = [];
    fields.forEach(field => {
      if (field.databaseColumn.toLowerCase() === "id") return;
      let typeStr = "";
      if (field.databaseType === "VARCHAR") {
        typeStr = `DataTypes.STRING${field.length ? `(${field.length})` : ""}`;
      } else if (field.databaseType === "ENUM") {
        const enumVals = field.placeholder ? field.placeholder.split(",").map(v => `'${v.trim()}'`).join(",") : "'Active','Inactive'";
        typeStr = `DataTypes.ENUM(${enumVals})`;
      } else if (field.databaseType === "INT") {
        typeStr = "DataTypes.INTEGER";
      } else if (field.databaseType === "BIGINT") {
        typeStr = "DataTypes.BIGINT";
      } else if (field.databaseType === "TEXT") {
        typeStr = "DataTypes.TEXT";
      } else if (field.databaseType === "LONGTEXT") {
        typeStr = `DataTypes.TEXT("long")`;
      } else if (field.databaseType === "DATE") {
        typeStr = "DataTypes.DATEONLY";
      } else if (field.databaseType === "TIME") {
        typeStr = "DataTypes.TIME";
      } else if (field.databaseType === "DATETIME" || field.databaseType === "TIMESTAMP") {
        typeStr = "DataTypes.DATE";
      } else if (field.databaseType === "BOOLEAN") {
        typeStr = "DataTypes.BOOLEAN";
      } else if (field.databaseType === "FLOAT") {
        typeStr = "DataTypes.FLOAT";
      } else if (field.databaseType === "DOUBLE") {
        typeStr = "DataTypes.DOUBLE";
      } else if (field.databaseType === "DECIMAL") {
        typeStr = "DataTypes.DECIMAL";
      } else if (field.databaseType === "JSON") {
        typeStr = "DataTypes.JSON";
      } else if (field.databaseType === "UUID") {
        typeStr = "DataTypes.UUID";
      }

      let fieldObj = `    ${field.databaseColumn}: {\n      type: ${typeStr},\n      allowNull: ${field.nullable ? "true" : "false"}`;
      
      if (field.unique) {
        fieldObj += ",\n      unique: true";
      }
      if (field.defaultValue !== undefined && field.defaultValue !== null && field.defaultValue !== "") {
        let defVal = field.defaultValue;
        const upperDefault = String(field.defaultValue).trim().toUpperCase();
        if (upperDefault === "CURRENT_TIMESTAMP" || upperDefault === "NOW()") {
          defVal = "sequelize.literal('CURRENT_TIMESTAMP')";
        } else if (field.databaseType === "BOOLEAN") {
          defVal = field.defaultValue === "true" || field.defaultValue === "1" ? "true" : "false";
        } else if (!["INT", "BIGINT", "FLOAT", "DOUBLE", "DECIMAL"].includes(field.databaseType)) {
          defVal = `"${field.defaultValue}"`;
        }
        fieldObj += `,\n      defaultValue: ${defVal}`;
      }
      if (field.databaseType === "UUID") {
        fieldObj += ",\n      defaultValue: DataTypes.UUIDV4";
      }
      fieldObj += "\n    }";
      modelFields.push(fieldObj);
    });

    const modelTemplate = `const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class ${moduleName} extends Model {}

${moduleName}.init(
  {
${modelFields.join(",\n")}
  },
  {
    sequelize,
    modelName: "${moduleName}",
    tableName: "${tableName}",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = ${moduleName};
`;
    const modelFilePath = path.join(__dirname, "../../models", `${slug}Model.js`);
    fs.writeFileSync(modelFilePath, modelTemplate, "utf8");
    createdFiles.push(modelFilePath);
    addLog(`Model file created.`);

    // -------------------------------------------------------------
    // Step 3: Register Model in index.js and setup associations
    // -------------------------------------------------------------
    addLog(`Registering model in backend/models/index.js...`);
    let modelsContent = fs.readFileSync(modelsIndexPath, "utf8");

    // Add import
    const modelImportStr = `const ${moduleName} = require("./${slug}Model");`;
    const lastImportIndex = modelsContent.lastIndexOf("const ");
    const nextLineIndex = modelsContent.indexOf("\n", lastImportIndex);
    modelsContent = modelsContent.slice(0, nextLineIndex + 1) + modelImportStr + "\n" + modelsContent.slice(nextLineIndex + 1);

    // Add associations
    let assocStr = `\n// ${moduleName} associations\n`;
    fields.forEach(field => {
      if (field.fieldType === "Foreign Key" && field.foreignKeyConfig) {
        const fk = field.foreignKeyConfig;
        const refModel = getModelName(fk.referencedTable);
        const relationName = field.databaseColumn.replace("_id", "");
        assocStr += `${moduleName}.belongsTo(${refModel}, { foreignKey: "${field.databaseColumn}", as: "${relationName}" });\n`;
        assocStr += `${refModel}.hasMany(${moduleName}, { foreignKey: "${field.databaseColumn}", as: "${slug}s" });\n`;
      }
    });
    
    const assocInsertIndex = modelsContent.indexOf("module.exports = {");
    modelsContent = modelsContent.slice(0, assocInsertIndex) + assocStr + "\n" + modelsContent.slice(assocInsertIndex);

    // Add to export
    const exportIndex = modelsContent.indexOf("module.exports = {");
    const exportClosingIndex = modelsContent.indexOf("};", exportIndex);
    modelsContent = modelsContent.slice(0, exportClosingIndex) + `  , ${moduleName}\n` + modelsContent.slice(exportClosingIndex);

    fs.writeFileSync(modelsIndexPath, modelsContent, "utf8");
    addLog(`Model registered in index.js successfully.`);

    // Helper to map DB tables to Model names
    function getModelName(tblName) {
      const map = {
        users: "User",
        roles: "Role",
        permissions: "Permission",
        categories: "Category",
        sub_categories: "SubCategory",
        sub_category_variations: "SubCategoryVariation",
        corporations: "Corporation",
        zones: "Zone",
        wards: "Ward",
        collection_events: "CollectionEvent",
        time_slots: "TimeSlot"
      };
      if (map[tblName]) return map[tblName];
      let name = tblName.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      name = name.charAt(0).toUpperCase() + name.slice(1);
      if (name.endsWith("s")) name = name.slice(0, -1);
      return name;
    }

    // -------------------------------------------------------------
    // Step 4: Create Service Layer
    // -------------------------------------------------------------
    addLog(`Creating Service layer '${slug}Service.js'...`);
    const serviceTemplate = `const { ${moduleName}, ${fields.filter(f => f.fieldType === "Foreign Key").map(f => getModelName(f.foreignKeyConfig.referencedTable)).join(", ")} } = require("../models/index");

class ${moduleName}Service {
  async getAll({ where, limit, offset, order, include }) {
    return await ${moduleName}.findAndCountAll({ where, limit, offset, order, include });
  }

  async getById(id, { include } = {}) {
    return await ${moduleName}.findByPk(id, { include });
  }

  async create(data) {
    return await ${moduleName}.create(data);
  }

  async update(id, data) {
    const record = await ${moduleName}.findByPk(id);
    if (!record) throw new Error("${displayName} not found");
    return await record.update(data);
  }

  async delete(id) {
    const record = await ${moduleName}.findByPk(id);
    if (!record) throw new Error("${displayName} not found");
    return await record.destroy();
  }
}

module.exports = new ${moduleName}Service();
`;
    const serviceFilePath = path.join(__dirname, "../../services", `${slug}Service.js`);
    fs.writeFileSync(serviceFilePath, serviceTemplate, "utf8");
    createdFiles.push(serviceFilePath);
    addLog(`Service file created.`);

    // -------------------------------------------------------------
    // Step 5: Create Controller
    // -------------------------------------------------------------
    addLog(`Creating Controller '${slug}Controller.js'...`);
    const searchableFields = fields.filter(f => f.searchable && f.databaseColumn.toLowerCase() !== "id").map(f => f.databaseColumn);
    const filterableFields = fields.filter(f => f.filterable && f.databaseColumn.toLowerCase() !== "id").map(f => f.databaseColumn);
    const sortableFields = fields.filter(f => f.sortable && f.databaseColumn.toLowerCase() !== "id").map(f => f.databaseColumn);
    
    // Build includes list for foreign keys
    const includesList = fields.filter(f => f.fieldType === "Foreign Key").map(f => {
      const relationName = f.databaseColumn.replace("_id", "");
      const refModel = getModelName(f.foreignKeyConfig.referencedTable);
      return `{ model: ${refModel}, as: "${relationName}" }`;
    });

    const controllerTemplate = `const service = require("../../services/${slug}Service");
const { ${fields.filter(f => f.fieldType === "Foreign Key").map(f => getModelName(f.foreignKeyConfig.referencedTable)).join(", ")} } = require("../../models/index");
const { Op } = require("sequelize");

// GET /api/admin/${slug}
const getAll = async (req, res) => {
  const { page = 1, limit = 10, search = '', status = '', sortField = 'id', sortOrder = 'DESC' } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where[Op.or] = [
${searchableFields.map(f => `      { ${f}: { [Op.like]: \`%\${search}%\` } }`).join(",\n")}
    ];
  }
  if (status) {
    where.status = status;
  }
  
  // Custom filters
${filterableFields.filter(f => f !== 'status').map(f => `  if (req.query.${f}) {
    where.${f} = req.query.${f};
  }`).join("\n")}

  const allowedSortFields = [${sortableFields.map(f => `'${f}'`).join(", ")}];
  const orderField = allowedSortFields.includes(sortField) ? sortField : 'id';
  const orderDir = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

  try {
    const { count, rows } = await service.getAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[orderField, orderDir]],
      include: [
        ${includesList.join(",\n        ")}
      ]
    });

    return res.status(200).json({
      data: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error("getAll ${moduleName} error:", err);
    return res.status(500).json({ message: "Failed to fetch records" });
  }
};

// GET /api/admin/${slug}/:id
const getById = async (req, res) => {
  const { id } = req.params;
  try {
    const record = await service.getById(id, {
      include: [
        ${includesList.join(",\n        ")}
      ]
    });
    if (!record) return res.status(404).json({ message: "Record not found" });
    return res.status(200).json({ record });
  } catch (err) {
    console.error("getById ${moduleName} error:", err);
    return res.status(500).json({ message: "Failed to fetch details" });
  }
};

// POST /api/admin/${slug}
const create = async (req, res) => {
  const inputData = { ...req.body };

  // Handle uploaded files/images
  if (req.files) {
    Object.keys(req.files).forEach(fieldName => {
      inputData[fieldName] = req.files[fieldName][0].filename;
    });
  }

  try {
    const record = await service.create(inputData);
    return res.status(201).json({ message: "Created successfully", record });
  } catch (err) {
    console.error("create ${moduleName} error:", err);
    return res.status(500).json({ message: err.message || "Failed to create record" });
  }
};

// PUT /api/admin/${slug}/:id
const update = async (req, res) => {
  const { id } = req.params;
  const inputData = { ...req.body };

  // Handle uploaded files/images
  if (req.files) {
    Object.keys(req.files).forEach(fieldName => {
      inputData[fieldName] = req.files[fieldName][0].filename;
    });
  }

  try {
    const record = await service.update(id, inputData);
    return res.status(200).json({ message: "Updated successfully", record });
  } catch (err) {
    console.error("update ${moduleName} error:", err);
    return res.status(500).json({ message: err.message || "Failed to update record" });
  }
};

// PATCH /api/admin/${slug}/:id/status
const toggleStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const record = await service.update(id, { status });
    return res.status(200).json({ message: "Status updated successfully", status });
  } catch (err) {
    console.error("toggleStatus ${moduleName} error:", err);
    return res.status(500).json({ message: "Failed to update status" });
  }
};

// DELETE /api/admin/${slug}/:id
const remove = async (req, res) => {
  const { id } = req.params;
  try {
    await service.delete(id);
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("delete ${moduleName} error:", err);
    return res.status(500).json({ message: "Failed to delete record" });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  toggleStatus,
  delete: remove
};
`;
    const controllerFilePath = path.join(__dirname, "../Admin", `${slug}Controller.js`);
    fs.writeFileSync(controllerFilePath, controllerTemplate, "utf8");
    createdFiles.push(controllerFilePath);
    addLog(`Controller file created.`);

    // -------------------------------------------------------------
    // Step 6: Create Routes File (including custom multer)
    // -------------------------------------------------------------
    addLog(`Creating Routes File '${slug}Routes.js'...`);
    const fileFields = fields.filter(f => f.fieldType === "Image" || f.fieldType === "File").map(f => f.databaseColumn);

    let routeTemplate = `const express = require("express");
const router = express.Router();
const controller = require("../controllers/Admin/${slug}Controller");
const { verifyToken, requirePermission } = require("../middleware/authMiddleware");
`;

    if (fileFields.length > 0) {
      routeTemplate += `const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../public/uploads/${moduleName}");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  }
});
const upload = multer({ storage });
const uploadMiddleware = upload.fields([
  ${fileFields.map(f => `{ name: '${f}', maxCount: 1 }`).join(",\n  ")}
]);
`;
    }

    routeTemplate += `
router.get("/", verifyToken, requirePermission("${slug}_view"), controller.getAll);
router.get("/:id", verifyToken, requirePermission("${slug}_view"), controller.getById);
router.post("/", verifyToken, requirePermission("${slug}_add"), ${fileFields.length > 0 ? "uploadMiddleware, " : ""}controller.create);
router.put("/:id", verifyToken, requirePermission("${slug}_edit"), ${fileFields.length > 0 ? "uploadMiddleware, " : ""}controller.update);
router.patch("/:id/status", verifyToken, requirePermission("${slug}_edit"), controller.toggleStatus);
router.delete("/:id", verifyToken, requirePermission("${slug}_delete"), controller.delete);

module.exports = router;
`;

    const routesFilePath = path.join(__dirname, "../../routes", `${slug}Routes.js`);
    fs.writeFileSync(routesFilePath, routeTemplate, "utf8");
    createdFiles.push(routesFilePath);
    addLog(`Routes file created.`);

    // -------------------------------------------------------------
    // Step 7: Register Route in backend/routes/index.js
    // -------------------------------------------------------------
    addLog(`Registering route in backend/routes/index.js...`);
    let routesContent = fs.readFileSync(routesIndexPath, "utf8");
    
    // Find mount location
    const mountIndex = routesContent.indexOf("// Audit Logs");
    const routeMountStr = `router.use("/${slug}", require("./${slug}Routes"));\n\n`;
    routesContent = routesContent.slice(0, mountIndex) + routeMountStr + routesContent.slice(mountIndex);
    
    fs.writeFileSync(routesIndexPath, routesContent, "utf8");
    addLog(`Route registered in index.js successfully.`);

    // -------------------------------------------------------------
    // Step 8: Create Frontend Pages (Listing, Form, View)
    // -------------------------------------------------------------
    addLog(`Creating React Frontend folder 'frontend/src/pages/${moduleName}'...`);
    const feDir = path.join(__dirname, "../../../frontend/src/pages", moduleName);
    if (!fs.existsSync(feDir)) fs.mkdirSync(feDir, { recursive: true });

    // --- LISTING PAGE ---
    addLog(`Creating Listing Page '${moduleName}List.jsx'...`);
    const headersList = fields.filter(f => !f.hidden).map(f => {
      return `                  <th className="p-5">${f.displayLabel}</th>`;
    });
    
    const rowsList = fields.filter(f => !f.hidden).map(f => {
      if (f.fieldType === "Foreign Key") {
        const relationName = f.databaseColumn.replace("_id", "");
        return `                      <td className="p-5 text-sm font-semibold text-slate-700">
                        {item.${relationName}?.${f.foreignKeyConfig.displayColumn} || '—'}
                      </td>`;
      }
      if (f.fieldType === "Image") {
        return `                      <td className="p-5">
                        {item.${f.databaseColumn} ? (
                          <img src={\`\${IMAGE_BASE_URL}/${moduleName}/\${item.${f.databaseColumn}}\`} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                        ) : '—'}
                      </td>`;
      }
      if (f.databaseColumn === "status") {
        return `                      <td className="p-5">
                        <button
                          onClick={() => toggleStatus(item)}
                          className={\`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all \${item.status === 'Active'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
                          }\`}
                        >
                          <span className={\`w-1.5 h-1.5 rounded-full mr-2 \${item.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}\`}></span>
                          {item.status}
                        </button>
                      </td>`;
      }
      return `                      <td className="p-5 text-sm font-bold text-slate-800">{item.${f.databaseColumn} !== null ? String(item.${f.databaseColumn}) : '—'}</td>`;
    });

    const listingTemplate = `import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { IMAGE_BASE_URL } from '../../api';
import ConfirmModal from '../../components/ConfirmModal';
import ${moduleName}View from './${moduleName}View';

export default function ${moduleName}List() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, [page, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/${slug}', {
        params: {
          page,
          search,
          status: statusFilter,
          limit: 10
        }
      });
      setData(res.data.data || []);
      setTotalPages(res.data.pages || 1);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const toggleStatus = async (item) => {
    const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(\`/${slug}/\${item.id}/status\`, { status: newStatus });
      toast.success("Status updated successfully");
      fetchData();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const confirmDelete = (id) => {
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(\`/${slug}/\${idToDelete}\`);
      toast.success("Record deleted successfully");
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to delete record");
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">${displayName} Management</h1>
          <p className="text-slate-500 mt-1 text-sm">Add and manage your ${displayName.toLowerCase()} entries.</p>
        </div>
        <button
          onClick={() => navigate('/${slug}/create')}
          className="flex items-center px-6 py-3 bg-[#7c3aed] hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-100 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5 mr-2" /> Add ${displayName}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all text-sm"
            />
          </form>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-purple-100 text-xs font-bold text-slate-600 cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                <th className="p-5">Sr No</th>
${headersList.join("\n")}
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={${fields.filter(f => !f.hidden).length + 2}} className="p-20 text-center">
                    <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm font-medium text-slate-400">Loading your data...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={${fields.filter(f => !f.hidden).length + 2}} className="p-20 text-center">
                    <p className="text-slate-600 font-bold">No Records Found</p>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-5 text-xs font-mono text-slate-400">{(page - 1) * 10 + index + 1}</td>
${rowsList.join("\n")}
                    <td className="p-5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => { setSelectedItem(item); setIsViewOpen(true); }}
                        className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(\`/${slug}/edit/\${item.id}\`)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center">
            <p className="text-xs font-bold text-slate-400">
              Showing {data.length} of {totalItems} items
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Record?"
        message="Are you sure you want to delete this record? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      {isViewOpen && (
        <${moduleName}View
          isOpen={isViewOpen}
          onClose={() => { setIsViewOpen(false); setSelectedItem(null); }}
          item={selectedItem}
        />
      )}
    </div>
  );
}
`;
    const listingFilePath = path.join(feDir, `${moduleName}List.jsx`);
    fs.writeFileSync(listingFilePath, listingTemplate, "utf8");
    createdFiles.push(listingFilePath);
    addLog(`Listing Page created.`);

    // --- FORM PAGE (CREATE & EDIT) ---
    addLog(`Creating Form Page '${moduleName}Form.jsx'...`);
    const formFields = [];
    const stateInits = [];
    const imagePrevs = [];
    const fileHandlers = [];
    const payloadAppends = [];

    // Load active options for foreign key dropdowns
    const fkEffectLoads = [];
    const fkStateInits = [];

    fields.filter(f => f.databaseColumn !== "id").forEach(f => {
      // Input form markup
      if (f.fieldType === "Foreign Key" && f.foreignKeyConfig) {
        const refTable = f.foreignKeyConfig.referencedTable;
        const refCol = f.foreignKeyConfig.referencedColumn;
        const dispCol = f.foreignKeyConfig.displayColumn;
        
        fkStateInits.push(`  const [${refTable}List, set${refTable}List] = useState([]);`);
        
        fkEffectLoads.push(`    const fetch${refTable} = async () => {
      try {
        const res = await api.get('/${refTable.replace("_", "-")}', { params: { limit: 500, status: 'Active' } });
        set${refTable}List(res.data.${refTable.replace(/_([a-z])/g, (g) => g[1].toUpperCase())} || res.data.data || []);
      } catch (err) {
        console.error("Failed to load ${refTable}:", err);
      }
    };
    fetch${refTable}();`);

        formFields.push(`            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">${f.displayLabel} ${f.required ? '*' : ''}</label>
              <select
                name="${f.databaseColumn}"
                value={formData.${f.databaseColumn}}
                onChange={handleInputChange}
                required={${f.required ? "true" : "false"}}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-semibold cursor-pointer"
              >
                <option value="">Select ${f.displayLabel}</option>
                {${refTable}List.map(opt => (
                  <option key={opt.${refCol}} value={opt.${refCol}}>{opt.${dispCol}}</option>
                ))}
              </select>
            </div>`);
      } else if (f.fieldType === "Image" || f.fieldType === "File") {
        stateInits.push(`  const [${f.databaseColumn}File, set${f.databaseColumn}File] = useState(null);`);
        imagePrevs.push(`  const [${f.databaseColumn}Prev, set${f.databaseColumn}Prev] = useState(null);`);
        
        fileHandlers.push(`  const handle${f.databaseColumn}Change = (e) => {
    const file = e.target.files[0];
    if (file) {
      set${f.databaseColumn}File(file);
      set${f.databaseColumn}Prev(URL.createObjectURL(file));
    }
  };`);

        payloadAppends.push(`    if (${f.databaseColumn}File) {
      payload.append('${f.databaseColumn}', ${f.databaseColumn}File);
    }`);

        formFields.push(`            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">${f.displayLabel} ${f.required ? '*' : ''}</label>
              <input
                type="file"
                accept="${f.fieldType === "Image" ? "image/*" : "*/*"}"
                onChange={handle${f.databaseColumn}Change}
                required={${f.required && !f.defaultValue ? "!isEditMode" : "false"}}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-semibold"
              />
              {${f.databaseColumn}Prev && (
                <div className="mt-4 relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200">
                  <img src={${f.databaseColumn}Prev} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>`);
      } else if (f.fieldType === "Select") {
        const selectOptions = f.placeholder ? f.placeholder.split(",").map(v => v.trim()) : ["Active", "Inactive"];
        formFields.push(`            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">${f.displayLabel} ${f.required ? '*' : ''}</label>
              <select
                name="${f.databaseColumn}"
                value={formData.${f.databaseColumn}}
                onChange={handleInputChange}
                required={${f.required ? "true" : "false"}}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-semibold cursor-pointer"
              >
                ${selectOptions.map(opt => `<option value="${opt}">${opt}</option>`).join("\n                ")}
              </select>
            </div>`);
      } else {
        // Text / Number / Date / Textarea
        let inpType = "text";
        if (f.fieldType === "Number") inpType = "number";
        if (f.fieldType === "Email") inpType = "email";
        if (f.fieldType === "Password") inpType = "password";
        if (f.fieldType === "Date") inpType = "date";
        if (f.fieldType === "Time") inpType = "time";
        if (f.fieldType === "DateTime") inpType = "datetime-local";

        if (f.fieldType === "Textarea") {
          formFields.push(`            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">${f.displayLabel} ${f.required ? '*' : ''}</label>
              <textarea
                name="${f.databaseColumn}"
                value={formData.${f.databaseColumn}}
                onChange={handleInputChange}
                required={${f.required ? "true" : "false"}}
                placeholder="${f.placeholder || ''}"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-semibold h-24"
              />
            </div>`);
        } else {
          formFields.push(`            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">${f.displayLabel} ${f.required ? '*' : ''}</label>
              <input
                type="${inpType}"
                name="${f.databaseColumn}"
                value={formData.${f.databaseColumn}}
                onChange={handleInputChange}
                required={${f.required ? "true" : "false"}}
                placeholder="${f.placeholder || ''}"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-semibold"
              />
            </div>`);
        }
      }
    });

    const initFormDataObj = fields.filter(f => f.databaseColumn !== "id").reduce((acc, f) => {
      let dVal = f.defaultValue || "";
      if (f.fieldType === "Select") dVal = f.placeholder ? f.placeholder.split(",")[0].trim() : "Active";
      acc[f.databaseColumn] = dVal;
      return acc;
    }, {});

    const formTemplate = `import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, RotateCcw, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { IMAGE_BASE_URL } from '../../api';

export default function ${moduleName}Form() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState(${JSON.stringify(initFormDataObj, null, 2)});
  const [submitting, setSubmitting] = useState(false);

${stateInits.join("\n")}
${imagePrevs.join("\n")}
${fkStateInits.join("\n")}

  useEffect(() => {
${fkEffectLoads.join("\n")}
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const fetchDetail = async () => {
        try {
          const res = await api.get(\`/${slug}/\${id}\`);
          const rec = res.data.record;
          if (rec) {
            const freshData = {};
            Object.keys(formData).forEach(k => {
              freshData[k] = rec[k] !== null ? rec[k] : '';
            });
            setFormData(freshData);
            
            // Set previews for image fields
            ${fields.filter(f => f.fieldType === "Image").map(f => `if (rec.${f.databaseColumn}) {
              set${f.databaseColumn}Prev(\`\${IMAGE_BASE_URL}/${moduleName}/\${rec.${f.databaseColumn}}\`);
            }`).join("\n            ")}
          }
        } catch (err) {
          toast.error("Failed to load record details");
        }
      };
      fetchDetail();
    }
  }, [id, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

${fileHandlers.join("\n")}

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = new FormData();
    Object.keys(formData).forEach(k => {
      payload.append(k, formData[k]);
    });

    ${payloadAppends.join("\n    ")}

    try {
      if (isEditMode) {
        await api.put(\`/${slug}/\${id}\`, payload);
        toast.success("Updated successfully");
      } else {
        await api.post('/${slug}', payload);
        toast.success("Created successfully");
      }
      navigate('/${slug}');
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full pb-12 font-sans">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/${slug}')}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            {isEditMode ? 'Edit ${displayName}' : 'Add New ${displayName}'}
          </h1>
          <p className="text-slate-400 mt-0.5 text-sm">Please fill in the form details below.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
${formFields.join("\n")}
          </div>

          <div className="flex justify-end space-x-4 mt-10 pt-8 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/${slug}')}
              className="flex items-center px-6 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center px-8 py-2.5 rounded-xl font-bold bg-[#7c3aed] text-white hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4 mr-2" /> {submitting ? 'Saving...' : 'Save ${displayName}'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
`;
    const formFilePath = path.join(feDir, `${moduleName}Form.jsx`);
    fs.writeFileSync(formFilePath, formTemplate, "utf8");
    createdFiles.push(formFilePath);
    addLog(`Form Page created.`);

    // --- VIEW PAGE ---
    addLog(`Creating View Slide Panel Page '${moduleName}View.jsx'...`);
    const viewRows = fields.map(f => {
      if (f.fieldType === "Foreign Key") {
        const relationName = f.databaseColumn.replace("_id", "");
        return `          <InfoRow label="${f.displayLabel}" value={item.${relationName}?.${f.foreignKeyConfig.displayColumn}} />`;
      }
      if (f.fieldType === "Image") {
        return `          <div className="py-3 border-b border-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${f.displayLabel}</p>
            {item.${f.databaseColumn} ? (
              <img src={\`\${IMAGE_BASE_URL}/${moduleName}/\${item.${f.databaseColumn}}\`} alt="Preview" className="w-24 h-24 mt-2 rounded-xl object-cover border border-slate-200 shadow-sm" />
            ) : <p className="text-sm font-semibold text-slate-500 mt-1">—</p>}
          </div>`;
      }
      return `          <InfoRow label="${f.displayLabel}" value={item.${f.databaseColumn} !== null ? String(item.${f.databaseColumn}) : '—'} />`;
    });

    const viewTemplate = `import { X } from 'lucide-react';

function InfoRow({ label, value }) {
  return (
    <div className="py-3 border-b border-slate-50">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-slate-800 mt-1">{value || '—'}</p>
    </div>
  );
}

export default function ${moduleName}View({ isOpen, onClose, item }) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200" />

      {/* Slide Panel */}
      <div
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">${displayName} Details</h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">ID: {item.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
${viewRows.join("\n")}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
`;
    const viewFilePath = path.join(feDir, `${moduleName}View.jsx`);
    fs.writeFileSync(viewFilePath, viewTemplate, "utf8");
    createdFiles.push(viewFilePath);
    addLog(`View Slide Panel Page created.`);

    // -------------------------------------------------------------
    // Step 9: Register Route and Sidebar Item in Frontend
    // -------------------------------------------------------------
    addLog(`Registering frontend route in frontend/src/App.jsx...`);
    let appJsxContent = fs.readFileSync(appJsxPath, "utf8");
    
    // Add page imports
    const pageImportsStr = `import ${moduleName}List from './pages/${moduleName}/${moduleName}List';\nimport ${moduleName}Form from './pages/${moduleName}/${moduleName}Form';`;
    const lastAppImportIndex = appJsxContent.lastIndexOf("import ");
    const nextLineAppIndex = appJsxContent.indexOf("\n", lastAppImportIndex);
    appJsxContent = appJsxContent.slice(0, nextLineAppIndex + 1) + pageImportsStr + "\n" + appJsxContent.slice(nextLineAppIndex + 1);

    // Add route mappings (before final </Route>)
    const closingNestedRouteIndex = appJsxContent.lastIndexOf("</Route>");
    const feRouteStr = `          <Route
            path="${slug}"
            element={
              <RequirePermission requiredPermission="${slug}_view">
                <${moduleName}List />
              </RequirePermission>
            }
          />
          <Route
            path="${slug}/create"
            element={
              <RequirePermission requiredPermission="${slug}_add">
                <${moduleName}Form />
              </RequirePermission>
            }
          />
          <Route
            path="${slug}/edit/:id"
            element={
              <RequirePermission requiredPermission="${slug}_edit">
                <${moduleName}Form />
              </RequirePermission>
            }
          />\n`;
    
    appJsxContent = appJsxContent.slice(0, closingNestedRouteIndex) + feRouteStr + appJsxContent.slice(closingNestedRouteIndex);
    fs.writeFileSync(appJsxPath, appJsxContent, "utf8");
    addLog(`Frontend route registered in App.jsx.`);

    // Sidebar navigation registration in DashboardLayout.jsx
    addLog(`Registering sidebar menu item in frontend/src/layouts/DashboardLayout.jsx...`);
    let dbLayoutContent = fs.readFileSync(dashboardLayoutPath, "utf8");

    if (menuGroup === "General Master") {
      // Find master section items array and append
      const locLine = `{ name: t('locations'), path: '/locations', req: 'locations' }`;
      const locIndex = dbLayoutContent.indexOf(locLine);
      if (locIndex !== -1) {
        const nextLineIndex = dbLayoutContent.indexOf("\n", locIndex);
        const newItemStr = `,\n        { name: '${displayName}', path: '/${slug}', req: '${slug}_view' }`;
        dbLayoutContent = dbLayoutContent.slice(0, locIndex + locLine.length) + newItemStr + dbLayoutContent.slice(locIndex + locLine.length);
      }
    } else {
      // Find settings or default sidebar item and prepend
      const settingsLine = `{ name: t('settings'), path: '/settings', icon: SlidersHorizontal, isSubMenu: false, req: 'settings_management' }`;
      const settingsIndex = dbLayoutContent.indexOf(settingsLine);
      if (settingsIndex !== -1) {
        const newItemStr = `{ name: '${displayName}', path: '/${slug}', icon: ${menuIcon || 'ClipboardList'}, isSubMenu: false, req: '${slug}_view' },\n    `;
        dbLayoutContent = dbLayoutContent.slice(0, settingsIndex) + newItemStr + dbLayoutContent.slice(settingsIndex);
      }
    }

    fs.writeFileSync(dashboardLayoutPath, dbLayoutContent, "utf8");
    addLog(`Sidebar menu registered in DashboardLayout.jsx.`);

    // -------------------------------------------------------------
    // Step 10: Create Permissions & Assign to Super Admin (role_id = 1)
    // -------------------------------------------------------------
    addLog(`Creating Permissions for '${slug}'...`);
    const permNames = [`${slug}_view`, `${slug}_add`, `${slug}_edit`, `${slug}_delete`].concat(
      options.createExport ? [`${slug}_export`] : []
    );

    for (const pName of permNames) {
      let [permRecord] = await Permission.findOrCreate({ where: { permission_name: pName } });
      permissionsCreated.push(pName);
      
      // Associate with Admin Role (role_id = 1)
      const existingLink = await RolePermission.findOne({
        where: { role_id: 1, permission_id: permRecord.id }
      });
      if (!existingLink) {
        await RolePermission.create({
          role_id: 1,
          permission_id: permRecord.id
        });
      }
    }
    addLog(`Permissions [${permNames.join(", ")}] assigned to Super Admin role.`);

    // -------------------------------------------------------------
    // Step 11: Save History Record
    // -------------------------------------------------------------
    await ModuleGeneratorHistory.create({
      module_name: moduleName,
      display_name: displayName,
      slug: slug,
      table_name: tableName,
      menu_group: menuGroup,
      config: config,
      files_generated: createdFiles,
      status: "Success",
      created_by: req.user?.id || 1
    });

    addLog("Module Generation completed successfully!");
    return res.status(200).json({
      success: 1,
      message: "Module generated successfully",
      logs,
      files: createdFiles
    });

  } catch (err) {
    addLog(`FATAL ERROR encountered: ${err.message}`);
    addLog("Starting atomic rollback process...");

    // ROLLBACK DATABASE CHANGES
    if (dbTableCreated) {
      try {
        await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\`;`);
        addLog(`Rollback: Database table '${tableName}' dropped.`);
      } catch (dbErr) {
        addLog(`Rollback Error (db): ${dbErr.message}`);
      }
    }

    // ROLLBACK PERMISSIONS
    if (permissionsCreated.length > 0) {
      try {
        for (const pName of permissionsCreated) {
          const perm = await Permission.findOne({ where: { permission_name: pName } });
          if (perm) {
            await RolePermission.destroy({ where: { permission_id: perm.id } });
            await perm.destroy();
          }
        }
        addLog("Rollback: Created permissions and associations removed.");
      } catch (permErr) {
        addLog(`Rollback Error (permissions): ${permErr.message}`);
      }
    }

    // DELETE CREATED FILES & DIRECTORY
    createdFiles.forEach(fPath => {
      try {
        if (fs.existsSync(fPath)) {
          fs.unlinkSync(fPath);
          addLog(`Rollback: Deleted file '${path.basename(fPath)}'`);
        }
      } catch (fErr) {
        addLog(`Rollback Error (file delete): ${fErr.message}`);
      }
    });

    // Delete generated folder if empty
    const feDir = path.join(__dirname, "../../../frontend/src/pages", moduleName);
    try {
      if (fs.existsSync(feDir)) {
        const files = fs.readdirSync(feDir);
        if (files.length === 0) {
          fs.rmdirSync(feDir);
          addLog("Rollback: Removed empty frontend page directory.");
        }
      }
    } catch (dirErr) {
      addLog(`Rollback Error (directory remove): ${dirErr.message}`);
    }

    // RESTORE MODIFIED FILES CONTENT
    try {
      if (appJsxBackup && fs.existsSync(appJsxPath)) fs.writeFileSync(appJsxPath, appJsxBackup, "utf8");
      if (dashboardLayoutBackup && fs.existsSync(dashboardLayoutPath)) fs.writeFileSync(dashboardLayoutPath, dashboardLayoutBackup, "utf8");
      if (modelsIndexBackup && fs.existsSync(modelsIndexPath)) fs.writeFileSync(modelsIndexPath, modelsIndexBackup, "utf8");
      if (routesIndexBackup && fs.existsSync(routesIndexPath)) fs.writeFileSync(routesIndexPath, routesIndexBackup, "utf8");
      addLog("Rollback: Central configuration files restored to original states.");
    } catch (resErr) {
      addLog(`Rollback Error (restore content): ${resErr.message}`);
    }

    return res.status(500).json({
      success: 0,
      message: "Module generation failed. All actions rolled back.",
      logs,
      error: err.message
    });
  }
};

// POST /api/admin/developer/history/:id/rollback
const rollbackModule = async (req, res) => {
  const { id } = req.params;
  const logs = [];
  const addLog = (msg) => {
    console.log(`[ROLLBACK] ${msg}`);
    logs.push(msg);
  };

  try {
    const record = await ModuleGeneratorHistory.findByPk(id);
    if (!record) return res.status(404).json({ message: "History record not found" });

    let config = record.config;
    if (typeof config === "string") {
      try {
        config = JSON.parse(config);
      } catch (e) {
        config = {};
      }
    }

    const { moduleName, displayName, slug, tableName, menuGroup } = config || {};

    let files = record.files_generated;
    if (typeof files === "string") {
      try {
        files = JSON.parse(files);
      } catch (e) {
        files = [];
      }
    }
    if (!Array.isArray(files)) {
      files = [];
    }

    addLog(`Initiating rollback for module '${moduleName}'...`);

    // 1. Drop Database Table
    try {
      await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\`;`);
      addLog(`Database table '${tableName}' dropped.`);
    } catch (dbErr) {
      addLog(`Failed to drop database table: ${dbErr.message}`);
    }

    // 2. Delete permissions
    try {
      const permNames = [`${slug}_view`, `${slug}_add`, `${slug}_edit`, `${slug}_delete`, `${slug}_export`];
      for (const pName of permNames) {
        const perm = await Permission.findOne({ where: { permission_name: pName } });
        if (perm) {
          await RolePermission.destroy({ where: { permission_id: perm.id } });
          await perm.destroy();
        }
      }
      addLog("Permissions and role associations removed.");
    } catch (permErr) {
      addLog(`Failed to remove permissions: ${permErr.message}`);
    }

    // 3. Delete generated files
    files.forEach(fPath => {
      try {
        if (fs.existsSync(fPath)) {
          fs.unlinkSync(fPath);
          addLog(`Deleted file '${path.basename(fPath)}'`);
        }
      } catch (fErr) {
        addLog(`Failed to delete file '${fPath}': ${fErr.message}`);
      }
    });

    // Delete empty folder
    const feDir = path.join(__dirname, "../../../frontend/src/pages", moduleName);
    try {
      if (fs.existsSync(feDir)) {
        const remaining = fs.readdirSync(feDir);
        if (remaining.length === 0) {
          fs.rmdirSync(feDir);
          addLog(`Removed frontend page directory.`);
        }
      }
    } catch (dErr) {
      addLog(`Failed to remove frontend directory: ${dErr.message}`);
    }

    // 4. Remove entries from models/index.js, routes/index.js, App.jsx, DashboardLayout.jsx
    const appJsxPath = path.join(__dirname, "../../../frontend/src/App.jsx");
    const dashboardLayoutPath = path.join(__dirname, "../../../frontend/src/layouts/DashboardLayout.jsx");
    const modelsIndexPath = path.join(__dirname, "../../models/index.js");
    const routesIndexPath = path.join(__dirname, "../../routes/index.js");

    try {
      // Models index
      if (fs.existsSync(modelsIndexPath)) {
        let content = fs.readFileSync(modelsIndexPath, "utf8");
        
        // Robust regex to match models import
        const importRegex = new RegExp(`const\\s+${moduleName}\\s+=\\s+require\\(['"]\\.\\/${slug}Model['"]\\);?\\r?\\n?`, 'g');
        content = content.replace(importRegex, "");
        
        // Robust regex to match model associations block
        const assocRegex = new RegExp(`\\/\\/\\s*${moduleName}\\s+associations\\r?\\n?[\\s\\S]*?User\\.hasMany\\(${moduleName}.*?\\);?\\r?\\n?`, 'g');
        content = content.replace(assocRegex, "");
        
        // Remove model export reference
        content = content.replace(new RegExp(`,\\s*${moduleName}\\b`), "");
        
        fs.writeFileSync(modelsIndexPath, content, "utf8");
        addLog("Model registrations reverted from models/index.js.");
      }

      // Routes index
      if (fs.existsSync(routesIndexPath)) {
        let content = fs.readFileSync(routesIndexPath, "utf8");
        
        // Proven regex: matches full router.use("/slug", require("./slugRoutes")); including closing )
        const routeRegex = new RegExp(`router\\.use\\(['"]\\/${slug}['"],\\s*require\\(['"]\\.\\/${slug}Routes['"]\\)\\);?\\r?\\n?`, 'g');
        content = content.replace(routeRegex, "");
        
        fs.writeFileSync(routesIndexPath, content, "utf8");
        addLog("Route mount reverted from routes/index.js.");
      }

      // App.jsx
      if (fs.existsSync(appJsxPath)) {
        let content = fs.readFileSync(appJsxPath, "utf8");
        
        // Robust regex to match imports with either single or double quotes, semicolons, and cross-platform line-endings
        const importRegex = new RegExp(`import\\s+${moduleName}List\\s+from\\s+['"]\\.\\/pages\\/${moduleName}\\/${moduleName}List['"];?\\r?\\n?import\\s+${moduleName}Form\\s+from\\s+['"]\\.\\/pages\\/${moduleName}\\/${moduleName}Form['"];?\\r?\\n?`, 'g');
        content = content.replace(importRegex, "");
        
        // Proven regex: matches all 3 Routes for this slug ending on newline+spaces+/>
        // Verified clean on both LF (Unix) and CRLF (Windows) line endings
        const regexAppJsx = new RegExp(`\\s*<Route[^>]*path=["']${slug}["'][\\s\\S]*?path=["']${slug}\\/edit\\/:id["'][\\s\\S]*?\\n\\s*\\/>`);
        content = content.replace(regexAppJsx, "");
        
        fs.writeFileSync(appJsxPath, content, "utf8");
        addLog("Route path definitions reverted from App.jsx.");
      }

      // DashboardLayout.jsx
      if (fs.existsSync(dashboardLayoutPath)) {
        let content = fs.readFileSync(dashboardLayoutPath, "utf8");
        
        // Robust regex literal source to match sidebar menu entry (space-insensitive and quotes-insensitive)
        const regexLiteral = /,?\s*\{\s*name:\s*['"]DISPLAY_NAME['"],\s*path:\s*['"]\/SLUG['"],?[\s\S]*?\}/;
        const regexLayout = new RegExp(
          regexLiteral.source
            .replace("DISPLAY_NAME", (displayName || "").replace(/\s+/g, "\\s+"))
            .replace("SLUG", slug)
        );
        content = content.replace(regexLayout, "");
        
        const regexLiteralStandalone = /,?\s*\{\s*id:\s*['"]SLUG['"][\s\S]*?\},\s*/;
        const regexLayoutStandalone = new RegExp(
          regexLiteralStandalone.source.replace("SLUG", slug)
        );
        content = content.replace(regexLayoutStandalone, "");

        fs.writeFileSync(dashboardLayoutPath, content, "utf8");
        addLog("Sidebar menu entry reverted from DashboardLayout.jsx.");
      }

    } catch (strErr) {
      addLog(`Failed during central file reversion: ${strErr.message}`);
    }

    // 5. Delete History record
    await record.destroy();
    addLog(`Module rollback completed successfully.`);

    return res.status(200).json({ success: 1, logs });
  } catch (err) {
    console.error("rollbackModule error:", err);
    return res.status(500).json({ success: 0, message: "Rollback failed", error: err.message, logs });
  }
};

module.exports = {
  getHistory,
  deleteHistory,
  generateModule,
  rollbackModule
};
