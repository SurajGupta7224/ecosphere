import React from "react";
import { FiMapPin } from "react-icons/fi";
import {
  statusColor,
  getSiteName,
  getVehicleNumber,
  getDriverName,
  getDriverMobile,
} from "./pickupHelpers";

export default function TodaysPickupCard({
  todaysPickup,
  loadingPickups,
  fallbackSiteName,
  fallbackMobile,
  onTrack,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
            Scheduled Pickup
          </p>
          <h2 className="text-lg font-bold text-gray-800 mt-1">
            Today's Pickup
          </h2>
        </div>

        {todaysPickup && (
          <span
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusColor(
              todaysPickup.status
            )}`}
          >
            {todaysPickup.status || "Pending"}
          </span>
        )}
      </div>

      {loadingPickups ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : todaysPickup ? (
        <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">

          <div className="min-w-0">
            <p className="font-bold text-gray-800 text-sm truncate">
              {getSiteName(todaysPickup, fallbackSiteName)}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              Reg. No:{" "}
              <span className="font-semibold text-gray-600">
                {getVehicleNumber(todaysPickup)}
              </span>
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Driver:{" "}
              <span className="font-semibold text-gray-600">
                {getDriverName(todaysPickup)}
              </span>
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Mobile:{" "}
              <span className="font-semibold text-gray-600">
                {getDriverMobile(todaysPickup, fallbackMobile)}
              </span>
            </p>
          </div>

          <button
            onClick={onTrack}
            className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800"
          >
            <FiMapPin size={13} />
            Track
          </button>

        </div>
      ) : (
        <p className="text-sm text-gray-400">
          No pickup scheduled for today.
        </p>
      )}

    </div>
  );
}
