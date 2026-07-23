import React from "react";
import {
  FiAlertCircle,
  FiPhoneCall,
  FiTool,
  FiStar,
  FiUser,
  FiCreditCard,
  FiX,
} from "react-icons/fi";

import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import { MdEmail, MdLocationOn } from "react-icons/md";

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const topics = [
    // { title: "Raise a Complaint", icon: <FiAlertCircle size={22} className="text-emerald-700" /> },
    // { title: "Request a Call", icon: <FiPhoneCall size={22} className="text-blue-600" /> },
    // { title: "Book Services", icon: <FiTool size={22} className="text-amber-600" /> },
    // { title: "Give Feedback", icon: <FiStar size={22} className="text-yellow-500" /> },
    // { title: "Account", icon: <FiUser size={22} className="text-emerald-700" /> },
    // { title: "Payments", icon: <FiCreditCard size={22} className="text-purple-600" /> },
  ];

  const contactMethods = [
    {
      icon: <FaWhatsapp className="text-green-500 text-xl" />,
      title: "WhatsApp",
      detail: "+91 90354-89496",
    },
    {
      icon: <FaPhoneAlt className="text-blue-500 text-xl" />,
      title: "Call Us",
      detail: "+91 90354-89496",
    },
    {
      icon: <MdEmail className="text-red-500 text-xl" />,
      title: "Email",
      detail: "info@ecospherewm.com",
    },
    {
      icon: <MdLocationOn className="text-amber-500 text-xl" />,
      title: "Visit Us",
      detail:
        "No 201, Dhammanagi Zeus Apartment, Millers Tank Bund Rd, Vasanth Nagar, Bangalore, Karnataka 560034",
    },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 backdrop-blur-sm px-4 py-6">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-600 font-semibold mb-1">
              Ecosphere Support
            </p>
            <h2 className="text-[22px] font-bold text-slate-900 leading-tight">
              Help Center
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Reach us instantly for complaints, service requests, and support.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>


        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
          <div className="grid gap-6 md:grid-cols-5">

            {/* LEFT SIDE – TOPICS */}
            {/* <div className="md:col-span-3">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Quick Actions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {topics.map((t, i) => (
                  <button
                    key={i}
                    className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm hover:shadow-md hover:border-emerald-200 hover:bg-emerald-50/40 transition-all"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-50">
                      {t.icon}
                    </div>

                    <div>
                      <p className="text-[14px] font-semibold text-slate-800">
                        {t.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tap to continue
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div> */}

            {/* RIGHT SIDE – CONTACT OPTIONS */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Contact Options
              </h3>

              <div className="space-y-3">
                {contactMethods.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3.5 shadow-sm hover:shadow-md hover:border-emerald-200 hover:bg-white transition cursor-pointer"
                  >
                    <div className="mt-[2px]">{m.icon}</div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">
                        {m.title}
                      </p>
                      <p className="text-[12px] text-slate-600 leading-snug">
                        {m.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-100 px-3.5 py-3">
                <p className="text-[11px] text-emerald-900 font-medium">
                  Service Hours
                </p>
                <p className="text-[12px] text-emerald-700">
                  Monday–Saturday, 9:00 AM – 7:00 PM (IST)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/70">
          <p className="text-[12px] text-slate-500 text-center">
            Need more help? Our support team is available 24/7 via WhatsApp & Email.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
