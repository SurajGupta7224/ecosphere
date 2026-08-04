import React, { useEffect, useMemo, useState } from "react";
import BookPickup from "./BookPickup";
import { useNavigate } from "react-router-dom";
import { QrCode } from "lucide-react";

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
  FiX,
  FiDownload,
  FiUpload,
  FiFileText,
  FiAlertCircle,
  FiCalendar,
  FiMail,
  FiPhone,
  FiFilter,
  FiCheckCircle,
  FiAlertTriangle
} from "react-icons/fi";
import { customerFetch } from "../../api";

// -----------------------------------------------------------
// NEW: extracted dashboard pieces + shared helpers
// Adjust these relative paths to wherever you place the files
// -----------------------------------------------------------
import PlanStatusCard from "./PlanStatusCard";
import OverviewStats from "./OverviewStats";
import WasteBreakdownCard from "./WasteBreakdownCard";
import RecentPickupsStrip from "./RecentPickupsStrip";
import NotificationsPanel from "./NotificationsPanel";
import MyDetails from "./MyDetails";
import RaiseComplaint from "./RaiseComplaint";
import MyComplaints from "./MyComplaints";

import {
  statusColor,
  isToday,
  isMissedPickup,
  formatDate,
  formatDateTime,
  getVehicleNumber,
  getDriverName,
  getWetWeight,
  getDryWeight,
  getSanitaryWeight,
  getSpecialCareWeight,
  getTotalWeight,
} from "./pickupHelpers";

export default function CustomerDashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("customer_token");
  const localUser = localStorage.getItem("customer_user");

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

  // QR popup
  const [showQR, setShowQR] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);

  // Pickup history filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const loadPickupQR = async (pickupId) => {
    try {
      setQrLoading(true);
      setQrCodeDataUrl("");

      const data = await customerFetch(
        `/customer/pickups/${pickupId}/qr`
      );

      setQrCodeDataUrl(data.qr);
      setShowQR(true);
    } catch (err) {
      console.error("QR fetch error:", err);
      alert("Failed to load pickup QR code.");
    } finally {
      setQrLoading(false);
    }
  };
  

  // ---------------------------------------------------------
  // FETCH PICKUPS
  // ---------------------------------------------------------
  useEffect(() => {
    setLoadingPickups(true);

    customerFetch("/customer/pickups")
      .then((data) => {
        setPickups(data.orders || []);
      })
      .catch((err) => {
        console.error("Pickups fetch error:", err);
      })
      .finally(() => {
        setLoadingPickups(false);
      });
  }, []);

  
  

  // ---------------------------------------------------------
  // FETCH PROFILE
  // ---------------------------------------------------------
  useEffect(() => {
    customerFetch("/customer/profile")
      .then((data) => {
        if (data.customer) {
          setCustomer(data.customer);
          localStorage.setItem(
            "customer_user",
            JSON.stringify(data.customer)
          );
        }
      })
      .catch((err) => {
        console.error("Dashboard profile fetch error:", err);
      });
  }, []);

  // ---------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------
  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_user");
    window.location.href = "/";
  };

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------
  const capitalizeWords = (str) => {
    if (!str) return str;

    return str
      .split(" ")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1).toLowerCase()
      )
      .join(" ");
  };

  const customerName = capitalizeWords(customer?.customer_name);
  const customerEmail = customer?.email;
  const customerMobile = customer?.phone || customer?.mobile;

  // ---------------------------------------------------------
  // NAV ITEMS
  // ---------------------------------------------------------
  const sidebarNavItems = [
    { id: "overview", label: "Overview", icon: FiLayout },
    { id: "my-details", label: "My Details", icon: FiUser },
    { id: "wallet", label: "Wallet", icon: FiCreditCard },
    { id: "rewards", label: "Rewards", icon: FiGift },
    { id: "payments", label: "Payments", icon: FiDollarSign },
    { id: "addresses", label: "Address", icon: FiMapPin },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "complaints", label: "Raise a Complaint", icon: FiAlertCircle },
    { id: "mycomplaints", label: "My Complaints", icon: FiAlertTriangle },
    { id: "support", label: "Support", icon: FiHelpCircle },
    { id: "settings", label: "Settings", icon: FiSettings },
  ];


  const totalPickups = pickups.length;

  // ---------------------------------------------------------
  // TODAY'S PICKUP
  // ---------------------------------------------------------
  const upcomingPickup  = useMemo(() => {
    const trackableStatuses = [
      "booked",
      "pending",
      "approved",
      "in progress",
      "in-progress",
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [...pickups]
      .filter((p) => {
        const status = String(p.status || "").toLowerCase();
        if (!trackableStatuses.includes(status)) return false;

        if (!p.pickup_date) return false;
        const d = new Date(p.pickup_date);
        if (Number.isNaN(d.getTime())) return false;
        d.setHours(0, 0, 0, 0);

        return d >= today;
      })
      .sort((a, b) => new Date(a.pickup_date) - new Date(b.pickup_date))[0];
}, [pickups]);


  // ---------------------------------------------------------
  // MISSED PICKUPS (past date, never collected)
  // ---------------------------------------------------------
  const missedPickups = useMemo(() => {
    return [...pickups]
      .filter(isMissedPickup)
      .sort((a, b) => new Date(b.pickup_date) - new Date(a.pickup_date));
  }, [pickups]);

  // ---------------------------------------------------------
  // RECENT PICKUPS (last 10, most recent first)
  // ---------------------------------------------------------
  const recentPickups = useMemo(() => {
    return [...pickups]
      .sort((a, b) => {
        const dateA = new Date(
          `${a.pickup_date || ""} ${a.pickup_time || ""}`
        ).getTime();

        const dateB = new Date(
          `${b.pickup_date || ""} ${b.pickup_time || ""}`
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 7);
  }, [pickups]);

  // ---------------------------------------------------------
  // FILTER PICKUPS (pickup history tab)
  // ---------------------------------------------------------
  const filteredPickups = useMemo(() => {
    return pickups.filter((pickup) => {
      if (!pickup.pickup_date) return true;

      const pickupDate = new Date(pickup.pickup_date);

      if (Number.isNaN(pickupDate.getTime())) {
        return true;
      }

      if (fromDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        if (pickupDate < start) return false;
      }

      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (pickupDate > end) return false;
      }

      return true;
    });
  }, [pickups, fromDate, toDate]);

  // ---------------------------------------------------------
  // REPORT SUMMARY
  // ---------------------------------------------------------
  const reportSummary = useMemo(() => {
    return filteredPickups.reduce(
      (summary, pickup) => {
        summary.wet += getWetWeight(pickup);
        summary.dry += getDryWeight(pickup);
        summary.sanitary += getSanitaryWeight(pickup);
        summary.special += getSpecialCareWeight(pickup);
        summary.total += getTotalWeight(pickup);
        return summary;
      },
      { wet: 0, dry: 0, sanitary: 0, special: 0, total: 0 }
    );
  }, [filteredPickups]);

  // ---------------------------------------------------------
  // CSV DOWNLOAD
  // ---------------------------------------------------------
  const downloadCSV = () => {
    if (!filteredPickups.length) {
      alert("No pickup records available for the selected date range.");
      return;
    }

    const headers = [
      "Date & Time",
      "Vehicle No.",
      "Driver",
      "Trip Status",
      "Wet (kg)",
      "Dry (kg)",
      "Sanitary (kg)",
      "Special Care (kg)",
      "Total (kg)",
    ];

    const rows = filteredPickups.map((pickup) => [
      formatDateTime(pickup),
      getVehicleNumber(pickup),
      getDriverName(pickup),
      pickup.status || "—",
      getWetWeight(pickup),
      getDryWeight(pickup),
      getSanitaryWeight(pickup),
      getSpecialCareWeight(pickup),
      getTotalWeight(pickup),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ecosphere-pickup-history.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ---------------------------------------------------------
  // GENERATE REPORT
  // ---------------------------------------------------------
  const generateReport = () => {
    if (!filteredPickups.length) {
      alert("No pickup records available for the selected date range.");
      return;
    }

    alert(
      `Report generated successfully.\n\n` +
        `Total Pickups: ${filteredPickups.length}\n` +
        `Total Waste: ${reportSummary.total.toFixed(2)} kg`
    );
  };

 

  // ---------------------------------------------------------
  // NAV BUTTON
  // ---------------------------------------------------------
  const NavButton = ({ item, badge }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        onClick={() => setActiveTab(item.id)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all w-full ${
          isActive
            ? "bg-green-50 text-green-700 font-semibold"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        }`}
      >
        <Icon size={15} />
        <span className="flex-1">{item.label}</span>
        {badge > 0 && (
          <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </button>
    );
  };

  const downloadCustomerQR = () => {
    if (!qrCodeDataUrl) {
      alert("QR code is not loaded yet.");
      return;
    }

    const link = document.createElement("a");

    link.href = qrCodeDataUrl;

    link.download = `pickup-qr.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      <div className="min-h-screen bg-[#f0f3f1] pt-48 sm:pt-52 lg:pt-56 pb-24 px-4 sm:px-6 lg:px-10">

        <div className="flex items-start justify-center gap-5 max-w-7xl mx-auto">

          {/* SIDEBAR */}
          <aside className="w-52 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">

            <NavButton item={sidebarNavItems.find((i) => i.id === "overview")} />
            <NavButton item={sidebarNavItems.find((i) => i.id === "my-details")} />

            <div className="h-px bg-gray-100 my-3" />

            <nav className="flex flex-col gap-0.5 flex-1">

              <button
                onClick={() => setActiveTab("pickup-history")}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all w-full ${
                  activeTab === "pickup-history"
                    ? "bg-green-50 text-green-700 font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <FiCalendar size={15} />
                <span>Pickup History</span>
              </button>

              <NavButton item={sidebarNavItems.find((i) => i.id === "payments")} />
              <NavButton item={sidebarNavItems.find((i) => i.id === "addresses")} />
              <NavButton
                item={sidebarNavItems.find((i) => i.id === "notifications")}
                badge={missedPickups.length}
              />
              <NavButton item={sidebarNavItems.find((i) => i.id === "complaints")} />
              <NavButton item={sidebarNavItems.find((i) => i.id === "mycomplaints")} />
              <NavButton item={sidebarNavItems.find((i) => i.id === "support")} />
            </nav>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 mt-3 rounded-xl text-red-500 hover:bg-red-50 w-full text-sm transition-all"
            >
              <FiLogOut size={15} />
              <span>Logout</span>
            </button>

          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 min-w-0 flex flex-col gap-4">

            {/* ============================ OVERVIEW ============================ */}
            {activeTab === "overview" && (
              <div className="flex flex-col gap-4">

                {/* Welcome Banner */}
                <div className="bg-green-800 rounded-2xl p-5 sm:p-6 flex items-center gap-5">
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
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        if (upcomingPickup?.id) {
                          loadPickupQR(upcomingPickup.id);
                        }
                      }}
                      title="Show Pickup QR"
                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all"
                    >
                      <QrCode size={20} strokeWidth={2} />
                    </button>
                  </div>
                </div>

                {/* Plan / contract status — wire startDate/endDate to your
                    customer or subscription object once that field exists */}
                <PlanStatusCard
                  planName={customer?.plan_name || "Service Plan"}
                  siteName={customer?.site_name|| "Bangalore Site"}
                  endDate={customer?.plan_end_date||"2026-12-31"}
                  onDownloadReport={generateReport}
                />

                {/* Stat row — first card merges today's pickup detail
                    (vehicle, driver, mobile, Track) with the stat tiles.
                    openComplaints is a placeholder until complaints are
                    fetched from the backend. */}
                <OverviewStats
                  loadingPickups={loadingPickups}
                  upcomingPickup={upcomingPickup}
                  fallbackMobile={customerMobile}
                  onTrack={() => setActiveTab("pickup-history")}
                  totalPickups={totalPickups}
                  totalWasteKg={reportSummary.total}
                  openComplaints={0}
                />

                {/* Waste breakdown 
                <WasteBreakdownCard reportSummary={reportSummary} />*/}

                {/* Recent pickups strip */}
                <RecentPickupsStrip
                  pickups={recentPickups}
                  loadingPickups={loadingPickups}
                  onViewAll={() => setActiveTab("pickup-history")}
                />

              </div>
            )}

            {/* ============================ MY DETAILS ============================ */}

            {activeTab === "my-details" && <MyDetails customer={customer} />}

            {/* ============================ PICKUP HISTORY ============================ */}
            {activeTab === "pickup-history" && (
              <div className="flex flex-col gap-4">

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                        Collection Records
                      </p>
                      <h2 className="text-xl font-bold text-gray-800 mt-1">Pickup History</h2>
                      <p className="text-sm text-gray-400 mt-1">
                        View and download your complete waste collection history.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={generateReport}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                      >
                        <FiFileText size={14} />
                        Generate Report
                      </button>

                      <button
                        onClick={downloadCSV}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-semibold"
                      >
                        <FiDownload size={14} />
                        Download CSV
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <FiFilter size={15} className="text-green-700" />
                    <h3 className="text-sm font-semibold text-gray-800">Filter by Date</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">From Date</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">To Date</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                      />
                    </div>

                    <button
                      onClick={() => {
                        setFromDate("");
                        setToDate("");
                      }}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50"
                    >
                      Clear Filter
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Pickups</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{filteredPickups.length}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Wet</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{reportSummary.wet.toFixed(0)} kg</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Dry</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{reportSummary.dry.toFixed(0)} kg</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Sanitary</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{reportSummary.sanitary.toFixed(0)} kg</p>
                  </div>
                  <div className="bg-green-50 rounded-xl border border-green-100 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-green-700 font-semibold">Total Waste</p>
                    <p className="text-xl font-bold text-green-800 mt-1">{reportSummary.total.toFixed(0)} kg</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-4 text-left text-[10px] uppercase tracking-wider font-bold text-gray-400">Date & Time</th>
                          <th className="px-4 py-4 text-left text-[10px] uppercase tracking-wider font-bold text-gray-400">Vehicle No.</th>
                          <th className="px-4 py-4 text-left text-[10px] uppercase tracking-wider font-bold text-gray-400">Driver</th>
                          <th className="px-4 py-4 text-left text-[10px] uppercase tracking-wider font-bold text-gray-400">Trip Status</th>
                          <th className="px-4 py-4 text-right text-[10px] uppercase tracking-wider font-bold text-gray-400">Wet (kg)</th>
                          <th className="px-4 py-4 text-right text-[10px] uppercase tracking-wider font-bold text-gray-400">Dry (kg)</th>
                          <th className="px-4 py-4 text-right text-[10px] uppercase tracking-wider font-bold text-gray-400">Sanitary (kg)</th>
                          <th className="px-4 py-4 text-right text-[10px] uppercase tracking-wider font-bold text-gray-400">Special Care (kg)</th>
                          <th className="px-4 py-4 text-right text-[10px] uppercase tracking-wider font-bold text-gray-400">Total (kg)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPickups.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="text-center py-16 text-gray-400">
                              <FiTruck size={32} className="mx-auto mb-3" />
                              No pickup records found for this date range.
                            </td>
                          </tr>
                        ) : (
                          filteredPickups.map((pickup, index) => (
                            <tr
                              key={pickup._id || pickup.id || pickup.lead_id || index}
                              className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{formatDateTime(pickup)}</td>
                              <td className="px-4 py-4 font-medium text-gray-700">{getVehicleNumber(pickup)}</td>
                              <td className="px-4 py-4 text-gray-700">{getDriverName(pickup)}</td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColor(pickup.status)}`}>
                                  {String(pickup.status || "").toLowerCase() === "completed" && <FiCheckCircle size={11} />}
                                  {pickup.status || "Pending"}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right text-gray-700">{getWetWeight(pickup).toFixed(1)}</td>
                              <td className="px-4 py-4 text-right text-gray-700">{getDryWeight(pickup).toFixed(1)}</td>
                              <td className="px-4 py-4 text-right text-gray-700">{getSanitaryWeight(pickup).toFixed(1)}</td>
                              <td className="px-4 py-4 text-right text-gray-700">{getSpecialCareWeight(pickup).toFixed(1)}</td>
                              <td className="px-4 py-4 text-right font-bold text-gray-900">{getTotalWeight(pickup).toFixed(1)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ============================ PAYMENTS ============================ */}
            {activeTab === "payments" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <FiDollarSign size={18} className="text-green-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Payments</h2>
                    <p className="text-sm text-gray-400">View your payment history and invoices.</p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <FiDollarSign size={40} className="mx-auto mb-4" />
                  <p>No payments yet.</p>
                </div>
              </div>
            )}

            {/* ============================ ADDRESS ============================ */}
            {activeTab === "addresses" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                      Collection Location
                    </p>
                    <h2 className="text-xl font-semibold text-gray-800 mt-1">Address</h2>
                  </div>

                  <button className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors">
                    <FiPlus size={16} />
                    Add Address
                  </button>
                </div>

                <div className="border border-gray-100 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                      <FiMapPin size={18} className="text-green-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Collection Address</p>
                      <p className="text-sm text-gray-500 mt-2 leading-6">
                        {customer?.address || customer?.location || "No collection address saved."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================ NOTIFICATIONS ============================ */}
            {activeTab === "notifications" && (
              <NotificationsPanel
                missedPickups={missedPickups}
                loadingPickups={loadingPickups}
                onRaiseComplaint={() => {
                  setSubject("Missed Pickup");
                  setActiveTab("complaints");
                }}
              />
            )}

            {/* ============================ RAISE COMPLAINT ============================ */}
            {activeTab === "complaints" && (
              <RaiseComplaint 
                customer={customer} 
                onViewComplaints={() => setActiveTab("mycomplaints")}
              />
            )}

            {/* ============================ MY COMPLAINTS ============================ */}
            {activeTab === "mycomplaints" && (
              <MyComplaints 
                customer={customer} 
                onRaiseComplaint={() => setActiveTab("complaints")}
              />
            )}

            {/* ============================ SUPPORT ============================ */}
            {activeTab === "support" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="mb-6">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Customer Care</p>
                  <h2 className="text-xl font-semibold text-gray-800 mt-1">Support</h2>
                  <p className="text-sm text-gray-400 mt-1">Need help with your waste collection?</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href="mailto:info@ecospherewm.com"
                    className="border border-gray-100 rounded-2xl p-5 hover:border-green-200 hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-4">
                      <FiMail size={18} className="text-green-700" />
                    </div>
                    <p className="font-semibold text-gray-800">Email Support</p>
                    <p className="text-sm text-gray-500 mt-1">info@ecospherewm.com</p>
                    <p className="text-xs text-gray-400 mt-3">Send us your query and we'll get back to you.</p>
                  </a>

                  <a
                    href="tel:+919035489496"
                    className="border border-gray-100 rounded-2xl p-5 hover:border-green-200 hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-4">
                      <FiPhone size={18} className="text-green-700" />
                    </div>
                    <p className="font-semibold text-gray-800">Call Support</p>
                    <p className="text-sm text-gray-500 mt-1">+91 90354 89496</p>
                    <p className="text-xs text-gray-400 mt-3">Mon–Sat · 8:00 AM – 8:00 PM</p>
                  </a>
                </div>
              </div>
            )}

            {/* ============================ WALLET (hidden from sidebar) ============================ */}
            {activeTab === "wallet" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Wallet</h2>
                <div className="bg-green-50 border border-green-100 rounded-xl p-6">
                  <p className="text-sm text-gray-500 mb-1">Available Balance</p>
                  <p className="text-2xl font-semibold text-green-700">₹0.00</p>
                </div>
              </div>
            )}

            {/* ============================ REWARDS (hidden from sidebar) ============================ */}
            {activeTab === "rewards" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Rewards</h2>
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <FiGift size={40} className="mx-auto mb-4" />
                  <p>No rewards earned yet.</p>
                </div>
              </div>
            )}

            {/* ============================ BOOK PICKUP (hidden from sidebar) ============================ */}
            {activeTab === "book-pickup" && <BookPickup />}

            {/* ============================ SETTINGS (hidden from sidebar) ============================ */}
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
      {/* QR MODAL */}
     {showQR && (
  <div
    className="fixed left-0 top-0 z-[999999] flex h-screen w-screen items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    onClick={() => setShowQR(false)}
  >
    <div
      className="relative flex w-[380px] flex-col items-center rounded-[28px] bg-white px-6 py-7 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* CLOSE */}
      <button
        type="button"
        onClick={() => setShowQR(false)}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
      >
        <FiX size={18} />
      </button>

      {/* TITLE */}
      <div className="w-full text-center">
        <h2 className="text-[20px] font-bold text-gray-900">
          Customer QR Code
        </h2>

        <p className="mt-1 text-[13px] text-gray-500">
          Scan to view customer details
        </p>
      </div>

      {/* QR */}
      <div
        className="mt-6 flex h-[260px] w-[260px] items-center justify-center"
        style={{
          position: "relative",
          overflow: "visible",
          flexShrink: 0,
        }}
      >
        <div
          id="customer-qr"
          style={{
            position: "relative",
            width: "240px",
            height: "240px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
            padding: "8px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxSizing: "border-box",
          }}
        >
          {qrLoading ? (
            <p className="text-sm text-gray-400">
              Generating QR...
            </p>
          ) : qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl}
              alt="Pickup QR Code"
              className="h-[220px] w-[220px]"
            />
           ) : (
            <p className="text-sm text-gray-400">
              QR unavailable
            </p>
          )}
        </div>
      </div>

      {/* DOWNLOAD */}
      <button
        type="button"
        onClick={downloadCustomerQR}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3.5 text-sm font-semibold text-white"
      >
        <FiDownload size={17} />
        Download QR
      </button>
    </div>
  </div>
)}
    </>
  );
}

