const CustomerComplaint = require("../models/customerComplaintModel");

const generateComplaintId = async () => {
  const lastComplaint = await CustomerComplaint.findOne({
    attributes: ["complaint_id"],
    order: [["id", "DESC"]],
  });

  let nextNumber = 1;

  if (lastComplaint && lastComplaint.complaint_id) {
    const match = lastComplaint.complaint_id.match(/\d+/);

    if (match) {
      nextNumber = parseInt(match[0], 10) + 1;
    }
  }

  return `CMP${String(nextNumber).padStart(6, "0")}`;
};

module.exports = {
  generateComplaintId,
};