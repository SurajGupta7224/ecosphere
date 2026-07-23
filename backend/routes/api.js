const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Customer } = require("../models");
const { verifyToken } = require("../middleware/authMiddleware");

// Helper to generate a simple OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
};

// POST /api/customer/register (Email/Password registration)
router.post("/customer/register", async (req, res) => {
  const { customer_name, email, password, mobile } = req.body || {};

  if (!email || !password || !customer_name) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required" });
  }

  try {
    const existingEmail = await Customer.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "A customer account with this email already exists" });
    }

    if (mobile) {
      const existingMobile = await Customer.findOne({ where: { mobile } });
      if (existingMobile) {
        return res.status(400).json({ success: false, message: "A customer account with this mobile number already exists" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      customer_name,
      email,
      mobile: mobile || null,
      password: hashedPassword,
      login_type: "email",
      status: "active",
      customer_type: "website",
      created_by: "customer",
      notification_status: true
    });

    const token = jwt.sign({ id: customer.id }, process.env.JWT_SECRET, {
      expiresIn: "30d"
    });

    await customer.update({ jwt_token: token });

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      token,
      customer: {
        id: customer.id,
        customer_name: customer.customer_name,
        email: customer.email,
        mobile: customer.mobile,
        login_type: customer.login_type,
        customer_type: customer.customer_type,
        created_by: customer.created_by
      }
    });
  } catch (err) {
    console.error("customer register error:", err);
    return res.status(500).json({ success: false, message: "Registration failed", error: err.message });
  }
});

// POST /api/customer/login (Email/Password login)
router.post("/customer/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    const customer = await Customer.findOne({ where: { email } });

    if (!customer) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (customer.status !== "active") {
      return res.status(403).json({ success: false, message: "Your account is suspended. Please contact support." });
    }

    if (!customer.password) {
      return res.status(400).json({ 
        success: false, 
        message: "No password configured for this account. Please use OTP to login or contact support." 
      });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: customer.id }, process.env.JWT_SECRET, {
      expiresIn: "30d"
    });

    await customer.update({ jwt_token: token });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      customer: {
        id: customer.id,
        customer_name: customer.customer_name,
        email: customer.email,
        mobile: customer.mobile,
        profie_pic: customer.profie_pic,
        referral_code: customer.referral_code,
        referral_id: customer.referral_id,
        notification_status: customer.notification_status,
        login_type: customer.login_type,
        customer_type: customer.customer_type,
        created_by: customer.created_by
      }
    });
  } catch (err) {
    console.error("customer login error:", err);
    return res.status(500).json({ success: false, message: "Login failed", error: err.message });
  }
});

// POST /api/customer/forgot-password (Request reset OTP)
router.post("/customer/forgot-password", async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      return res.status(404).json({ success: false, message: "No customer account registered with this email" });
    }

    const otp = generateOTP();
    await customer.update({ otp });

    // Print to backend stdout for local convenience
    console.log(`\n--- PASSWORD RESET OTP FOR ${email} ---`);
    console.log(`OTP: ${otp}`);
    console.log(`-----------------------------------------\n`);

    return res.status(200).json({
      success: true,
      message: "Reset OTP sent successfully to your email",
      otp // Returning OTP directly in response for local testing convenience
    });
  } catch (err) {
    console.error("forgot-password error:", err);
    return res.status(500).json({ success: false, message: "Failed to send reset OTP", error: err.message });
  }
});

// POST /api/customer/reset-password (Reset password with OTP verification)
router.post("/customer/reset-password", async (req, res) => {
  const { email, otp, new_password } = req.body || {};

  if (!email || !otp || !new_password) {
    return res.status(400).json({ success: false, message: "Email, OTP, and new password are required" });
  }

  try {
    const customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer account not found" });
    }

    if (customer.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await customer.update({ password: hashedPassword, otp: null });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login with your new password."
    });
  } catch (err) {
    console.error("reset-password error:", err);
    return res.status(500).json({ success: false, message: "Failed to reset password", error: err.message });
  }
});

// 1. POST /api/customer/send-otp (Signup / Login Trigger)
router.post("/customer/send-otp", async (req, res) => {
  const { email, mobile, login_type } = req.body || {};

  if (login_type === "email" && !email) {
    return res.status(400).json({ success: false, message: "Email is required for email login" });
  }
  if (login_type === "mobile" && !mobile) {
    return res.status(400).json({ success: false, message: "Mobile is required for mobile login" });
  }
  if (!login_type) {
    return res.status(400).json({ success: false, message: "login_type (email/mobile) is required" });
  }

  try {
    const otp = generateOTP();
    let customer = null;

    if (login_type === "email") {
      customer = await Customer.findOne({ where: { email } });
    } else {
      customer = await Customer.findOne({ where: { mobile } });
    }

    if (!customer) {
      // Auto-register new customer account
      customer = await Customer.create({
        customer_name: email ? email.split("@")[0] : "Customer",
        email: email || null,
        mobile: mobile || null,
        login_type,
        otp,
        status: "active",
        customer_type: "website", // Web sign-up
        created_by: "customer", // Self registered
        notification_status: true
      });
    } else {
      // Update OTP and login method for existing customer
      await customer.update({ otp, login_type });
    }

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to your ${login_type}`,
      otp // Returning OTP directly in response for local testing convenience
    });
  } catch (err) {
    console.error("send-otp error:", err);
    return res.status(500).json({ success: false, message: "Failed to send OTP", error: err.message });
  }
});

// 2. POST /api/customer/verify-otp (Verify & Login)
router.post("/customer/verify-otp", async (req, res) => {
  const { email, mobile, otp } = req.body || {};

  if (!otp) {
    return res.status(400).json({ success: false, message: "OTP is required" });
  }

  try {
    let customer = null;
    if (email) {
      customer = await Customer.findOne({ where: { email } });
    } else if (mobile) {
      customer = await Customer.findOne({ where: { mobile } });
    }

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer account not found" });
    }

    if (customer.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Generate JWT token for storefront customer authentication
    const token = jwt.sign({ id: customer.id }, process.env.JWT_SECRET, {
      expiresIn: "30d" // 30 days session
    });

    // Save token to database
    await customer.update({ jwt_token: token, otp: null });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      customer: {
        id: customer.id,
        customer_name: customer.customer_name,
        email: customer.email,
        mobile: customer.mobile,
        profie_pic: customer.profie_pic,
        referral_code: customer.referral_code,
        referral_id: customer.referral_id,
        notification_status: customer.notification_status,
        login_type: customer.login_type,
        customer_type: customer.customer_type,
        created_by: customer.created_by
      }
    });
  } catch (err) {
    console.error("verify-otp error:", err);
    return res.status(500).json({ success: false, message: "Verification failed", error: err.message });
  }
});

// 3. GET /api/customer/profile (Fetch authenticated customer details)
router.get("/customer/profile", verifyToken, async (req, res) => {
  try {
    // req.user contains the verified customer object from authMiddleware
    return res.status(200).json({
      success: true,
      customer: req.user
    });
  } catch (err) {
    console.error("profile fetch error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
});

// 4. PUT /api/customer/profile (Update authenticated customer details)
router.put("/customer/profile", verifyToken, async (req, res) => {
  const { customer_name, profie_pic, notification_status } = req.body || {};

  try {
    const customer = await Customer.findByPk(req.user.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer profile not found" });
    }

    await customer.update({
      customer_name: customer_name !== undefined ? customer_name : customer.customer_name,
      profie_pic: profie_pic !== undefined ? profie_pic : customer.profie_pic,
      notification_status: notification_status !== undefined ? notification_status : customer.notification_status
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      customer
    });
  } catch (err) {
    console.error("profile update error:", err);
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
});

module.exports = router;
