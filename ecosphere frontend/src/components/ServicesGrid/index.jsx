import React, { useEffect, useRef, useState } from "react";

// ===== DESKTOP SERVICES =====
const desktopServices = [
  {
    id: 1,
    title: "Collection of Biodigradablewaste",
    subtitle:
      "Biodigradablewaste generated from kitchens, food industries, and agricultural operations forms a major portion of organic waste that must be managed responsibly. At EcoSphere, we use an advanced biological process powered by Black Soldier Fly (BSF) larvae to convert this waste into high-value resources.",
    img: "/service1.jpg",
    points: ["Real-Time Tracking", "Certified Process", "Full Documentation"],
  },
  {
    id: 2,
    title:
      "Upcycling Process by BSF Bioconversion of Biodigradablewaste for Environmental Value",
    subtitle:
      "BSF larvae rapidly break down organic waste, transforming it into valuable products such as protein meal and organic fertilizer.",
    img: "/service2.jpeg",
    points: [],
  },
  {
    id: 3,
    title: "Organic Compost Rejuvenate the Soil to Support the Ecosystem",
    subtitle:
      "BSF frass boosts soil health, fertility, and water retention, supporting resilient ecosystems.",
    img: "/service3.jpg",
    points: ["Eco-Friendly", "Organic", "Improves Soil"],
  },
  {
    id: 4,
    title:
      "Sustainable Insect Protein Nourishing Animals Naturally, Sustainably, and Responsibly",
    subtitle:
      "BSF larvae are a high-quality, nutrient-rich sustainable protein source.",
    img: "/service4.jpg",
    points: ["High Protein", "Sustainable", "Eco-Friendly"],
  },
];

// ===== ICONS =====
import { FiTrash2, FiAperture, FiDroplet } from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";

// ===== MOBILE SERVICES =====
const mobileServices = [
  {
    id: 1,
    title: "Waste Collection",
    short: "Door-to-door pickup of wet, dry & food waste.",
    img: "/service1.jpg",
    icon: <FiTrash2 size={36} color="#A3E635" />,
  },
  {
    id: 2,
    title: "Rearing",
    short: "Larval growth, egg collection & pupation process.",
    img: "/service2.jpg",
    icon: <FiAperture size={36} color="#A3E635" />,
  },
  {
    id: 3,
    title: "Organic Compost",
    short: "Nutrient-rich soil booster for agriculture.",
    img: "/service3.jpg",
    icon: <FaLeaf size={36} color="#A3E635" />,
  },
  {
    id: 4,
    title: "BSF Protein",
    short: "High-quality sustainable insect protein.",
    img: "/service4.jpg",
    icon: <FiDroplet size={36} color="#A3E635" />,
  },
];

const ServicesGrid = () => {
  const sectionRefs = useRef([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // OPEN POPUP
  const openPopup = (id) => {
    const data = desktopServices.find((item) => item.id === id);
    setSelectedService(data);
    setShowPopup(true);
  };

  // CLOSE POPUP
  const closePopup = () => setShowPopup(false);

  // ✅ DESKTOP IN/OUT ANIMATION (Left/Right)
  useEffect(() => {
    const els = sectionRefs.current.filter(Boolean);
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // toggle class so it animates IN and OUT
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
          } else {
            entry.target.classList.remove("is-inview");
          }
        });
      },
      { threshold: 0.25 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full bg-black py-12 md:py-24 lg:py-32 px-4 md:px-6 -mt-40">
      {/* ========= MOBILE VIEW ========= */}
      <div
        className="grid grid-cols-1 gap-10 md:hidden relative px-3 py-10 min-h-screen w-full"
        style={{
          backgroundImage: "url('/mobile-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/60 z-[1]"></div>

        <div className="relative z-[2] space-y-10">
          {mobileServices.map((s, idx) => (
            <div
              key={idx}
              className="relative w-full bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-lg"
            >
              {/* FLIP CARD */}
              <div className="relative w-full h-72 perspective mb-4">
                <div className="flip-card relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer">
                  {/* FRONT */}
                  <div className="absolute w-full h-full backface-hidden rounded-xl overflow-hidden shadow-xl bg-black/70 text-white flex flex-col justify-center items-center p-6 border border-white/10">
                    <div className="mb-3">{s.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                    <p className="text-center text-gray-300 text-sm leading-relaxed">
                      {s.short}
                    </p>
                  </div>

                  {/* BACK */}
                  <div className="absolute w-full h-full rotateY-180 backface-hidden rounded-xl overflow-hidden shadow-xl">
                    <img
                      src={s.img}
                      alt={s.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* READ MORE BUTTON */}
              <div className="flex justify-end">
                <button
                  onClick={() => openPopup(s.id)}
                  className="text-emerald-400 font-semibold text-sm tracking-wide hover:text-emerald-300 transition"
                >
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          .perspective { perspective: 1000px; }
          .flip-card:hover { transform: rotateY(180deg); }
          .transform-style-preserve-3d { transform-style: preserve-3d; }
          .backface-hidden { backface-visibility: hidden; }
          .rotateY-180 { transform: rotateY(180deg); }
        `}</style>
      </div>

      {/* ========= DESKTOP VIEW ========= */}
      <div className="hidden md:block max-w-6xl mx-auto">
        {desktopServices.map((service, idx) => {
          const isReversed = idx % 2 === 1;

          return (
            <article
              key={service.id}
              ref={(el) => (sectionRefs.current[idx] = el)}
              data-side={isReversed ? "right" : "left"} // ✅ controls direction
              className={`
                service-row
                grid grid-cols-1 lg:grid-cols-2
                gap-0 md:gap-16 lg:gap-12
                mb-10 md:mb-24 lg:mb-24
                ${isReversed ? "lg:grid-cols-[1.1fr_1fr]" : "lg:grid-cols-[1fr_1.1fr]"}
              `}
            >
              {/* IMAGE */}
              <div className={`${isReversed ? "lg:order-2" : "lg:order-1"} service-media`}>
                <div className="relative rounded-xl overflow-hidden shadow-[0_10px_32px_rgba(0,0,0,0.1)]">
                  <img
                    src={service.img}
                    alt={service.title}
                    className="w-full h-64 sm:h-80 md:h-96 lg:h-[440px] object-cover transition-transform duration-300 hover:scale-[1.02]"
                  />
                </div>
              </div>

              {/* TEXT */}
              <div className={`${isReversed ? "lg:order-1" : "lg:order-2"} px-1 service-text`}>
                <div className="relative mb-6 sm:mb-8">
                  <div className="text-[70px] sm:text-[90px] md:text-[110px] font-extrabold text-emerald-100/20">
                    {String(service.id).padStart(2, "0")}
                  </div>
                  <div className="absolute inset-0 flex items-center pl-1">
                    <span className="tracking-[0.3em] text-emerald-300 text-[14px] sm:text-[18px]">
                      STEP {service.id}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-3 -mt-4 sm:-mt-6">
                  {service.title}
                </h3>

                <div className="w-14 sm:w-16 h-[4px] bg-emerald-400 mb-4 sm:mb-5"></div>

                <p className="text-sm sm:text-[14px] text-white leading-relaxed mb-5">
                  {service.subtitle}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {/* ========= POPUP (SLIDE UP) ========= */}
      {showPopup && selectedService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex justify-center items-end animate-fadeIn">
          <div className="w-full bg-[#0f0f0f] rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto animate-slideUp border-t border-emerald-500/30 shadow-[0_-10px_40px_rgba(0,255,100,0.3)]">
            <div className="w-full flex justify-end mb-4">
              <button
                onClick={closePopup}
                className="text-white text-2xl font-bold px-4 py-1 rounded-full hover:text-emerald-400"
              >
                ✕
              </button>
            </div>

            <div className="text-emerald-200 text-sm tracking-widest mb-2">
              STEP {selectedService.id}
            </div>

            <h2 className="text-white text-2xl font-bold mb-3">
              {selectedService.title}
            </h2>

            <img
              src={selectedService.img}
              alt={selectedService.title}
              className="w-full h-56 rounded-lg object-cover mb-5 shadow-lg"
            />

            <p className="text-gray-300 text-base leading-relaxed mb-6">
              {selectedService.subtitle}
            </p>

            {selectedService.points?.length > 0 && (
              <ul className="space-y-3">
                {selectedService.points.map((pt, index) => (
                  <li
                    key={index}
                    className="text-gray-200 bg-emerald-600/10 px-4 py-2 rounded-lg border border-emerald-400/20"
                  >
                    ✔ {pt}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ✅ DESKTOP LEFT/RIGHT IN-OUT ANIMATION CSS */}
      <style>{`
        /* --- existing --- */
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }

        /* --- NEW: Desktop in/out --- */
        .service-row {
          opacity: 0;
          transition: opacity 700ms ease;
        }

        .service-row .service-media,
        .service-row .service-text {
          opacity: 0;
          transform: translateX(0);
          filter: blur(8px);
          transition:
            transform 900ms cubic-bezier(.2,.9,.2,1),
            opacity 900ms ease,
            filter 900ms ease;
          will-change: transform, opacity, filter;
        }

        /* initial positions (OUT state) */
        .service-row[data-side="left"] .service-media {
          transform: translateX(-70px);
        }
        .service-row[data-side="left"] .service-text {
          transform: translateX(70px);
        }

        .service-row[data-side="right"] .service-media {
          transform: translateX(70px);
        }
        .service-row[data-side="right"] .service-text {
          transform: translateX(-70px);
        }

        /* IN state */
        .service-row.is-inview {
          opacity: 1;
        }

        .service-row.is-inview .service-media,
        .service-row.is-inview .service-text {
          opacity: 1;
          transform: translateX(0);
          filter: blur(0);
        }

        /* stagger effect */
        .service-row .service-media {
          transition-delay: 120ms;
        }
        .service-row .service-text {
          transition-delay: 240ms;
        }
      `}</style>
    </section>
  );
};

export default ServicesGrid;
