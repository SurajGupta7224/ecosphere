const { Notification, Employee, Vehicle, User, Role } = require("../../models/index");

// GET /api/notifications - Get Admin notifications & pending counters
const getNotifications = async (req, res) => {
  try {
    const isAdmin = req.user?.role?.role_name?.toLowerCase().includes('admin');
    if (!isAdmin) {
      return res.status(403).json({ message: "Access denied. Notifications are restricted to Admin users." });
    }

    const notifications = await Notification.findAll({
      order: [["created_at", "DESC"]],
      limit: 30
    });

    const unreadCount = await Notification.count({
      where: { is_read: false }
    });

    const pendingEmployeesCount = await Employee.count({
      where: { profile_approval_status: "pending" }
    });

    const pendingVehiclesCount = await Vehicle.count({
      where: { approval_status: "pending" }
    });

    let pendingVendorsCount = 0;
    try {
      const vendorRole = await Role.findOne({ where: { role_name: "Vendor" } });
      if (vendorRole) {
        pendingVendorsCount = await User.count({
          where: { role_id: vendorRole.id, profile_status: "pending" }
        });
      }
    } catch (err) {
      console.error("Vendor count error:", err);
    }

    const enrichedNotifications = await Promise.all(
      notifications.map(async (notif) => {
        const plain = notif.get({ plain: true });
        if (plain.reference_type === "employee" && plain.reference_id) {
          const emp = await Employee.findByPk(plain.reference_id);
          plain.approval_status = emp ? emp.profile_approval_status : "pending";
        } else if (plain.reference_type === "vehicle" && plain.reference_id) {
          const veh = await Vehicle.findByPk(plain.reference_id);
          plain.approval_status = veh ? (veh.approval_status || "pending") : "pending";
        } else {
          plain.approval_status = "approved";
        }
        return plain;
      })
    );

    return res.status(200).json({
      notifications: enrichedNotifications,
      unreadCount,
      totalPending: unreadCount,
      pendingEmployeesCount,
      pendingVehiclesCount,
      pendingVendorsCount
    });
  } catch (err) {
    console.error("getNotifications error:", err);
    return res.status(500).json({ message: "Failed to fetch notifications", error: err.message });
  }
};

// PATCH /api/notifications/:id/read - Mark single notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === "all") {
      await Notification.update({ is_read: true }, { where: { is_read: false } });
      return res.status(200).json({ message: "All notifications marked as read" });
    }

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.update({ is_read: true });
    return res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("markAsRead error:", err);
    return res.status(500).json({ message: "Failed to update notification" });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
