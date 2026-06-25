const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Role, Permission, SystemSettings, SecuritySettings } = require("../../models/index");

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
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
      const security = await SecuritySettings.findByPk(1);
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

    // Reset login attempts on successful login
    await user.update({ login_attempts: 0, locked_until: null, last_login: new Date() });

    // Extract an array of permission strings like ["MANAGE_USERS", "VIEW_DASHBOARD"]
    const permissionsInfo = user.role?.permissions?.map(p => p.permission_name) || [];

    // Get dynamic JWT expiration from session_timeout
    const security = await SecuritySettings.findByPk(1);
    const timeout = security?.session_timeout || 30; // in minutes

    const token = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id },
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

module.exports = { login };
