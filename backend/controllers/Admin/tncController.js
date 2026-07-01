const TncAcceptance = require("../../models/tncAcceptanceModel");

// POST /api/tnc/accept
// Stores which T&C checkboxes the logged-in user accepted
const acceptTnc = async (req, res) => {
  try {
    const { accepted_checkboxes } = req.body;

    if (!accepted_checkboxes) {
      return res.status(400).json({ message: "accepted_checkboxes is required." });
    }

    // Get user info from JWT token (set by verifyToken middleware)
    const user_id   = req.user?.id   || null;
    const user_name = req.user?.name || null;

    // Capture request metadata
    const ip_address = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
                    || req.connection?.remoteAddress
                    || null;
    const user_agent = req.headers['user-agent'] || null;

    // Ensure checkboxes is stored as JSON string
    const checkboxesStr = typeof accepted_checkboxes === 'string'
      ? accepted_checkboxes
      : JSON.stringify(accepted_checkboxes);

    const record = await TncAcceptance.create({
      user_id,
      user_name,
      accepted_checkboxes: checkboxesStr,
      accepted_at: new Date(),
      ip_address,
      user_agent,
    });

    return res.status(201).json({
      message: "T&C acceptance recorded successfully.",
      id: record.id,
    });
  } catch (err) {
    console.error("TNC Accept Error:", err);
    return res.status(500).json({ message: "Failed to record T&C acceptance." });
  }
};

module.exports = { acceptTnc };
