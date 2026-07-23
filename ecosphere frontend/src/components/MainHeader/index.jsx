import React, { useEffect, useState } from "react";
import {
  FiDownload,
  FiHeadphones,
  FiClock,
  FiCreditCard,
  FiFileText,
  FiUser,
  FiMenu,
  FiX,
  FiStar,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import HelpModal from "../../Pages/HelpModal";

const MainHeader = () => {
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isGetAppModalOpen, setIsGetAppModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Coming soon modal state
  const [comingSoonFeature, setComingSoonFeature] = useState(null);

  const menus = [
    { name: "Technology", link: "/technology" },
    { name: "Segments", link: "/segments" },
    { name: "Products", link: "/products", comingSoon: true },
    { name: "Blogs", link: "/blogs", comingSoon: true },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuClick = (menu) => {
    if (menu.comingSoon) {
      setComingSoonFeature(menu.name);
    } else {
      navigate(menu.link);
    }
  };

  // ---------- COMING SOON CONTENT LOGIC ----------
  const isProducts = comingSoonFeature === "Products";
  const isBlogs = comingSoonFeature === "Blogs";

  const comingSoonTitle = comingSoonFeature
    ? `${comingSoonFeature} are coming soon`
    : "";

  const comingSoonDescription = isProducts
    ? "We’re building a dedicated products experience with advanced filters, real-time stock visibility, and seamless integration into your Ecommerce workflow."
    : isBlogs
    ? "We’re crafting an insights-driven blog experience with expert articles, industry updates, and sustainability knowledge tailored for modern businesses."
    : "New experience is under development — stay tuned.";

  return (
    <>
      {/* BACKDROP FOR MOBILE MENU */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[40]"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* HEADER */}
      <header
        className={
          isScrolled
            ? "fixed top-0 left-0 w-full z-[50] bg-[rgba(255,255,255,0.55)] backdrop-blur-[12px] border-b border-[rgba(255,255,255,0.3)] shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-[350ms]"
            : "fixed top-0 left-0 w-full z-[50] bg-transparent transition-all duration-[350ms]"
        }
      >
        <div className="max-w-[1350px] mx-auto">
          {/* TOP BAR (DESKTOP ONLY, WHEN NOT SCROLLED) */}
          {!isScrolled && !isMobile && (
            <div className="py-[16px] px-6 flex justify-end items-center gap-7 text-[14px] font-semibold text-white whitespace-nowrap">
              <button
                onClick={() => setIsGetAppModalOpen(true)}
                className="flex items-center gap-1"
              >
                <FiDownload /> Download App
              </button>

              <button
                onClick={() => setIsHelpModalOpen(true)}
                className="flex items-center gap-1"
              >
                <FiHeadphones /> Help &amp; Support
              </button>

              <button
                onClick={() => navigate("/certifications")}
                className="flex items-center gap-[6px] cursor-pointer"
              >
                <FiFileText size={15} /> Certifications
              </button>

              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-[6px] cursor-pointer"
              >
                <FiCreditCard size={15} /> Make a Payment
              </button>

              <button
                onClick={() => navigate("/login")}
                className={
                  "flex items-center gap-[6px] cursor-pointer " +
                  (isScrolled ? "text-[#1f2937]" : "text-white")
                }
              >
                <FiUser size={15} /> Log In ▾
              </button>
            </div>
          )}

          {/* NAVIGATION ROW */}
          <div
            className={
              "flex justify-between items-center px-6 " +
              (isScrolled ? "py-[10px]" : "py-[16px]")
            }
          >
            {/* LOGO */}
            <img
              src={isScrolled ? "/ecospare-logo.png" : "/ecospherelogo.png"}
              className={
                (isScrolled
                  ? "h-[65px] lg:h-[70px]"
                  : "h-[85px] lg:h-[105px] -mt-0 -ml-8 lg:-mt-14 lg:-ml-6") +
                " transition-all duration-[400ms] cursor-pointer"
              }
              onClick={() => navigate("/")}
            />

            {/* MOBILE HAMBURGER ICON */}
            {isMobile && (
              <button onClick={() => setIsMenuOpen(true)} className="mr-2">
                <FiMenu
                  size={32}
                  className={isScrolled ? "text-[#1f2937]" : "text-white"}
                />
              </button>
            )}

            {/* DESKTOP NAVIGATION */}
            {!isMobile && (
              <nav
                className={
                  "flex items-center gap-[32px] text-[16px] font-semibold flex-1 justify-end " +
                  (isScrolled ? "text-[#1f2937]" : "text-white")
                }
              >
                {menus.map((menu, i) => (
                  <span
                    key={i}
                    onClick={() => handleMenuClick(menu)}
                    className="relative pb-[6px] cursor-pointer group"
                  >
                    {menu.name}
                    <span
                      className={
                        "pointer-events-none absolute left-0 -bottom-[2px] h-[2px] w-0 rounded-full transition-all duration-300 ease-out group-hover:w-full " +
                        (isScrolled ? "bg-[#064e3b]" : "bg-white")
                      }
                    />
                  </span>
                ))}

                <button
                  onClick={() => navigate("/partnerwithus")}
                  className="py-[10px] px-[18px] bg-[#84cc16] text-white rounded-[6px] font-medium cursor-pointer whitespace-nowrap"
                >
                  Partner With Us
                </button>
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE SLIDE MENU */}
      <div
        className={
          "fixed top-0 left-0 h-full w-[70%] sm:w-[55%] max-w-[320px] bg-white z-[60] shadow-2xl p-7 transform transition-all duration-500 ease-out " +
          (isMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0")
        }
      >
        {/* CLOSE BUTTON */}
        <button
          className="absolute top-5 right-5 text-gray-600 hover:text-black transition"
          onClick={() => setIsMenuOpen(false)}
        >
          <FiX size={28} />
        </button>

        {/* LOGO */}
        <img
          src="/ecospare-logo.png"
          className="h-[55px] mb-10 mt-4 ml-1 cursor-pointer"
          onClick={() => {
            navigate("/");
            setIsMenuOpen(false);
          }}
        />

        {/* MENU ITEMS */}
        <div className="flex flex-col gap-7 text-[18px] font-semibold text-gray-800 tracking-wide ml-1">
          {menus.map((menu, i) => (
            <span
              key={i}
              onClick={() => {
                if (menu.comingSoon) {
                  setComingSoonFeature(menu.name);
                } else {
                  navigate(menu.link);
                }
                setIsMenuOpen(false);
              }}
              className="relative cursor-pointer group"
            >
              {menu.name}
              <span
                className="pointer-events-none absolute left-0 -bottom-[3px] h-[2px] w-0 rounded-full bg-emerald-600 transition-all duration-300 ease-out group-hover:w-full"
              />
            </span>
          ))}

          {/* PARTNER BUTTON */}
          <button
            onClick={() => {
              navigate("/partnerwithus");
              setIsMenuOpen(false);
            }}
            className="mt-6 py-3 px-6 bg-[#84cc16] rounded-lg font-semibold text-black text-left w-fit hover:bg-[#76b814] transition-all shadow-md"
          >
            Partner With Us
          </button>
        </div>
      </div>

      {/* GET APP MODAL */}
      {isGetAppModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[90]">
          <div className="bg-white p-6 rounded-xl relative max-w-sm shadow-xl">
            <button
              onClick={() => setIsGetAppModalOpen(false)}
              className="absolute top-3 right-4 text-gray-600 hover:text-red-600"
            >
              ×
            </button>

            <h2 className="text-xl font-bold text-center mb-4 text-emerald-700">
              Download the Ecosphere App
            </h2>

            <p className="text-gray-700 text-sm text-center mb-5">
              Book services faster, track orders, and earn rewards.
            </p>

            <div className="flex justify-center gap-4">
              <img src="/playstore.svg" className="h-10" />
              <img src="/appstore.svg" className="h-10" />
            </div>
          </div>
        </div>
      )}

      {/* COMING SOON MODAL */}
      {comingSoonFeature && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[95]">
          <div className="relative bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
            {/* Top accent bar */}
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

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </>
  );
};

export default MainHeader;
