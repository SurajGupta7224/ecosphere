const { SubCategory, Category, SubCategoryVariation } = require("../models/index");
const { Op } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Fetch all subcategories matching filter parameters.
 */
const getSubCategories = async (params, userId, isAdmin, hasProductAccess, hasSubCategoryAccess, hasRequestAccess) => {
  const { page = 1, limit = 10, search = '', status = '', category_id = '' } = params;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where.name = { [Op.like]: `%${search}%` };
  }
  if (status !== '') {
    if (status === 'Active' || status === '1' || status === 1) {
      where.status = 1;
    } else if (status === 'Inactive' || status === '0' || status === 0) {
      where.status = 0;
    } else {
      where.status = status;
    }
  }
  if (category_id !== '') {
    where.category_id = category_id;
  }

  // Ownership security check
  if (userId && !isAdmin && !hasProductAccess && !hasSubCategoryAccess && !hasRequestAccess) {
    where.user_id = userId;
  }

  const { count, rows } = await SubCategory.findAndCountAll({
    where,
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name"],
      },
      {
        model: SubCategoryVariation,
        as: "variations",
      }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [
      ["id", "DESC"],
      [{ model: SubCategoryVariation, as: "variations" }, "display_order", "ASC"]
    ],
  });

  return {
    subCategories: rows,
    total: count,
    pages: Math.ceil(count / limit),
    currentPage: parseInt(page),
  };
};

/**
 * Create a sub-category and its variations in a single transaction.
 */
const createSubCategory = async (subCategoryData, variations, userId) => {
  const t = await sequelize.transaction();
  try {
    const subCategory = await SubCategory.create({
      ...subCategoryData,
      user_id: userId,
    }, { transaction: t });

    if (variations && variations.length > 0) {
      const variationsData = variations.map((v, index) => ({
        subcategory_id: subCategory.id,
        variation_name: v.variation_name,
        number_of_sr: parseInt(v.number_of_sr),
        schedule_after_days: parseInt(v.schedule_after_days),
        per_kg_price: parseFloat(v.per_kg_price || 0),
        bulk_price: parseFloat(v.bulk_price || 0),
        status: v.status || 'Active',
        display_order: v.display_order !== undefined ? parseInt(v.display_order) : index,
      }));
      await SubCategoryVariation.bulkCreate(variationsData, { transaction: t });
    }

    await t.commit();

    // Fetch the fully created sub-category with its variations
    return await SubCategory.findOne({
      where: { id: subCategory.id },
      include: [{ model: SubCategoryVariation, as: "variations" }],
      order: [[{ model: SubCategoryVariation, as: "variations" }, "display_order", "ASC"]]
    });
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

/**
 * Update a sub-category and synchronize its variations in a single transaction.
 */
const updateSubCategory = async (id, subCategoryData, variations, userId, isAdmin, hasSubCategoryAccess) => {
  const whereClause = { id };
  if (!isAdmin && !hasSubCategoryAccess) {
    whereClause.user_id = userId;
  }

  const subCategory = await SubCategory.findOne({ where: whereClause });
  if (!subCategory) {
    throw new Error("Sub-category not found or access denied");
  }

  const t = await sequelize.transaction();
  try {
    await subCategory.update(subCategoryData, { transaction: t });

    if (variations) {
      // Find existing variation IDs in the DB
      const incomingIds = variations
        .filter(v => v.id)
        .map(v => parseInt(v.id));

      // 1. Delete variations not present in incoming list
      await SubCategoryVariation.destroy({
        where: {
          subcategory_id: id,
          id: { [Op.notIn]: incomingIds.length > 0 ? incomingIds : [-1] }
        },
        transaction: t
      });

      // 2. Insert or update the incoming variations
      for (let i = 0; i < variations.length; i++) {
        const v = variations[i];
        const variationData = {
          subcategory_id: id,
          variation_name: v.variation_name,
          number_of_sr: parseInt(v.number_of_sr),
          schedule_after_days: parseInt(v.schedule_after_days),
          per_kg_price: parseFloat(v.per_kg_price || 0),
          bulk_price: parseFloat(v.bulk_price || 0),
          status: v.status || 'Active',
          display_order: v.display_order !== undefined ? parseInt(v.display_order) : i,
        };

        if (v.id) {
          await SubCategoryVariation.update(variationData, {
            where: { id: v.id, subcategory_id: id },
            transaction: t
          });
        } else {
          await SubCategoryVariation.create(variationData, { transaction: t });
        }
      }
    }

    await t.commit();

    // Fetch the updated sub-category with its variations
    return await SubCategory.findOne({
      where: { id },
      include: [{ model: SubCategoryVariation, as: "variations" }],
      order: [[{ model: SubCategoryVariation, as: "variations" }, "display_order", "ASC"]]
    });
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

/**
 * Toggle the status of a sub-category.
 */
const toggleStatus = async (id, status, userId, isAdmin, hasSubCategoryAccess) => {
  const whereClause = { id };
  if (!isAdmin && !hasSubCategoryAccess) {
    whereClause.user_id = userId;
  }

  const subCategory = await SubCategory.findOne({ where: whereClause });
  if (!subCategory) {
    throw new Error("Sub-category not found or access denied");
  }

  await subCategory.update({ status });
  return subCategory;
};

/**
 * Soft delete a sub-category (status = 0).
 */
const deleteSubCategory = async (id, userId, isAdmin, hasSubCategoryAccess) => {
  const whereClause = { id };
  if (!isAdmin && !hasSubCategoryAccess) {
    whereClause.user_id = userId;
  }

  const subCategory = await SubCategory.findOne({ where: whereClause });
  if (!subCategory) {
    throw new Error("Sub-category not found or access denied");
  }

  await subCategory.update({ status: 0 });
  return subCategory;
};

module.exports = {
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  toggleStatus,
  deleteSubCategory,
};
