import React from "react";
import { FiUser, FiMail, FiPhone } from "react-icons/fi";

export default function MyDetails({ customer }) {
  const name = customer?.customer_name || "-";
  const email = customer?.email || "-";
  const phone = customer?.mobile || "-";

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
            <FiUser size={19} className="text-green-700" />
          </div>

          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
              Customer Profile
            </p>

            <h2 className="text-xl font-bold text-gray-800 mt-1">
              My Details
            </h2>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Name */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <FiUser size={16} className="text-green-700" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
                Name
              </p>

              <p className="text-sm font-semibold text-gray-800 break-words">
                {name}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <FiMail size={16} className="text-green-700" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
                Email
              </p>

              <p className="text-sm font-semibold text-gray-800 break-all">
                {email}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <FiPhone size={16} className="text-green-700" />
            </div>

            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
                Phone
              </p>

              <p className="text-sm font-semibold text-gray-800">
                {phone}
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}