const { Category } = require("../../models/index");
const subCategoryService = require("../../services/subCategoryService");

/**
 * GET /api/sub-categories
 * Fetches all sub-categories with category and variations data.
 */
const getAllSubCategories = async (req, res) => {
  const isAdmin = req.user?.role?.role_name?.toLowerCase() === 'admin';
  const hasProductAccess = req.userPermissions?.includes('product_management');
  const hasSubCategoryAccess = req.userPermissions?.includes('sub_category_management');

  try {
    const result = await subCategoryService.getSubCategories(
      req.query,
      req.user.id,
      isAdmin,
      hasProductAccess,
      hasSubCategoryAccess
    );
    return res.status(200).json(result);
  } catch (err) {
    console.error("getAllSubCategories error:", err);
    return res.status(500).json({ message: "Failed to fetch sub-categories" });
  }
};

/**
 * Validate variation items helper.
 */
const validateVariations = (variations) => {
  if (!Array.isArray(variations)) {
    return "Variations must be an array";
  }
  for (let i = 0; i < variations.length; i++) {
    const v = variations[i];
    const rowNum = i + 1;
    if (!v.variation_name || v.variation_name.trim() === '') {
      return `Variation Name is required for row ${rowNum}`;
    }
    if (v.variation_name.length > 100) {
      return `Variation Name cannot exceed 100 characters in row ${rowNum}`;
    }
    if (v.number_of_sr === undefined || v.number_of_sr === null || v.number_of_sr === '' || isNaN(Number(v.number_of_sr)) || Number(v.number_of_sr) <= 0) {
      return `Number of SR must be greater than 0 in row ${rowNum}`;
    }
    if (v.schedule_after_days === undefined || v.schedule_after_days === null || v.schedule_after_days === '' || isNaN(Number(v.schedule_after_days)) || Number(v.schedule_after_days) <= 0) {
      return `Schedule After Days must be greater than 0 in row ${rowNum}`;
    }
    if (v.per_kg_price === undefined || v.per_kg_price === null || v.per_kg_price === '' || isNaN(Number(v.per_kg_price)) || Number(v.per_kg_price) < 0) {
      return `Par Kg Price must be greater than or equal to 0 in row ${rowNum}`;
    }
    if (v.bulk_price === undefined || v.bulk_price === null || v.bulk_price === '' || isNaN(Number(v.bulk_price)) || Number(v.bulk_price) < 0) {
      return `Bulk Price must be greater than or equal to 0 in row ${rowNum}`;
    }
    if (!v.status || !['Active', 'Inactive'].includes(v.status)) {
      return `Status must be 'Active' or 'Inactive' in row ${rowNum}`;
    }
  }
  return null;
};

/**
 * POST /api/sub-categories
 * Creates a sub-category along with its variations.
 */
const createSubCategory = async (req, res) => {
  const { category_id, name, color, slug, description, alt_tag, meta_title, meta_description, status } = req.body;
  const image = req.files && req.files.subcategory_image ? req.files.subcategory_image[0].filename : null;

  if (!category_id) {
    return res.status(400).json({ message: "Category is required" });
  }
  if (!name || !slug) {
    return res.status(400).json({ message: "Name and Slug are required" });
  }

  // Parse variations
  let variations = [];
  if (req.body.variations) {
    try {
      variations = typeof req.body.variations === 'string' 
        ? JSON.parse(req.body.variations) 
        : req.body.variations;
    } catch (e) {
      return res.status(400).json({ message: "Invalid variations format" });
    }
  }

  // Validate variations
  const varError = validateVariations(variations);
  if (varError) {
    return res.status(400).json({ message: varError });
  }

  // Verify the category exists
  const isAdmin = req.user?.role?.role_name?.toLowerCase() === 'admin';
  const hasSubCategoryAccess = req.userPermissions?.includes('sub_category_management');
  const categoryWhereClause = { id: category_id };
  
  if (!isAdmin && !hasSubCategoryAccess) {
    categoryWhereClause.user_id = req.user.id;
  }
  
  const categoryExists = await Category.findOne({ where: categoryWhereClause });
  if (!categoryExists) {
    return res.status(400).json({ message: "Selected category does not exist or access denied" });
  }

  try {
    const subCategoryData = {
      category_id,
      name,
      color,
      slug,
      description,
      image,
      alt_tag,
      meta_title,
      meta_description,
      status: status !== undefined ? status : 1,
    };

    const subCategory = await subCategoryService.createSubCategory(
      subCategoryData,
      variations,
      req.user.id
    );

    return res.status(201).json({ message: "Sub-category created successfully", subCategory });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Slug must be unique" });
    }
    console.error("createSubCategory error:", err);
    return res.status(500).json({ message: "Failed to create sub-category" });
  }
};

/**
 * PUT /api/sub-categories/:id
 * Updates a sub-category and its variations.
 */
const updateSubCategory = async (req, res) => {
  const { id } = req.params;
  const { category_id, name, color, slug, description, alt_tag, meta_title, meta_description, status } = req.body;

  // Parse variations
  let variations = undefined;
  if (req.body.variations !== undefined) {
    try {
      variations = typeof req.body.variations === 'string' 
        ? JSON.parse(req.body.variations) 
        : req.body.variations;
    } catch (e) {
      return res.status(400).json({ message: "Invalid variations format" });
    }

    // Validate variations
    const varError = validateVariations(variations);
    if (varError) {
      return res.status(400).json({ message: varError });
    }
  }

  const isAdmin = req.user?.role?.role_name?.toLowerCase() === 'admin';
  const hasSubCategoryAccess = req.userPermissions?.includes('sub_category_management');

  if (category_id) {
    const categoryWhereClause = { id: category_id };
    if (!isAdmin && !hasSubCategoryAccess) {
      categoryWhereClause.user_id = req.user.id;
    }
    const categoryExists = await Category.findOne({ where: categoryWhereClause });
    if (!categoryExists) {
      return res.status(400).json({ message: "Selected category does not exist or access denied" });
    }
  }

  try {
    const updateData = {};
    if (category_id !== undefined) updateData.category_id = category_id;
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (alt_tag !== undefined) updateData.alt_tag = alt_tag;
    if (meta_title !== undefined) updateData.meta_title = meta_title;
    if (meta_description !== undefined) updateData.meta_description = meta_description;
    if (status !== undefined) updateData.status = status;

    if (req.files && req.files.subcategory_image) {
      updateData.image = req.files.subcategory_image[0].filename;
    }

    const subCategory = await subCategoryService.updateSubCategory(
      id,
      updateData,
      variations,
      req.user.id,
      isAdmin,
      hasSubCategoryAccess
    );

    return res.status(200).json({ message: "Sub-category updated successfully", subCategory });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Slug must be unique" });
    }
    if (err.message === "Sub-category not found or access denied") {
      return res.status(404).json({ message: err.message });
    }
    console.error("updateSubCategory error:", err);
    return res.status(500).json({ message: "Failed to update sub-category" });
  }
};

/**
 * PATCH /api/sub-categories/:id/status
 * Toggles a sub-category's status.
 */
const toggleSubCategoryStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const isAdmin = req.user?.role?.role_name?.toLowerCase() === 'admin';
  const hasSubCategoryAccess = req.userPermissions?.includes('sub_category_management');

  try {
    await subCategoryService.toggleStatus(id, status, req.user.id, isAdmin, hasSubCategoryAccess);
    return res.status(200).json({ message: "Status updated successfully", status });
  } catch (err) {
    if (err.message === "Sub-category not found or access denied") {
      return res.status(404).json({ message: err.message });
    }
    return res.status(500).json({ message: "Failed to update status" });
  }
};

/**
 * DELETE /api/sub-categories/:id
 * Soft deletes a sub-category.
 */
const deleteSubCategory = async (req, res) => {
  const { id } = req.params;
  const isAdmin = req.user?.role?.role_name?.toLowerCase() === 'admin';
  const hasSubCategoryAccess = req.userPermissions?.includes('sub_category_management');

  try {
    await subCategoryService.deleteSubCategory(id, req.user.id, isAdmin, hasSubCategoryAccess);
    return res.status(200).json({ message: "Sub-category deleted successfully" });
  } catch (err) {
    if (err.message === "Sub-category not found or access denied") {
      return res.status(404).json({ message: err.message });
    }
    return res.status(500).json({ message: "Failed to delete sub-category" });
  }
};

module.exports = {
  getAllSubCategories,
  createSubCategory,
  updateSubCategory,
  toggleSubCategoryStatus,
  deleteSubCategory,
};
