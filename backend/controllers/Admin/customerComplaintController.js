const CustomerComplaint = require("../../models/customerComplaintModel");

const { sendComplaintResolutionEmail } = require("../../services/emailService");

const { Op } = require("sequelize");

const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const buildComplaintWhereClause = require("../../services/complaintFilterService");

// GET /api/admin/complaints
const getAllComplaints = async (req, res) => {
  try {
    const {
  page = 1,
  limit = 10,
  search = "",
  status = "",
  from = "",
  to = "",
} = req.query;

    const offset = (page - 1) * limit;

    const where = buildComplaintWhereClause(req.query);

    // Status Filter
    if (status) {
      where.status = status;
    }
      
    // Date Range Filter
if (from && to) {
  where.created_at = {
    [Op.between]: [
      new Date(`${from} 00:00:00`),
      new Date(`${to} 23:59:59`)
    ]
  };
}
    // Search
    if (search) {
      where[Op.or] = [
        {
          complaint_id: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          customer_name: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          customer_email: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          subject: {
            [Op.like]: `%${search}%`,
          },
        },
      ];
    }

    const { count, rows } = await CustomerComplaint.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: 1,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: rows,
    });

  } catch (error) {
    console.error("Get Complaints Error:", error);

    return res.status(500).json({
      success: 0,
      message: "Internal Server Error",
    });
  }
};
// PATCH /api/admin/complaints/:id
const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_reply } = req.body;

    const complaint = await CustomerComplaint.findByPk(id);

    if (!complaint) {
      return res.status(404).json({
        success: 0,
        message: "Complaint not found.",
      });
    }

    complaint.status = status || complaint.status;
    complaint.admin_reply = admin_reply || complaint.admin_reply;
    complaint.replied_by = req.user.id;
    complaint.replied_at = new Date();

    await complaint.save();

    await sendComplaintResolutionEmail({
  toEmail: complaint.customer_email,
  customerName: complaint.customer_name,
  complaintId: complaint.complaint_id,
  subject: complaint.subject,
  status: complaint.status,
  adminReply: complaint.admin_reply,
});

    return res.status(200).json({
      success: 1,
      message: "Complaint updated successfully.",
      data: complaint,
    });

  } catch (error) {
    console.error("Update Complaint Error:", error);

    return res.status(500).json({
      success: 0,
      message: "Internal Server Error",
    });
  }
};

// GET /api/admin/complaints/:id
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await CustomerComplaint.findByPk(id);

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
    console.error("Get Complaint Details Error:", error);

    return res.status(500).json({
      success: 0,
      message: "Internal Server Error",
    });
  }
};


// GET /api/admin/complaints/dashboard

const getComplaintDashboard = async (req, res) => {
  try {
    const total = await CustomerComplaint.count();

    const pending = await CustomerComplaint.count({
      where: { status: "Pending" },
    });

    const inProgress = await CustomerComplaint.count({
      where: { status: "In Progress" },
    });

    const resolved = await CustomerComplaint.count({
      where: { status: "Resolved" },
    });

    const closed = await CustomerComplaint.count({
      where: { status: "Closed" },
    });

    return res.status(200).json({
      success: 1,
      data: {
        total,
        pending,
        in_progress: inProgress,
        resolved,
        closed,
      },
    });

  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: 0,
      message: "Internal Server Error",
    });
  }
};




// GET /api/admin/complaints/export
const exportComplaints = async (req, res) => {
  try {
    const {
      format = "excel",
      from = "",
      to = ""
    } = req.query;

    const where = buildComplaintWhereClause(req.query);

    const complaints = await CustomerComplaint.findAll({
      where,
      order: [["created_at", "DESC"]],
    });

    
    // PDF EXPORT
    
    if (format.toLowerCase() === "pdf") {

      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
      });

      const fileName =
        from && to
          ? `Complaint_Report_${from}_to_${to}.pdf`
          : "Complaint_Report.pdf";

      res.setHeader("Content-Type", "application/pdf");

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${fileName}`
      );

      doc.pipe(res);

      doc
        .fontSize(18)
        .text("EcoSphere Waste Solutions", {
          align: "center",
        });

      doc.moveDown();

      doc
        .fontSize(15)
        .text("Customer Complaint Report", {
          align: "center",
        });

      doc.moveDown();

      doc
        .fontSize(10)
        .text(`Generated On : ${new Date().toLocaleString()}`);

      if (from && to) {
        doc.text(`Date Range : ${from} to ${to}`);
      }

      doc.moveDown();

      complaints.forEach((item, index) => {

        doc
          .fontSize(12)
          .text(`${index + 1}. Complaint ID : ${item.complaint_id}`);

        doc.fontSize(10);

        doc.text(`Customer : ${item.customer_name}`);
        doc.text(`Email : ${item.customer_email}`);
        doc.text(`Subject : ${item.subject}`);
        doc.text(`Status : ${item.status}`);
        doc.text(`Description : ${item.description}`);
        doc.text(`Admin Reply : ${item.admin_reply || "-"}`);
        doc.text(
          `Created : ${new Date(item.created_at).toLocaleString()}`
        );

        if (item.replied_at) {
          doc.text(
            `Replied : ${new Date(item.replied_at).toLocaleString()}`
          );
        }

        doc.moveDown();

        doc
          .moveTo(40, doc.y)
          .lineTo(550, doc.y)
          .stroke();

        doc.moveDown();
      });

      doc.end();

      return;
    }

   
    // EXCEL EXPORT
   

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet("Complaints");

    worksheet.columns = [
      { header: "Complaint ID", key: "complaint_id", width: 20 },
      { header: "Customer Name", key: "customer_name", width: 25 },
      { header: "Customer Email", key: "customer_email", width: 30 },
      { header: "Subject", key: "subject", width: 30 },
      { header: "Description", key: "description", width: 45 },
      { header: "Status", key: "status", width: 18 },
      { header: "Admin Reply", key: "admin_reply", width: 45 },
      { header: "Created Date", key: "created_at", width: 25 },
      { header: "Replied Date", key: "replied_at", width: 25 },
    ];

    worksheet.getRow(1).font = {
      bold: true,
    };

    complaints.forEach((item) => {

      worksheet.addRow({

        complaint_id: item.complaint_id,

        customer_name: item.customer_name,

        customer_email: item.customer_email,

        subject: item.subject,

        description: item.description,

        status: item.status,

        admin_reply: item.admin_reply || "-",

        created_at: item.created_at,

        replied_at: item.replied_at || "-",

      });

    });

    const fileName =
      from && to
        ? `Complaint_Report_${from}_to_${to}.xlsx`
        : "Complaint_Report.xlsx";

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileName}`
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (error) {

    console.error("Export Complaint Error:", error);

    return res.status(500).json({
      success: 0,
      message: "Failed to export complaints.",
    });

  }
};



module.exports = {
  getAllComplaints,
  updateComplaint,
  getComplaintById,
  getComplaintDashboard,
  exportComplaints,
};