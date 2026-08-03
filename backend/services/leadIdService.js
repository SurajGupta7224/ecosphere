const WasteCollectionRequest = require("../models/wasteCollectionRequestModel");
const { Op } = require("sequelize");

const generateLeadId = async () => {
  const lastSequentialLead = await WasteCollectionRequest.findOne({
    attributes: ["lead_id"],
    where: {
      lead_id: {
        [Op.regexp]: "^LD[0-9]{6}$",
      },
    },
    order: [["lead_id", "DESC"]],
  });

  let nextNumber = 1;

  if (lastSequentialLead) {
    nextNumber =
      parseInt(lastSequentialLead.lead_id.replace("LD", ""), 10) + 1;
  }

  return `LD${String(nextNumber).padStart(6, "0")}`;
};

module.exports = {
  generateLeadId,
};