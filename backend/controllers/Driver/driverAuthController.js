const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Driver, Vehicle, Employee } = require("../../models/index");
const { sendDriverOTPEmail, sendDriverSMS } = require("../../services/emailService");

// POST /api/v1/driver/login - Driver Login
const loginDriver = async (req, res) => {
  try {
    const { vehicleNumber, password } = req.body;

    if (!vehicleNumber || !password) {
      return res.status(400).json({
        status: 0,
        message: "Vehicle number and password are required.",
        body: null
      });
    }

    // 1. Find driver using vehicleNumber (exact or trimmed match)
    const formattedVehicleNumber = vehicleNumber.trim();
    const driver = await Driver.findOne({
      where: { vehicle_number: formattedVehicleNumber },
      include: [
        { model: Vehicle, as: "vehicle" }
      ]
    });

    if (!driver) {
      return res.status(401).json({
        status: 0,
        message: "Invalid vehicle number or password.",
        body: null
      });
    }

    // 2. Verify vehicle is Approved
    if (!driver.vehicle || driver.vehicle.approval_status !== "approved") {
      return res.status(403).json({
        status: 0,
        message: "Vehicle is not approved.",
        body: null
      });
    }

    // 3. Verify driver status is Active
    if (driver.status !== "active") {
      return res.status(403).json({
        status: 0,
        message: "Driver account is inactive.",
        body: null
      });
    }

    // 4. Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 0,
        message: "Invalid vehicle number or password.",
        body: null
      });
    }

    // 5. Generate JWT Token
    const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret";
    const token = jwt.sign(
      {
        id: driver.id,
        vehicleNumber: driver.vehicle_number,
        type: "driver"
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    // 6. Return driver & vehicle details in requested format
    const responsePayload = {
      token,
      driver: {
        id: driver.id,
        name: driver.name
      },
      vehicle: {
        id: driver.vehicle ? driver.vehicle.id : (driver.vehicle_id || null),
        vehicleNumber: driver.vehicle ? (driver.vehicle.registration_number || driver.vehicle_number) : driver.vehicle_number
      }
    };

    return res.status(200).json({
      status: 1,
      message: "Login successful.",
      data: responsePayload
    });
  } catch (err) {
    console.error("loginDriver error:", err);
    return res.status(500).json({
      status: 0,
      message: "Internal server error during login.",
      body: null
    });
  }
};

// POST /api/v1/driver/forgot-password - Send OTP to registered Mobile/Email
const forgotPassword = async (req, res) => {
  try {
    const { vehicleNumber } = req.body;

    if (!vehicleNumber) {
      return res.status(400).json({
        status: 0,
        message: "Vehicle number is required.",
        body: null
      });
    }

    const formattedVehicleNumber = vehicleNumber.trim();
    const vehicle = await Vehicle.findOne({
      where: { registration_number: formattedVehicleNumber }
    });

    if (!vehicle) {
      return res.status(404).json({
        status: 0,
        message: "Vehicle not found.",
        body: null
      });
    }

    if (vehicle.approval_status !== "approved") {
      return res.status(403).json({
        status: 0,
        message: "Vehicle is not approved.",
        body: null
      });
    }

    const driver = await Driver.findOne({
      where: { vehicle_number: formattedVehicleNumber }
    });

    if (!driver) {
      return res.status(404).json({
        status: 0,
        message: "Driver account not found for this vehicle.",
        body: null
      });
    }

    if (driver.status !== "active") {
      return res.status(403).json({
        status: 0,
        message: "Driver account is inactive.",
        body: null
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    await driver.update({
      otp,
      otp_expiry: otpExpiry
    });

    // Send OTP via Email & SMS
    if (driver.email) {
      await sendDriverOTPEmail({
        toEmail: driver.email,
        driverName: driver.name,
        vehicleNumber: driver.vehicle_number,
        otp
      });
    }

    await sendDriverSMS({
      mobileNumber: driver.mobile_number,
      message: `Your Ecosphere password reset OTP for vehicle ${driver.vehicle_number} is: ${otp}. Valid for 10 minutes.`
    });

    return res.status(200).json({
      status: 1,
      message: "OTP sent successfully to registered mobile and email.",
      body: null
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({
      status: 0,
      message: "Failed to process forgot password request.",
      body: null
    });
  }
};

// POST /api/v1/driver/verify-otp - Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { vehicleNumber, otp } = req.body;

    if (!vehicleNumber || !otp) {
      return res.status(400).json({
        status: 0,
        message: "Vehicle number and OTP are required.",
        body: null
      });
    }

    const formattedVehicleNumber = vehicleNumber.trim();
    const driver = await Driver.findOne({
      where: { vehicle_number: formattedVehicleNumber }
    });

    if (!driver) {
      return res.status(404).json({
        status: 0,
        message: "Driver account not found.",
        body: null
      });
    }

    if (!driver.otp || driver.otp !== otp.toString().trim()) {
      return res.status(400).json({
        status: 0,
        message: "Invalid OTP code.",
        body: null
      });
    }

    if (!driver.otp_expiry || new Date() > new Date(driver.otp_expiry)) {
      return res.status(400).json({
        status: 0,
        message: "OTP has expired. Please request a new OTP.",
        body: null
      });
    }

    return res.status(200).json({
      status: 1,
      message: "OTP verified successfully.",
      body: null
    });
  } catch (err) {
    console.error("verifyOtp error:", err);
    return res.status(500).json({
      status: 0,
      message: "Failed to verify OTP.",
      body: null
    });
  }
};

// POST /api/v1/driver/reset-password - Set new password
const resetPassword = async (req, res) => {
  try {
    const { vehicleNumber, otp, newPassword } = req.body;

    if (!vehicleNumber || !otp || !newPassword) {
      return res.status(400).json({
        status: 0,
        message: "Vehicle number, OTP, and new password are required.",
        body: null
      });
    }

    const formattedVehicleNumber = vehicleNumber.trim();
    const driver = await Driver.findOne({
      where: { vehicle_number: formattedVehicleNumber }
    });

    if (!driver) {
      return res.status(404).json({
        status: 0,
        message: "Driver account not found.",
        body: null
      });
    }

    if (!driver.otp || driver.otp !== otp.toString().trim()) {
      return res.status(400).json({
        status: 0,
        message: "Invalid OTP code.",
        body: null
      });
    }

    if (!driver.otp_expiry || new Date() > new Date(driver.otp_expiry)) {
      return res.status(400).json({
        status: 0,
        message: "OTP has expired. Please request a new OTP.",
        body: null
      });
    }

    // Hash new password using bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update driver password and clear OTP fields
    await driver.update({
      password: hashedPassword,
      otp: null,
      otp_expiry: null
    });

    return res.status(200).json({
      status: 1,
      message: "Password reset successfully. You can now log in with your new password.",
      body: null
    });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({
      status: 0,
      message: "Failed to reset password.",
      body: null
    });
  }
};

// GET /api/v1/driver/me - Fetch authenticated driver profile (Protected Route)
const getDriverProfile = async (req, res) => {
  try {
    const driver = req.driver;
    if (!driver) {
      return res.status(401).json({
        status: 0,
        message: "Unauthorized driver session.",
        body: null
      });
    }

    return res.status(200).json({
      status: 1,
      message: "Driver profile fetched successfully.",
      body: {
        driver: {
          id: driver.id,
          vehicleNumber: driver.vehicle_number,
          name: driver.name,
          email: driver.email,
          mobileNumber: driver.mobile_number,
          status: driver.status,
          vehicle: driver.vehicle ? {
            id: driver.vehicle.id,
            registrationNumber: driver.vehicle.registration_number,
            brand: driver.vehicle.brand,
            model: driver.vehicle.model,
            vehicleType: driver.vehicle.vehicle_type,
            approvalStatus: driver.vehicle.approval_status
          } : null
        }
      }
    });
  } catch (err) {
    console.error("getDriverProfile error:", err);
    return res.status(500).json({
      status: 0,
      message: "Failed to fetch driver profile.",
      body: null
    });
  }
};

module.exports = {
  loginDriver,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getDriverProfile
};
