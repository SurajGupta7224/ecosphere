import { useState, useEffect } from 'react';
import {
  ClipboardList, RefreshCw, Search, Eye,
  Calendar, Clock, CheckCircle, AlertCircle, Weight, IndianRupee, TrendingUp, Tag, Hash, MoreVertical, Edit3, ChevronRight, Layers, FolderOpen
} from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';
import EditRequestForm from '../components/EditRequestForm';
import ViewRequestDetails from '../components/ViewRequestDetails';
import BookOrderForm from '../components/BookOrderForm';

const STATUS_STYLES = {
  Pending: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  Approved: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  Verified: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  Booked: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
  Rejected: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  Completed: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${s.bg} ${s.border} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

export default function WasteCollectionRequestsList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // User Role Parsing
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role?.role_name?.toLowerCase().includes('admin');

  // Edit/View Panel States
  const [isEditing, setIsEditing] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [activeDropdownLeadId, setActiveDropdownLeadId] = useState(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.action-dropdown-trigger')) {
        setActiveDropdownLeadId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/waste-collection-requests', { params: { limit: 500 } });
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load waste collection requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Group requests by lead_id
  const grouped = requests.reduce((acc, req) => {
    const key = req.lead_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(req);
    return acc;
  }, {});

  const groupedList = Object.entries(grouped).map(([lead_id, items]) => {
    const first = items[0];
    const totalExpectedWaste = items.reduce((s, r) => s + parseFloat(r.expected_waste || 0), 0);
    const totalMonthlyPrice = items.reduce((s, r) => s + parseFloat(r.monthly_price || 0), 0);
    const totalYearlyPrice = items.reduce((s, r) => s + parseFloat(r.yearly_price || 0), 0);
    const categories = [...new Set(items.map(r => r.category?.name).filter(Boolean))].join(', ');
    const subCategories = [...new Set(items.map(r => r.subCategory?.name).filter(Boolean))].join(', ');
    return {
      lead_id,
      items,
      first,
      totalExpectedWaste,
      totalMonthlyPrice,
      totalYearlyPrice,
      categories,
      subCategories,
      itemCount: items.length,
    };
  })
  .filter(g => g.first.status !== 'Booked')
  .sort((a, b) => new Date(b.first.created_at) - new Date(a.first.created_at));

  // Filter
  const filteredList = groupedList.filter(g => {
    // 1. Search filter: mobile, name, lead id, category
    const matchSearch = !search || [
      g.lead_id,
      g.first.waste_generator_name,
      g.first.customer_legal_name,
      g.first.customer_trade_name,
      g.first.contact_person,
      g.first.mobile_number,
      g.first.phone_number_2,
      g.first.email,
      g.categories,
      g.subCategories
    ].some(v => v?.toLowerCase().includes(search.toLowerCase()));

    // 2. Status filter
    const matchStatus = !statusFilter || g.items.every(r => r.status === statusFilter) || g.first.status === statusFilter;

    // 3. Start Date filter (on creation date)
    let matchStartDate = true;
    if (startDate && g.first.created_at) {
      const itemDate = new Date(g.first.created_at);
      itemDate.setHours(0, 0, 0, 0);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      matchStartDate = itemDate >= start;
    }

    // 4. End Date filter (on creation date)
    let matchEndDate = true;
    if (endDate && g.first.created_at) {
      const itemDate = new Date(g.first.created_at);
      itemDate.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
      matchEndDate = itemDate <= end;
    }

    return matchSearch && matchStatus && matchStartDate && matchEndDate;
  });

  // Export to CSV Function
  const handleExportCSV = () => {
    if (filteredList.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Lead ID", 
      "Customer Type", 
      "Site Request", 
      "Service Center Type", 
      "Employee Name", 
      "Billing Type", 
      "Business Region", 
      "Business Sub Region", 
      "Branch Code", 
      "Business Lead", 
      "Customer Legal Name", 
      "Customer Trade Name", 
      "Contact Person", 
      "Designation", 
      "Mobile Number", 
      "Phone Number 2", 
      "Email", 
      "Email 2", 
      "Others Note", 
      "Registered RWA", 
      "GST Number", 
      "PAN Number", 
      "Trade License", 
      "BWG Name", 
      "Sector", 
      "Area (SqM)", 
      "Flats", 
      "Complete Address", 
      "Landmark", 
      "City", 
      "State", 
      "Pincode", 
      "Country", 
      "Address Search String", 
      "Latitude", 
      "Longitude", 
      "Google Map Link", 
      "Category Name", 
      "Sub-Category Name", 
      "Selected Variation", 
      "Expected Waste (KG/Day)", 
      "Agreed Price", 
      "Suggested Price", 
      "Monthly Waste (KG)", 
      "Yearly Waste (KG)", 
      "Monthly Price (INR)", 
      "Yearly Price (INR)", 
      "Total Order Value (INR)", 
      "Discount (INR)", 
      "Discounted Price (INR)", 
      "SEZ", 
      "Taxability / GST", 
      "Final Price (INR)", 
      "Preferred Pickup Date", 
      "Preferred Pickup Time", 
      "Pickup Notes", 
      "Request Source", 
      "Billing Address Different", 
      "Billing Customer Legal Name", 
      "Billing Customer Trade Name", 
      "Billing Contact Person", 
      "Billing Designation", 
      "Billing Phone 1", 
      "Billing Phone 2", 
      "Billing Email", 
      "Billing Email 2", 
      "Billing City", 
      "Billing State", 
      "Billing Pincode", 
      "Billing Landmark", 
      "Billing Country", 
      "Billing Others Note", 
      "Billing Complete Address", 
      "MOM Agreement File", 
      "PO Copy File", 
      "RWA File", 
      "GST File", 
      "PAN File", 
      "Trade License File", 
      "Email Copy File", 
      "Status", 
      "Rejection Reason", 
      "Created Date"
    ];

    const rows = [];
    filteredList.forEach(group => {
      group.items.forEach(item => {
        let billing = {};
        if (group.first.billing_details) {
          try {
            billing = typeof group.first.billing_details === 'string' ? JSON.parse(group.first.billing_details) : group.first.billing_details;
          } catch (e) { }
        }

        const bLegalName = billing.billing_customer_legal_name || billing.customer_legal_name || "";
        const bTradeName = billing.billing_customer_trade_name || billing.customer_trade_name || "";
        const bContactPerson = billing.billing_contact_person || billing.contact_person || "";
        const bDesignation = billing.billing_designation || billing.designation || "";
        const bPhone1 = billing.billing_phone_number_1 || billing.billing_mobile_number || billing.phone_number_1 || billing.mobile_number || billing.phone || "";
        const bPhone2 = billing.billing_phone_number_2 || billing.phone_number_2 || "";
        const bEmail = billing.billing_email || billing.email || "";
        const bEmail2 = billing.billing_email_2 || billing.email_2 || "";
        const bCity = billing.billing_city || billing.city || "";
        const bState = billing.billing_state || billing.state || "";
        const bPincode = billing.billing_pincode || billing.pincode || "";
        const bLandmark = billing.billing_landmark || billing.landmark || "";
        const bCountry = billing.billing_country || billing.country || "";
        const bOthers = billing.billing_others || billing.billing_others_note || billing.others || billing.others_note || "";
        const bCompleteAddress = billing.billing_complete_address || billing.complete_address || "";

        const row = [
          group.lead_id || "",
          group.first.customer_type || "",
          group.first.site_request || "",
          group.first.service_center_type || "",
          group.first.employee_name || "",
          group.first.billing_type || "",
          group.first.business_region || "",
          group.first.business_sub_region || "",
          group.first.branch_code || "",
          group.first.business_lead || "",
          group.first.customer_legal_name || "",
          group.first.customer_trade_name || "",
          group.first.contact_person || "",
          group.first.designation || "",
          group.first.mobile_number || "",
          group.first.phone_number_2 || "",
          group.first.email || "",
          group.first.email_2 || "",
          (group.first.others_note || "").replace(/"/g, '""'),
          group.first.registered_rwa || "",
          group.first.gst_number || group.first.gst || "",
          group.first.pan_number || group.first.pan || "",
          group.first.trade_license || "",
          group.first.waste_generator_name || "",
          group.first.sector || "",
          group.first.area_sqm || "",
          group.first.dwelling_units || group.first.no_of_dwelling_units || "",
          (group.first.complete_address || "").replace(/"/g, '""'),
          group.first.landmark || "",
          group.first.city || "",
          group.first.state || "",
          group.first.pincode || "",
          group.first.country || "",
          (group.first.address_search || "").replace(/"/g, '""'),
          group.first.latitude || "",
          group.first.longitude || "",
          group.first.google_map_link || "",
          item.category?.name || "",
          item.subCategory?.name || "",
          item.variation?.variation_name || "",
          item.expected_waste || "0",
          item.agreed_price || "0",
          item.suggested_price || "0",
          item.monthly_waste || "0",
          item.yearly_waste || "0",
          item.monthly_price || "0",
          item.yearly_price || "0",
          group.first.total_order_value || "0",
          group.first.discount || "0",
          group.first.discounted_price || "0",
          group.first.sez || "",
          group.first.taxibility || "",
          group.first.final_price || "0",
          group.first.pickup_date || "",
          group.first.pickup_time || "",
          (group.first.pickup_notes || "").replace(/"/g, '""'),
          group.first.request_source || "",
          group.first.billing_address_different ? "Yes" : "No",
          bLegalName || "",
          bTradeName || "",
          bContactPerson || "",
          bDesignation || "",
          bPhone1 || "",
          bPhone2 || "",
          bEmail || "",
          bEmail2 || "",
          bCity || "",
          bState || "",
          bPincode || "",
          bLandmark || "",
          bCountry || "",
          (bOthers || "").replace(/"/g, '""'),
          (bCompleteAddress || "").replace(/"/g, '""'),
          group.first.mom_agreement_file || "",
          group.first.po_copy_file || "",
          group.first.rwa_file || "",
          group.first.gst_file || "",
          group.first.pan_file || "",
          group.first.trade_license_file || "",
          group.first.email_copy_file || "",
          item.status || group.first.status || "",
          (group.first.rejected_reason || "").replace(/"/g, '""'),
          group.first.created_at ? new Date(group.first.created_at).toLocaleDateString() : ""
        ];
        rows.push(row);
      });
    });

    const csvContent = [
      headers.map(h => `"${h}"`).join(","),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `waste_requests_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Export downloaded successfully!");
  };

  const openPanel = (group) => {
    setSelectedGroup(group);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setIsEditing(false);
    setIsBooking(false);
    setTimeout(() => setSelectedGroup(null), 300);
  };

  const totalLeads = groupedList.length;
  const totalRequests = requests.length;
  const pendingCount = groupedList.filter(g => g.first.status === 'Pending').length;
  const completedCount = groupedList.filter(g => g.first.status === 'Completed').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {panelOpen && selectedGroup ? (
        isEditing ? (
          <EditRequestForm
            selectedGroup={selectedGroup}
            onSuccess={() => {
              fetchRequests();
              closePanel();
            }}
            onCancel={closePanel}
          />
        ) : isBooking ? (
          <BookOrderForm
            selectedGroup={selectedGroup}
            onSuccess={() => {
              fetchRequests();
              closePanel();
            }}
            onCancel={closePanel}
          />
        ) : (
          <ViewRequestDetails
            selectedGroup={selectedGroup}
            isAdmin={isAdmin}
            onEditClick={() => setIsEditing(true)}
            onBookClick={() => setIsBooking(true)}
            onStatusUpdated={(newStatus, updatedData) => {
              setSelectedGroup(prev => ({
                ...prev,
                first: {
                  ...prev.first,
                  status: newStatus,
                  approved_by: updatedData.approved_by,
                  approved_date: updatedData.approved_date,
                  rejected_by: updatedData.rejected_by,
                  rejected_date: updatedData.rejected_date,
                  rejected_reason: updatedData.rejected_reason,
                  approver: newStatus === 'Approved' ? { name: user.name, email: user.email } : prev.first.approver,
                  rejector: newStatus === 'Rejected' ? { name: user.name, email: user.email } : prev.first.rejector
                }
              }));
              fetchRequests();
            }}
            onClose={closePanel}
          />
        )
      ) : (
        <>
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-violet-600" /> Waste Requests List
              </h1>
              <p className="text-slate-400 text-xs mt-1">All submitted requests grouped by Lead ID</p>
            </div>
            <button
              onClick={fetchRequests}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Leads', value: totalLeads, icon: Hash, color: 'text-violet-600', bg: 'bg-violet-50' },
              { label: 'Total Requests', value: totalRequests, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Pending', value: pendingCount, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Completed', value: completedCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-lg font-bold text-slate-800 mt-0.5">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">

              {/* Left filter options */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Lead ID, name, mobile..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:border-violet-400 cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  {['Pending', 'Verified', 'Approved', 'Booked', 'Rejected', 'Completed'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 outline-none focus:border-violet-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 outline-none focus:border-violet-400 cursor-pointer"
                  />
                </div>

                {(search || statusFilter || startDate || endDate) && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('');
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Right export action */}
              <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                <p className="text-xs font-bold text-slate-400">
                  Showing <span className="text-slate-700">{filteredList.length}</span> lead{filteredList.length !== 1 ? 's' : ''}
                </p>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-100 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Export Data
                </button>
              </div>

            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <RefreshCw className="w-10 h-10 animate-spin text-violet-500 mb-4" />
                <p className="text-sm font-semibold">Loading requests…</p>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <ClipboardList className="w-12 h-12 opacity-20 mb-4" />
                <p className="text-sm font-semibold">No waste collection requests found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto pb-28 min-h-[340px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">#</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lead ID</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Generator / Contact</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Created By</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Created Date</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Items</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Total Waste/Day</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Monthly Rev.</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredList.map((group, idx) => (
                      <tr
                        key={group.lead_id}
                        className="hover:bg-violet-50/20 transition-colors group"
                      >
                        <td className="px-5 py-4 text-xs text-slate-400 font-bold align-top">{idx + 1}</td>

                        <td className="px-5 py-4 align-top">
                          <span className="font-mono text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-1 rounded-md block w-fit">
                            {group.lead_id}
                          </span>
                        </td>

                        <td className="px-5 py-4 align-top">
                          <p className="text-xs font-bold text-slate-800 truncate max-w-[160px]">
                            {group.first.waste_generator_name || group.first.authorized_person_name || '—'}
                          </p>
                          {group.first.waste_generator_name && group.first.authorized_person_name && (
                            <p className="text-[10px] text-slate-500 font-semibold truncate max-w-[160px] mt-0.5">
                              Ref: {group.first.authorized_person_name}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{group.first.mobile_number}</p>
                          {group.first.customer_type && (
                            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider mt-1 inline-block">
                              {group.first.customer_type}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 align-top text-xs font-semibold text-slate-700">
                          <div>
                            <span className="font-bold text-slate-700">{group.first.customer?.name || '—'}</span>
                            {group.first.customer?.email && (
                              <span className="block text-[9px] text-slate-400 mt-0.5">{group.first.customer.email}</span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 align-top text-xs font-semibold text-slate-600 whitespace-nowrap">
                          {group.first.created_at ? (
                            <span>
                              {new Date(group.first.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          ) : '—'}
                        </td>

                        <td className="px-5 py-4 text-center align-top">
                          <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center justify-center mx-auto">
                            {group.itemCount}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right align-top whitespace-nowrap">
                          <span className="text-xs font-bold text-slate-800">
                            {group.totalExpectedWaste.toFixed(2).replace(/\.00$/, '')}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 ml-1">KG</span>
                        </td>

                        <td className="px-5 py-4 text-right align-top whitespace-nowrap">
                          <span className="text-xs font-bold text-purple-700">
                            ₹{group.totalMonthlyPrice.toFixed(2).replace(/\.00$/, '')}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 ml-1.5">
                            (₹{group.totalYearlyPrice.toFixed(0)}/yr)
                          </span>
                        </td>

                        <td className="px-5 py-4 align-top">
                          <StatusBadge status={group.first.status} />
                        </td>

                        <td className="px-5 py-4 text-center align-top">
                          <div className="relative inline-block text-left action-dropdown-trigger">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownLeadId(activeDropdownLeadId === group.lead_id ? null : group.lead_id);
                              }}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center border border-slate-200 bg-white shadow-sm"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                            {activeDropdownLeadId === group.lead_id && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownLeadId(null);
                                  }}
                                />
                                <div className={`absolute right-0 ${idx >= filteredList.length - 2 && filteredList.length > 2 ? 'bottom-full mb-1' : 'top-full mt-1'} w-32 bg-white rounded-xl border border-slate-200 shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left`}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveDropdownLeadId(null);
                                      openPanel(group);
                                      setIsEditing(false);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-violet-600 transition-colors flex items-center gap-2 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                                    View Details
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveDropdownLeadId(null);
                                      openPanel(group);
                                      setIsEditing(true);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-violet-600 transition-colors flex items-center gap-2 cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                                    Edit Record
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
