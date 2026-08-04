import React from "react";
import { FiTruck, FiAlertCircle, FiMapPin } from "react-icons/fi";
import {
  statusColor,
  getVehicleNumber,
  getDriverName,
  getDriverMobile,
} from "./pickupHelpers";

export default function OverviewStats({
  loadingPickups,
  upcomingPickup,
  fallbackMobile,
  onTrack,
  totalPickups,
  totalWasteKg,
  openComplaints = 0,
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">

      {/* Upcoming Pickup — vehicle, driver, mobile + Track, all in one card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
            <FiTruck size={17} className="text-green-700" />
          </div>

          {upcomingPickup && (
            <span
              className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${statusColor(
                upcomingPickup.status
              )}`}
            >
              {upcomingPickup.status || "Pending"}
            </span>
          )}
        </div>

        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1.5">
          Upcoming Pickup
        </p>

        {loadingPickups ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : upcomingPickup ? (
          <div className="flex-1 flex flex-col">
            <p className="text-xs text-gray-500 leading-5">
              Reg. No:{" "}
              <span className="font-semibold text-gray-700">
                {getVehicleNumber(upcomingPickup)}
              </span>
            </p>
            <p className="text-xs text-gray-500 leading-5">
              Driver:{" "}
              <span className="font-semibold text-gray-700">
                {getDriverName(upcomingPickup)}
              </span>
            </p>
            <p className="text-xs text-gray-500 leading-5">
              Mobile:{" "}
              <span className="font-semibold text-gray-700">
                {getDriverMobile(upcomingPickup, fallbackMobile)}
              </span>
            </p>

            <button
              onClick={onTrack}
              className="mt-auto pt-3 flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800"
            >
              <FiMapPin size={12} />ic
              Track
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No upcoming pickups.</p>
        )}
      </div>

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
