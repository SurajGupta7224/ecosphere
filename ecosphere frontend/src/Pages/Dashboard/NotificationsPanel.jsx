import React from "react";
import { FiBell, FiAlertTriangle, FiArrowRight } from "react-icons/fi";
import { formatDate, getVehicleNumber, getDriverName } from "./pickupHelpers";

export default function NotificationsPanel({
  missedPickups,
  loadingPickups,
  onRaiseComplaint,
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
          <FiBell size={18} className="text-green-700" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
          <p className="text-sm text-gray-400">
            Missed pickups that need your attention.
          </p>
        </div>
      </div>

      {loadingPickups ? (
        <div className="py-16 text-center text-gray-400">
          Loading...
        </div>
      ) : missedPickups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <FiBell size={40} className="mx-auto mb-4" />
          <p>You're all caught up.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {missedPickups.map((pickup, index) => (
            <div
              key={pickup._id || pickup.id || pickup.lead_id || index}
              className="flex items-center justify-between gap-4 border border-amber-100 bg-amber-50 rounded-xl p-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <FiAlertTriangle size={15} className="text-amber-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amber-800">
                    Pickup missed on {formatDate(pickup.pickup_date)}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Vehicle: {getVehicleNumber(pickup)} · Driver: {getDriverName(pickup)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onRaiseComplaint?.(pickup)}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900"
              >
                Raise complaint
                <FiArrowRight size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
