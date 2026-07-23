import React, { useState } from "react";
import {
  FiCheckCircle,
  FiSearch,
  FiFileText,
  FiClock,
  FiShield,
  FiFolder,
  FiCalendar,
  FiArrowRight,
  FiDownload,
  FiEye
} from "react-icons/fi";
import { FaFilePdf } from "react-icons/fa";

const Certifications = () => {
  const [activeTab, setActiveTab] = useState("certifications");

  const tabs = [
    { id: "certifications", label: "Certifications", icon: <FiShield /> },
    // { id: "documents", label: "Documents", icon: <FiFileText /> },
    // { id: "updates", label: "Regulatory Updates", icon: <FiClock /> },
    // { id: "timeline", label: "Compliance Timeline", icon: <FiClock /> },
    // { id: "tools", label: "Compliance Tools", icon: <FiFolder /> },
  ];

  // Dynamically generate the 10 certificates
  const certificates = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: `Certification Document ${i + 1}`,
    subtitle: "Official Compliance Document",
    agency: "Ecosphere Waste Solutions",
    path: `/certificates/${i + 1}.pdf`,
    size: "PDF",
  }));

  const documents = [
    {
      name: "Annual Compliance Audit Report 2024",
      desc: "Comprehensive audit covering all regulatory requirements.",
      tag: "Audit Reports",
      size: "2.4 MB",
      updated: "15/11/2024",
    },
    {
      name: "Waste Management Process Documentation",
      desc: "Detailed documentation of collection & disposal.",
      tag: "Process Documents",
      size: "1.8 MB",
      updated: "08/11/2024",
    },
    {
      name: "Environmental Impact Assessment",
      desc: "Assessment of sustainability & environmental performance.",
      tag: "Impact Reports",
      size: "3.1 MB",
      updated: "01/11/2024",
    },
    {
      name: "Safety & Training Compliance Manual",
      desc: "Complete safety protocols for staff & operations.",
      tag: "Safety Documents",
      size: "1.5 MB",
      updated: "25/10/2024",
    },
  ];

  const updates = [
    {
      impact: "HIGH IMPACT",
      impactColor: "bg-red-600",
      category: "E-Waste Regulations",
      title: "New E-Waste Management Rules 2024",
      desc: "Updated guidelines for electronic waste collection & disposal.",
      date: "10/11/2024",
    },
    {
      impact: "MEDIUM IMPACT",
      impactColor: "bg-yellow-600",
      category: "Plastic Regulations",
      title: "Plastic Waste Management Amendment",
      desc: "Stricter segregation rules & new recycling targets.",
      date: "28/10/2024",
    },
    {
      impact: "HIGH IMPACT",
      impactColor: "bg-red-600",
      category: "Biomedical Waste",
      title: "Biomedical Waste Handling Protocol Update",
      desc: "Enhanced safety protocols for waste collection and transport.",
      date: "05/10/2024",
    },
    {
      impact: "LOW IMPACT",
      impactColor: "bg-green-600",
      category: "C&D Waste",
      title: "Construction & Demolition Waste Guidelines",
      desc: "Guidelines for recycling and reuse of construction materials.",
      date: "19/09/2024",
    },
  ];

  const timeline = [
    {
      year: "2024",
      title: "Advanced Technology Integration",
      desc: "AI-powered waste tracking & IoT sensors. Achieved 99.2% compliance.",
      tags: ["ISO 14001:2015", "Green Building Certification", "Smart City Partner"],
    },
    {
      year: "2023",
      title: "Regulatory Excellence Achievement",
      desc: "Achieved full compliance across all operations.",
      tags: ["Zero Violations", "Top Compliance Rating"],
    },
    {
      year: "2022",
      title: "Safety & Quality Standards",
      desc: "Completed facility certifications & quality audits.",
      tags: ["Quality Audit Cleared"],
    },
  ];

  const tools = [
    {
      title: "Compliance Alert Subscription",
      desc: "Stay informed about regulatory updates relevant to your operations.",
      type: "subscription",
    },
    {
      title: "Digital Badge Verification",
      desc: "Verify authenticity of certification IDs & badges.",
      type: "verify",
    },
  ];

  return (
    <div className="w-full bg-slate-50 min-h-screen font-sans">
      {/* HERO */}
      <section className="relative w-full bg-emerald-900 text-white py-24 px-6 text-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 opacity-90"></div>

        <div className="relative max-w-4xl mx-auto z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-emerald-700/50 border border-emerald-600 text-emerald-200 text-sm font-semibold mb-4 backdrop-blur-sm">
            Trust & Transparency
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Compliance & Certifications
          </h1>
          <p className="max-w-2xl mx-auto text-emerald-100 mb-0 text-lg leading-relaxed">
            Access our verified certifications, audit reports, and compliance documents.
            We maintain the highest standards of regulatory adherence.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white py-10 border-b border-slate-200 shadow-sm relative z-20 -mt-8 mx-4 md:mx-auto max-w-6xl rounded-2xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 px-8 text-center divide-x divide-slate-100">
          <div>
            <h2 className="text-3xl font-bold text-emerald-600">10+</h2>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wide mt-1">Active Certifications</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-emerald-600">100%</h2>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wide mt-1">Compliance Rate</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-emerald-600">0</h2>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wide mt-1">Violations</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-emerald-600">24/7</h2>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wide mt-1">Public Access</p>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">

        {/* TABS */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all duration-300
              ${activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-600 ring-offset-2"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* =============================================== */}
        {/* CERTIFICATIONS (Enhanced Grid) */}
        {/* =============================================== */}
        {activeTab === "certifications" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="group relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* PDF PREVIEW HEADER */}
                <div className="bg-slate-50 h-40 flex items-center justify-center border-b border-slate-100 group-hover:bg-emerald-50/50 transition-colors">
                  <FaFilePdf className="text-5xl text-rose-500 drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
                </div>

                {/* CONTENT */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2 group-hover:text-emerald-700 transition-colors">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium bg-slate-100 inline-block px-2 py-1 rounded">
                      {cert.agency}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex gap-3">
                    <a
                      href={cert.path}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 bg-slate-50 py-2 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      <FiEye /> View
                    </a>
                    <a
                      href={cert.path}
                      download
                      className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 py-2 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      <FiDownload /> Save
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =============================================== */}
        {/* DOCUMENTS */}
        {/* =============================================== */}
        {activeTab === "documents" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <FiFileText size={24} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{doc.name}</h3>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">{doc.desc}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 mb-6">
                  <span className="bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wide">{doc.tag}</span>
                  <span className="flex items-center gap-1"><FiFolder /> {doc.size}</span>
                  <span className="flex items-center gap-1"><FiCalendar /> {doc.updated}</span>
                </div>

                <button className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors flex justify-center items-center gap-2">
                  <FiDownload /> Download Document
                </button>
              </div>
            ))}
          </div>
        )}

        {/* =============================================== */}
        {/* REGULATORY UPDATES */}
        {/* =============================================== */}
        {activeTab === "updates" && (
          <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
            {updates.map((u, idx) => (
              <div
                key={idx}
                className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6"
              >
                <div className="md:w-1/4">
                  <span
                    className={`${u.impactColor} text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block`}
                  >
                    {u.impact}
                  </span>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mt-1">{u.category}</p>
                  <p className="text-slate-500 text-sm mt-2 flex items-center gap-1 font-medium"><FiCalendar /> {u.date}</p>
                </div>

                <div className="md:w-3/4">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{u.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm mb-4">{u.desc}</p>
                  <button className="text-emerald-700 font-bold text-sm hover:underline flex items-center gap-1">
                    Read Full Regulation <FiArrowRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =============================================== */}
        {/* TIMELINE */}
        {/* =============================================== */}
        {activeTab === "timeline" && (
          <div className="relative border-l-2 border-emerald-200 pl-8 ml-4 md:ml-10 space-y-12 max-w-3xl mx-auto">
            {timeline.map((t, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[41px] top-1 h-6 w-6 rounded-full bg-emerald-100 border-4 border-white ring-2 ring-emerald-500"></span>

                <h2 className="text-4xl font-black text-emerald-900/10 absolute -top-4 -left-6 select-none">{t.year}</h2>
                <div className="relative pl-2">
                  <h2 className="text-2xl font-bold text-slate-800 mb-1">{t.year}</h2>
                  <h3 className="text-lg font-semibold text-emerald-700 mb-2">{t.title}</h3>
                  <p className="text-slate-600 mb-4">{t.desc}</p>

                  <div className="flex flex-wrap gap-2">
                    {t.tags.map((tg, i) => (
                      <span
                        key={i}
                        className="bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-medium rounded-full"
                      >
                        {tg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =============================================== */}
        {/* TOOLS */}
        {/* =============================================== */}
        {activeTab === "tools" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* ALERT SUBSCRIPTION */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                <FiClock size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Compliance Alert Subscription
              </h3>
              <p className="text-slate-600 mb-6 text-sm">
                Stay informed about regulatory changes and compliance updates directly in your inbox.
              </p>

              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter business email"
                  className="flex-1 border border-slate-300 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
                <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-emerald-600 transition text-sm">
                  Subscribe
                </button>
              </div>
            </div>

            {/* VERIFY BADGE */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <FiShield size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Digital Badge Verification
              </h3>
              <p className="text-slate-600 mb-6 text-sm">
                Instant verification of certification badge IDs and authorization status.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ID e.g. BBMP-2023-WM"
                  className="flex-1 border border-slate-300 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
                <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-emerald-600 transition text-sm">
                  Verify
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certifications;
