import React from "react";

export default function WasteBreakdownCard({ reportSummary }) {
  const items = [
    { label: "Wet", value: reportSummary.wet },
    { label: "Dry", value: reportSummary.dry },
    { label: "Sanitary", value: reportSummary.sanitary },
    { label: "Special Care", value: reportSummary.special },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">

      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-4">
        Waste Breakdown
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
            <p className="text-lg font-bold text-gray-800">
              {item.value.toFixed(0)} kg
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
