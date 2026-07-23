
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrashAlt,
  FaFlask,
  FaLeaf,
  FaCube,
  FaStar,
  FaCheckCircle,
  FaCloud,
  FaTemperatureLow,
} from "react-icons/fa";
import React, { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";


/* ================================================================
   STEP 1 — YOUR EXISTING HERO SECTION
================================================================ */

const BsfInnovation = () => {
  const steps = [
    {
      day: "Day 0",
      title: "Organic Waste Input",
      desc: "Pre-sorted organic waste materials including food scraps, agricultural residue, and biodegradable materials enter the processing facility.",
      output: "1000 kg waste",
      icon: <FaTrashAlt className="text-white text-3xl" />,
    },
    {
      day: "Day 1–2",
      title: "BSF Larvae Introduction",
      desc: "Black Soldier Fly larvae are introduced into the organic substrate in climate-controlled chambers optimized for rapid consumption.",
      output: "50,000 larvae",
      icon: <FaFlask className="text-white text-3xl" />,
    },
    {
      day: "Day 3–10",
      title: "Active Decomposition",
      desc: "Larvae actively consume organic matter, converting it through biological processes into protein-rich biomass and valuable byproducts.",
      output: "95% conversion",
      icon: <FaLeaf className="text-white text-3xl" />,
    },
    {
      day: "Day 11–12",
      title: "Protein & Oil Extraction",
      desc: "Mature larvae are harvested and processed to extract high-quality protein meal and oil for animal feed and industrial applications.",
      output: "200 kg protein",
      icon: <FaCube className="text-white text-3xl" />,
    },
    {
      day: "Day 13–14",
      title: "Frass Collection",
      desc: "Nutrient-rich frass (larvae excrement) is collected and processed into premium organic fertilizer with superior soil amendment properties.",
      output: "300 kg fertilizer",
      icon: <FaStar className="text-white text-3xl" />,
    },
  ];

  const facilityTabs = [
    {
      title: "Larvae Chambers",
      description:
        "Climate-controlled breeding and growth chambers where Black Soldier Fly larvae thrive in optimal conditions.",
      img: "/facility1.jpg",
      temp: "27–30°C",
      humidity: "60–70%",
      features: [
        "Automated climate control",
        "Optimal growth conditions",
        "Real-time monitoring",
        "Biosecurity protocols",
      ],
    },
    {
      title: "Feeding Systems",
      description:
        "Automated feeding trays distribute pre-processed organic waste to larvae chambers efficiently.",
      img: "/facility2.jpg",
      temp: "27–30°C",
      humidity: "55–65%",
      features: [
        "Automated feeding",
        "Even waste distribution",
        "Zero manual handling",
      ],
    },
    {
      title: "Processing Units",
      description:
        "State-of-the-art extraction units separate larvae biomass into protein, oil, and fertilizer.",
      img: "/facility3.jpg",
      temp: "25–28°C",
      humidity: "50–60%",
      features: [
        "High-yield extraction",
        "Low energy consumption",
        "Advanced separation",
      ],
    },
    {
      title: "Quality Control Lab",
      description:
        "Advanced laboratory units conduct continuous testing on protein, oil quality, and microbial safety.",
      img: "/facility4.jpg",
      temp: "22–25°C",
      humidity: "45–55%",
      features: [
        "Microbial safety testing",
        "Nutritional quality analysis",
        "Regulatory compliance",
      ],
    },
  ];

  const [activeTab, setActiveTab] = useState(0);
  const mobileTrackRef = useRef(null);
const [activeDot, setActiveDot] = useState(0);

useEffect(() => {
  const el = mobileTrackRef.current;
  if (!el) return;

  const gap = 40; // matches gap-10 (approx)
  const getCardWidth = () => {
    const first = el.querySelector("[data-card='true']");
    return first ? first.getBoundingClientRect().width : 320;
  };

  let rafId = 0;

  const updateDot = () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const cardW = getCardWidth();
      const idx = Math.round(el.scrollLeft / (cardW + gap)) % steps.length;
      setActiveDot((idx + steps.length) % steps.length);
    });
  };

  el.addEventListener("scroll", updateDot, { passive: true });
  updateDot();

  // ✅ Auto-scroll
  const id = setInterval(() => {
    const cardW = getCardWidth();
    const moveBy = cardW + gap;

    // loop back
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 5) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollBy({ left: moveBy, behavior: "smooth" });
    }
  }, 2500);

  return () => {
    clearInterval(id);
    el.removeEventListener("scroll", updateDot);
    cancelAnimationFrame(rafId);
  };
}, [steps.length]);


  return (
    <>
      <section className="relative w-full min-h-[620px] bg-black flex items-center overflow-hidden">
  <div
    className="absolute inset-0 bg-cover bg-center opacity-60"
    style={{ backgroundImage: "url('/bsfhome.jpeg')" }}
  />

  <div className="relative z-10 w-full px-4 sm:px-6 lg:px-20 py-14 sm:py-20">
    <div className="w-full max-w-5xl">
      <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 sm:mb-6 mt-2 sm:mt-4">
        Black Soldier Fly <br />
        Processing <br />
        Technology
      </h1>

      <p className="text-sm sm:text-lg md:text-xl text-gray-300 max-w-3xl mb-8 sm:mb-12">
        Revolutionary biotechnology that transforms organic waste into valuable
        protein, oil, and organic fertilizer through nature&apos;s most
        efficient decomposer.
      </p>

      {/* ✅ Always 3 in one line */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl text-white rounded-xl text-center p-3 sm:p-5 md:p-6 min-w-0">
          <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-lime-300 truncate">
            95%
          </h3>
          <p className="text-[10px] sm:text-sm mt-1 sm:mt-2 text-gray-100/90">
            Waste Conversion
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 backdrop-blur-xl text-white rounded-xl text-center p-3 sm:p-5 md:p-6 min-w-0">
          <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-lime-300 truncate">
            14 Days
          </h3>
          <p className="text-[10px] sm:text-sm mt-1 sm:mt-2 text-gray-100/90">
            Processing Cycle
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 backdrop-blur-xl text-white rounded-xl text-center p-3 sm:p-5 md:p-6 min-w-0">
          <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-lime-300 truncate">
            Zero
          </h3>
          <p className="text-[10px] sm:text-sm mt-1 sm:mt-2 text-gray-100/90">
            Landfill Waste
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<section className="w-full bg-[#f5f8f3] py-10 px-6 lg:px-20 overflow-hidden">
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7 }}
    className="text-center mb-16"
  >
    <div className="flex justify-center items-center gap-2 text-green-700 font-semibold mb-3">
      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
      Circular Process
    </div>

    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
      Complete Lifecycle Transformation
    </h2>

    <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
      From organic waste to valuable resources in just 14 days through nature&apos;s most efficient biological process.
    </p>
  </motion.div>

  {/* ================= MOBILE VIEW (AUTO SCROLL + ARROWS + DOTS) ================= */}
  <div className="lg:hidden relative">
    {/* Left Arrow */}
    <button
      type="button"
      aria-label="Previous"
      onClick={() => {
        const el = mobileTrackRef.current;
        if (!el) return;
        const first = el.querySelector("[data-card='true']");
        const cardW = first ? first.getBoundingClientRect().width : 320;
        el.scrollBy({ left: -(cardW + 40), behavior: "smooth" });
      }}
      className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 border border-gray-200 shadow-lg rounded-full w-10 h-10 flex items-center justify-center"
    >
      <FaChevronLeft className="text-gray-800" />
    </button>

    {/* Right Arrow */}
    <button
      type="button"
      aria-label="Next"
      onClick={() => {
        const el = mobileTrackRef.current;
        if (!el) return;
        const first = el.querySelector("[data-card='true']");
        const cardW = first ? first.getBoundingClientRect().width : 320;
        el.scrollBy({ left: cardW + 40, behavior: "smooth" });
      }}
      className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 border border-gray-200 shadow-lg rounded-full w-10 h-10 flex items-center justify-center"
    >
      <FaChevronRight className="text-gray-800" />
    </button>

    {/* Track */}
    <div
      ref={mobileTrackRef}
      className="flex gap-10 overflow-x-auto scroll-smooth snap-x snap-mandatory px-12"
      style={{
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
      }}
    >
      {/* hide scrollbar (webkit) */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {steps.map((step, index) => (
        <motion.div
          key={index}
          data-card="true"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.08 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-[85vw] sm:w-[420px] flex-shrink-0 relative hover:scale-105 transition duration-300 snap-center"
        >
          <div className="w-14 h-14 bg-gradient-to-b from-green-600 to-green-400 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
            {step.icon}
          </div>

          <p className="text-green-700 font-semibold text-sm">{step.day}</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1">{step.title}</h3>

          <p className="text-gray-600 text-sm mt-3 leading-relaxed">{step.desc}</p>

          <div className="mt-4 w-full border-t border-gray-200"></div>

          <p className="text-green-700 font-semibold mt-4 text-sm">
            Output: <span className="font-bold">{step.output}</span>
          </p>
        </motion.div>
      ))}
    </div>

    {/* Dotted indicator below cards */}
    <div className="flex justify-center gap-2 mt-6">
      {steps.map((_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full transition ${
            activeDot === i ? "bg-green-600" : "bg-green-200"
          }`}
        />
      ))}
    </div>
  </div>

  {/* ================= DESKTOP ORIGINAL (UNTOUCHED) ================= */}
  <div className="relative hidden lg:flex flex-col lg:flex-row justify-center items-start gap-10 lg:gap-6">
    {steps.map((step, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.12 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full lg:w-1/5 relative hover:scale-105 transition duration-300"
      >
        <div className="w-14 h-14 bg-gradient-to-b from-green-600 to-green-400 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
          {step.icon}
        </div>

        <p className="text-green-700 font-semibold text-sm">{step.day}</p>
        <h3 className="text-xl font-bold text-gray-900 mt-1">{step.title}</h3>

        <p className="text-gray-600 text-sm mt-3 leading-relaxed">{step.desc}</p>

        <div className="mt-4 w-full border-t border-gray-200"></div>

        <p className="text-green-700 font-semibold mt-4 text-sm">
          Output: <span className="font-bold">{step.output}</span>
        </p>

        {index !== steps.length - 1 && (
          <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
            <div className="w-8 h-1 bg-green-400 rounded-full"></div>
          </div>
        )}
      </motion.div>
    ))}
  </div>
</section>

    </>
  );
};

export default BsfInnovation;
