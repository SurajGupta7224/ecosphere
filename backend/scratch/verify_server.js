const { WasteCollectionRequest, User } = require("../models/index");
console.log("WasteCollectionRequest model successfully loaded:", WasteCollectionRequest ? "Yes" : "No");
console.log("WasteCollectionRequest associations:", Object.keys(WasteCollectionRequest.associations));
const controller = require("../controllers/Admin/wasteCollectionRequestController");
console.log("Controller successfully loaded:", controller ? "Yes" : "No");
console.log("SUCCESS: Verification script passed!");
process.exit(0);
