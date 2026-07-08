const { User, Role, Pincode, City } = require("../../models/index");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalRoles = await Role.count();
    const totalPincodes = await Pincode.count();
    const totalCities = await City.count();

    res.json({
      success: true,
      stats: {
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalVendors: 0,
        totalWarehouses: 0,
        lowStockCount: 0,
        totalUsers,
        totalRoles,
        totalPincodes,
        totalCities
      },
      pulse: {
        todayOrders: 0,
        todayRevenue: 0,
        pendingOrders: 0,
        activeDeliveries: 0
      },
      recentOrders: [],
      lowStockItems: [],
      salesData: [],
      topProducts: []
    });

  } catch (error) {
    console.error("Dashboard Stats Aggregation Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

