import React from "react";
import { FiArrowRight, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import {
  formatDate,
  getTotalWeight,
  getDriverName,
  isCompletedStatus,
} from "./pickupHelpers";

export default function RecentPickupsStrip({
  pickups,
  loadingPickups,
  onViewAll,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
            Recent Activity
          </p>
          <h2 className="text-lg font-bold text-gray-800 mt-1">
            Recent Pickups
          </h2>
        </div>

        <button
          onClick={onViewAll}
          className="flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800"
        >
          View all
          <FiArrowRight size={13} />
        </button>
      </div>

      {loadingPickups ? (
        <div className="py-10 text-center text-sm text-gray-400">
          Loading pickup history...
        </div>
      ) : pickups.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">
          No pickup records available.
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {pickups.map((pickup, index) => {
            const done = isCompletedStatus(pickup);

            return (
              <div
                key={pickup._id || pickup.id || pickup.lead_id || index}
                className="flex-shrink-0 w-40 border border-gray-100 rounded-xl p-4 hover:border-green-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-full whitespace-nowrap">
                    {formatDate(pickup.pickup_date)}
                  </span>

                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      done ? "bg-green-600" : "bg-amber-400"
                    }`}
                  >
                    {done ? (
                      <FiCheckCircle size={12} className="text-white" />
                    ) : (
                      <FiAlertCircle size={12} className="text-white" />
                    )}
                  </span>
                </div>

                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1">
                  Weight
                </p>
                <p
                  className={`text-lg font-bold mb-3 ${
                    done ? "text-gray-800" : "text-amber-500"
                  }`}
                >
                  {getTotalWeight(pickup)}kg
                </p>

                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1">
                  Collector
                </p>
                <p className="text-sm font-semibold text-green-700 truncate">
                  {getDriverName(pickup)}
                </p>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
