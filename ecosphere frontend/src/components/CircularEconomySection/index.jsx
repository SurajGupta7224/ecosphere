import React, { useEffect, useRef, useState } from "react";
import { FiTrash2, FiCpu, FiSettings, FiTrendingUp } from "react-icons/fi";

const CircularEconomySection = () => {
  const [visible, setVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const rootRef = useRef(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // MOBILE ORDER 1 → 2 → 3 → 4
  const mobileSteps = [
    {
      number: "1",
      title: "Waste Sources",
      text: "Food waste is sourced from supermarkets, factories, farms, and schools.",
      icon: <FiTrash2 className="text-emerald-700" size={20} />,
    },
    {
      number: "2",
      title: "Bio Conversion",
      text: "Organic waste is fed to BSF larvae and converted into nutrient-rich biomass.",
      icon: <FiCpu className="text-emerald-700" size={20} />,
    },
    {
      number: "3",
      title: "Process",
      text: "Larvae turn into protein meal & oil; residue becomes compost & briquettes.",
      icon: <FiSettings className="text-emerald-700" size={20} />,
    },
    {
      number: "4",
      title: "To Outlets",
      text: "Outputs go to poultry, aquaculture, fertilizers & renewable fuel.",
      icon: <FiTrendingUp className="text-emerald-700" size={20} />,
    },
  ];

  // AUTO–CYCLE the cards every 3 seconds
  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % mobileSteps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [visible]);

  const slideDirections = ["left", "right", "left", "right"];

  const leftSteps = [
    {
      number: "1",
      title: "Waste Sources",
      text: "The food waste is sourced from factories, schools, supermarkets, agriculture fields and more.",
      icon: <FiTrash2 className="text-emerald-700" size={20} />,
    },
    {
      number: "4",
      title: "To Outlets",
      text: "BSFL meal & oil go to poultry, aquaculture, pet & cattle feeds. Compost becomes alternative fuel.",
      icon: <FiTrendingUp className="text-emerald-700" size={20} />,
    },
  ];

  const rightSteps = [
    {
      number: "2",
      title: "Bio Conversion",
      text: "Waste is fed to BSF larvae and converted into rich organic biomass.",
      icon: <FiCpu className="text-emerald-700" size={20} />,
    },
    {
      number: "3",
      title: "Process",
      text: "Larvae are processed into protein meal & oil; residue becomes compost & briquettes.",
      icon: <FiSettings className="text-emerald-700" size={20} />,
    },
  ];

  const stepBaseClasses =
    "relative flex gap-4 md:gap-5 items-start max-w-xs";

  return (
    <section
      ref={rootRef}
      className="relative py-16 md:py-24 bg-white overflow-hidden"
    >
      {/* PARTICLES */}
      <div className="absolute inset-0 md:hidden pointer-events-none z-0">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-lime-400/40 blur-[2px] animate-float-slow"
            style={{
              left: `${Math.random() * 90}%`,
              top: `${Math.random() * 90}%`,
              animationDelay: `${i * 0.9}s`,
            }}
          />
        ))}
      </div>

      {/* TOP GRADIENT */}
      <div className="pointer-events-none absolute -top-20 left-0 right-0 h-24 rotate-1 bg-gradient-to-b from-emerald-900/70 to-transparent opacity-90" />

      {/* CONTENT WRAPPER */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Heading */}
        <div
          className={`text-center mb-12 md:mb-16 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-800">
            Circular Economy of{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-lime-500 bg-clip-text text-transparent">
              Waste Management
            </span>
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm md:text-base text-slate-500">
            Every kilogram of organic waste is transformed through a closed-loop BSF ecosystem.
          </p>
        </div>

        {/* ================================================================= */}
        {/* 📱 MOBILE — ONE CARD AT A TIME SLIDING */}
        {/* ================================================================= */}
        <div className="md:hidden mt-12 flex flex-col items-center">
          {/* VIDEO */}
          <div
            className={`relative w-full flex justify-center transition-all duration-700 ${
              visible ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <div className="relative w-64 h-60 overflow-hidden rounded-2xl shadow-xl border border-emerald-500/20 animate-float-slow">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                src="/videos/ces.mp4"
              />
            </div>
          </div>

          {/* SLIDING SINGLE CARD AREA */}
          <div className="relative w-full h-44 mt-10 overflow-hidden">
            {mobileSteps.map((step, index) => {
              const isActive = index === activeStep;
              const direction = slideDirections[index];

              return (
                <div
                  key={index}
                  className={`absolute w-full bg-white/80 backdrop-blur-xl rounded-2xl border border-emerald-500/10 shadow-lg p-5 flex items-start gap-4 transition-all duration-700 ${
                    isActive
                      ? "opacity-100 translate-x-0"
                      : direction === "left"
                      ? "-translate-x-36 opacity-0"
                      : "translate-x-36 opacity-0"
                  }`}
                >
                  {/* ICON + NUMBER */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-lime-100 border border-lime-400 text-xl shadow-md animate-float-slow">
                      {step.icon}
                    </div>
                    <span className="mt-2 text-3xl font-extrabold text-[#84cc16]">
                      {step.number}
                    </span>
                  </div>

                  {/* TEXT */}
                  <div>
                    <h3 className="text-sm font-bold text-[#84cc16] uppercase tracking-wide">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#000000]">
                      {step.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 🖥️ DESKTOP VIEW (UNCHANGED STRUCTURE) */}
        {/* ================================================================= */}
        <div className="hidden md:grid lg:grid-cols-[1.1fr_auto_1.1fr] gap-8 md:gap-10 items-center">
          {/* LEFT STEPS */}
          <div className="flex flex-col items-start gap-10">
            {leftSteps.map((step, idx) => (
              <div
                key={step.number}
                className={`${stepBaseClasses} transition-all duration-700 ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-7"
                }`}
              >
                <div className="flex flex-col items-center mr-1">
                  <div className="w-12 h-12 rounded-full border-[2.5px] border-amber-500/80 bg-amber-50/70 flex items-center justify-center text-xl shadow-sm">
                    {step.icon}
                  </div>
                  <span className="mt-3 text-4xl font-extrabold text-[#84cc16]">
                    {step.number}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm md:text-base font-bold text-[#000000] uppercase tracking-wide">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] md:text-sm text-[#000000]">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CENTER VIDEO */}
          <div
            className={`relative hidden md:flex items-center justify-center transition-all duration-700 ${
              visible ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <div className="relative w-60 h-56 sm:w-70 sm:h-64 overflow-hidden">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0  object-content"
                src="/videos/ces.mp4"
              />
            </div>
          </div>

          {/* RIGHT STEPS */}
          <div className="hidden md:flex flex-col items-start lg:items-end gap-10">
            {rightSteps.map((step, idx) => (
              <div
                key={step.number}
                className={`${stepBaseClasses} lg:flex-row-reverse transition-all duration-700 ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-7"
                }`}
              >
                <div className="flex flex-col items-center lg:ml-1">
                  <div className="w-12 h-12 rounded-full border-[2.5px] border-amber-500/80 bg-amber-50/70 flex items-center justify-center text-xl shadow-sm">
                    {step.icon}
                  </div>
                  <span className="mt-3 text-4xl font-extrabold text-[#84cc16]">
                    {step.number}
                  </span>
                </div>

                <div className="lg:text-right">
                  <h3 className="text-sm md:text-base font-bold text-[#00000] uppercase tracking-wide">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] md:text-sm text-[#000000]">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* animations */}
      <style>
        {`
          @keyframes float-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
        `}
      </style>
    </section>
  );
};

export default CircularEconomySection;
