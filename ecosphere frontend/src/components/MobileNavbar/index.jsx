import React, { useState } from "react";
import { FiHome, FiBox, FiUser, FiCreditCard, FiStar } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import HelpModal from "../../Pages/HelpModal";
import { FiCpu } from "react-icons/fi";
const MobileNavbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [comingSoonFeature, setComingSoonFeature] = useState(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const links = [
    { id: 1, label: "Home", path: "/", icon: <FiHome size={22} />, type: "route" },
    { id: 2, label: "Products", icon: <FiBox size={22} />, type: "comingSoon", feature: "Products" },
    // { id: 3, label: "Payment", icon: <FiCreditCard size={22} />, type: "comingSoon", feature: "Payments" },
    { 
        id: 3, 
        label: "Technology", 
        icon: <FiCpu size={22} />, 
        path: "/technology", 
        type: "route",
        feature: "Technology" 
      },
    { id: 4, label: "Account", icon: <FiUser size={22} />, type: "help" },
  ];

  const handleClick = (item) => {
    if (item.type === "route") {
      navigate(item.path);
      return;
    }
    if (item.type === "comingSoon") {
      setComingSoonFeature(item.feature);
      return;
    }
    if (item.type === "help") {
      setIsHelpModalOpen(true);
      return;
    }
  };

  const isProducts = comingSoonFeature === "Products";
  const isPayments = comingSoonFeature === "Payments";

  const comingSoonTitle = comingSoonFeature ? `${comingSoonFeature} are coming soon` : "";

  const comingSoonDescription = isProducts
    ? "We’re building a dedicated products experience with advanced filters, real-time availability, and seamless workflow integration."
    : isPayments
    ? "We’re enabling a secure payments module with invoices, transaction history, and real-time payment confirmations."
    : "New experience is under development — stay tuned.";

  return (
    <>
      {/* PREMIUM FLOATING NAVBAR */}
      <div className="fixed bottom-3 left-0 w-full z-50 lg:hidden px-4">
        <div
          className="
            mx-auto max-w-md
            rounded-2xl border border-white/40
            bg-white/70 backdrop-blur-xl
            shadow-[0_12px_40px_rgba(0,0,0,0.18)]
            px-4 py-3
          "
        >
          <div className="flex items-center justify-between">
            {links.map((item) => {
              const active = item.type === "route" && pathname === item.path;

              return (
                <button
                  key={item.id}
                  onClick={() => handleClick(item)}
                  className="
                    relative flex flex-col items-center justify-center
                    w-[70px] py-2 rounded-xl
                    transition-all duration-300
                    active:scale-[0.96]
                  "
                >
                  {/* Active glow */}
                  {active && (
                    <span className="absolute inset-0 rounded-xl bg-emerald-500/10 blur-md" />
                  )}

                  {/* Icon bubble */}
                  <span
                    className={
                      "relative z-10 grid place-items-center h-10 w-10 rounded-2xl transition-all duration-300 " +
                      (active
                        ? "bg-emerald-600 text-white shadow-[0_10px_22px_rgba(16,185,129,0.35)]"
                        : "bg-white/60 text-gray-700 border border-gray-200")
                    }
                  >
                    {item.icon}
                  </span>

                  <span
                    className={
                      "relative z-10 mt-1 text-[11px] font-semibold tracking-wide " +
                      (active ? "text-emerald-700" : "text-gray-600")
                    }
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* COMING SOON MODAL */}
      {comingSoonFeature && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[95] px-4">
          <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-700" />

            <button
              onClick={() => setComingSoonFeature(null)}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl"
            >
              ×
            </button>

            <div className="p-7 pt-8">
              <div className="flex items-center justify-center mb-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center shadow-inner">
                  <FiStar className="text-emerald-600" size={24} />
                </div>
              </div>

              <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
                {comingSoonTitle}
              </h2>

              <p className="text-sm text-gray-600 text-center mb-5">
                {comingSoonDescription}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setComingSoonFeature(null)}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition"
                >
                  Got it, close
                </button>
                <button
                  disabled
                  className="flex-1 py-2.5 rounded-lg border border-dashed border-gray-300 text-xs sm:text-sm text-gray-500 cursor-not-allowed"
                >
                  Notify me when live (Soon)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HELP MODAL */}
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </>
  );
};

export default MobileNavbar;
