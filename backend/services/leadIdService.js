const WasteCollectionRequest = require("../models/wasteCollectionRequestModel");
const { Op } = require("sequelize");

const generateLeadId = async () => {
  // Use Op.like to find the highest sequential LD-prefixed lead ID.
  // This avoids Op.regexp compatibility issues across MySQL versions.
  const lastSequentialLead = await WasteCollectionRequest.findOne({
    attributes: ["lead_id"],
    where: {
      lead_id: {
        [Op.like]: "LD______", // matches LD followed by exactly 6 characters
      },
    },
    order: [["lead_id", "DESC"]],
  });

  let nextNumber = 1;

  if (lastSequentialLead) {
    const parsed = parseInt(lastSequentialLead.lead_id.replace("LD", ""), 10);
    if (!isNaN(parsed)) {
      nextNumber = parsed + 1;
    }
  }

  return `LD${String(nextNumber).padStart(6, "0")}`;
};

module.exports = {
  generateLeadId,
};