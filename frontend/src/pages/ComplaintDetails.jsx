import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

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
      toast.error("Failed to load complaint");
    } finally {
      setLoading(false);
    }
  };


const updateComplaint = async () => {
  try {
    if (!reply.trim()) {
      return toast.error("Please enter an admin reply.");
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

    toast.error(
      err.response?.data?.message || "Failed to update complaint."
    );
  } finally {
    setUpdating(false);
  }
};




  useEffect(() => {
    fetchComplaint();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Loading Complaint...
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600 text-lg">
        Complaint not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header */}

      <div className="bg-white rounded-xl shadow border p-6 mb-6 flex justify-between items-center">

        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate("/complaints")}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100 flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div>

            <h1 className="text-3xl font-bold text-slate-800">
              Complaint Details
            </h1>

            <p className="text-gray-500 mt-1">
              Complaint ID : {complaint.complaint_id}
            </p>

          </div>

        </div>

        <span
          className={`px-4 py-2 rounded-full font-semibold
          ${
            complaint.status === "Pending"
              ? "bg-yellow-100 text-yellow-700"
              : complaint.status === "Resolved"
              ? "bg-green-100 text-green-700"
              : complaint.status === "In Progress"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {complaint.status}
        </span>

      </div>



      {/* Customer Information */}

      <div className="bg-white rounded-xl shadow border p-6 mb-6">

        <h2 className="text-xl font-semibold mb-5">
          Customer Information
        </h2>

        <div className="grid grid-cols-2 gap-6">

          <div>
            <p className="text-gray-500 text-sm">Customer Name</p>
            <p className="font-semibold">{complaint.customer_name}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Email</p>
            <p className="font-semibold">{complaint.customer_email}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Pickup Date</p>
            <p className="font-semibold">{complaint.pickup_date}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Created At</p>
            <p className="font-semibold">
              {new Date(complaint.created_at).toLocaleString()}
            </p>
          </div>

        </div>

      </div>

      {/* Complaint Information */}

      <div className="bg-white rounded-xl shadow border p-6 mb-6">

        <h2 className="text-xl font-semibold mb-5">
          Complaint Information
        </h2>

        <div className="mb-5">

          <p className="text-gray-500 text-sm">
            Subject
          </p>

          <p className="font-semibold text-lg">
            {complaint.subject}
          </p>

        </div>

        <div>

          <p className="text-gray-500 text-sm mb-2">
            Description
          </p>

          <div className="bg-gray-50 rounded-lg border p-4 whitespace-pre-wrap">
            {complaint.description}
          </div>

        </div>

      </div>




       {/* Attachment */}

<div className="bg-white rounded-xl shadow border p-4 mb-4">

  <h2 className="text-lg font-semibold mb-4">
    Attachment
  </h2>

  {complaint.attachment ? (

    <div>

      <img
  src={`http://localhost:5000/uploads/complaints/${complaint.attachment}`}
  alt="Complaint Attachment"
  className="w-64 rounded-lg border cursor-pointer hover:opacity-90"
  onClick={() => setShowImage(true)}
/>

      <p className="text-xs text-gray-500 mt-2">
        Click the image to view it in full size.
      </p>

    </div>

  ) : (

    <p className="text-gray-500">
      No attachment available.
    </p>

  )}

  

</div>



      {/* Admin Reply */}

      <div className="bg-white rounded-xl shadow border p-6">

        <h2 className="text-xl font-semibold mb-5">
          Admin Response
        </h2>

        <textarea
  rows={6}
  value={reply}
  onChange={(e) => setReply(e.target.value)}
  className="w-full border rounded-lg p-4"
  placeholder="Write your reply..."
/>

        <div className="mt-5">

          <label className="font-medium">
            Status
          </label>

        <select
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  className="w-full border rounded-lg mt-2 p-3"
>

            <option>Pending</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Closed</option>

          </select>

        </div>

        <div className="flex justify-end mt-6">
<button
  onClick={updateComplaint}
  disabled={updating}
  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg transition"
>
  {updating ? "Updating..." : "Update Complaint"}
</button>

        </div>

      </div>


      {showImage && (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    onClick={() => setShowImage(false)}
  >
    <img
      src={`http://localhost:5000/uploads/complaints/${complaint.attachment}`}
      alt="Full Attachment"
      className="max-w-[90%] max-h-[90%] rounded-lg shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
)}

    </div>
  );
}