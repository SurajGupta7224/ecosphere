import React, { useEffect, useRef, useState } from "react";

// Visibility hook
const useVisible = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.25 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
};

const CircularV3UltraPremium = () => {
  const [ref, visible] = useVisible();
  const wheelRef = useRef(null);

  const items = [
    { text: "Raw Materials", deg: 300 },
    { text: "Design", deg: 345 },
    { text: "Production", deg: 30 },
    { text: "Distribution", deg: 75 },
    { text: "Use", deg: 120 },
    { text: "Collection & Recycling", deg: 180 },
  ];

  /** Mouse Parallax */
  const handleMouseMove = (e) => {
    if (window.innerWidth < 768) return; // Disable on mobile
    if (!wheelRef.current) return;

    const rect = wheelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    wheelRef.current.style.transform = `perspective(900px)
      rotateX(${y / 25}deg)
      rotateY(${x / 25}deg)`;
  };

  const resetParallax = () => {
    if (!wheelRef.current) return;
    wheelRef.current.style.transform = `perspective(900px)`;
  };

  return (
    <section className="bg-black py-24 px-6 md:px-16 overflow-hidden -mt-4">

      {/* TITLE */}
      <div className="text-center mb-20 md:mb-28 -mt-16 md:-mt-10">
        <h2 className="text-[24px]  sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Our Scientific Waste-to-Value Process
        </h2>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-center -mt-16 sm:-mt-20">

        {/* LEFT TEXT */}
        <div
          className={`transition-all duration-[1200ms]
            ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}
          `}
        >
          <p className="text-green-400 tracking-[.25em] font-semibold mb-3">
            — Circular Economy
          </p>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
            About Circular Economy
          </h2>

          <p className="text-gray-300 text-base sm:text-[14px] mt-6 leading-relaxed max-w-[540px]">
            A future-ready system designed to minimize waste, regenerate natural cycles,
            and create sustainable value from resources already in use.
          </p>

          <p className="text-gray-300 text-base sm:text-lg mt-4 leading-relaxed max-w-[540px]">
            The circular model transforms waste into opportunity — making production,
            reuse, and recycling smarter and more efficient.
          </p>
        </div>

        <div
          ref={ref}
          className="
            relative flex justify-center items-center 
            cursor-pointer select-none
            scale-[0.70] sm:scale-[0.85] md:scale-90 
            transform origin-center mx-auto 
            -mt-28 lg:-mt-0
            ml-[-95px]
           sm:ml-[20px]
          "
        >
          <div
            className="
              absolute 
              w-[580px] h-[580px] 
              bg-green-600/10 
              blur-[130px]
              rounded-full
            "
          ></div>

          {/* WHEEL */}
          <div
            ref={wheelRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={resetParallax}
            className={`
              relative w-[480px] h-[480px]
              transition-all duration-[800ms] ease-out
              ${visible ? "opacity-100 scale-100" : "opacity-0 scale-75"}
            `}
          >
            {/* NEON RING */}
            <div className="absolute inset-0 rounded-full border-[3px] border-green-400/20 ">
              <div className="w-full h-full absolute animate-neon-spin">
                <div className="
                  w-8 h-8 bg-green-400 rounded-full blur-md 
                  absolute -top-4 left-1/2 transform -translate-x-1/2
                "></div>
              </div>
            </div>

            {/* LABELS EXACT SAME POSITIONS */}
            {items.map((item, i) => (
              <div
                key={i}
                className={`
                  absolute left-1/2 top-1/2 
                  transition-all duration-700
                  ${visible ? "opacity-100 scale-100" : "opacity-0 scale-50"}
                `}
                style={{
                  transform: `
                    rotate(${item.deg}deg)
                    translate(0, -195px)
                    rotate(-${item.deg}deg)
                  `,
                }}
              >
                <div
                  className="
                    px-6 py-2 rounded-xl 
                    bg-[#0f3d19]/70 backdrop-blur-xl
                    text-white text-sm font-semibold
                    border border-green-300/20
                    shadow-[0_8px_25px_rgba(0,255,150,0.15)]
                    transition-all duration-300
                  "
                >
                  {item.text}
                </div>
              </div>
            ))}

            {/* CENTER LABEL */}
            <div
              className={`
                absolute left-1/2 top-1/2 
                -translate-x-1/2 -translate-y-1/2
                w-44 h-44 rounded-full
                bg-[#101010] text-white 
                flex items-center justify-center text-xl font-bold
                shadow-[0_0_40px_rgba(0,255,150,0.25)]
                transition-all duration-700 delay-300
                ${visible ? "opacity-100 scale-100" : "opacity-0 scale-75"}
              `}
            >
              Circular <br /> Economy
            </div>
          </div>
        </div>
      </div>

      {/* ANIMATIONS */}
      <style>{`
        @keyframes neonSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-neon-spin {
          animation: neonSpin 6s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default CircularV3UltraPremium;
