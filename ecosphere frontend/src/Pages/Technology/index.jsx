import React from "react";
import { useNavigate } from "react-router-dom";
import ServiceGridTch from "../servicegridtech";
import { motion } from "framer-motion";

const InfraLoginSection = () => {
  const navigate = useNavigate();
  const goTo = (path) => navigate(path);

  return (
    <>
     <section className="relative w-full h-[590px] flex items-center justify-center overflow-hidden">
  {/* VIDEO BG */}
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 w-full h-full object-cover"
    src="https://hompure.in/wp-content/uploads/2025/12/Untitled-design.mp4"
  />

  {/* Overlay */}
  <div className="absolute inset-0 bg-gradient-to-l from-black/85 via-black/70 to-black/40"></div>

  {/* Soft glow */}
  <div className="absolute top-0 left-0 w-72 h-72 bg-lime-400/10 blur-[120px] animate-pulse"></div>

  {/* CONTENT */}
  <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-12">
    <div className="flex flex-col items-center justify-center text-white animate-fadeUp text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
        World-Class <br />
        <span className="bg-gradient-to-r from-lime-400 to-emerald-500 bg-clip-text text-transparent">
          Infrastructure
        </span>
      </h1>

      <p className="text-base md:text-xl text-gray-200 max-w-2xl mb-10">
        State-of-the-art facilities and cutting-edge technology powering
        sustainable waste management.
      </p>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:gap-4 justify-center">
        <div className="bg-white/10 backdrop-blur-xl text-white p-4 md:p-5 rounded-xl border border-white/20 flex flex-col items-center justify-center h-24 md:h-auto w-full md:w-40 animate-cardUp">
          <h3 className="text-xl md:text-3xl font-extrabold">50+</h3>
          <p className="text-[11px] md:text-sm text-gray-200 -mt-1">
            Acres Facility
          </p>
        </div>


        <div className="bg-white/10 backdrop-blur-xl text-white p-4 md:p-5 rounded-xl border border-white/20 flex flex-col items-center justify-center h-24 md:h-auto w-full md:w-40 animate-cardUp delay-300">
          <h3 className="text-xl md:text-3xl font-extrabold">24/7</h3>
          <p className="text-[11px] md:text-sm text-gray-200 -mt-1">
            Operations
          </p>
        </div>
      </div>
    </div>
  </div>
</section>


      {/* ================= VIRTUAL FACILITY TOURS ================= */}
<section className="bg-[#f7f9fa] py-10 -mt-2 relative overflow-hidden">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center mb-8 sm:mb-12">
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 mb-3 animate-fadeUp">
      Virtual Facility Tours
    </h2>

    <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base animate-fadeUp delay-150">
      Explore our world-class infrastructure through interactive virtual tours.
    </p>
  </div>

  {/* MOBILE HORIZONTAL SCROLLER + DESKTOP GRID */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6">
    
    <div
      className="
        flex gap-4 sm:gap-6
        overflow-x-auto pb-3
        snap-x snap-mandatory
        scrollbar-hide
        sm:grid sm:overflow-visible sm:pb-0
        sm:grid-cols-2 lg:grid-cols-3
      "
      style={{
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* CARD 1 */}
      <div
        onClick={() => goTo("/bsfinnovation")}
        className="
          group relative
          min-w-[86%] xs:min-w-[80%] sm:min-w-0
          snap-start
          p-6 sm:p-8
          bg-white rounded-2xl
          border border-emerald-600
          shadow-md cursor-pointer
          hover:shadow-xl hover:-translate-y-2 hover:border-emerald-700
          transition-all duration-300
          overflow-hidden
          animate-cardUp
        "
      >
        {/* subtle bg glow */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#84cc16]/20 blur-3xl rounded-full opacity-70 group-hover:opacity-100 transition-opacity" />

        <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 relative z-10">
          BSF Innovation
        </h3>
        <p className="text-slate-600 text-sm relative z-10 mb-5">
          🏭 4,00,000 Sq. Ft.
        </p>

        <div
          onClick={(e) => {
            e.stopPropagation();
            goTo("/bsfinnovation");
          }}
          className="
            absolute bottom-4 right-4
            bg-[#84cc16] text-black
            w-[140px] sm:w-40 h-10 rounded-md
            flex items-center justify-center
            shadow-md
            transition-all duration-300
            cursor-pointer
            group-hover:scale-110 group-hover:bg-emerald-700 group-hover:text-white
            z-20
          "
        >
          <span className="text-sm sm:text-base font-semibold">Read More ➜</span>
        </div>
      </div>

      {/* CARD 2 */}
      <div
        onClick={() => goTo("/gpssolutions")}
        className="
          group relative
          min-w-[86%] xs:min-w-[80%] sm:min-w-0
          snap-start
          p-6 sm:p-8
          bg-white rounded-2xl
          border border-gray-300
          shadow-md cursor-pointer
          hover:shadow-xl hover:-translate-y-2 hover:border-emerald-600
          transition-all duration-300
          overflow-hidden
          animate-cardUp sm:delay-150
        "
      >
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-emerald-400/15 blur-3xl rounded-full opacity-70 group-hover:opacity-100 transition-opacity" />

        <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 relative z-10">
          GPS Solutions
        </h3>
        <p className="text-slate-600 text-sm relative z-10 mb-5">
          Live Tracking
        </p>

        <div
          onClick={(e) => {
            e.stopPropagation();
            goTo("/gpssolutions");
          }}
          className="
            absolute bottom-4 right-4
            bg-[#84cc16] text-black
            w-[140px] sm:w-40 h-10 rounded-md
            flex items-center justify-center
            shadow-md
            transition-all duration-300
            cursor-pointer
            group-hover:scale-110 group-hover:bg-emerald-700 group-hover:text-white
            z-20
          "
        >
          <span className="text-sm sm:text-base font-semibold">Read More ➜</span>
        </div>
      </div>

      {/* CARD 3 */}
      <div
        onClick={() => goTo("/certifications")}
        className="
          group relative
          min-w-[86%] xs:min-w-[80%] sm:min-w-0
          snap-start
          p-6 sm:p-8
          bg-white rounded-2xl
          border border-gray-300
          shadow-md cursor-pointer
          hover:shadow-xl hover:-translate-y-2 hover:border-emerald-600
          transition-all duration-300
          overflow-hidden
          animate-cardUp sm:delay-300
        "
      >
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-slate-300/25 blur-3xl rounded-full opacity-70 group-hover:opacity-100 transition-opacity" />

        <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 relative z-10">
          Compliance
        </h3>
        <p className="text-slate-600 text-sm relative z-10 mb-5">
          Certifications
        </p>

        <div
          onClick={(e) => {
            e.stopPropagation();
            goTo("/certifications");
          }}
          className="
            absolute bottom-4 right-4
            bg-[#84cc16] text-black
            w-[140px] sm:w-40 h-10 rounded-md
            flex items-center justify-center
            shadow-md
            transition-all duration-300
            cursor-pointer
            group-hover:scale-110 group-hover:bg-emerald-700 group-hover:text-white
            z-20
          "
        >
          <span className="text-sm sm:text-base font-semibold">Read More ➜</span>
        </div>
      </div>
    </div>
  </div>
</section>

      <ServiceGridTch />
    </>
  );
};

export default InfraLoginSection;
