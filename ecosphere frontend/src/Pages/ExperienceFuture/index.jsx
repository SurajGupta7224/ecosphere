import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaFileDownload } from "react-icons/fa";
import { FaAward } from "react-icons/fa6";

export default function ExperienceFuture() {
  return (
    <section className="py-20 px-4 md:px-10 bg-gray-50">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
      >

        {/* LEFT CONTENT */}
        <div className="p-10 flex flex-col justify-center">

          {/* Badge */}
          <div className="flex items-center gap-2 bg-emerald-100 text-emerald-900 px-4 py-1 rounded-full text-sm font-semibold w-fit mb-6">
            <span className="text-emerald-700">🌱</span> Ready to Transform?
          </div>

          {/* Heading */}
          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
            Experience the Future of Waste Management
          </h2>

          {/* Description */}
          <p className="text-gray-600 mt-4 text-lg">
            Join industry leaders who have already transformed their waste
            management operations with EcoSphere's revolutionary technology.
            Schedule a consultation to discover how we can help you achieve
            zero-landfill impact.
          </p>

          {/* Feature List */}
          <div className="mt-6 space-y-4">
            {[
              {
                title: "Free Technology Assessment",
                desc: "Comprehensive analysis of your waste management needs",
              },
              {
                title: "Custom ROI Calculation",
                desc: "Detailed financial and environmental impact projections",
              },
              {
                title: "Virtual Facility Tour",
                desc: "Interactive demonstration of our technology in action",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="flex items-start gap-3"
              >
                <FaCheckCircle className="text-green-600 text-xl" />
                <div>
                  <p className="font-semibold text-gray-800">{item.title}</p>
                  <p className="text-gray-600 text-sm -mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Buttons */}
          <div className="mt-8 flex gap-4">
            <button className="bg-green-700 text-white px-6 py-3 rounded-lg shadow hover:bg-green-800 font-semibold">
              Schedule Consultation
            </button>

            <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-6 py-3 hover:bg-gray-100">
              <FaFileDownload /> Download Brochure
            </button>
          </div>

          {/* Partners row */}
          <div className="mt-8 flex items-center gap-4">
            <img
              src="/team.jpg"
              alt="Partners"
              className="w-10 h-10 rounded-full object-cover shadow"
            />
            <div>
              <p className="font-semibold text-gray-800">Join 150+ Partners</p>
              <p className="text-gray-500 text-sm">Trusted by industry leaders worldwide</p>
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE + OVERLAY */}
        <div className="relative">
          <img
            src="/it.jpeg" // <-- CHANGE TO YOUR PUBLIC IMAGE NAME
            alt="EcoSphere Facility"
            className="w-full h-full object-cover"
          />

          {/* Overlay Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="absolute bottom-6 left-6 bg-white bg-opacity-80 backdrop-blur-md shadow-xl rounded-xl p-5 w-[85%]"
          >
            <p className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
              <FaAward className="text-green-700 text-lg" />
              Industry Recognition
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-1">
              ISO 14001 Certified
            </h3>

            <div className="grid grid-cols-3 mt-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-800">12+</p>
                <p className="text-gray-600 text-sm">Patents</p>
              </div>

              <div>
                <p className="text-2xl font-bold text-gray-800">8</p>
                <p className="text-gray-600 text-sm">Research Partners</p>
              </div>

              <div>
                <p className="text-2xl font-bold text-green-700">99.97%</p>
                <p className="text-gray-600 text-sm">Uptime</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
