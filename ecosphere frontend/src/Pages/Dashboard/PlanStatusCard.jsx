import React from "react";
import { FiFileText } from "react-icons/fi";

// -----------------------------------------------------------
// Plan / contract status card
// Pass startDate / endDate from your customer or subscription
// object once that field exists on the backend. Until then,
// this gracefully hides the renewal chip if endDate is missing.
// -----------------------------------------------------------
export default function PlanStatusCard({
  planName = "Your Plan",
  endDate,
  onDownloadReport,
}) {
  const daysLeft = (() => {
    if (!endDate) return null;

    const end = new Date(endDate);

    if (Number.isNaN(end.getTime())) return null;

    return Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  })();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3">

        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
            Service Plan
          </p>
          <p className="text-sm font-bold text-gray-800">
            {planName}
          </p>
        </div>

        <div className="flex items-center gap-4">

          {endDate && (
            <div className="text-right">
              <p className="text-[10px] text-gray-400">Renews on</p>
              <p className="text-xs font-semibold text-gray-700">
                {new Date(endDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          )}

          {daysLeft !== null && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-50 text-green-700">
              {daysLeft > 0 ? `${daysLeft} days left` : "Plan expired"}
            </span>
          )}

          <button
            onClick={onDownloadReport}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
          >
            <FiFileText size={13} />
            Compliance report
          </button>

        </div>

      </div>
    </div>
  );
}
