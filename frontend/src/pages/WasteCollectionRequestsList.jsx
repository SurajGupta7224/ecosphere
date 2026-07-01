import { useState, useEffect } from 'react';
import {
  ClipboardList, RefreshCw, Search, Eye, X,
  User, Phone, Mail, MapPin, Building, Calendar, Clock,
  ShieldCheck, FileText, Layers, ChevronRight, Info,
  CheckCircle, XCircle, AlertCircle, Package, TrendingUp,
  DollarSign, Weight, Tag, Home, Hash
} from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  Pending:   { bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-500'  },
  Approved:  { bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  Verified:  { bg: 'bg-indigo-50',  border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  Rejected:  { bg: 'bg-rose-50',    border: 'border-rose-200',   text: 'text-rose-700',   dot: 'bg-rose-500'   },
  Completed: { bg: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700',dot: 'bg-emerald-500'},
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${s.bg} ${s.border} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value, iconColor = 'text-slate-400' }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className={`w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-slate-800 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, iconColor = 'text-violet-600', children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-violet-50`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h3 className="text-sm font-black text-slate-800 tracking-tight">{title}</h3>
      </div>
      <div className="px-5 py-3">{children}</div>
    </div>
  );
}

export default function WasteCollectionRequestsList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => { fetchRequests(); }, []);

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
  }).sort((a, b) => new Date(b.first.created_at) - new Date(a.first.created_at));

  // Filter
  const filteredList = groupedList.filter(g => {
    const matchSearch = !search || [
      g.lead_id,
      g.first.waste_generator_name,
      g.first.authorized_person_name,
      g.first.mobile_number,
      g.first.email,
      g.categories,
    ].some(v => v?.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = !statusFilter || g.items.every(r => r.status === statusFilter) || g.first.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openPanel = (group) => {
    setSelectedGroup(group);
    setPanelOpen(true);
  };
  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(() => setSelectedGroup(null), 300);
  };

  const totalLeads = groupedList.length;
  const totalRequests = requests.length;
  const pendingCount = groupedList.filter(g => g.first.status === 'Pending').length;
  const completedCount = groupedList.filter(g => g.first.status === 'Completed').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-violet-600" /> Waste Requests List
          </h1>
          <p className="text-slate-400 text-sm mt-1">All submitted requests grouped by Lead ID</p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-black text-slate-800 mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Lead ID, name, mobile, category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none focus:border-violet-400 cursor-pointer"
        >
          <option value="">All Statuses</option>
          {['Pending','Verified','Approved','Rejected','Completed'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <p className="text-xs font-bold text-slate-400 ml-auto">
          Showing <span className="text-slate-700">{filteredList.length}</span> lead{filteredList.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">#</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lead ID</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Generator / Contact</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Categories Selected</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Items</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Total Waste/Day</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Monthly Rev.</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pickup Date</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredList.map((group, idx) => (
                  <tr
                    key={group.lead_id}
                    className="hover:bg-violet-50/20 transition-colors group"
                  >
                    <td className="px-5 py-4 text-sm text-slate-400 font-bold">{idx + 1}</td>

                    <td className="px-5 py-4">
                      <span className="font-mono text-[11px] font-extrabold text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-1.5 rounded-lg block w-fit">
                        {group.lead_id}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-extrabold text-slate-800 truncate max-w-[160px]">
                        {group.first.waste_generator_name || group.first.authorized_person_name || '—'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{group.first.mobile_number}</p>
                      {group.first.customer_type && (
                        <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider mt-1 inline-block">
                          {group.first.customer_type}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 max-w-[200px]">
                      {group.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 mb-1 last:mb-0">
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap">
                            {item.category?.name}
                          </span>
                          <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                          <span className="text-xs font-bold text-slate-700 truncate">{item.subCategory?.name}</span>
                        </div>
                      ))}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 text-xs font-black flex items-center justify-center mx-auto">
                        {group.itemCount}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-extrabold text-slate-800">
                        {group.totalExpectedWaste.toFixed(2).replace(/\.00$/, '')}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 block">KG</span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-extrabold text-purple-700">
                        ₹{group.totalMonthlyPrice.toFixed(2).replace(/\.00$/, '')}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 block">
                        ₹{group.totalYearlyPrice.toFixed(0)}/yr
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {group.first.pickup_date}
                      </div>
                      {group.first.pickup_time && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-300" />
                          {group.first.pickup_time}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={group.first.status} />
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => openPanel(group)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-100 transition-all active:scale-95 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
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

      {/* Detail Side Panel Overlay */}
      {panelOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          onClick={closePanel}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200" />

          {/* Panel */}
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-slate-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-extrabold text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-lg">
                    {selectedGroup?.lead_id}
                  </span>
                  <StatusBadge status={selectedGroup?.first?.status} />
                </div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">
                  {selectedGroup?.first?.waste_generator_name || selectedGroup?.first?.authorized_person_name}
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  {selectedGroup?.itemCount} subcategor{selectedGroup?.itemCount !== 1 ? 'ies' : 'y'} selected · Pickup: {selectedGroup?.first?.pickup_date}
                </p>
              </div>
              <button
                onClick={closePanel}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Panel Body — scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* Summary Pills */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Weight, label: 'Daily Waste', value: `${selectedGroup?.totalExpectedWaste.toFixed(2).replace(/\.00$/, '')} KG`, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { icon: DollarSign, label: 'Monthly Rev.', value: `₹${selectedGroup?.totalMonthlyPrice.toFixed(2).replace(/\.00$/, '')}`, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { icon: TrendingUp, label: 'Yearly Rev.', value: `₹${selectedGroup?.totalYearlyPrice.toFixed(0)}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map(pill => (
                  <div key={pill.label} className={`${pill.bg} rounded-2xl p-3.5 text-center`}>
                    <pill.icon className={`w-5 h-5 ${pill.color} mx-auto mb-1`} />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{pill.label}</p>
                    <p className={`text-base font-black ${pill.color} mt-0.5`}>{pill.value}</p>
                  </div>
                ))}
              </div>

              {/* Section 1: Customer Details */}
              <SectionCard title="Customer Details" icon={User} iconColor="text-violet-600">
                <InfoRow icon={User}     label="Customer Type"          value={selectedGroup?.first?.customer_type}         iconColor="text-violet-500" />
                <InfoRow icon={User}     label="Authorized Person Name" value={selectedGroup?.first?.authorized_person_name} iconColor="text-violet-500" />
                <InfoRow icon={Phone}    label="Mobile Number"          value={selectedGroup?.first?.mobile_number}         iconColor="text-green-500" />
                <InfoRow icon={Mail}     label="Email"                  value={selectedGroup?.first?.email}                 iconColor="text-blue-500" />
              </SectionCard>

              {/* Section 2: Property / Generator Details */}
              <SectionCard title="Property & Generator Details" icon={Building} iconColor="text-blue-600">
                <InfoRow icon={Building} label="Waste Generator Name" value={selectedGroup?.first?.waste_generator_name}  iconColor="text-blue-500" />
                <InfoRow icon={Home}     label="Area (SqM)"           value={selectedGroup?.first?.area_sqm ? `${selectedGroup.first.area_sqm} SqM` : null} iconColor="text-blue-400" />
                <InfoRow icon={Hash}     label="Dwelling Units"        value={selectedGroup?.first?.dwelling_units?.toString()} iconColor="text-blue-400" />
                <InfoRow icon={MapPin}   label="Complete Address"      value={selectedGroup?.first?.complete_address}      iconColor="text-rose-500" />
              </SectionCard>

              {/* Section 3: Subcategories Breakdown */}
              <SectionCard title="Subcategories Breakdown" icon={Layers} iconColor="text-emerald-600">
                <div className="space-y-3 pt-1">
                  {selectedGroup?.items.map((item, idx) => {
                    const monthly_waste = parseFloat(item.monthly_waste || 0);
                    const yearly_waste  = parseFloat(item.yearly_waste  || 0);
                    const monthly_price = parseFloat(item.monthly_price || 0);
                    const yearly_price  = parseFloat(item.yearly_price  || 0);
                    return (
                      <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3">
                        {/* Cat / Subcat header */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {item.category?.name}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                          <span className="text-sm font-extrabold text-slate-800">{item.subCategory?.name}</span>
                          {item.variation?.variation_name && (
                            <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                              {item.variation.variation_name}
                            </span>
                          )}
                        </div>

                        {/* Price & waste grid */}
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Expected Waste/Day', value: `${parseFloat(item.expected_waste).toFixed(2)} KG`, color: 'text-blue-700' },
                            { label: 'Agreed Price/KG',    value: `₹${parseFloat(item.agreed_price).toFixed(2)}`,   color: 'text-purple-700' },
                            { label: 'Suggested Price/KG', value: `₹${parseFloat(item.suggested_price).toFixed(2)}`,color: 'text-slate-600' },
                            { label: 'Monthly Waste',      value: `${monthly_waste.toFixed(2)} KG`,                 color: 'text-slate-700' },
                            { label: 'Yearly Waste',       value: `${yearly_waste.toFixed(2)} KG`,                  color: 'text-slate-700' },
                            { label: 'Monthly Price',      value: `₹${monthly_price.toFixed(2)}`,                   color: 'text-purple-700' },
                            { label: 'Yearly Price',       value: `₹${yearly_price.toFixed(2)}`,                    color: 'text-purple-700' },
                          ].map(cell => (
                            <div key={cell.label} className="bg-white rounded-xl border border-slate-100 px-3 py-2.5">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{cell.label}</p>
                              <p className={`text-sm font-extrabold ${cell.color} mt-0.5`}>{cell.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              {/* Section 4: License Details */}
              <SectionCard title="License & Legal Details" icon={ShieldCheck} iconColor="text-amber-600">
                <InfoRow icon={Building}  label="Registered RWA" value={selectedGroup?.first?.registered_rwa}   iconColor="text-amber-500" />
                <InfoRow icon={FileText}  label="GST Number"     value={selectedGroup?.first?.gst_number}      iconColor="text-amber-500" />
                <InfoRow icon={FileText}  label="PAN Number"     value={selectedGroup?.first?.pan_number}      iconColor="text-amber-500" />
                <InfoRow icon={Tag}       label="Trade License"  value={selectedGroup?.first?.trade_license}   iconColor="text-amber-500" />
              </SectionCard>

              {/* Section 5: Pickup & Notes */}
              <SectionCard title="Pickup & Additional Details" icon={Calendar} iconColor="text-indigo-600">
                <InfoRow icon={Calendar} label="Preferred Pickup Date" value={selectedGroup?.first?.pickup_date}          iconColor="text-indigo-500" />
                <InfoRow icon={Clock}    label="Preferred Pickup Time" value={selectedGroup?.first?.pickup_time}          iconColor="text-indigo-500" />
                <InfoRow icon={Info}     label="Pickup Notes"          value={selectedGroup?.first?.pickup_notes}         iconColor="text-slate-500" />
                <InfoRow icon={User}     label="Request Source"        value={selectedGroup?.first?.request_source}       iconColor="text-slate-500" />
              </SectionCard>

            </div>

            {/* Panel Footer */}
            <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              <p className="text-xs font-bold text-slate-400">
                {selectedGroup?.itemCount} line item{selectedGroup?.itemCount !== 1 ? 's' : ''} under this lead
              </p>
              <button
                onClick={closePanel}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
