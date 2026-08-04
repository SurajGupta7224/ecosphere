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
} from "react-icons/fi";

import { customerFetch } from "../../api";

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

    customerFetch("/complaints")
      .then((data) => {
        setComplaints(data.complaints || data.orders || []);
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

    if (s === "resolved" || s === "closed") {
      return "bg-green-50 text-green-700 border-green-100";
    }
    if (s === "in progress" || s === "in-progress" || s === "reviewing") {
      return "bg-blue-50 text-blue-700 border-blue-100";
    }
    if (s === "rejected") {
      return "bg-red-50 text-red-700 border-red-100";
    }
    // default: open / pending / submitted
    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  const statusIcon = (status) => {
    const s = String(status || "").toLowerCase();

    if (s === "resolved" || s === "closed") return <FiCheckCircle size={12} />;
    if (s === "rejected") return <FiXCircle size={12} />;
    if (s === "in progress" || s === "in-progress" || s === "reviewing")
      return <FiRefreshCw size={12} />;
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

  const getFileIcon = (file) => {
    const name = typeof file === "string" ? file : file?.name || "";
    const ext = name.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return <FiImage size={13} className="text-green-600" />;
    }
    if (ext === "pdf") {
      return <FiFileText size={13} className="text-red-500" />;
    }
    return <FiFile size={13} className="text-gray-400" />;
  };

  const getFileName = (file) => {
    if (typeof file === "string") {
      return file.split("/").pop();
    }
    return file?.name || file?.filename || "Attachment";
  };

  const getFileUrl = (file) => {
    if (typeof file === "string") return file;
    return file?.url || file?.path || "#";
  };

  // ---------------------------------------------------------
  // FILTERED LIST
  // ---------------------------------------------------------
  const filteredComplaints = useMemo(() => {
    if (statusFilter === "all") return complaints;

    return complaints.filter(
      (c) => String(c.status || "").toLowerCase() === statusFilter
    );
  }, [complaints, statusFilter]);

  const sortedComplaints = useMemo(() => {
    return [...filteredComplaints].sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0).getTime();
      const dateB = new Date(b.date || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [filteredComplaints]);

  const statusCounts = useMemo(() => {
    return complaints.reduce((acc, c) => {
      const s = String(c.status || "open").toLowerCase();
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
  }, [complaints]);

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
            <p className="text-sm text-gray-400 mt-1">
              Track the status of complaints you've raised.
            </p>
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
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-wrap gap-2">
          {[
            { id: "all", label: "All", count: complaints.length },
            { id: "open", label: "Open", count: statusCounts.open || 0 },
            {
              id: "in progress",
              label: "In Progress",
              count: statusCounts["in progress"] || 0,
            },
            {
              id: "resolved",
              label: "Resolved",
              count: statusCounts.resolved || 0,
            },
            {
              id: "rejected",
              label: "Rejected",
              count: statusCounts.rejected || 0,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? "bg-green-50 text-green-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  statusFilter === tab.id
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
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
          <div className="divide-y divide-gray-50">
            {sortedComplaints.map((complaint, index) => {
              const id =
                complaint._id ||
                complaint.id ||
                complaint.complaintId ||
                index;
              const isExpanded = expandedId === id;
              const files = complaint.files || complaint.attachments || [];

              return (
                <div key={id} className="p-5">
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : id)
                    }
                    className="w-full flex items-start justify-between gap-4 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <p className="font-bold text-gray-800 text-sm">
                          {complaint.subject || "Complaint"}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyles(
                            complaint.status
                          )}`}
                        >
                          {statusIcon(complaint.status)}
                          {complaint.status || "Open"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <FiCalendar size={11} />
                          {formatDate(complaint.date || complaint.createdAt)}
                        </span>

                        {complaint.complaintId && (
                          <span>#{complaint.complaintId}</span>
                        )}

                        {files.length > 0 && (
                          <span className="flex items-center gap-1">
                            <FiPaperclip size={11} />
                            {files.length}
                          </span>
                        )}
                      </div>

                      {!isExpanded && complaint.description && (
                        <p className="text-xs text-gray-400 mt-2 truncate">
                          {complaint.description}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0 text-gray-300 mt-1">
                      {isExpanded ? (
                        <FiChevronUp size={16} />
                      ) : (
                        <FiChevronDown size={16} />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 pl-0 sm:pl-1">
                      {complaint.description && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-3">
                          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1.5">
                            Description
                          </p>
                          <p className="text-sm text-gray-700 leading-6 whitespace-pre-wrap">
                            {complaint.description}
                          </p>
                        </div>
                      )}

                      {complaint.resolutionNote && (
                        <div className="bg-green-50 rounded-xl p-4 mb-3">
                          <p className="text-[10px] uppercase tracking-widest text-green-700 font-semibold mb-1.5">
                            Resolution
                          </p>
                          <p className="text-sm text-green-800 leading-6 whitespace-pre-wrap">
                            {complaint.resolutionNote}
                          </p>
                        </div>
                      )}

                      {files.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">
                            Attachments
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {files.map((file, fIndex) => (
                              <a
                                key={fIndex}
                                href={getFileUrl(file)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs text-gray-600"
                              >
                                {getFileIcon(file)}
                                <span className="truncate max-w-[140px]">
                                  {getFileName(file)}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}