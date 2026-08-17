import React from "react";
import { FiMapPin, FiTruck } from "react-icons/fi";
import {
  statusColor,
  getVehicleNumber,
  getDriverName,
  getDriverMobile,
} from "./pickupHelpers";

export default function TodaysPickupCard({
  todaysPickups = [],
  loadingPickups,
  fallbackMobile,
  onTrack,
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
            Scheduled Pickup
          </p>
          <h2 className="text-lg font-bold text-gray-800 mt-1">
            Today's Pickup
          </h2>
        </div>

        {todaysPickups.length > 0 && (
          <span className="text-xs text-gray-400">
            {todaysPickups.length} truck{todaysPickups.length > 1 ? "s" : ""} assigned
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        {loadingPickups ? (
          <p className="text-sm text-gray-400 text-center py-6">Loading...</p>
        ) : todaysPickups.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No pickup scheduled for today.
          </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {todaysPickups.map((pickup, index) => (
              <div
                key={pickup.id ?? index}
                className="bg-white border border-gray-100 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <FiTruck size={20} className="text-green-700" />
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(
                      pickup.status
                    )}`}
                  >
                    {pickup.status || "Pending"}
                  </span>
                </div>

                <p className="text-xs text-gray-400">
                  Reg. No:{" "}
                  <span className="font-semibold text-gray-600">
                    {getVehicleNumber(pickup)}
                  </span>
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Driver:{" "}
                  <span className="font-semibold text-gray-600">
                    {getDriverName(pickup)}
                  </span>
                </p>

                <p className="text-xs text-gray-400 mt-1 mb-3">
                  Mobile:{" "}
                  <span className="font-semibold text-gray-600">
                    {getDriverMobile(pickup, fallbackMobile)}
                  </span>
                </p>

                <button
                  onClick={() => onTrack?.(pickup)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800"
                >
                  <FiMapPin size={12} />
                  Track
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}