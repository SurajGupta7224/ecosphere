import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

/* =======================
   INBUILT SVG ICONS
   (No react-icons needed)
======================= */

const IconMapPin = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 2c-3.86 0-7 3.14-7 7 0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
  </svg>
);

const IconTrendingUp = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 17l6-6 4 4 7-7" />
    <path d="M14 8h6v6" />
  </svg>
);

const IconSmartphone = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="7" y="2.5" width="10" height="19" rx="2" />
    <path d="M11 18h2" />
  </svg>
);

const IconShield = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4z" />
    <path d="M9 12l2 2 4-5" />
  </svg>
);

const IconChevronLeft = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const IconChevronRight = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const GpsSolutions = () => {
  const features = useMemo(
    () => [
      {
        icon: (
          <div className="w-12 h-12 p-3 bg-green-700 text-white rounded-xl flex items-center justify-center">
            <IconMapPin className="w-6 h-6" />
          </div>
        ),
        title: "Real-Time Location Tracking",
        desc:
          "Monitor every vehicle with pinpoint accuracy. Live updates every 10 seconds ensure complete operational visibility.",
        meta: "99.9% Uptime",
      },
      {
        icon: (
          <div className="w-12 h-12 p-3 bg-green-700 text-white rounded-xl flex items-center justify-center">
            <IconTrendingUp className="w-6 h-6" />
          </div>
        ),
        title: "Instant Route Optimization",
        desc:
          "AI continuously analyzes traffic, collection schedules and vehicle capacity to deliver the fastest, most efficient routes.",
        meta: "28% Fuel Savings",
      },
      {
        icon: (
          <div className="w-12 h-12 p-3 bg-green-700 text-white rounded-xl flex items-center justify-center">
            <IconSmartphone className="w-6 h-6" />
          </div>
        ),
        title: "Predictive ETA Calculations",
        desc:
          "Machine learning accurately predicts arrival times, enabling superior planning and customer communication.",
        meta: "95% Accuracy",
      },
      {
        icon: (
          <div className="w-12 h-12 p-3 bg-green-700 text-white rounded-xl flex items-center justify-center">
            <IconShield className="w-6 h-6" />
          </div>
        ),
        title: "Geofencing & Alerts",
        desc:
          "Real-time alerts for route deviations, unauthorized stops, and sensitive geofenced areas.",
        meta: "100% Coverage",
      },
    ],
    []
  );

  // ===== Mobile slider controls (Features section only) =====
  const trackRef = useRef(null);
  const [activeDot, setActiveDot] = useState(0);

  const getCardStep = () => {
    const el = trackRef.current;
    if (!el) return 360;

    const first = el.querySelector("[data-card='true']");
    const cardW = first ? first.getBoundingClientRect().width : 320;

    // gap-5 => 20px
    return cardW + 20;
  };

  const goNext = () => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: getCardStep(), behavior: "smooth" });
  };

  const goPrev = () => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: -getCardStep(), behavior: "smooth" });
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let raf = 0;

    const updateDot = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const step = getCardStep();
        const idx = Math.round(el.scrollLeft / step) % features.length;
        setActiveDot((idx + features.length) % features.length);
      });
    };

    el.addEventListener("scroll", updateDot, { passive: true });
    updateDot();

    const id = setInterval(() => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 5) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: getCardStep(), behavior: "smooth" });
      }
    }, 2600);

    return () => {
      clearInterval(id);
      el.removeEventListener("scroll", updateDot);
      cancelAnimationFrame(raf);
    };
  }, [features.length]);

  // ===== Mobile slider controls (Fleet Management right-cards only) =====
  const fleetCardsRef = useRef(null);
  const [fleetDot, setFleetDot] = useState(0);

  const fleetGetStep = () => {
    const el = fleetCardsRef.current;
    if (!el) return 360;

    const first = el.querySelector("[data-fleet-card='true']");
    const cardW = first ? first.getBoundingClientRect().width : 320;

    // gap-4 => 16px
    return cardW + 16;
  };

  const fleetNext = () => {
    const el = fleetCardsRef.current;
    if (!el) return;
    el.scrollBy({ left: fleetGetStep(), behavior: "smooth" });
  };

  const fleetPrev = () => {
    const el = fleetCardsRef.current;
    if (!el) return;
    el.scrollBy({ left: -fleetGetStep(), behavior: "smooth" });
  };

  useEffect(() => {
    const el = fleetCardsRef.current;
    if (!el) return;

    let raf = 0;

    const updateDot = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const step = fleetGetStep();
        const idx = Math.round(el.scrollLeft / step) % 5;
        setFleetDot((idx + 5) % 5);
      });
    };

    el.addEventListener("scroll", updateDot, { passive: true });
    updateDot();

    const id = setInterval(() => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 5) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: fleetGetStep(), behavior: "smooth" });
      }
    }, 2800);

    return () => {
      clearInterval(id);
      el.removeEventListener("scroll", updateDot);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative w-full min-h-[560px] sm:min-h-[650px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/gpssol.jpeg')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>

        <div className="relative z-10 px-6 sm:px-8 lg:px-20 py-20 sm:py-24 w-full">
          <div className="max-w-4xl lg:mt-10">
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className="text-3xl sm:text-5xl md:text-5xl font-extrabold text-white leading-tight mb-4 sm:mb-6 drop-shadow-xl"
            >
              Real-Time Fleet <br />
              Intelligence for <br />
              Zero-Waste <br />
              Operations
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="text-sm sm:text-lg md:text-xl text-gray-200 max-w-2xl mb-8 sm:mb-12"
            >
              GPS-enabled tracking, AI-powered routing, and real-time analytics
              give you complete control of your waste management fleet. Reduce
              costs by 35% and increase operational efficiency instantly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:gap-14 text-white max-w-xl"
            >
              <div className="bg-white/10 border border-white/15 backdrop-blur-xl rounded-xl p-3 sm:p-0 sm:bg-transparent sm:border-0 sm:backdrop-blur-0">
                <h2 className="text-xl sm:text-4xl font-extrabold">98.7%</h2>
                <p className="text-[11px] sm:text-sm text-gray-200/90 mt-1">
                  On-Time Performance
                </p>
              </div>

              <div className="bg-white/10 border border-white/15 backdrop-blur-xl rounded-xl p-3 sm:p-0 sm:bg-transparent sm:border-0 sm:backdrop-blur-0">
                <h2 className="text-xl sm:text-4xl font-extrabold">35%</h2>
                <p className="text-[11px] sm:text-sm text-gray-200/90 mt-1">
                  Cost Reduction
                </p>
              </div>

              <div className="bg-white/10 border border-white/15 backdrop-blur-xl rounded-xl p-3 sm:p-0 sm:bg-transparent sm:border-0 sm:backdrop-blur-0">
                <h2 className="text-xl sm:text-4xl font-extrabold">24/7</h2>
                <p className="text-[11px] sm:text-sm text-gray-200/90 mt-1">
                  Live Monitoring
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="w-full bg-[#ffffff] py-16 sm:py-20 px-5 sm:px-6 lg:px-20 overflow-hidden">
        <div className="text-center mb-10 sm:mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-snug"
          >
            Complete Operational Visibility{" "}
            <br className="hidden sm:block" /> in Real-Time
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gray-600 mt-3 sm:mt-4 max-w-3xl mx-auto text-sm sm:text-base"
          >
            Advanced GPS technology combined with AI-powered analytics delivers
            unparalleled insight into your fleet operations.
          </motion.p>
        </div>

        {/* MOBILE SLIDER */}
        <div className="md:hidden relative">
          <button
            type="button"
            aria-label="Previous feature"
            onClick={goPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 border border-gray-200 shadow-lg rounded-full w-10 h-10 flex items-center justify-center"
          >
            <IconChevronLeft className="w-5 h-5 text-gray-900" />
          </button>

          <button
            type="button"
            aria-label="Next feature"
            onClick={goNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 border border-gray-200 shadow-lg rounded-full w-10 h-10 flex items-center justify-center"
          >
            <IconChevronRight className="w-5 h-5 text-gray-900" />
          </button>

          <div
            ref={trackRef}
            className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory px-12"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              maskImage:
                "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            }}
          >
            {features.map((f, idx) => (
              <motion.div
                key={idx}
                data-card="true"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md w-[86vw] max-w-[420px] flex-shrink-0 snap-center"
              >
                <div className="flex items-start gap-4">
                  {f.icon}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{f.title}</h3>
                    <p className="text-gray-600 text-sm mt-2">{f.desc}</p>
                    <p className="text-green-700 font-semibold text-sm mt-4">
                      {f.meta}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {features.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition ${
                  activeDot === i ? "bg-green-700" : "bg-green-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* DESKTOP GRID */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-10">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 + i * 0.1 }}
              className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-4">
                {f.icon}
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{f.title}</h3>
                  <p className="text-gray-600 text-sm mt-2">{f.desc}</p>
                  <p className="text-green-700 font-semibold text-sm mt-4">
                    {f.meta}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ROUTE PLANNING (unchanged, no icons here) */}
      <section className="w-full bg-[#ffffff]  sm:py-12 px-5 sm:px-6 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6 leading-snug">
              Transform Operations <br />
              with Intelligent Route <br />
              Planning
            </h2>

            <p className="text-gray-600 text-sm sm:text-lg mb-8 sm:mb-10 max-w-xl">
              Our advanced AI algorithms analyze millions of data points—traffic
              patterns, collection schedules, vehicle capacity, weather
              conditions, and historical performance—to generate optimal routes
              that maximize efficiency while minimizing environmental impact.
            </p>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-gray-200 mb-8 sm:mb-10">
              <h3 className="text-base sm:text-lg font-bold mb-5 sm:mb-6 text-gray-900">
                Before/After Comparison
              </h3>

              <div className="space-y-5 sm:space-y-6 text-gray-700">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="font-semibold">Route Efficiency</p>
                    <p className="text-sm">
                      Before: <span className="font-semibold">62%</span>
                    </p>
                    <p className="text-sm">
                      After: <span className="font-semibold">94%</span>
                    </p>
                  </div>
                  <p className="text-green-600 font-bold text-lg sm:text-xl">
                    +32%
                  </p>
                </div>

                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="font-semibold">Fuel Consumption</p>
                    <p className="text-sm">
                      Before: <span className="font-semibold">8.2 L/100km</span>
                    </p>
                    <p className="text-sm">
                      After: <span className="font-semibold">5.3 L/100km</span>
                    </p>
                  </div>
                  <p className="text-green-600 font-bold text-lg sm:text-xl">
                    -35%
                  </p>
                </div>

                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="font-semibold">Daily Collections</p>
                    <p className="text-sm">
                      Before: <span className="font-semibold">127</span>
                    </p>
                    <p className="text-sm">
                      After: <span className="font-semibold">189</span>
                    </p>
                  </div>
                  <p className="text-green-600 font-bold text-lg sm:text-xl">
                    +49%
                  </p>
                </div>

                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="font-semibold">Carbon Emissions</p>
                    <p className="text-sm">
                      Before: <span className="font-semibold">2.4 tons/day</span>
                    </p>
                    <p className="text-sm">
                      After: <span className="font-semibold">1.5 tons/day</span>
                    </p>
                  </div>
                  <p className="text-green-600 font-bold text-lg sm:text-xl">
                    -38%
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-200 mb-8 sm:mb-10">
              <img
                src="/route-map.jpeg"
                alt="Route Planning"
                className="w-full h-[240px] sm:h-[320px] object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-md border border-gray-200">
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  247
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Active Vehicles
                </p>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-md border border-gray-200">
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  1,847
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Optimized Routes
                </p>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-gray-200">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                Real-Time Adaptation
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Routes automatically adjust based on traffic conditions, vehicle
                breakdowns, and priority collections.&nbsp;
                <span className="font-semibold text-green-700">
                  Average response time: 47 seconds.
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FLEET MANAGEMENT */}
      <section className="w-full bg-white py-16 sm:py-0 px-5 sm:px-6 lg:px-20">
        <div className="text-center mb-12 sm:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900"
          >
            Complete Fleet Management at{" "}
            <br className="hidden sm:block" /> Your Fingertips
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gray-600 mt-3 sm:mt-4 max-w-3xl mx-auto text-sm sm:text-base"
          >
            Secure, cloud-based portal providing 24/7 access to your fleet
            operations, performance metrics, and management tools from any
            device, anywhere.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="relative">
              <img
                src="/fleet-dashboard-mobile.png"
                alt="Fleet Mobile Dashboard"
                className="w-[580px] sm:w-[550px] sm:h-[450px] h-[350px] drop-shadow-2xl rounded-xl"
              />

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="absolute -bottom-5 -right-6 sm:-bottom-6 sm:-right-10 bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-gray-200 flex items-center gap-3"
              >
                <div className="bg-green-700 text-white p-3 rounded-xl flex items-center justify-center">
                  <IconShield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    Security Status
                  </p>
                  <p className="font-bold text-gray-800 text-sm sm:text-base">
                    Enterprise-Grade
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* MOBILE: side scroll + arrows + dots */}
            <div className="lg:hidden relative">
              <button
                type="button"
                aria-label="Previous"
                onClick={fleetPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 border border-gray-200 shadow-lg rounded-full w-10 h-10 flex items-center justify-center"
              >
                <IconChevronLeft className="w-5 h-5 text-gray-900" />
              </button>

              <button
                type="button"
                aria-label="Next"
                onClick={fleetNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 border border-gray-200 shadow-lg rounded-full w-10 h-10 flex items-center justify-center"
              >
                <IconChevronRight className="w-5 h-5 text-gray-900" />
              </button>

              <div
                ref={fleetCardsRef}
                className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-12"
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  maskImage:
                    "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
                }}
              >
                <div
                  data-fleet-card="true"
                  className="snap-center flex-shrink-0 w-[85vw] max-w-[420px] p-5 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow hover:shadow-lg transition-all flex gap-4"
                >
                  <div className=" text-black  flex items-center justify-center">
                    <IconTrendingUp className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg">
                      Real-Time Analytics Dashboard
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      View fleet performance, fuel consumption, route efficiency,
                      and driver behavior with live data widgets.
                    </p>
                  </div>
                </div>

                <div
                  data-fleet-card="true"
                  className="snap-center flex-shrink-0 w-[85vw] max-w-[420px] p-5 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow hover:shadow-lg transition-all flex gap-4"
                >
                  <div className="text-black p-3 rounded-xl flex items-center justify-center">
                    <IconSmartphone className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg">
                      Automated Reporting
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Schedule daily or weekly reports delivered directly to your
                      inbox in multiple formats.
                    </p>
                  </div>
                </div>

                <div
                  data-fleet-card="true"
                  className="snap-center flex-shrink-0 w-[85vw] max-w-[420px] p-5 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow hover:shadow-lg transition-all flex gap-4"
                >
                  <div className="text-black p-3 rounded-xl flex items-center justify-center">
                    <IconShield className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg">
                      Smart Alert System
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Instant alerts for route deviations, fuel anomalies,
                      maintenance schedules, and threshold violations via email/SMS.
                    </p>
                  </div>
                </div>

                <div
                  data-fleet-card="true"
                  className="snap-center flex-shrink-0 w-[85vw] max-w-[420px] p-5 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow hover:shadow-lg transition-all flex gap-4"
                >
                  <div className="text-black p-3 rounded-xl flex items-center justify-center">
                    <IconMapPin className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg">
                      Multi-User Access Control
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Role-based permissions ensure the correct access levels for
                      admins, supervisors, and dispatchers.
                    </p>
                  </div>
                </div>

                <div
                  data-fleet-card="true"
                  className="snap-center flex-shrink-0 w-[85vw] max-w-[420px] p-5 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow hover:shadow-lg transition-all flex gap-4"
                >
                  <div className="text-black p-3 rounded-xl flex items-center justify-center">
                    <IconSmartphone className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg">
                      Mobile App Integration
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      iOS & Android apps with offline capability, digital forms,
                      photo logs, and instant communication.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full transition ${
                      fleetDot === i ? "bg-green-700" : "bg-green-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* DESKTOP: same UI, only icons replaced */}
            <div className="hidden lg:block space-y-5 sm:space-y-6">
              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow hover:shadow-lg transition-all flex gap-4">
                <div className=" text-black p-3 rounded-xl flex items-center justify-center">
                  <IconTrendingUp className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">
                    Real-Time Analytics Dashboard
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    View fleet performance, fuel consumption, route efficiency,
                    and driver behavior with live data widgets.
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow hover:shadow-lg transition-all flex gap-4">
                <div className="text-black p-3 rounded-xl flex items-center justify-center">
                  <IconSmartphone className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">
                    Automated Reporting
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Schedule daily or weekly reports delivered directly to your
                    inbox in multiple formats.
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow hover:shadow-lg transition-all flex gap-4">
                <div className="text-black p-3 rounded-xl flex items-center justify-center">
                  <IconShield className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">
                    Smart Alert System
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Instant alerts for route deviations, fuel anomalies,
                    maintenance schedules, and threshold violations via email/SMS.
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow hover:shadow-lg transition-all flex gap-4">
                <div className="text-black p-3 rounded-xl flex items-center justify-center">
                  <IconMapPin className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">
                    Multi-User Access Control
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Role-based permissions ensure the correct access levels for
                    admins, supervisors, and dispatchers.
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow hover:shadow-lg transition-all flex gap-4">
                <div className="text-black p-3 rounded-xl flex items-center justify-center">
                  <IconSmartphone className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">
                    Mobile App Integration
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    iOS & Android apps with offline capability, digital forms,
                    photo logs, and instant communication.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default GpsSolutions;
