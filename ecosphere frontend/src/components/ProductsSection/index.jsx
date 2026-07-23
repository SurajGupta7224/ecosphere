import React, { useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const products = [
  {
    title: "Insect Meal",
    image: "/meal.png",
    description:
      "High protein, sustainable powder used as feed ingredient for aquaculture, pet food and other animal feed.",
    showButton: false,
  },
  {
    title: "Insect Oil",
    image: "/oil.png",
    description:
      "Sustainable insect oil rich in lauric acid and other fatty acids, used as a premium feed ingredient for aquaculture and other animal feed.",
    showButton: false,
  },
  {
    title: "Compost",
    image: "/compost.png",
    description:
      "BSF-enhanced compost that improves soil quality and fertility, ideal for agriculture, horticulture, gardening and landscaping.",
    showButton: false,
  },
  {
    title: "Humic Acid",
    image: "/humicacid.jpg",
    description:
      "Humic acid formed by microbial degradation of organic waste. Available as liquid humic acid, powder and granular formulations.",
    showButton: false,
  },
  {
    title: "Briquettes",
    image: "briquetters.png",
    description:
      "Compressed blocks made from organic residue of BSF larvae, used as a clean and efficient alternative to firewood.",
    showButton: false,
  },
];

export default function OurProductsSection() {
  const scrollRef = useRef(null);

  const scrollByAmount = 280; // adjust if you want more/less movement

  const scrollLeft = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: -scrollByAmount,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: scrollByAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full bg-[#ffffff] -mt-16 lg:-mt-16 lg:mb-10 py-8 sm:py-20 lg:py-4 px-4 sm:px-8 lg:px-10 relative overflow-hidden">
      {/* subtle background accents */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-lime-200/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-emerald-200/25 blur-3xl" />

      {/* Heading */}
      <div className="text-center mb-10 relative z-10">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          Our Products
        </h2>
        <div className="mt-5 flex items-center justify-center gap-2">
          <span className="h-[3px] w-16 rounded-full bg-lime-500" />
          <span className="h-[3px] w-8 rounded-full bg-lime-300" />
        </div>
        <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          Sustainable, BSF-based products engineered for performance, nutrition
          and soil health.
        </p>
      </div>

      {/* ARROWS + SCROLLER WRAPPER */}
      <div className="relative max-w-6xl mx-auto">
        {/* LEFT ARROW */}
        <button
          type="button"
          onClick={scrollLeft}
          className="
            hidden sm:flex
            absolute left-0 top-1/2 -translate-y-1/2 z-20
            h-10 w-10 rounded-full bg-white shadow-[0_10px_30px_rgba(15,23,42,0.25)]
            border border-slate-200
            items-center justify-center
            text-slate-700 hover:bg-lime-50 hover:text-emerald-700
            transition
          "
        >
          <FiChevronLeft size={20} />
        </button>

        {/* RIGHT ARROW */}
        <button
          type="button"
          onClick={scrollRight}
          className="
            hidden sm:flex
            absolute right-0 top-1/2 -translate-y-1/2 z-20
            h-10 w-10 rounded-full bg-white shadow-[0_10px_30px_rgba(15,23,42,0.25)]
            border border-slate-200
            items-center justify-center
            text-slate-700 hover:bg-lime-50 hover:text-emerald-700
            transition
          "
        >
          <FiChevronRight size={20} />
        </button>

        {/* GRADIENT FADES */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent z-10" />

        {/* HORIZONTAL SCROLL AREA (NO SCROLLBAR) */}
        <div
          ref={scrollRef}
          className="overflow-x-auto no-scrollbar pb-4 px-1 sm:px-4"
        >
          <div className="flex gap-5 sm:gap-7 min-w-max">
            {products.map((item, idx) => (
              <div
                key={idx}
                className="
                  group flex flex-col items-center text-center 
                  w-72 sm:w-80
                  px-5 pt-7 pb-8 rounded-3xl
                  bg-white border border-slate-200
                  shadow-[0_14px_35px_rgba(15,23,42,0.10)]
                  transition-all duration-500
                  hover:-translate-y-3 hover:border-lime-400/70
                  hover:shadow-[0_20px_55px_rgba(15,23,42,0.20)]
                "
              >
                {/* Circular Image with glow ring */}
                <div className="relative mb-7">
                  <div className="absolute inset-0 blur-xl bg-lime-300/25 rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-full overflow-hidden border-[5px] border-white shadow-xl bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                  {item.description}
                </p>

                {/* Know More button for selected items */}
                {item.showButton && (
                  <button
                    className="
                      mt-7 inline-flex items-center justify-center
                      px-8 py-2.5 rounded-xl
                      bg-lime-500 text-[#064e3b] font-semibold text-sm sm:text-base
                      shadow-[0_10px_26px_rgba(132,204,22,0.45)]
                      hover:bg-lime-400 hover:shadow-[0_14px_35px_rgba(132,204,22,0.55)]
                      active:translate-y-[1px]
                      transition-all duration-300
                    "
                    onClick={() =>
                      console.log(`Know more about ${item.title}`)
                    }
                  >
                    Know More
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HIDE SCROLLBAR CLASS */}
      <style>{`
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;     /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;             /* Chrome, Safari */
        }
      `}</style>
    </section>
  );
}
