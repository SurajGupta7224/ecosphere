import React, { useState } from "react";

const HomeScreen = () => {
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);

  return (
    <>
      <section
        id="residential"
        className="
          relative 
          min-h-[650px]
          md:h-screen 
          flex 
          items-center 
          justify-center
          overflow-hidden
          pt-28
        "
      >
        {/* ⭐ Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="https://hompure.in/wp-content/uploads/2025/12/WhatsApp-Video-2025-12-11-at-17.10.42.mp4"
        />

        {/* ⭐ Dark Overlay */}
        <div className="absolute inset-0 bg-[rgba(15,23,42,0.6)]" />

        {/* ⭐ OUTER CONTAINER MATCHING HEADER WIDTH */}
        <div className="relative w-full">
          <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-6">
            {/* ⭐ HERO CONTENT */}
            <div className="w-full max-w-5xl mx-auto text-center flex flex-col items-center">
              {/* ⭐ HERO TITLE */}
              <h1
                className="
                  text-white
                  text-[1.6rem] sm:text-[2.3rem] md:text-[3.5rem] 
                  leading-[1.2] md:leading-[1.15]
                  font-extrabold 
                  mb-6 sm:mb-8
                "
              >
                Waste Management That
                <br />
                Works For Your Business{" "}
                <span className="text-[#22c55e]">And</span>
                <br />
                <span
                  className="
                    font-extrabold 
                    bg-gradient-to-r 
                    from-lime-400 
                    to-emerald-500 
                    bg-clip-text 
                    text-transparent
                    leading-tight
                  "
                >
                  The Environment
                </span>
              </h1>

              {/* ⭐ BUTTON (mobile: opens popup, desktop: just CTA) */}
              <button
                onClick={() => setIsMobileFormOpen(true)}
                className="
                  px-6 sm:px-8 
                  py-3 
                  rounded-md 
                  text-white 
                  font-semibold 
                  text-base sm:text-lg 
                  shadow-lg 
                  bg-[#84cc16] 
                  hover:opacity-90 
                  transition 
                  mb-8
                  z-40
                "
              >
                Request a Callback
              </button>

              {/* ⭐ INLINE FORM CARD (DESKTOP / TABLET ONLY) */}
              <div
                className="
                  -mt-14 
                  z-20 
                  bg-white/10 
                  backdrop-blur-lg 
                  w-full max-w-4xl 
                  rounded-[22px] sm:rounded-[28px] 
                  p-5 sm:p-6 md:p-10 
                  shadow-[0_4px_12px_rgba(0,0,0,0.15)]
                  hidden md:block
                "
              >
                <form className="flex flex-col gap-4 sm:gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      className="
                        p-3 
                        rounded-xl 
                        bg-white 
                        border border-gray-300 
                        text-sm 
                        focus:border-[#7ee22f] 
                        focus:ring-4 
                        focus:ring-[#7ee22f]/20 
                        outline-none
                      "
                    />

                    <input
                      type="tel"
                      name="phone"
                      placeholder="Contact Number"
                      className="
                        p-3 
                        rounded-xl 
                        bg-white 
                        border border-gray-300 
                        text-sm 
                        focus:border-[#7ee22f] 
                        focus:ring-4 
                        focus:ring-[#7ee22f]/20 
                        outline-none
                      "
                    />

                    <input
                      type="email"
                      name="email"
                      placeholder="Your E-mail"
                      className="
                        p-3 
                        rounded-xl 
                        bg-white 
                        border border-gray-300 
                        text-sm 
                        focus:border-[#7ee22f] 
                        focus:ring-4 
                        focus:ring-[#7ee22f]/20 
                        outline-none
                      "
                    />

                    <button
                      type="submit"
                      className="
                        p-3 
                        rounded-xl 
                        font-semibold 
                        text-[16px] 
                        bg-[#84cc16] 
                        text-white
                        hover:bg-[#6bc626] 
                        shadow-sm 
                        hover:shadow-lg 
                        active:scale-95 
                        transition-all 
                        whitespace-nowrap
                      "
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* ⭐ MOBILE POPUP FORM */}
        {isMobileFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 md:hidden">
            <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl relative">
              {/* Close button */}
              <button
                onClick={() => setIsMobileFormOpen(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                ×
              </button>

              <h2 className="text-lg font-semibold text-gray-900 mb-1 text-center">
                Request a Callback
              </h2>
              <p className="text-xs text-gray-500 mb-4 text-center">
                Share your details and our team will reach out shortly.
              </p>

              <form className="space-y-3">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="
                    w-full
                    p-3 
                    rounded-xl 
                    bg-white 
                    border border-gray-300 
                    text-sm 
                    focus:border-[#7ee22f] 
                    focus:ring-4 
                    focus:ring-[#7ee22f]/20 
                    outline-none
                  "
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Contact Number"
                  className="
                    w-full
                    p-3 
                    rounded-xl 
                    bg-white 
                    border border-gray-300 
                    text-sm 
                    focus:border-[#7ee22f] 
                    focus:ring-4 
                    focus:ring-[#7ee22f]/20 
                    outline-none
                  "
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Your E-mail"
                  className="
                    w-full
                    p-3 
                    rounded-xl 
                    bg-white 
                    border border-gray-300 
                    text-sm 
                    focus:border-[#7ee22f] 
                    focus:ring-4 
                    focus:ring-[#7ee22f]/20 
                    outline-none
                  "
                />

                <button
                  type="submit"
                  className="
                    w-full
                    mt-1
                    p-3 
                    rounded-xl 
                    font-semibold 
                    text-[15px] 
                    bg-[#84cc16] 
                    text-white
                    hover:bg-[#6bc626] 
                    shadow-sm 
                    hover:shadow-lg 
                    active:scale-95 
                    transition-all 
                  "
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default HomeScreen;
