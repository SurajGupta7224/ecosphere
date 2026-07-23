import React from "react";
import { useEffect, useState } from "react";

/* COUNT UP HOOK */
const useCountUp = (end, duration = 2000) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(counter);
      }
      setValue(Math.floor(start));
    }, 16);

    return () => clearInterval(counter);
  }, [end, duration]);

  return value;
};

/* VISIBILITY HOOK */
const useVisible = (options) => {
  const ref = React.useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.3, ...options }
    );

    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return [ref, isVisible];
};

const Certifications = () => {
  // 🔗 Each card mapped to a PDF in /public/certificates
  const certs = [
    {
      title: "12RS Government Order",
      subtitle: "Government Order for Operations",
      link: "/certificates/12RS Government Order.pdf",
    },
    {
      title: "CFO Approval",
      subtitle: "Consent for Operation (CFO)",
      link: "/certificates/CFO.pdf",
    },
    {
      title: "CFO Expansion – Mukka",
      subtitle: "CFO Expansion Approval",
      link: "/certificates/CFO Expand Mukka.pdf",
    },
    {
      title: "Empanelled Letter",
      subtitle: "Approved Vendor Empanelment",
      link: "/certificates/Empanelled letter.pdf",
    },
    {
      title: "EWS Trade License",
      subtitle: "Trade License for Operations",
      link: "/certificates/EWS Trade License.pdf",
    },
    {
      title: "GBA Authorised Waste Vendor",
      subtitle: "Authorization for Waste Collection",
      link: "/certificates/GBA authoraised waste collect.pdf",
    },
    {
      title: "GST Certificate – Ecosphere",
      subtitle: "GST Registration Certificate",
      link: "/certificates/GST Certificate_Ecosphere.pdf",
    },
    {
      title: "Mukka Corrigendum",
      subtitle: "Corrigendum for Mukka Approval",
      link: "/certificates/Mukka corrigendum.pdf",
    },
  ];

  const logos = [
    "/brigade-log.png",
    "/indianairforce-logo.png",
    "/iskon-logo.png",
    "/prestige-logo.svg",
    "/purvankara-logo.svg",
    "/shoba-logo.webp",
  ];

  const stats = [
    {
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
        >
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <path d="M16 8h4a2 2 0 0 1 2 2v6h-6" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
      value: "250",
      label: "Active Collection Vehicles",
    },
    {
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M8 3v18" />
          <path d="M16 3v18" />
          <path d="M3 9h18" />
          <path d="M3 15h18" />
        </svg>
      ),
      value: "1500",
      label: "Commercial Clients Served",
    },
    {
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      value: "99",
      label: "On-Time Collection Rate",
    },
  ];

  // Modal state for selected certificate
  const [selectedCert, setSelectedCert] = useState(null);

  const openCert = (cert) => setSelectedCert(cert);
  const closeCert = () => setSelectedCert(null);

  return (
    <section className="py-0 px-4 sm:px-6 md:px-8 bg-white">
      {/* TITLE */}
      {/* <div className="text-center max-w-4xl mx-auto mb-10 px-2">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1e293b]">
          Complete Transparency, Total Compliance
        </h2>
        <p className="text-gray-600 mt-3 text-sm sm:text-base">
          Certified by leading regulatory bodies and trusted across industries.
        </p>
      </div> */}

      {/* CERTIFICATIONS STRIP – HORIZONTAL SCROLL */}
      {/* <h3 className="text-center text-lg sm:text-xl font-semibold text-gray-700 mb-4">
        Our Certifications
      </h3> */}

      {/* <div className="w-full overflow-x-auto pb-4">
        <div className="flex gap-5 sm:gap-7 min-w-max px-1 sm:px-2">
          {certs.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => openCert(c)}
              className="
                cursor-pointer
                bg-white rounded-xl shadow-md 
                border border-gray-200
                w-56 sm:w-64 h-80
                flex flex-col overflow-hidden
                hover:shadow-lg hover:-translate-y-1
                transition-all duration-300
              "
            >
       
              <div className="flex-1 bg-gray-50">
                <iframe
                  src={c.link}
                  title={c.title}
                  className="w-full h-full pointer-events-none"
                />
              </div>

           
              <div className="px-4 py-3 text-left bg-white">
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2">
                  {c.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                  {c.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div> */}

      {/* TRUSTED BY LOGOS */}
      <h2 className="text-2xl sm:text-4xl md:text-3xl text-black font-extrabold text-center">
        Trusted By Leading Organizations
      </h2>

      <div className="w-full overflow-hidden py-8 relative">
        <div className="logo-scroll-right flex items-center gap-6 sm:gap-10 px-3 min-w-max">
          {logos.concat(logos).map((logo, i) => (
            <div
              key={i}
              className="
                w-28 h-28 sm:w-36 sm:h-36 
                bg-gray-50 border border-gray-200 
                rounded-2xl shadow-md 
                flex items-center justify-center 
                hover:scale-105 transition
              "
            >
              <img
                src={logo}
                className="w-16 h-16 sm:w-24 sm:h-24 object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .logo-scroll-right {
          display: flex;
          animation: scroll-right 18s linear infinite;
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>

      {/* PREMIUM STATS SECTION */}
      <div className="bg-white mb-10 px-4 sm:px-6 md:px-8 rounded-2xl max-w-7xl mx-auto mt-10">
        <h2 className="text-2xl sm:text-4xl md:text-3xl text-black font-extrabold text-center mb-14">
          Real-Time Operational Excellence
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">
          {stats.map((s, i) => {
            const [ref, isVisible] = useVisible();
            const num = useCountUp(isVisible ? s.value : 0);

            return (
              <div
                key={i}
                ref={ref}
                className="
                  group relative w-full text-center
                  bg-white/40 backdrop-blur-2xl
                  rounded-3xl p-10 sm:p-12
                  shadow-[8px_8px_24px_#dbdbdb,-8px_-8px_24px_#ffffff]
                  transition-all duration-700
                  opacity-0 translate-y-6
                  overflow-hidden
                "
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(12px)",
                }}
              >
    
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-40 h-40 rounded-full bg-green-200/20 blur-3xl animate-pulse"></div>
                </div>


                <div
                  className="
                    absolute inset-0 rounded-3xl border border-transparent 
                    group-hover:border-green-400/40 group-hover:shadow-[0_0_20px_4px_rgba(74,222,128,0.25)]
                    transition-all duration-500
                  "
                ></div>

                <div className="mb-6 transform transition-all duration-500 group-hover:-translate-y-2">
                  <div className="animate-float-slow">{s.icon}</div>
                </div>

                <p className="text-4xl sm:text-5xl font-extrabold text-[#111] tracking-tight">
                  {num}+
                </p>
                <p className="text-gray-700 mt-3 text-base sm:text-lg leading-snug">
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FLOAT ANIMATION */}
      <style>{`
        @keyframes float-slow {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
      `}</style>

      {/* 🔍 PDF MODAL POPUP */}
      {selectedCert && (
        <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="relative w-full max-w-5xl h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-emerald-600 font-semibold">
                  Ecosphere Certification
                </p>
                <h4 className="text-sm sm:text-base font-semibold text-gray-800 mt-0.5">
                  {selectedCert.title}
                </h4>
              </div>
              <button
                onClick={closeCert}
                className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-black transition"
              >
                ✕
              </button>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1">
              <iframe
                src={selectedCert.link}
                title={selectedCert.title}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Certifications;
