import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  Archive,
  Search,
  MessageSquare,
  RefreshCw,
  Download,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

export default function CustomerComplaint() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get("/complaints", {
        params: {
          search,
          status,
          from,
          to,
        },
      });
      setComplaints(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/complaints/dashboard");
      setDashboard(res.data.data || {});
    } catch (err) {
      console.error("Error loading complaints dashboard:", err);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchDashboard();
  }, []);

  const clearFilters = async () => {
    setSearch("");
    setStatus("");
    setFrom("");
    setTo("");

    try {
      setLoading(true);
      const res = await api.get("/complaints");
      setComplaints(res.data.data || []);
      const dash = await api.get("/complaints/dashboard");
      setDashboard(dash.data.data || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await api.get("/complaints/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `complaints_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      toast.success("Complaint report exported successfully!");
    } catch (err) {
      toast.error("Failed to export complaint report.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Complaint Management</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              View, filter, track, and resolve customer service complaints.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${exporting ? "animate-bounce" : ""}`} />
            {exporting ? "Exporting..." : "Export Report"}
          </button>
          <button
            onClick={() => {
              fetchComplaints();
              fetchDashboard();
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Dashboard Stat Cards Row (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Complaints</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{dashboard.total || 0}</h3>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending</p>
            <h3 className="text-2xl font-extrabold text-amber-700 mt-1">{dashboard.pending || 0}</h3>
          </div>
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">In Progress</p>
            <h3 className="text-2xl font-extrabold text-blue-700 mt-1">{dashboard.in_progress || 0}</h3>
          </div>
          <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Resolved</p>
            <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">{dashboard.resolved || 0}</h3>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Closed */}
        <div className="bg-slate-100/60 p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Closed</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{dashboard.closed || 0}</h3>
          </div>
          <div className="p-3 bg-slate-200 text-slate-700 rounded-xl">
            <Archive className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 items-center">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search complaint ID, customer, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchComplaints()}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchComplaints}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer text-center"
            >
              Search
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition active:scale-95 cursor-pointer text-center"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Main Complaints Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
            <p className="text-sm font-semibold">Loading Customer Complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <MessageSquare className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-base font-bold text-slate-700">No complaints found</p>
            <p className="text-xs text-slate-500">Try clearing filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-5">Complaint ID</th>
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">Pickup Date</th>
                  <th className="py-3.5 px-5">Subject</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5">Created At</th>
                  <th className="py-3.5 px-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {complaints.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => navigate(`/complaints/${item.id}`)}
                  >
                    <td className="py-4 px-5">
                      <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200 font-mono">
                        {item.complaint_id}
                      </span>
                    </td>

                    <td className="py-4 px-5 font-bold text-slate-900">{item.customer_name || "—"}</td>

                    <td className="py-4 px-5 text-slate-600 font-medium">{item.pickup_date || "—"}</td>

                    <td className="py-4 px-5 font-semibold text-slate-700 max-w-xs truncate">{item.subject || "—"}</td>

                    <td className="py-4 px-5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                          item.status === "Pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : item.status === "Resolved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : item.status === "In Progress"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-slate-500 text-xs">
                      {new Date(item.created_at || Date.now()).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/complaints/${item.id}`);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}