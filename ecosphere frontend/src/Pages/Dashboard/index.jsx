import React, { useEffect, useState } from "react";
import BookPickup from "./BookPickup";
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
  FiArrowRight,
  FiLogOut,
  FiDollarSign,
  FiLayout,
  FiZap,
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

  const [activeTab, setActiveTab] = useState("overview");
  const [pickups, setPickups] = useState([]);
  const [loadingPickups, setLoadingPickups] = useState(false);

  // Fetch pickups on mount so overview stats and active pickup are available immediately
  useEffect(() => {
    setLoadingPickups(true);
    customerFetch("/customer/pickups")
      .then((data) => setPickups(data.orders || []))
      .catch((err) => console.error("Pickups fetch error:", err))
      .finally(() => setLoadingPickups(false));
  }, []);

  useEffect(() => {
    customerFetch("/customer/profile")
      .then((data) => {
        if (data.customer) {
          setCustomer(data.customer);
          localStorage.setItem("customer_user", JSON.stringify(data.customer));
        }
      })
      .catch((err) => console.error("Dashboard profile fetch error:", err));
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
  const customerMobile = customer?.phone || customer?.mobile;

  const sidebarNavItems = [
    { id: "overview",      label: "Overview",       icon: FiLayout   },
    { id: "pickups",       label: "My Pickups",     icon: FiTruck    },
    { id: "wallet",        label: "Wallet",         icon: FiCreditCard },
    { id: "rewards",       label: "Rewards",        icon: FiGift     },
    { id: "payments",      label: "Payments",       icon: FiDollarSign },
    { id: "notifications", label: "Notifications",  icon: FiBell     },
    { id: "addresses",     label: "Addresses",      icon: FiMapPin   },
    { id: "support",       label: "Support",        icon: FiHelpCircle },
    { id: "settings",      label: "Settings",       icon: FiSettings },
  ];

  const statusColor = (status) => {
    switch (status) {
      case "Booked":     return "bg-blue-100 text-blue-700";
      case "Approved":   return "bg-emerald-100 text-emerald-700";
      case "Rejected":   return "bg-red-100 text-red-700";
      case "Cancelled":  return "bg-gray-100 text-gray-500";
      case "Completed":  return "bg-teal-100 text-teal-700";
      default:           return "bg-amber-100 text-amber-700";
    }
  };

  const activePickup = pickups.find(
    (p) => p.status === "Booked" || p.status === "Pending" || p.status === "Approved"
  );
  const totalPickups = pickups.length;

  return (
    <div className="min-h-screen bg-[#f0f3f1] pt-48 sm:pt-52 lg:pt-56 pb-24 px-4 sm:px-6 lg:px-10">
      <div className="flex items-start justify-center gap-5 max-w-7xl mx-auto">

        {/* ──────────────── SIDEBAR ──────────────── */}
        <aside className="w-52 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col">

          {/* Overview button */}
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all mb-2 ${
              activeTab === "overview"
                ? "bg-green-50 text-green-700 font-semibold"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            <FiLayout size={15} />
            <span>Overview</span>
          </button>

          {/* Book Pickup CTA */}
          <button
            onClick={() => setActiveTab("pickups")}
            className="flex items-center justify-center gap-1.5 w-full bg-green-700 hover:bg-green-800 active:scale-95 text-white text-sm font-semibold py-2.5 rounded-xl mb-4 transition-all"
          >
            <FiPlus size={15} />
            Book Pickup
          </button>

          {/* Nav items */}
          <nav className="flex flex-col gap-0.5 flex-1">
            {sidebarNavItems.filter((item) => item.id !== "overview").map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                    isActive
                      ? "bg-green-50 text-green-700 font-semibold"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 mt-3 rounded-xl text-red-500 hover:bg-red-50 w-full text-sm transition-all"
          >
            <FiLogOut size={15} />
            <span>Logout</span>
          </button>
        </aside>

        {/* ──────────────── MAIN CONTENT ──────────────── */}
        <main className="flex-1 min-w-0 flex flex-col gap-4">

          {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-4">

              {/* Welcome Banner */}
              <div className="bg-green-800 rounded-2xl p-6 flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-green-600/60 border-2 border-green-500/40 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 select-none">
                  {customerName?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-green-300 text-[10px] font-semibold uppercase tracking-widest mb-1">
                    Welcome Back
                  </p>
                  <h2 className="text-white text-xl font-bold leading-tight mb-1.5 truncate">
                    {customerName || "..."}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-green-200">
                    {customerEmail && <span className="truncate">{customerEmail}</span>}
                    {customerMobile && <span>· {customerMobile}</span>}
                    <span className="inline-flex items-center bg-teal-500/80 text-white text-[10px] px-2.5 py-0.5 rounded-full font-semibold tracking-wide">
                      ✦ Platinum member
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Wallet Balance */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center mb-3">
                    <FiCreditCard size={17} className="text-green-700" />
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
                    Wallet Balance
                  </p>
                  <p className="text-[22px] font-bold text-gray-800 leading-tight">₹0.00</p>
                </div>

                {/* Reward Points */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                    <FiGift size={17} className="text-amber-500" />
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
                    Reward Points
                  </p>
                  <p className="text-[22px] font-bold text-gray-800 leading-tight">0</p>
                </div>

                {/* Total Pickups */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                    <FiTruck size={17} className="text-blue-500" />
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
                    Total Pickups
                  </p>
                  <p className="text-[22px] font-bold text-gray-800 leading-tight">
                    {loadingPickups ? "–" : totalPickups}
                  </p>
                </div>

                {/* Impact Tier */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
                    <FiZap size={17} className="text-purple-500" />
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
                    Impact Tier
                  </p>
                  <p className="text-[22px] font-bold text-gray-800 leading-tight">Platinum</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab("pickups")}
                  className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-left hover:shadow-md hover:border-green-200 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
                    <FiTruck size={17} className="text-green-700" />
                  </div>
                  <p className="font-semibold text-gray-800 text-sm mb-0.5">Book Pickup</p>
                  <p className="text-xs text-gray-400">Schedule a new collection</p>
                </button>

                <button
                  onClick={() => setActiveTab("pickups")}
                  className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-left hover:shadow-md hover:border-green-200 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
                    <FiMapPin size={17} className="text-green-700" />
                  </div>
                  <p className="font-semibold text-gray-800 text-sm mb-0.5">Track Pickup</p>
                  <p className="text-xs text-gray-400">See live driver ETA</p>
                </button>

                <button
                  onClick={() => setActiveTab("rewards")}
                  className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-left hover:shadow-md hover:border-amber-200 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                    <FiGift size={17} className="text-amber-500" />
                  </div>
                  <p className="font-semibold text-gray-800 text-sm mb-0.5">View Rewards</p>
                  <p className="text-xs text-gray-400">Redeem your points</p>
                </button>

                <button
                  onClick={() => setActiveTab("payments")}
                  className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-left hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                    <FiDollarSign size={17} className="text-blue-500" />
                  </div>
                  <p className="font-semibold text-gray-800 text-sm mb-0.5">Payment History</p>
                  <p className="text-xs text-gray-400">Download invoices</p>
                </button>
              </div>

              {/* Active Pickup */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-4">
                  Active Pickup
                </p>
                {loadingPickups ? (
                  <p className="text-sm text-gray-400">Loading...</p>
                ) : activePickup ? (
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">
                        #{activePickup.lead_id?.slice(-8)?.toUpperCase()} ·{" "}
                        {activePickup.waste_generator_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Status:{" "}
                        <span className="font-semibold text-green-600">
                          {activePickup.status}
                        </span>
                        {activePickup.pickup_date && ` · ${activePickup.pickup_date}`}
                        {activePickup.pickup_time && ` · ${activePickup.pickup_time}`}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("pickups")}
                      className="flex-shrink-0 flex items-center gap-2 bg-green-700 hover:bg-green-800 active:scale-95 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                    >
                      Track <FiArrowRight size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-400">No active pickup scheduled.</p>
                    <button
                      onClick={() => setActiveTab("pickups")}
                      className="flex-shrink-0 flex items-center gap-2 bg-green-700 hover:bg-green-800 active:scale-95 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                    >
                      Book Now <FiArrowRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════ MY ACCOUNT TAB ═══════════════ */}
          {activeTab === "account" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">My Account</h2>
                <button className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors">
                  <FiSettings size={16} />
                  Edit Profile
                </button>
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <FiUser size={28} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-lg">{customerName}</p>
                  <p className="text-sm text-gray-500">{customerEmail}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
                  <p className="font-medium text-gray-700">{customerEmail}</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Mobile Number</p>
                  <p className="font-medium text-gray-700">{customerMobile}</p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ PICKUPS TAB ═══════════════ */}
          {activeTab === "pickups" && <BookPickup />}

          {/* ═══════════════ WALLET TAB ═══════════════ */}
          {activeTab === "wallet" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Wallet</h2>
              <div className="bg-green-50 border border-green-100 rounded-xl p-6">
                <p className="text-sm text-gray-500 mb-1">Available Balance</p>
                <p className="text-2xl font-semibold text-green-700">₹0.00</p>
              </div>
            </div>
          )}

          {/* ═══════════════ REWARDS TAB ═══════════════ */}
          {activeTab === "rewards" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Rewards</h2>
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FiGift size={40} className="mx-auto mb-4" />
                <p>No rewards earned yet.</p>
              </div>
            </div>
          )}

          {/* ═══════════════ PAYMENTS TAB ═══════════════ */}
          {activeTab === "payments" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Payments</h2>
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FiDollarSign size={40} className="mx-auto mb-4" />
                <p>No payments yet.</p>
              </div>
            </div>
          )}

          {/* ═══════════════ NOTIFICATIONS TAB ═══════════════ */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FiBell size={40} className="mx-auto mb-4" />
                <p>You're all caught up.</p>
              </div>
            </div>
          )}

          {/* ═══════════════ ADDRESSES TAB ═══════════════ */}
          {activeTab === "addresses" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Addresses</h2>
                <button className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors">
                  <FiPlus size={16} />
                  Add Address
                </button>
              </div>
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FiMapPin size={40} className="mx-auto mb-4" />
                <p>No saved addresses.</p>
              </div>
            </div>
          )}

          {/* ═══════════════ SUPPORT TAB ═══════════════ */}
          {activeTab === "support" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Support</h2>
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FiHelpCircle size={40} className="mx-auto mb-4" />
                <p>Need help? Reach out to our support team.</p>
              </div>
            </div>
          )}

          {/* ═══════════════ SETTINGS TAB ═══════════════ */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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