const jwt = require("jsonwebtoken");
const { User, Role, Permission, Customer, SystemSettings, SecuritySettings } = require("../models/index");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ 
      status: 0,
      message: "No token provided. Please login to continue." 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try finding in User table first (Admin/Seller)
    let user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          as: "role",
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

    let userType = 'user';

    // If not found in User, try Customer table (Storefront)
    if (!user) {
      user = await Customer.findByPk(decoded.id);
      userType = 'customer';
    }

    if (!user) {
      return res.status(401).json({ 
        status: 0,
        message: "User account missing or session expired. Please logout and login again." 
      });
    }

    // Check status (handle both 'active' string for User and 1/active for Customer)
    const isActive = userType === 'user' ? user.status === 'active' : (user.status == 1 || user.status === 'active');
    if (!isActive) {
      return res.status(401).json({ message: "User account suspended." });
    }

    // Enforce Single Session if allow_multiple_sessions is disabled
    if (userType === 'user') {
      const security = await SecuritySettings.findByPk(1);
      if (security && !security.allow_multiple_sessions) {
        if (decoded.session_token !== user.current_session_token) {
          return res.status(401).json({
            status: 0,
            message: "Your session has been terminated because another login was started on a different device."
          });
        }
      }
    }

    req.user = user;
    req.userType = userType;
    req.userPermissions = userType === 'user' ? (user.role?.permissions?.map(p => p.permission_name) || []) : [];

    // Enforce Maintenance Mode (block non-admins)
    try {
      const systemSettings = await SystemSettings.findByPk(1);
      if (systemSettings && systemSettings.maintenance_mode) {
        const isAdmin = userType === 'user' && user.role?.role_name?.toLowerCase().includes('admin');
        if (!isAdmin) {
          return res.status(503).json({
            status: 0,
            message: "The application is currently undergoing maintenance. Only administrators can access the system at this time."
          });
        }
      }
    } catch (err) {
      console.error("Maintenance check error in verifyToken:", err);
    }

    // Check if user is pending approval
    if (userType === 'user') {
      const isApproved = user.profile_status === 'approved';
      const isAdmin = user.role?.role_name?.toLowerCase().includes('admin');
      if (!isApproved && !isAdmin) {
        // Only allow profile retrieval/update, T&C acceptance, dashboard stats, and location dropdowns
        const allowedPrefixes = [
          '/profile',
          '/tnc',
          '/corporations',
          '/zones',
          '/dashboard'
        ];
        const isAllowed = allowedPrefixes.some(prefix => req.path.startsWith(prefix));
        if (!isAllowed) {
          return res.status(403).json({
            status: 0,
            message: "Access Denied: Your account is pending approval. You cannot perform this action."
          });
        }
      }
    }

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ status: 0, message: "Your session has expired. Please login again." });
    }
    console.error("verifyToken auth block err", err);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Returns a middleware configured for a specific permission block
const requirePermission = (requiredPermissions) => {
  return (req, res, next) => {
    // If a single string is passed, wrap it in an array
    const permissionsToVerify = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];

    // Check if user has ANY of the required permissions
    const hasPermission = permissionsToVerify.some(perm => req.userPermissions.includes(perm));

    if (!hasPermission) {
      return res.status(403).json({ 
        message: "Forbidden Interface: You do not have the required permissions.",
        required: permissionsToVerify.join(' or ')
      });
    }

    next();
  };
};

module.exports = { verifyToken, requirePermission };
