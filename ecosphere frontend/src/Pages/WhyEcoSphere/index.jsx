import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaLeaf,
  FaClock,
  FaArrowsAlt,
  FaDollarSign,
  FaRecycle,
  FaChartLine,
  FaShieldAlt,
  FaTools,
  FaMedal,
  FaChevronDown,
} from "react-icons/fa";

const comparisonData = [
  {
    icon: <FaLeaf className="text-emerald-600 text-xl" />,
    title: "Environmental Impact",
    traditional: "❌ High carbon emissions, methane from landfills",
    eco: "✔ 95% waste diversion, 50% CO₂ reduction, zero landfill",
  },
  {
    icon: <FaClock className="text-emerald-600 text-xl" />,
    title: "Processing Time",
    traditional: "❌ Weeks to months for decomposition",
    eco: "✔ 10–14 days complete bioconversion cycle",
  },
  {
    icon: <FaArrowsAlt className="text-emerald-600 text-xl" />,
    title: "Space Requirements",
    traditional: "❌ Large land areas required",
    eco: "✔ Compact modular systems, 70% less space",
  },
  {
    icon: <FaDollarSign className="text-emerald-600 text-xl" />,
    title: "Operating Costs",
    traditional: "❌ High transportation & disposal fees",
    eco: "✔ 65% cost reduction + revenue generation",
  },
  {
    icon: <FaRecycle className="text-emerald-600 text-xl" />,
    title: "Resource Recovery",
    traditional: "❌ Minimal to no resource recovery",
    eco: "✔ High-quality fertilizer & protein production",
  },
  {
    icon: <FaChartLine className="text-emerald-600 text-xl" />,
    title: "Scalability",
    traditional: "❌ Limited by infrastructure",
    eco: "✔ Modular design, easily scalable systems",
  },
  {
    icon: <FaShieldAlt className="text-emerald-600 text-xl" />,
    title: "Regulatory Compliance",
    traditional: "❌ Complex permits & environmental risks",
    eco: "✔ ISO 14001 certified, exceeds standards",
  },
  {
    icon: <FaTools className="text-emerald-600 text-xl" />,
    title: "Maintenance",
    traditional: "❌ Heavy equipment, frequent repairs",
    eco: "✔ IoT monitoring, predictive maintenance",
  },
];

export default function WhyEcoSphere() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 md:px-12 bg-white">
      {/* HEADER */}
      <motion.div
        className="text-center mb-10 sm:mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-emerald-50 text-emerald-700 mb-5">
          <FaLeaf className="text-emerald-600" />
          <span className="text-xs sm:text-sm font-semibold">
            Traditional vs EcoSphere
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
          Why Choose EcoSphere?
        </h2>
        <p className="text-slate-600 mt-2 text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
          Compare traditional waste management methods with our innovative BSF
          bioconversion technology.
        </p>
      </motion.div>

      {/* DESKTOP TABLE (keeps your “table” look) */}
      <motion.div
        className="hidden md:block bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-6xl mx-auto"
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        {/* TITLE */}
        <div className="p-6 border-b bg-white">
          <h3 className="text-xl font-bold text-slate-900">
            Traditional vs EcoSphere Solutions
          </h3>
          <p className="text-slate-500 text-sm">
            Comprehensive comparison of waste management approaches
          </p>
        </div>

        {/* TABLE HEADER */}
        <div className="grid grid-cols-12 bg-slate-100 px-6 py-3 font-semibold text-slate-700 text-sm">
          <div className="col-span-4">Feature</div>
          <div className="col-span-4 text-center">Traditional Methods</div>
          <div className="col-span-4 text-center">EcoSphere Technology</div>
        </div>

        {/* TABLE ITEMS */}
        {comparisonData.map((item, i) => (
          <motion.div
            key={i}
            className="grid grid-cols-12 px-6 py-5 border-t hover:bg-slate-50 transition"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            viewport={{ once: true }}
          >
            <div className="col-span-4 flex items-center gap-3 font-semibold text-slate-900">
              <span className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                {item.icon}
              </span>
              {item.title}
            </div>

            <div className="col-span-4 flex items-center text-red-600 font-medium">
              {item.traditional}
            </div>

            <div className="col-span-4 flex items-center text-emerald-700 font-semibold">
              {item.eco}
            </div>
          </motion.div>
        ))}

        {/* FOOTER ROW */}
        <motion.div
          className="px-6 py-5 border-t bg-slate-50 flex items-center gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          viewport={{ once: true }}
        >
          <FaMedal className="text-emerald-600 text-2xl" />
          <div>
            <p className="font-bold text-emerald-700">
              Overall Advantage: 85% Better Performance
            </p>
            <p className="text-slate-600 text-sm -mt-1">
              Based on comprehensive environmental and operational metrics
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* MOBILE UI (accordion cards, super clean) */}
      <div className="md:hidden max-w-2xl mx-auto">
        <motion.div
          className="rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          viewport={{ once: true }}
        >
          <div className="p-5 bg-white border-b">
            <h3 className="text-lg font-bold text-slate-900">
              Traditional vs EcoSphere
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Tap a feature to compare
            </p>
          </div>

          <div className="p-4 bg-slate-50 space-y-3">
            {comparisonData.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-3 p-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <p className="font-semibold text-slate-900 text-left truncate">
                        {item.title}
                      </p>
                    </div>

                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-slate-500"
                    >
                      <FaChevronDown />
                    </motion.span>
                  </button>

                  <motion.div
                    initial={false}
                    animate={{
                      height: isOpen ? "auto" : 0,
                      opacity: isOpen ? 1 : 0,
                    }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      <div className="p-3 rounded-xl border bg-red-50 border-red-100">
                        <p className="text-[11px] font-bold text-red-700 mb-1">
                          Traditional
                        </p>
                        <p className="text-sm text-red-700 font-medium">
                          {item.traditional}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl border bg-emerald-50 border-emerald-100">
                        <p className="text-[11px] font-bold text-emerald-700 mb-1">
                          EcoSphere
                        </p>
                        <p className="text-sm text-emerald-800 font-semibold">
                          {item.eco}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          <div className="p-4 bg-white border-t">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <FaMedal className="text-emerald-600 text-xl mt-0.5" />
              <div>
                <p className="font-bold text-emerald-800">
                  Overall Advantage: 85% Better Performance
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Based on comprehensive environmental and operational metrics
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
