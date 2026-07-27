import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiPlus,
  FiTruck,
  FiCreditCard,
  FiGift,
  FiBell,
  FiMapPin,
  FiHelpCircle,
  FiSettings,
  FiBox,
  FiFeather,
  FiArrowRight,
  FiLogOut,
  FiDollarSign,
  FiCheckCircle,
  FiTrendingUp,
  FiActivity,
  FiClock,
  FiLayout
} from "react-icons/fi";
import { customerFetch } from "../../api";

export default function CustomerDashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("customer_token");
  const localUser = localStorage.getItem("customer_user");

  // Strict check: if no token, immediately redirect to login and render nothing
  if (!token) {
    window.location.href = "/login";
    return null;
  }

  const [customer, setCustomer] = useState(() => {
    try {
      return localUser ? JSON.parse(localUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState("overview"); // "account" | "pickups" | "wallet" etc.

  useEffect(() => {
    // Fetch fresh profile data
    customerFetch("/customer/profile")
      .then((data) => {
        if (data.customer) {
          setCustomer(data.customer);
          localStorage.setItem("customer_user", JSON.stringify(data.customer));
        }
      })
      .catch((err) => {
        console.error("Dashboard profile fetch error:", err);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_user");
    window.location.href = "/login";
  };

  const capitalizeWords = (str) => {
    if (!str) return str;
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const customerName = capitalizeWords(customer?.customer_name);
  const customerEmail = customer?.email;
  const customerMobile = customer?.phone;

  const sidebarNavItems = [
    { id: "overview", label: "Overview", icon: FiLayout },
    { id: "account", label: "My Account", icon: FiUser },
    { id: "pickups", label: "My Pickups", icon: FiTruck },
    { id: "wallet", label: "Wallet", icon: FiCreditCard },
    { id: "rewards", label: "Rewards", icon: FiGift },
    { id: "payments", label: "Payments", icon: FiDollarSign },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "addresses", label: "Addresses", icon: FiMapPin },
    { id: "support", label: "Support", icon: FiHelpCircle },
    { id: "settings", label: "Settings", icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f6] pt-48 sm:pt-52 lg:pt-56 pb-20 px-4 sm:px-6 lg:px-10">
      <div className="flex items-stretch justify-center gap-10">
        <aside className="border border-white/20 rounded-lg p-4 shadow-md w-64 bg-white">
          <div className="mb-6 px-2">
            <p className="font-medium text-gray-800">{customerName}</p>
            <p className="text-sm text-gray-500">{customerEmail}</p>
          </div>

          <nav className="flex flex-col gap-1">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounde-md text-left transition-colors ${isActive ? "bg-green-100 text-green-700 font-medium" : "text-gray-700 hover:bg-gray-100"}`}>
                  <Icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 mt-6 rounded-md text-red-600 hover:bg-red-50 w-full"
          >
            <FiLogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </aside>
        <main className="border border-white/20 rounded-lg p-6 shadow-md bg-white flex-1 min-w-0">
          {activeTab === "overview" && (
            <div>
              <p className="text-lg font-semibold text-gray-800 mb-1">
                Welcome back, {customerName?.split(" ")[0] || "..."}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Here's what's happening with your account today.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-3 gap-6">
                <div className="bg-green-800 rounded-lg p-4">
                  <p className="text-xs text-green-200 mb-1">Next Pickup</p>
                  <p className="text-lg font-semibold text-white">----</p>
                </div>
                <div className="border border-gray-100 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Waste diverted</p>
                  <p className="text-lg font-semibold text-gray-800">0 kg</p>
                </div>
                <div className="border border-gray-100 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">CO2 offset</p>
                  <p className="text-lg font-semibold text-gray-800">0 kg</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
                <div className="lg:col-span-2 border border-gray-100 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-800 mb-3">
                    Waste collected, last 6 pickups
                  </p>
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <FiTrendingUp size={32} className="mb-2" />
                    <p className="text-sm">No pickup data yet</p>
                  </div>
                </div>
                <div className="border border-gray-100 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-800 mb-3">
                    Recent Activity
                  </p>
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <FiActivity size={28} className="mb-2" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                </div>
              </div>
            </div>
          )}


          {activeTab === "account" && (
            <div>
              <div className="flex items-center justify-between mb-6 ">
                <h2 className="text-xl font-semibold text-gray-800">My Account</h2>
                <button className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors">
                  <FiSettings size={16} />
                  Edit Profile
                </button>
              </div>

              <div className="flex items-center gap-4 mb-8">
                {/* Account details content */}
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <FiUser size={28} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-lg">{customerName}</p>
                  <p className="text-sm text-gray-500">{customerEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="border border-gray-100 rounded-lg p-4">
                  <p className="text-sm text-gray-500 uppercase mb-1">Email</p>
                  <p className="font-medium text-gray-700">{customerEmail}</p>
                </div>
                <div className="border border-gray-100 rounded-lg p-4">
                  <p className="text-sm text-gray-500 uppercase mb-1">Mobile Number</p>
                  <p className="font-medium text-gray-700">{customerMobile}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pickups" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">My Pickups</h2>
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FiTruck size={40} className="text-gray-400 mx-auto mb-4" />
                <p className="text-center text-gray-500">You have no pickups scheduled.</p>
                <button className="mt-4 flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors">
                  <FiPlus size={16} />
                  Schedule a pickup
                </button>
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Wallet</h2>
              <div className="bg-green-50 border border-green-100 rounded-lg p-6">
                <p className="text-sm text-gray-500 mb-1">Available Balance</p>
                <p className="text-2xl font-semibold text-green-700">₹0.00</p>
              </div>
            </div>
          )}

          {activeTab === "rewards" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Rewards</h2>
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FiGift size={40} className="text-gray-400 mx-auto mb-4" />
                <p>No rewards earned yet.</p>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Payments</h2>
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FiDollarSign size={40} className="text-gray-400 mx-auto mb-4" />
                <p>No payments yet.</p>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FiBell size={40} className="text-gray-400 mx-auto mb-4" />
                <p>You're all caught up.</p>
              </div>
            </div>
          )}
          
          {activeTab === "addresses" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Addresses</h2>
                <button className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors">
                  <FiPlus size={16} />
                  Add Address
                </button>
              </div>
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FiMapPin size={40} className="text-gray-400 mx-auto mb-4" />
                <p>No saved addresses.</p>
              </div>
            </div>
          )}

          {activeTab === "support" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Support</h2>
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FiHelpCircle size={40} className="text-gray-400 mx-auto mb-4" />
                <p>Need help? Reach out to our support team.</p> 
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Settings</h2>
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FiSettings size={40} className="mb-3" />
                <p>Account settings coming soon.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
