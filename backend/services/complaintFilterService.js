const { Op } = require("sequelize");

const buildComplaintWhereClause = (query) => {
  const {
    search = "",
    status = "",
    from = "",
    to = "",
    type = "",
  } = query;

  const where = {};

  // Status
  if (status) {
    where.status = status;
  }

  // Search
  if (search) {
    where[Op.or] = [
      { complaint_id: { [Op.like]: `%${search}%` } },
      { customer_name: { [Op.like]: `%${search}%` } },
      { customer_email: { [Op.like]: `%${search}%` } },
      { subject: { [Op.like]: `%${search}%` } },
    ];
  }

  let startDate = null;
  let endDate = null;

  // Quick filters
  if (type) {
    const today = new Date();

    switch (type.toLowerCase()) {
      case "daily":
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        break;

      case "weekly":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);

        endDate = new Date(today);
        endDate.setHours(23, 59, 59);
        break;

      case "monthly":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);

        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59);
        break;

      case "yearly":
        startDate = new Date(today.getFullYear(), 0, 1);

        endDate = new Date(today.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59);
        break;
    }
  }

  // Custom date range overrides quick filters
  if (from && to) {
    startDate = new Date(`${from} 00:00:00`);
    endDate = new Date(`${to} 23:59:59`);
  }

  if (startDate && endDate) {
    where.created_at = {
      [Op.between]: [startDate, endDate],
    };
  }

  return where;
};

module.exports = buildComplaintWhereClause;