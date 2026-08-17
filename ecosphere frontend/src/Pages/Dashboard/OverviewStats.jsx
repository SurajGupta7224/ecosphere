import React from "react";
import { FiTruck, FiAlertCircle } from "react-icons/fi";

export default function OverviewStats({
  loadingPickups,
  totalPickups,
  totalWasteKg,
  openComplaints = 0,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center mb-3">
          <FiTruck size={17} className="text-green-700" />
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
          Total Pickups
        </p>
        <p className="text-[22px] font-bold text-gray-800 leading-tight">
          {loadingPickups ? "–" : totalPickups}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
          <FiTruck size={17} className="text-amber-500" />
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
          Total Waste
        </p>
        <p className="text-[22px] font-bold text-gray-800 leading-tight">
          {totalWasteKg.toFixed(0)} kg
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center mb-3">
          <FiAlertCircle size={17} className="text-red-500" />
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
          Open Complaints
        </p>
        <p className="text-[22px] font-bold text-gray-800 leading-tight">
          {openComplaints}
        </p>
      </div>
    </div>
  );
}