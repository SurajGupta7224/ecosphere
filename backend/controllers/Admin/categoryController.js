const { Category } = require("../../models/index");
const { Op } = require("sequelize");

// GET /api/categories
const getAllCategories = async (req, res) => {
  const { page = 1, limit = 10, search = '', status = '' } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where.name = { [Op.like]: `%${search}%` };
  }
  if (status !== '') {
    where.status = status;
  }

  // Check if user is admin or has product_management or category_management permission
  const isAdmin = req.user?.role?.role_name?.toLowerCase() === 'admin';
  const hasProductAccess = req.userPermissions?.includes('product_management');
  const hasCategoryAccess = req.userPermissions?.includes('category_management');
  
  // If not admin AND doesn't have product access AND doesn't have category access, filter by user_id
  if (!isAdmin && !hasProductAccess && !hasCategoryAccess) {
    where.user_id = req.user.id;
  }

  try {
    const { count, rows } = await Category.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']]
    });

    return res.status(200).json({
      categories: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error("getAllCategories error:", err);
    return res.status(500).json({ message: "Failed to fetch categories" });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  const { name, slug, description, meta_title, meta_description, status } = req.body;
  const image = req.files && req.files.category_image ? req.files.category_image[0].filename : null;

  if (!name || !slug) {
    return res.status(400).json({ message: "Name and Slug are required" });
  }

  try {
    const category = await Category.create({
      name,
      slug,
      description,
      user_id: req.user.id, // Assign ownership
      image,
      meta_title,
      meta_description,
      status: status !== undefined ? status : 1
    });

    return res.status(201).json({ message: "Category created successfully", category });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Slug must be unique" });
    }
    console.error("createCategory error:", err);
    return res.status(500).json({ message: "Failed to create category" });
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, slug, description, meta_title, meta_description, status } = req.body;
  
  try {
    const isAdmin = req.user?.role?.role_name?.toLowerCase() === 'admin';
    const hasCategoryAccess = req.userPermissions?.includes('category_management');
    const whereClause = { id };
    
    // If not admin and doesn't have category access, only allow updating own categories
    if (!isAdmin && !hasCategoryAccess) {
      whereClause.user_id = req.user.id;
    }
    
    const category = await Category.findOne({ where: whereClause });
    if (!category) return res.status(404).json({ message: "Category not found or access denied" });

    const updateData = {
      name: name || category.name,
      slug: slug || category.slug,
      description: description !== undefined ? description : category.description,
      meta_title: meta_title !== undefined ? meta_title : category.meta_title,
      meta_description: meta_description !== undefined ? meta_description : category.meta_description,
      status: status !== undefined ? status : category.status
    };

    if (req.files && req.files.category_image) {
      updateData.image = req.files.category_image[0].filename;
    }

    await category.update(updateData);
    return res.status(200).json({ message: "Category updated successfully", category });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Slug must be unique" });
    }
    console.error("updateCategory error:", err);
    return res.status(500).json({ message: "Failed to update category" });
  }
};

// PATCH /api/categories/:id/status
const toggleCategoryStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const isAdmin = req.user?.role?.role_name?.toLowerCase() === 'admin';
    const hasCategoryAccess = req.userPermissions?.includes('category_management');
    const whereClause = { id };
    
    // If not admin and doesn't have category access, only allow updating own categories
    if (!isAdmin && !hasCategoryAccess) {
      whereClause.user_id = req.user.id;
    }
    
    const category = await Category.findOne({ where: whereClause });
    if (!category) return res.status(404).json({ message: "Category not found or access denied" });

    await category.update({ status });
    return res.status(200).json({ message: "Status updated successfully", status });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update status" });
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const isAdmin = req.user?.role?.role_name?.toLowerCase() === 'admin';
    const hasCategoryAccess = req.userPermissions?.includes('category_management');
    const whereClause = { id };
    
    // If not admin and doesn't have category access, only allow deleting own categories
    if (!isAdmin && !hasCategoryAccess) {
      whereClause.user_id = req.user.id;
    }
    
    const category = await Category.findOne({ where: whereClause });
    if (!category) return res.status(404).json({ message: "Category not found or access denied" });

    // Recommendation: Soft delete via status = 0
    await category.update({ status: 0 });
    // Or hard delete if preferred: await category.destroy();
    
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete category" });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory
};
