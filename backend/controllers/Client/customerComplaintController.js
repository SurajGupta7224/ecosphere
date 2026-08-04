const CustomerComplaint = require("../../models/customerComplaintModel");
const { generateComplaintId } = require("../../services/complaintIdService");

const { sendComplaintConfirmationEmail } = require("../../services/emailService");

const createComplaint = async (req, res) => {
  try {
    const customer = req.user;

    const {
      subject,
      description
    } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: 0,
        message: "Subject and description are required."
      });
    }

    const complaintId = await generateComplaintId();

    const attachment = req.file ? req.file.filename : null;

    const complaint = await CustomerComplaint.create({
      complaint_id: complaintId,

      customer_id: customer.id,
      customer_name: customer.customer_name,
      customer_email: customer.email,

      subject,
      description,

      attachment,

      status: "Pending"
    });
     
    await sendComplaintConfirmationEmail({
  toEmail: complaint.customer_email,
  customerName: complaint.customer_name,
  complaintId: complaint.complaint_id,
  subject: complaint.subject,
  description: complaint.description,
  status: complaint.status,
});

    return res.status(201).json({
      success: 1,
      message: "Complaint submitted successfully.",
      data: complaint
    });

  } catch (error) {
    console.error("Create Complaint Error:", error);

    return res.status(500).json({
      success: 0,
      message: "Internal Server Error"
    });
  }
};


// GET /api/customer/complaints
const getMyComplaints = async (req, res) => {
  try {
    const customer = req.user;

    const complaints = await CustomerComplaint.findAll({
      where: {
        customer_id: customer.id,
      },
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: 1,
      count: complaints.length,
      data: complaints,
    });

  } catch (error) {
    console.error("Get My Complaints Error:", error);

    return res.status(500).json({
      success: 0,
      message: "Internal Server Error",
    });
  }
};

// GET /api/customer/complaints/:id
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = req.user;

    const complaint = await CustomerComplaint.findOne({
      where: {
        id,
        customer_id: customer.id,
      },
    });

    if (!complaint) {
      return res.status(404).json({
        success: 0,
        message: "Complaint not found.",
      });
    }

    return res.status(200).json({
      success: 1,
      data: complaint,
    });

  } catch (error) {
    console.error("Get Complaint By Id Error:", error);

    return res.status(500).json({
      success: 0,
      message: "Internal Server Error",
    });
  }
};


module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
};