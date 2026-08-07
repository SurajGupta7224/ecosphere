import React, { useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiFileText,
  FiFile,
  FiImage,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiPlus,
  FiPaperclip,
  FiChevronDown,
  FiChevronUp,
  FiHash,
} from "react-icons/fi";

import { customerFetch } from "../../api";

// ---------------------------------------------------------
// If your backend serves uploaded files from a static path,
// set the base URL here so attachments resolve correctly.
// e.g. "http://localhost:5000/uploads/complaints/"
// ---------------------------------------------------------
const ATTACHMENT_BASE_URL = "/uploads/complaints/";

export default function MyComplaints({ customer, onRaiseComplaint }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  // ---------------------------------------------------------
  // FETCH COMPLAINTS
  // ---------------------------------------------------------
  const fetchComplaints = () => {
    setLoading(true);
    setError("");

    customerFetch("/customer/complaints")
      .then((data) => {
        setComplaints(data.data || []);
      })
      .catch((err) => {
        console.error("Complaints fetch error:", err);
        setError("Failed to load your complaints.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // ---------------------------------------------------------
  // STATUS HELPERS
  // ---------------------------------------------------------
  const statusStyles = (status) => {
    const s = String(status || "").toLowerCase();

    if (s === "resolved") {
      return "bg-green-50 text-green-700 border-green-200";
    }
    if (s === "in progress") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (s === "closed") {
      return "bg-gray-100 text-gray-600 border-gray-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const statusDot = (status) => {
    const s = String(status || "").toLowerCase();

    if (s === "resolved") return "bg-green-500";
    if (s === "in progress") return "bg-blue-500";
    if (s === "closed") return "bg-gray-400";
    return "bg-amber-500";
  };

  const statusIcon = (status) => {
    const s = String(status || "").toLowerCase();

    if (s === "resolved") return <FiCheckCircle size={12} />;
    if (s === "closed") return <FiXCircle size={12} />;
    if (s === "in progress") return <FiRefreshCw size={12} />;
    return <FiClock size={12} />;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isImageAttachment = (path) => {
    const ext = path?.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
  };

  const getFileIcon = (path) => {
    const ext = path?.split(".").pop()?.toLowerCase();

    if (isImageAttachment(path)) {
      return <FiImage size={13} className="text-green-600" />;
    }
    if (ext === "pdf") {
      return <FiFileText size={13} className="text-red-500" />;
    }
    return <FiFile size={13} className="text-gray-400" />;
  };

  const getFileName = (path) => {
    if (!path) return "Attachment";
    return path.split("/").pop();
  };

  const getFileUrl = (path) => {
    if (!path) return "#";
    if (path.startsWith("http")) return path;
    return `${ATTACHMENT_BASE_URL}${path}`;
  };

  // ---------------------------------------------------------
  // FILTERED + SORTED LIST
  // ---------------------------------------------------------
  const filteredComplaints = useMemo(() => {
    if (statusFilter === "all") return complaints;

    return complaints.filter(
      (c) => String(c.status || "").toLowerCase() === statusFilter
    );
  }, [complaints, statusFilter]);

  const sortedComplaints = useMemo(() => {
    return [...filteredComplaints].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [filteredComplaints]);

  const statusCounts = useMemo(() => {
    return complaints.reduce((acc, c) => {
      const s = String(c.status || "pending").toLowerCase();
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
  }, [complaints]);

  const filterTabs = [
    { id: "all", label: "All", count: complaints.length },
    { id: "pending", label: "Pending", count: statusCounts.pending || 0 },
    {
      id: "in progress",
      label: "In Progress",
      count: statusCounts["in progress"] || 0,
    },
    { id: "resolved", label: "Resolved", count: statusCounts.resolved || 0 },
    { id: "closed", label: "Closed", count: statusCounts.closed || 0 },
  ];

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="flex flex-col gap-4">
      {/* HEADER */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
              Support History
            </p>
            <h2 className="text-xl font-bold text-gray-800 mt-1">
              My Complaints
            </h2>

            {complaints.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {statusCounts.pending || 0} Pending
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {statusCounts["in progress"] || 0} In Progress
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {statusCounts.resolved || 0} Resolved
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  {statusCounts.closed || 0} Closed
                </span>
              </div>
            )}
          </div>

          {onRaiseComplaint && (
            <button
              onClick={onRaiseComplaint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-semibold flex-shrink-0"
            >
              <FiPlus size={14} />
              Raise a Complaint
            </button>
          )}
        </div>
      </div>

      {/* STATUS FILTER TABS */}
      {complaints.length > 0 && (
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 flex flex-wrap gap-1.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? "bg-green-700 text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  statusFilter === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm">Loading your complaints...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-400">
            <FiAlertTriangle size={32} className="mx-auto mb-3" />
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchComplaints}
              className="mt-3 text-xs font-semibold text-green-700 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : sortedComplaints.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <FiAlertTriangle size={32} className="mx-auto mb-3" />
            <p className="text-sm">
              {statusFilter === "all"
                ? "You haven't raised any complaints yet."
                : `No ${statusFilter} complaints.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-gray-400">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-gray-400">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-gray-400">
                    Pickup Date
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-gray-400">
                    Raised On
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider font-bold text-gray-400">
                    {/* expand chevron column */}
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedComplaints.map((complaint, index) => {
                  const id = complaint.id || complaint.complaint_id || index;
                  const isExpanded = expandedId === id;
                  const attachment = complaint.attachment;

                  return (
                    <React.Fragment key={id}>
                      <tr
                        onClick={() =>
                          setExpandedId(isExpanded ? null : id)
                        }
                        className={`cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                          isExpanded ? "bg-gray-50" : ""
                        }`}
                      >
                        <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                          <span className="flex items-center gap-1 text-xs font-medium">
                            <FiHash size={11} className="text-gray-300" />
                            {complaint.complaint_id || "—"}
                          </span>
                        </td>

                        <td className="px-4 py-4 font-semibold text-gray-800 max-w-[220px] truncate">
                          {complaint.subject || "Complaint"}
                        </td>

                        <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                          {formatDate(complaint.pickup_date)}
                        </td>

                        <td className="px-4 py-4 text-gray-400 text-xs whitespace-nowrap">
                          {formatDate(complaint.created_at)}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusStyles(
                              complaint.status
                            )}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusDot(
                                complaint.status
                              )}`}
                            />
                            {complaint.status || "Pending"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right text-gray-300">
                          {isExpanded ? (
                            <FiChevronUp size={16} className="inline" />
                          ) : (
                            <FiChevronDown size={16} className="inline" />
                          )}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="border-b border-gray-50 bg-gray-50/50">
                          <td colSpan={6} className="px-4 py-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* DESCRIPTION */}
                              <div className="md:col-span-2">
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1.5">
                                  Description
                                </p>
                                <p className="text-sm text-gray-700 leading-6 whitespace-pre-wrap bg-white rounded-xl border border-gray-100 p-4">
                                  {complaint.description ||
                                    "No description provided."}
                                </p>

                                {complaint.admin_reply && (
                                  <div className="mt-3">
                                    <p className="text-[10px] uppercase tracking-widest text-green-700 font-semibold mb-1.5">
                                      Resolution
                                    </p>
                                    <p className="text-sm text-green-800 leading-6 whitespace-pre-wrap bg-green-50 rounded-xl border border-green-100 p-4">
                                      {complaint.admin_reply}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* ATTACHMENT */}
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1.5">
                                  Attachment
                                </p>

                                {attachment ? (
                                 <a 
                                    href={getFileUrl(attachment)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-green-300 transition"
                                  >
                                    {isImageAttachment(attachment) ? (
                                      <img
                                        src={getFileUrl(attachment)}
                                        alt="Attachment"
                                        className="w-full h-32 object-cover"
                                      />
                                    ) : (
                                      <div className="flex flex-col items-center justify-center h-32 px-3">
                                        {getFileIcon(attachment)}
                                        <p className="mt-2 text-xs text-gray-500 truncate max-w-full">
                                          {getFileName(attachment)}
                                        </p>
                                      </div>
                                    )}

                                    <div className="flex items-center gap-1.5 px-3 py-2 border-t border-gray-100 text-[11px] text-gray-500">
                                      <FiPaperclip size={11} />
                                      <span className="truncate">
                                        {getFileName(attachment)}
                                      </span>
                                    </div>
                                  </a>
                                ) : (
                                  <p className="text-xs text-gray-400 bg-white rounded-xl border border-gray-100 p-4 text-center">
                                    No attachment
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}