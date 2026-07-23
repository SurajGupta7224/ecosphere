import React, { useEffect, useRef, useState } from "react";

/* SCROLL VISIBILITY HOOK */
const useVisible = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);

    return () => obs.disconnect();
  }, []);

  return [ref, visible];
};

const TechnologySectionV2 = () => {
  const [ref, visible] = useVisible();

  return (
    <section
      className="
        relative w-full bg-[#000000]
        py-20 sm:py-24 md:py-20 
        px-4 sm:px-6 md:px-16
        overflow-hidden
        -mt-10 sm:-mt-20 md:-mt-40
      "
    >
      {/* BACKGROUND GLOW (mobile scaled down) */}
      <div className="absolute inset-0 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">

        {/* LEFT BLOCK — ANIMATION */}
        <div
          ref={ref}
          className={`
            relative flex justify-center items-center 
            transition-all duration-[1500ms]
            ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-90"}
          `}
        >
          {/* MOBILE-SIZED GLOW */}
          <div className="
            absolute 
            w-[260px] h-[260px] 
            sm:w-[380px] sm:h-[380px]
            md:w-[600px] md:h-[600px]
            rounded-full 
            bg-green-500/10 
            blur-2xl sm:blur-3xl
            animate-pulse-slow
          "></div>

          {/* ORBITAL PARTICLES (scaled for mobile) */}
          <div className="
            absolute 
            w-[320px] h-[320px]
            sm:w-[500px] sm:h-[500px]
            md:w-[700px] md:h-[700px]
            animate-orbit pointer-events-none
          ">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full shadow-lg"
                style={{
                  top: `${50 + 40 * Math.sin((i * 30 * Math.PI) / 180)}%`,
                  left: `${50 + 40 * Math.cos((i * 30 * Math.PI) / 180)}%`,
                }}
              />
            ))}
          </div>

          {/* ARROW PARTICLES (reduce clutter on mobile) */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute text-green-300 text-sm sm:text-lg animate-arrowFly"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.7}s`,
                }}
              >
                ➤
              </div>
            ))}
          </div>

          {/* MAIN IMAGE (shrinks on mobile) */}
          <img
            src="/bsf-cycle.jpeg"
            alt=""
            className="
              relative z-20 
              w-[250px] sm:w-[350px] md:w-[520px] 
              drop-shadow-2xl 
              animate-float-super 
              hover:scale-[1.06] hover:-rotate-2 
              transition-all duration-700
            "
          />

          {/* FLOATING FOOD IMAGE */}
          {/* <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-[80px] h-[80px] object-cover"
          src="/videos/fly.mp4"
        /> */}

          {/* FLOATING LARVAE IMAGE */}
          {/* <img
            src="/larvae.png"
            className="
              absolute 
              top-20 sm:top-24 
              -right-6 sm:-right-10 
              w-16 sm:w-24 
              animate-insectFlutter 
              drop-shadow-lg
            "
          /> */}

          {/* FLOATING COW IMAGE */}
          {/* <img
            src="/cow.png"
            className="
              absolute 
              bottom-4 sm:bottom-6 
              left-4 sm:left-10 
              w-24 sm:w-36 
              animate-float-super 
              drop-shadow-lg
            "
          /> */}
        </div>

        {/* RIGHT TEXT BLOCK */}
        <div className="space-y-4 sm:space-y-6">
          <p
            className={`
              text-green-400 tracking-[0.15em] font-semibold text-sm sm:text-base
              transition-all duration-700 delay-200
              ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}
            `}
          >
            — Our Technology
          </p>

          <h2
            className={`
              text-3xl sm:text-4xl md:text-5xl 
              font-extrabold text-white leading-tight
              transition-all duration-700 delay-300
              ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}
            `}
          >
            The Black Soldier Fly <br /> Nature's Recycler
          </h2>

          <p
            className={`
              text-base sm:text-lg text-gray-300 leading-relaxed
              transition-all duration-700 delay-500
              ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
          >
            The black soldier fly, <span className="italic">Hermetia illucens</span>, 
            transforms food waste into a rich source of organic fertilizer and 
            protein. This natural process dramatically reduces landfill impact 
            while supporting a circular, sustainable ecosystem for agriculture 
            and industry.
          </p>
        </div>
      </div>

      {/* ANIMATIONS */}
      <style>{`
        @keyframes floatSuper {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        .animate-float-super { animation: floatSuper 5s ease-in-out infinite; }

        @keyframes floatFast {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-float-fast { animation: floatFast 3.5s ease-in-out infinite; }

        @keyframes insectFlutter {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        .animate-insectFlutter { animation: insectFlutter 2.2s ease-in-out infinite; }

        @keyframes orbit { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
        .animate-orbit { animation: orbit 30s linear infinite; }

        @keyframes arrowFly {
          0% { opacity: 0; transform: translateY(0) translateX(0); }
          100% { opacity: 1; transform: translateY(-60px) translateX(40px); }
        }
        .animate-arrowFly { animation: arrowFly 3s linear infinite; }

        @keyframes pulseSlow {
          0%,100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow { animation: pulseSlow 6s ease-in-out infinite; }
      `}</style>
    </section>
  );
};

export default TechnologySectionV2;
