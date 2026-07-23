import React from "react";

export default function PartnerWithUs() {
  return (
    <div className="w-full min-h-screen bg-[#ffffff] pt-[40px] pb-[80px] px-6 lg:px-16">
      <h1 className="text-4xl font-bold text-[#14532d] mb-10">
        Review Aggregator
      </h1>

      <SectionTitle title="Aggregator details" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <Field label="Agency Name *" placeholder="Enter agency name" />
        <Field label="Agency Owner Name *" placeholder="Enter owner name" />
        <Field label="Owner Designation *" placeholder="Enter designation" />
        <Field label="Aadhar *" placeholder="Enter Aadhar no." />

        <Field label="Email *" placeholder="Enter email" />
        <Field label="Mobile *" placeholder="Enter mobile number" />
        <Field
          label="Address *"
          placeholder="Enter full address"
          className="md:col-span-2 lg:col-span-2"
        />

        <Field label="GST Number *" placeholder="Enter GST Number" />
        <Field label="PAN Number *" placeholder="Enter PAN Number" />
        <Field label="LIN Number" placeholder="Enter LIN Number" />
        <Field label="ESIC Number" placeholder="Enter ESIC Number" />

        <Field label="EPFO Number" placeholder="Enter EPFO Number" />
        <Field label="KLWF Number" placeholder="Enter KLWF Number" />
        <Field label="TAN Number" placeholder="Enter TAN Number" />
      </div>

      {/* ================= SECTION 2 ================= */}
      <SectionTitle title="Financial details" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <Field label="Bank Name" placeholder="Enter bank name" />
        <Field label="Branch Name" placeholder="Enter branch name" />
        <Field label="IFSC Code" placeholder="Enter IFSC code" />
        <Field label="Account Number" placeholder="Enter account number" />
      </div>

      {/* ================= SECTION 3 ================= */}
      <SectionTitle title="Vehicle details" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <Field label="Vehicle Number" placeholder="Enter vehicle number" />
        <Field label="RC Number" placeholder="Enter RC number" />
        <Field label="Fleet Type" placeholder="Enter fleet type" />
        <Field label="Fuel Type" placeholder="Enter fuel type" />

        <Field label="Insurance Expiry" placeholder="Select insurance expiry" />
        <Field label="Permit Validity" placeholder="Select permit validity" />
        <Field label="PUC Validity" placeholder="Select PUC expiry" />
        <Field label="GPS Installed" placeholder="Yes / No" />
      </div>

      {/* ================= SUBMIT BUTTON ================= */}
      <div className="flex justify-center mt-10">
        <button
          className="
            bg-gradient-to-r from-emerald-700 to-emerald-600 
            text-white font-semibold 
            px-10 py-3 
            rounded-lg
            shadow-lg 
            hover:shadow-xl 
            hover:scale-[1.02] 
            transition-all 
            duration-300
          "
        >
          Submit Details
        </button>
      </div>
    </div>
  );
}

/* ------------------ COMPONENTS ------------------ */

function SectionTitle({ title }) {
  return (
    <h2 className="text-2xl font-semibold text-[#14532d] mb-4 border-b pb-2 border-[#c9c1b4]">
      {title}
    </h2>
  );
}

function Field({ label, className = "", placeholder = "" }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>

      <input
        type="text"
        placeholder={placeholder}
        className="
          h-[48px]
          bg-[#d6cdbd]
          rounded-lg
          shadow-sm
          px-3
          text-gray-900
          outline-none
          placeholder-gray-600
          focus:ring-2
          focus:ring-emerald-700
        "
      />
    </div>
  );
}
