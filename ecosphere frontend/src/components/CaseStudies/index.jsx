import React, { useEffect, useRef, useState } from "react";

const CaseStudies = () => {
  const cases = [
    {
      image: "/ithub.jpeg",
      tag: "Technology Campus",
      title: "TechHub IT Park",
      challenge:
        "Managing 15 tons of daily waste from 50+ companies with zero documentation and compliance issues.",
      solution:
        "Implemented segregated collection system with real-time tracking and monthly compliance reporting.",
      results: [
        "85% waste diverted from landfills",
        "100% compliance achieved",
        "₹2.5L annual cost savings",
      ],
    },
    {
      image: "/residentialcomplex.jpeg",
      tag: "Residential Complex",
      title: "Green Valley Apartments",
      challenge:
        "Inconsistent waste collection causing resident complaints and municipal violations.",
      solution:
        "Deployed GPS-tracked vehicles with scheduled pickups and resident education program.",
      results: [
        "Zero missed collections",
        "70% resident satisfaction increase",
        "Municipal compliance restored",
      ],
    },
    {
      image: "/hospitall.jpeg",
      tag: "Healthcare Facility",
      title: "City Hospital Network",
      challenge:
        "Critical need for certified biomedical waste handling with complete audit trails.",
      solution:
        "Specialized biomedical waste management with color-coded segregation and digital documentation.",
      results: [
        "100% regulatory compliance",
        "Zero safety incidents",
        "Complete audit trail maintained",
      ],
    },
  ];

  const [current, setCurrent] = useState(0);
  const sliderRef = useRef(null);

  // Auto slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      slideTo((current + 1) % cases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [current]);

  const slideTo = (index) => {
    setCurrent(index);
    sliderRef.current.scrollTo({
      left: index * sliderRef.current.clientWidth * 0.85, // Adjust scroll for card width
      behavior: "smooth",
    });
  };

  return (
    <section className="py-10 sm:py-14 md:py-20 px-4 bg-white -mt-10 sm:-mt-20">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1e293b]">
          Measurable Environmental Impact
        </h2>
        <p className="text-gray-500 mt-3 text-sm sm:text-base px-3 sm:px-0">
          Real success stories from businesses that transformed their waste management
          with EcoSphere's technology-driven solutions.
        </p>
      </div>

      <div
  ref={sliderRef}
  className="
    flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth space-x-5
    md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:snap-none md:space-x-0
  "
>

        {cases.map((item, index) => (
          <div
  key={index}
  className="
    min-w-[85%] sm:min-w-[60%]
    md:min-w-0 md:w-full md:snap-none
  "
>

            <div
              className="
                bg-white rounded-md shadow-md 
                border border-gray-100 overflow-hidden
              "
            >
              {/* IMAGE */}
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <span
                  className="
                    absolute top-3 left-3 
                    bg-green-700 text-white 
                    px-3 py-1 rounded-md 
                    text-xs sm:text-sm font-medium shadow-md
                  "
                >
                  {item.tag}
                </span>
              </div>

              {/* CONTENT */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>

                <div className="mt-3">
                  <p className="text-red-500 font-semibold text-sm">🔴 Challenge</p>
                  <p className="text-gray-600 text-sm mt-1">{item.challenge}</p>
                </div>

                <div className="mt-3">
                  <p className="text-yellow-600 font-semibold text-sm">
                    💡 Solution
                  </p>
                  <p className="text-gray-600 text-sm mt-1">{item.solution}</p>
                </div>

                <hr className="my-4" />

                <p className="text-green-700 font-semibold text-sm mb-1">
                  📊 Key Results
                </p>

                <ul className="space-y-1">
                  {item.results.map((r, i) => (
                    <li key={i} className="text-gray-700 text-sm flex items-center gap-2">
                      <span className="text-green-500 text-lg">✔</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DOTS */}
      <div className="flex justify-center mt-6 gap-2">
        {cases.map((_, i) => (
          <button
            key={i}
            onClick={() => slideTo(i)}
            className={`
              h-3 w-3 rounded-full transition-all
              ${current === i ? "bg-green-700 w-6" : "bg-gray-300"}
            `}
          ></button>
        ))}
      </div>
    </section>
  );
};

export default CaseStudies;
