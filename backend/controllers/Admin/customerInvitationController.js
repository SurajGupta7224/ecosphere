const { sendCustomerInvitationEmail } = require("../../services/emailService");
const WasteCollectionRequest = require("../../models/wasteCollectionRequestModel");

const bcrypt = require("bcrypt");
const Customer = require("../../models/customerModel");

const { Op } = require("sequelize");

const {
  generateProductionPassword,
  sendCustomerCredentialsEmail
} = require("../../services/emailService");


const sendInvitation = async (req, res) => {
  try {
    const { customer_name, email, mobile } = req.body;

    // Basic validation
    if (!customer_name || !email) {
      return res.status(400).json({
        success: 0,
        message: "Customer name and email are required.",
      });
    }

    // Registration URL
    const registrationLink =
      `${process.env.CLIENT_URL || "http://localhost:5173"}/customer-registration` +
      `?email=${encodeURIComponent(email)}&mobile=${encodeURIComponent(mobile || "")}`;

    // Send invitation email
    const emailSent = await sendCustomerInvitationEmail({
      toEmail: email,
      customerName: customer_name,
      registrationLink,
    });

    if (!emailSent) {
      return res.status(500).json({
        success: 0,
        message: "Failed to send invitation email.",
      });
    }

    return res.status(200).json({
      success: 1,
      message: "Invitation email sent successfully.",
      data: {
        customer_name,
        email,
        mobile,
      },
    });

  } catch (error) {
    console.error("Send Invitation Error:", error);

    return res.status(500).json({
      success: 0,
      message: "Internal Server Error",
    });
  }
};

// Approve Customer Registration

const approveCustomerRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await WasteCollectionRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({
        success: 0,
        message: "Registration request not found.",
      });
    }

    if (request.status === "Approved") {
      return res.status(400).json({
        success: 0,
        message: "Customer is already approved.",
      });
    }

    // Check if customer already exists
const existingCustomer = await Customer.findOne({
  where: {
    [Op.or]: [
      { email: request.email },
      { mobile: request.mobile_number }
    ]
  }
});

if (existingCustomer) {
  return res.status(400).json({
    success: 0,
    message: "A customer with this email or mobile number already exists.",
  });
}

// Generate password
const plainPassword = generateProductionPassword();

// Hash password
const hashedPassword = await bcrypt.hash(plainPassword, 10);

// Create customer
const customer = await Customer.create({
  customer_name: request.customer_legal_name,
  mobile: request.mobile_number,
  email: request.email,
  password: hashedPassword,
  login_type: "email",
  customer_type: "website",
  created_by: "admin",
});

// Update request
request.customer_id = customer.id;
request.status = "Approved";
request.approved_by = req.user.id;
request.approved_date = new Date();

await request.save();

await sendCustomerCredentialsEmail({
  toEmail: customer.email,
  plainPassword,
  orderId: request.lead_id,
  customerName: customer.customer_name,
  isNewAccount: true,
});

return res.status(200).json({
  success: 1,
  message: "Customer approved successfully. Login credentials have been sent to the customer's email.",
  data: customer,
});

  } catch (error) {
    console.error("Approve Registration Error:", error);

    return res.status(500).json({
      success: 0,
      message: "Internal Server Error",
    });
  }
};


// Generate a random password for the customer

// const generatePassword = () => {
//   const chars =
//     "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$";
//   let password = "";

//   for (let i = 0; i < 10; i++) {
//     password += chars.charAt(Math.floor(Math.random() * chars.length));
//   }

//   return password;
// };

module.exports = {
    sendInvitation,
    approveCustomerRegistration,
};