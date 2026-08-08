import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  Archive,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

export default function CustomerComplaint() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [dashboard, setDashboard] = useState({});

  const [loading, setLoading] = useState(true);

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
      console.error(err);
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

    setDashboard(dash.data.data);

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

    {/* Header */}

    <div className="bg-white rounded-xl shadow border p-4 mb-4">

     <h1 className="text-xl font-semibold text-slate-800">
        Complaint Management
      </h1>

      <p className="text-sm text-gray-500 mt-1">
        View and manage all customer complaints.
      </p>

    </div>

    {/* Dashboard */}

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-4">

      <div className="bg-white rounded-xl shadow border p-4">
        <div className="flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total</p>
            <h2 className="text-2xl font-bold mt-2">
              {dashboard.total || 0}
            </h2>
          </div>

          <FileText className="text-gray-500" size={24} />
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl shadow p-4">
        <div className="flex justify-between">
          <div>
            <p className="text-yellow-700 text-sm">Pending</p>

            <h2 className="text-xl font-bold text-yellow-700 mt-2">
              {dashboard.pending || 0}
            </h2>
          </div>

          <AlertCircle className="text-yellow-600" size={34} />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl shadow p-4">
        <div className="flex justify-between">
          <div>
            <p className="text-blue-700 text-sm">
              In Progress
            </p>

            <h2 className="text-3xl font-bold text-blue-700 mt-2">
              {dashboard.in_progress || 0}
            </h2>
          </div>

          <Clock className="text-blue-600" size={34} />
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl shadow p-4">
        <div className="flex justify-between">
          <div>
            <p className="text-green-700 text-sm">
              Resolved
            </p>

            <h2 className="text-3xl font-bold text-green-700 mt-2">
              {dashboard.resolved || 0}
            </h2>
          </div>

          <CheckCircle2
            className="text-green-600"
            size={34}
          />
        </div>
      </div>

      <div className="bg-gray-50 border rounded-xl shadow p-4">
        <div className="flex justify-between">
          <div>
            <p className="text-gray-600 text-sm">
              Closed
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {dashboard.closed || 0}
            </h2>
          </div>

          <Archive className="text-gray-600" size={34} />
        </div>
      </div>

    </div>

    {/* Filters */}

    <div className="bg-white rounded-xl shadow border p-4 mb-4">

      <div className="grid lg:grid-cols-5 gap-4">

        <input
          type="text"
          placeholder="Search complaint..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Status</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Resolved</option>
          <option>Closed</option>
        </select>

        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />

        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />

        <button
          onClick={fetchComplaints}
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          Search
        </button>

        <button
  onClick={clearFilters}
  className="border border-gray-300 hover:bg-gray-100 rounded-lg px-4 py-2"
>
  Clear
</button>

      </div>

    </div>

    {/* Table */}

    <div className="bg-white rounded-xl shadow border overflow-hidden">

      <table className="min-w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="px-4 py-3 text-left">
              Complaint ID
            </th>

            <th className="px-4 py-3 text-left">
              Customer
            </th>

            <th className="px-4 py-3 text-left">
              Pickup Date
            </th>

            <th className="px-4 py-3 text-left">
              Subject
            </th>

            <th className="px-4 py-3 text-left">
              Status
            </th>

            <th className="px-4 py-3 text-left">
              Created
            </th>

            <th className="px-4 py-3 text-center">
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {loading ? (

            <tr>

              <td
                colSpan="7"
                className="text-center py-10"
              >
                Loading...
              </td>

            </tr>

          ) : complaints.length === 0 ? (

            <tr>

              <td
                colSpan="7"
                className="text-center py-10 text-gray-500"
              >
                No complaints found.
              </td>

            </tr>

          ) : (

            complaints.map((item) => (

              <tr
                key={item.id}
                className="border-t hover:bg-slate-50"
              >

                <td className="px-5 py-4 font-semibold">
                  {item.complaint_id}
                </td>

                <td className="px-5 py-4">
                  {item.customer_name}
                </td>

                <td className="px-5 py-4">
                  {item.pickup_date}
                </td>

                <td className="px-5 py-4">
                  {item.subject}
                </td>

                <td className="px-5 py-4">

                  <span
  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
  ${
    item.status === "Pending"
      ? "bg-yellow-100 text-yellow-700"
      : item.status === "Resolved"
      ? "bg-green-100 text-green-700"
      : item.status === "In Progress"
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-200 text-gray-700"
  }`}
>
  {item.status}
</span>

                </td>

                <td className="px-5 py-4">
                  {new Date(
                    item.created_at
                  ).toLocaleDateString()}
                </td>

                <td className="px-5 py-4 text-center">

                  <button
                    onClick={() =>
                      navigate(`/complaints/${item.id}`)
                    }
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <button
  onClick={() => navigate(`/complaints/${item.id}`)}
  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
>
  <Eye size={18}/>
  View
</button>
                  </button>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>

  </div>
);
}