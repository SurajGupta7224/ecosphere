const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const svgCaptcha = require("svg-captcha");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const crypto = require("crypto");
const { User, Role, Permission, SystemSettings, SecuritySettings } = require("../../models/index");
const { type } = require("os");

// GET /api/admin/auth/captcha
const generateCaptcha = async (req, res) => {
  try {
    const security = await SecuritySettings.findByPk(1);
    if (!security || !security.captcha_enabled) {
      return res.json({ success: true, captchaEnabled: false });
    }

    const captcha = svgCaptcha.create({
      size: 4,
      noise: 2,
      color: true,
      background: "#f8fafc"
    });

    const token = jwt.sign(
      { text: captcha.text.toLowerCase() },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    res.json({
      success: true,
      captchaEnabled: true,
      captchaImg: captcha.data,
      captchaToken: token
    });
  } catch (err) {
    console.error("Captcha generation error:", err);
    res.status(500).json({ success: false, message: "Error generating captcha" });
  }
};

// POST /api/admin/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const security = await SecuritySettings.findByPk(1);

    // 1. Verify CAPTCHA if enabled
    if (security && security.captcha_enabled) {
      const { captcha_input, captcha_token } = req.body;
      if (!captcha_input || !captcha_token) {
        return res.status(400).json({ message: "CAPTCHA verification is required" });
      }
      try {
        const decoded = jwt.verify(captcha_token, process.env.JWT_SECRET);
        if (decoded.text !== captcha_input.toLowerCase()) {
          return res.status(400).json({ message: "Incorrect CAPTCHA entered. Please try again." });
        }
      } catch (err) {
        return res.status(400).json({ message: "CAPTCHA challenge expired. Please click the CAPTCHA to refresh." });
      }
    }

    const user = await User.findOne({
      where: { email, status: "active" },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "role_name"],
          include: [
            {
              model: Permission,
              as: "permissions",
              attributes: ["permission_name"],
              through: { attributes: [] }
            }
          ]
        }
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check account lockout
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const remainingMinutes = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      return res.status(403).json({
        message: `Your account is temporarily locked due to too many failed login attempts. Please try again in ${remainingMinutes} minutes.`
      });
    }

    // Support plain-text (test data) and bcrypt hashed passwords
    let passwordMatch = false;
    if (user.password && user.password.startsWith("$2")) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      passwordMatch = password === user.password;
    }

    if (!passwordMatch) {
      // Brute Force Lockout logic
      const maxAttempts = security?.max_login_attempts || 5;
      const lockoutDuration = security?.lockout_duration || 30; // in minutes

      const attempts = (user.login_attempts || 0) + 1;
      let lockedUntil = null;
      let message = "Invalid email or password";

      if (attempts >= maxAttempts) {
        lockedUntil = new Date(Date.now() + lockoutDuration * 60 * 1000);
        message = `Too many failed login attempts. Your account has been locked for ${lockoutDuration} minutes.`;
      } else {
        const remaining = maxAttempts - attempts;
        message = `Invalid email or password. You have ${remaining} attempts remaining before your account is locked.`;
      }

      await user.update({ login_attempts: attempts, locked_until: lockedUntil });
      return res.status(401).json({ message });
    }

    // Enforce Maintenance Mode (block non-admins from logging in)
    try {
      const systemSettings = await SystemSettings.findByPk(1);
      if (systemSettings && systemSettings.maintenance_mode) {
        const isAdmin = user.role?.role_name?.toLowerCase().includes('admin');
        if (!isAdmin) {
          return res.status(503).json({
            message: "The system is currently in Maintenance Mode. Only administrators are allowed to login."
          });
        }
      }
    } catch (err) {
      console.error("Maintenance check error in login:", err);
    }

    // 2. Check Two-Factor Authentication
    const isAdmin = user.role?.role_name?.toLowerCase().includes('admin');
    if (security && security.two_factor_enabled && isAdmin) {
      const tempTokenExpires = "10m"; // 10 minutes to setup/verify 2FA
      if (!user.two_factor_secret) {
        // Generate new TOTP secret
        const secret = speakeasy.generateSecret({
          name: `Ecosphere (${user.email})`
        });
        
        // Generate QR code URL
        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
        
        // Generate temporary setup token
        const tempToken = jwt.sign(
          { id: user.id, tempSecret: secret.base32, isTemp: true },
          process.env.JWT_SECRET,
          { expiresIn: tempTokenExpires }
        );
        
        return res.status(200).json({
          twoFactorRequired: true,
          setupRequired: true,
          tempToken,
          qrCode: qrCodeUrl,
          secret: secret.base32
        });
      } else {
        // Generate temporary login token
        const tempToken = jwt.sign(
          { id: user.id, isTemp: true },
          process.env.JWT_SECRET,
          { expiresIn: tempTokenExpires }
        );
        
        return res.status(200).json({
          twoFactorRequired: true,
          setupRequired: false,
          tempToken
        });
      }
    }

    // 3. Complete login if 2FA is not required
    // Reset login attempts
    await user.update({ login_attempts: 0, locked_until: null, last_login: new Date() });

    // Extract an array of permission strings like ["MANAGE_USERS", "VIEW_DASHBOARD"]
    const permissionsInfo = user.role?.permissions?.map(p => p.permission_name) || [];

    // Enforce Multiple Sessions if disabled
    let currentSessionToken = null;
    if (security && !security.allow_multiple_sessions) {
      currentSessionToken = crypto.randomBytes(16).toString("hex");
      await user.update({ current_session_token: currentSessionToken });
    }

    // Get dynamic JWT expiration from session_timeout
    const timeout = security?.session_timeout || 30; // in minutes

    const token = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id, session_token: currentSessionToken, type: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: `${timeout}m` }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        status: user.status,
        profile_status: user.profile_status,
        profile_photo: user.profile_photo,
        role: user.role,
        permissions: permissionsInfo
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// POST /api/admin/auth/2fa/verify
const verify2FA = async (req, res) => {
  const { tempToken, code } = req.body;

  if (!tempToken || !code) {
    return res.status(400).json({ message: "Verification token and code are required" });
  }

  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded.isTemp) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    const user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "role_name"],
          include: [
            {
              model: Permission,
              as: "permissions",
              attributes: ["permission_name"],
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "User account suspended or not found" });
    }

    let secret = user.two_factor_secret;
    const isSetup = !!decoded.tempSecret;
    if (isSetup) {
      secret = decoded.tempSecret;
    }

    if (!secret) {
      return res.status(400).json({ message: "Two-factor authentication secret not found. Please try logging in again." });
    }

    // Verify OTP code
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: code,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ message: "Incorrect verification code. Please try again." });
    }

    // If it was setup, save secret to user record
    if (isSetup) {
      await user.update({ two_factor_secret: secret });
    }

    // Complete login session
    const security = await SecuritySettings.findByPk(1);
    let currentSessionToken = null;
    if (security && !security.allow_multiple_sessions) {
      currentSessionToken = crypto.randomBytes(16).toString("hex");
      await user.update({ current_session_token: currentSessionToken });
    }

    // Get dynamic JWT expiration from session_timeout
    const timeout = security?.session_timeout || 30; // in minutes

    const token = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id, session_token: currentSessionToken, type: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: `${timeout}m` }
    );

    const permissionsInfo = user.role?.permissions?.map(p => p.permission_name) || [];

    // Reset login attempts and save last login
    await user.update({ login_attempts: 0, locked_until: null, last_login: new Date() });

    return res.status(200).json({
      message: "Two-factor authentication successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        status: user.status,
        profile_status: user.profile_status,
        profile_photo: user.profile_photo,
        role: user.role,
        permissions: permissionsInfo
      }
    });

  } catch (err) {
    console.error("2FA Verification error:", err);
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Verification session expired. Please sign in again." });
    }
    return res.status(500).json({ message: "Server error during 2FA verification" });
  }
};

module.exports = { login, generateCaptcha, verify2FA };
