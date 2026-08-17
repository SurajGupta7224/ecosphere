import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, Mail, Calendar, MessageSquare, Image as ImageIcon, Send, RefreshCw, AlertCircle, CheckCircle2, Clock, Archive } from "lucide-react";
import toast from "react-hot-toast";
import api, { IMAGE_BASE_URL } from "../api";

export default function ComplaintDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [showImage, setShowImage] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/complaints/${id}`);
      const data = res.data.data;
      setComplaint(data);
      setReply(data.admin_reply || "");
      setStatus(data.status || "Pending");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load complaint details");
    } finally {
      setLoading(false);
    }
  };

  const updateComplaint = async () => {
    try {
      if (!reply.trim()) {
        return toast.error("Please enter an admin response.");
      }

      setUpdating(true);
      const res = await api.patch(`/complaints/${id}`, {
        status,
        admin_reply: reply,
      });

      toast.success(res.data.message || "Complaint updated successfully.");
      navigate("/complaints");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update complaint.");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold">Loading Complaint Details...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-500 space-y-3">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <p className="text-base font-bold text-slate-700">Complaint record not found.</p>
        <button
          onClick={() => navigate("/complaints")}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
        >
          Return to Complaints
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/complaints")}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 text-xs">
                {complaint.complaint_id}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Complaint Details</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Review customer service ticket and issue official response.
            </p>
          </div>
        </div>

        <div>
          <span
            className={`inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-extrabold border ${
              complaint.status === "Pending"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : complaint.status === "Resolved"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : complaint.status === "In Progress"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            {complaint.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Information & Attachments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Customer Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer Name</p>
                <p className="text-sm font-extrabold text-slate-800 mt-1">{complaint.customer_name || "—"}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-extrabold text-slate-800 mt-1">{complaint.customer_email || "—"}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pickup Date</p>
                <p className="text-sm font-extrabold text-slate-800 mt-1">{complaint.pickup_date || "—"}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Submitted On</p>
                <p className="text-sm font-extrabold text-slate-800 mt-1">
                  {new Date(complaint.created_at || Date.now()).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Complaint Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Issue & Details
              </h2>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</p>
              <p className="text-base font-extrabold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                {complaint.subject}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Detailed Description</p>
              <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 text-xs sm:text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                {complaint.description || "No description provided."}
              </div>
            </div>
          </div>

          {/* Attachment Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Attachment / Photo
              </h2>
            </div>

            {complaint.attachment ? (
              <div className="space-y-2">
                <div
                  onClick={() => setShowImage(true)}
                  className="relative group rounded-2xl border border-slate-200 overflow-hidden max-w-md bg-slate-950 cursor-pointer shadow-xs"
                >
                  <img
                    src={`${IMAGE_BASE_URL}/complaints/${complaint.attachment}`}
                    alt="Complaint Attachment"
                    className="w-full max-h-72 object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-2">
                    <ImageIcon className="w-5 h-5" /> Click to view full image
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs font-semibold text-slate-400 italic">No attachment image uploaded for this complaint.</p>
            )}
          </div>
        </div>

        {/* Right 1 Column: Admin Response & Update Action */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5 sticky top-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Send className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Admin Response
              </h2>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">
                Update Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">
                Admin Reply / Resolution Remarks <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={6}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write official response or resolution details for the customer..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none placeholder-slate-400"
              />
            </div>

            <button
              onClick={updateComplaint}
              disabled={updating}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className={`w-4 h-4 ${updating ? "animate-spin" : ""}`} />
              {updating ? "Updating..." : "Update Complaint"}
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal Preview */}
      {showImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setShowImage(false)}
        >
          <img
            src={`${IMAGE_BASE_URL}/complaints/${complaint.attachment}`}
            alt="Full Attachment"
            className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}