const jwt = require("jsonwebtoken");
const { User, Role, Permission, Customer, SystemSettings } = require("../models/index");

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

    // Check status (handle both 'active' string for User and 1 for Customer)
    const isActive = userType === 'user' ? user.status === 'active' : user.status == 1;
    if (!isActive) {
      return res.status(401).json({ message: "User account suspended." });
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

    next();
  } catch (err) {
    console.error("verifyToken auth block err", err);
    return res.status(403).json({ message: "Invalid or expired token." });
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
