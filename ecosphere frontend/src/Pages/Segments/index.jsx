import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHome,
  FiBriefcase,
  FiTruck,
  FiLayers,
  FiUsers,
  FiArrowRight,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

const SegmentsWeServeSection = () => {
  const navigate = useNavigate();
  const goTo = (path) => navigate(path);

  const segments = [
    {
      label: "Living Spaces",
      title: "Communities",
      description:
        "Neighbourhood-focused waste solutions that keep residential spaces clean, odour-free and compliant.",
      icon: <FiHome size={26} className="text-emerald-700" />,
      items: [
        "Apartments & gated communities",
        "Independent houses & layouts",
        "Townships & plotted developments",
        "Villa communities & row houses",
      ],
    },
    {
      label: "Commercial",
      title: "Commercial Spaces",
      description:
        "High-frequency, professional waste management for premium customer-facing environments.",
      icon: <FiBriefcase size={26} className="text-emerald-700" />,
      items: [
        "Restaurants & QSRs",
        "Hotels & resorts",
        "Retail stores & malls",
        "Office spaces & business parks",
        "Co-working spaces & shared offices",
      ],
    },
    {
      label: "Industrial",
      title: "Industrial Facilities",
      description:
        "Heavy-duty, SOP-driven waste operations built for manufacturing and logistics hubs.",
      icon: <FiTruck size={26} className="text-emerald-700" />,
      items: [
        "Manufacturing units & plants",
        "Warehouses & storage facilities",
        "Logistics & distribution centres",
        "Industrial estates & SEZ clusters",
      ],
    },
    {
      label: "Bulk Buyers",
      title: "Bulk Buyers",
      description:
        "Structured bulk-sourcing programs for organisations that procure large volumes of recoverable waste.",
      icon: <FiLayers size={26} className="text-emerald-700" />,
      items: [
        "Scrap aggregators & consolidators",
        "Recyclable material buyers",
        "Food waste processing units",
        "Composting & biomass facilities",
      ],
    },
    {
      label: "B2B Services",
      title: "B2B Service Partners",
      description:
        "Integrated waste services for facility and housekeeping partners who manage sites on behalf of clients.",
      icon: <FiUsers size={26} className="text-emerald-700" />,
      items: [
        "FM companies & IFM partners",
        "Housekeeping & soft services agencies",
        "Facility management partners",
        "Outsourced manpower service providers",
      ],
    },
  ];

  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <section
        className="relative w-full sm:h-[200px] min-h-[520px] md:h-[595px] bg-cover bg-center flex items-center overflow-hidden"
      >
         <div
          className="absolute inset-0 bg-cover bg-center md:hidden"
          style={{ backgroundImage: "url('/segment-bg-mobile.jpeg')" }}
        />

        {/* ✅ Desktop Background */}
        <div
          className="absolute inset-0 bg-cover bg-center hidden md:block"
          style={{ backgroundImage: "url('/segment-bg.jpeg')" }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/10 md:to-transparent"></div>
        <div className="absolute top-0 left-0 w-60 h-60 bg-lime-400/10 blur-[120px] animate-pulse pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 px-4 sm:px-6 lg:px-12 gap-10 md:gap-12 pt-28 md:pt-32 pb-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* LEFT CONTENT */}
          <div className="flex flex-col justify-center text-white">
            <p className="uppercase tracking-[0.2em] text-[10px] sm:text-xs md:text-sm text-lime-300 mb-3">
              WASTE SOLUTIONS • ECOSPHERE
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-3 sm:mb-4">
              Segments We Serve in <br />
              <span className="bg-gradient-to-r from-lime-400 to-emerald-500 bg-clip-text text-transparent">
                Waste Management
              </span>
            </h1>


            {/* <div className="flex flex-col xs:flex-row flex-wrap gap-3 w-full">
              <button
                onClick={() => goTo("/contact")}
                className="w-full xs:w-auto px-5 py-2.5 rounded-full bg-lime-400 text-black font-semibold text-sm shadow-lg hover:bg-lime-300 transition inline-flex items-center justify-center gap-2"
              >
                Talk to a Waste Expert
                <FiArrowRight size={16} />
              </button>
              <button
                onClick={() => goTo("/technology")}
                className="w-full xs:w-auto px-5 py-2.5 rounded-full border border-white/30 text-sm font-medium hover:bg-white/10 transition"
              >
                Explore Our Technology
              </button>
            </div> */}
          </div>

          {/* RIGHT CONTENT – HIGHLIGHT BOX */}
          <motion.div
            className="flex items-center justify-center lg:justify-end hidden lg:block"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 sm:p-6 md:p-7 max-w-md w-full shadow-2xl">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-lime-300 mb-2">
                Built Around Bulk Generators
              </h3>
              <p className="text-xs sm:text-sm text-gray-100 mb-4">
                EcoSphere is designed for bulk waste generators who need
                predictability, documentation and zero excuses – across
                residential, commercial, industrial and service-led segments.
              </p>

              <ul className="space-y-2 text-sm sm:text-sm text-gray-100">
                <li>• Digital job cards & GPS-tracked collections</li>
                <li>• Segregated wet, dry & reject waste handling</li>
                <li>• BSF-based wet waste processing & recyclables recovery</li>
                <li>• Monthly compliance, manifests & certificates</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ================= SEGMENTS GRID SECTION ================= */}
      <section className="w-full bg-gray-50 py-10 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7 md:mb-8">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase mb-2">
                SEGMENTS
              </p>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Waste solutions tailored for every segment.
              </h2>

              <p className="text-sm sm:text-sm md:text-base text-gray-600 mt-2 max-w-2xl">
                From gated communities to manufacturing hubs, scrap buyers and
                B2B service partners – EcoSphere aligns operations, pricing and
                documentation to the realities of each segment.
              </p>
            </div>

            <button
              onClick={() => goTo("/partnerwithus")}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-emerald-700 text-white text-sm md:text-sm font-semibold shadow hover:bg-emerald-800 transition gap-2 self-start md:self-auto"
            >
              Partner with EcoSphere
              <FiArrowRight size={16} />
            </button>
          </div>

          {/* SEGMENTS GRID */}
          <motion.div
            className="grid gap-5 sm:gap-6 md:gap-7 sm:grid-cols-2 xl:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {segments.map((segment, index) => (
              <motion.div
                key={segment.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm 
                           hover:shadow-md hover:-translate-y-1 transition-all duration-200 p-4 sm:p-5 flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[14px] sm:text-[11px] font-semibold uppercase tracking-wide">
                    {segment.label}
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition">
                    {segment.icon}
                  </div>
                </div>

                <h3 className="text-lg sm:text-lg font-semibold text-gray-900 mb-2">
                  {segment.title}
                </h3>

                <p className="text-sm sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  {segment.description}
                </p>

                <ul className="space-y-1.5 text-sm sm:text-sm text-gray-700 flex-1">
                  {segment.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* ================= COMPARISON SECTION ================= */}
          <div className="mt-10 sm:mt-12 md:mt-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5 md:mb-6">
              <div>
                <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase mb-2">
                  WHY ECOSPHERE
                </p>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  Traditional waste vendors vs EcoSphere.
                </h3>
                <p className="text-sm sm:text-sm md:text-base text-gray-600 mt-1 max-w-2xl">
                  Move from manual, reactive waste handling to a structured,
                  transparent and technology-enabled ecosystem that works across
                  all your segments.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
              {/* Traditional Vendor */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white rounded-2xl border border-red-100 shadow-sm p-4 sm:p-5 md:p-6"
              >
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2.5 rounded-xl bg-red-50">
                    <FiXCircle className="text-red-500" size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-base font-semibold text-gray-900">
                      Traditional Waste Vendor
                    </h4>
                    <p className="text-[11px] sm:text-xs text-gray-500">
                      Reactive, manual and difficult to audit.
                    </p>
                  </div>
                </div>

                <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-sm text-gray-700">
                  <li>• Phone-based coordination, no real-time visibility</li>
                  <li>• Paper logs, missing or incomplete documentation</li>
                  <li>• Collections often missed or delayed without alerts</li>
                  <li>• No GPS tracking for vehicle movement</li>
                  <li>• Compliance responsibility pushed back to the client</li>
                  <li>• Minimal support for ESG or sustainability reporting</li>
                </ul>
              </motion.div>

              {/* EcoSphere */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-emerald-900 rounded-2xl border border-emerald-700 shadow-md p-4 sm:p-5 md:p-6 text-white relative overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 w-32 sm:w-40 h-32 sm:h-40 bg-emerald-700/40 rounded-full blur-3xl"></div>

                <div className="flex items-center gap-3 mb-3 sm:mb-4 relative z-10">
                  <div className="p-2.5 rounded-xl bg-emerald-700/60">
                    <FiCheckCircle className="text-lime-300" size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-base font-semibold">
                      EcoSphere Waste Solutions
                    </h4>
                    <p className="text-[13px] sm:text-xs text-emerald-100">
                      Digital, predictable and audit-ready from day one.
                    </p>
                  </div>
                </div>

                <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-sm text-emerald-50 relative z-10">
                  <li>• GPS-enabled vehicles & time-stamped collection logs</li>
                  <li>• Digital job cards, photos and e-signatures</li>
                  <li>• Client dashboards with live status & history</li>
                  <li>• Automated monthly compliance reports & manifests</li>
                  <li>• Integrated BSF, recycling & reject disposal partners</li>
                  <li>• Supports ESG, CSR and sustainability reporting</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SegmentsWeServeSection;
