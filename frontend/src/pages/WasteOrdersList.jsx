import { useState, useEffect } from 'react';
import {
  ClipboardList, RefreshCw, Search, Eye, QrCode,
  Calendar, Clock, CheckCircle, AlertCircle, Weight, IndianRupee, TrendingUp, Tag, Hash, MoreVertical, X, XCircle, ShieldAlert, Building, MapPin, User, UserCheck,
  Phone, Mail, Layers, ChevronRight, FolderOpen, FileText, Award, CreditCard, Receipt, Info, Download
} from 'lucide-react';
import api, { IMAGE_BASE_URL } from '../api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  Booked: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
  Completed: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Cancelled: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' }
};

const getCategoryColorTheme = (categoryName = '') => {
  const name = String(categoryName).toLowerCase();
  if (name.includes('wet') || name.includes('organic')) {
    return {
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      accentText: 'text-emerald-800'
    };
  }
  if (name.includes('dry') || name.includes('recycle')) {
    return {
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      accentText: 'text-blue-800'
    };
  }
  if (name.includes('sanitary') || name.includes('medical') || name.includes('hazard') || name.includes('bio')) {
    return {
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
      accentText: 'text-rose-800'
    };
  }
  if (name.includes('e-waste') || name.includes('electronic') || name.includes('metal') || name.includes('c&d')) {
    return {
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      accentText: 'text-amber-800'
    };
  }
  return {
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
    accentText: 'text-teal-800'
  };
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Booked;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${s.bg} ${s.border} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${status === 'Booked' ? 'animate-pulse' : ''}`} />
      {status}
    </span>
  );
}

function InfoItem({ icon: Icon, label, value, iconColor = 'text-slate-500' }) {
  return (
    <div className="flex items-start gap-3 bg-slate-50/40 rounded-xl p-3.5 border border-slate-200/60 min-w-0 transition-all hover:bg-white hover:shadow-xs hover:border-slate-300/80">
      <div className="w-8.5 h-8.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
        <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
        <span className="text-xs font-bold text-slate-700 mt-0.5 block break-words leading-snug">{value || '—'}</span>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, iconColor = 'text-slate-650', children }) {
  return (
    <div className="bg-white rounded-[1.25rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 px-6 py-4.5 bg-gradient-to-r from-slate-50/50 to-white border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-200/60 shadow-2xs">
          <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
        </div>
        <h3 className="text-sm font-extrabold text-slate-700 tracking-tight">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function WasteOrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({});

  const toggleExpandOrder = (order_id) => {
    setExpandedOrders(prev => ({
      ...prev,
      [order_id]: !prev[order_id]
    }));
  };

  // Sidebar / view state
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelInput, setShowCancelInput] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/waste-orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load waste orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Group requests by order_id
  const grouped = orders.reduce((acc, order) => {
    const key = order.order_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {});

  const groupedList = Object.entries(grouped).map(([order_id, items]) => {
    const first = items[0];
    const totalExpectedWaste = items.reduce((s, r) => s + parseFloat(r.expected_waste || 0), 0);
    const totalMonthlyPrice = items.reduce((s, r) => s + parseFloat(r.monthly_price || 0), 0);
    const totalYearlyPrice = items.reduce((s, r) => s + parseFloat(r.yearly_price || 0), 0);
    const categories = [...new Set(items.map(r => r.category?.name).filter(Boolean))].join(', ');
    const subCategories = [...new Set(items.map(r => r.subCategory?.name).filter(Boolean))].join(', ');
    return {
      order_id,
      lead_id: first.lead_id,
      items,
      first,
      totalExpectedWaste,
      totalMonthlyPrice,
      totalYearlyPrice,
      categories,
      subCategories,
      itemCount: items.length,
    };
  }).sort((a, b) => new Date(b.first.updated_at) - new Date(a.first.updated_at));

  const filteredList = groupedList.filter(g => {
    const matchSearch = !search || [
      g.order_id,
      g.lead_id,
      g.first.waste_generator_name,
      g.first.customer_legal_name,
      g.first.contact_person,
      g.first.mobile_number,
      g.categories,
      g.subCategories
    ].some(v => v?.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = !statusFilter || g.first.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openPanel = async (group) => {
    setSelectedGroup(group);
    setPanelOpen(true);
    setShowCancelInput(false);
    setCancelReason('');
    setQrCodeDataUrl('');
    setQrLoading(true);
    try {
      const res = await api.get(`/waste-orders/${group.first.id}/qr`);
      setQrCodeDataUrl(res.data.qr);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load order QR code from backend.');
    } finally {
      setQrLoading(false);
    }
  };

  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(() => {
      setSelectedGroup(null);
      setQrCodeDataUrl('');
    }, 300);
  };

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl || !selectedGroup) {
      toast.error('QR code is not loaded yet.');
      return;
    }
    try {
      const qrImg = new Image();
      qrImg.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = 360;
        const headerHeight = 120;
        const qrSize = 300;
        const height = headerHeight + qrSize + 20;

        canvas.width = width;
        canvas.height = height;

        // Background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Header Background
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(0, 0, width, headerHeight - 10);

        // Border Line
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, headerHeight - 10);
        ctx.lineTo(width, headerHeight - 10);
        ctx.stroke();

        const orderId = selectedGroup.order_id || '—';
        const customerName = selectedGroup.first.customer_legal_name || selectedGroup.first.contact_person || '—';
        const generatorName = selectedGroup.first.waste_generator_name || '—';

        ctx.textAlign = 'center';

        // 1. Order ID
        ctx.fillStyle = '#4F46E5';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`ORDER ID: ${orderId}`, width / 2, 35);

        // 2. Customer Name
        ctx.fillStyle = '#1E293B';
        ctx.font = 'bold 12px sans-serif';
        let dispCust = `Customer Name: ${customerName}`;
        if (dispCust.length > 42) dispCust = dispCust.substring(0, 39) + '...';
        ctx.fillText(dispCust, width / 2, 60);

        // 3. Apartment / Generator Name
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 11px sans-serif';
        let dispGen = `BWG Generator: ${generatorName}`;
        if (dispGen.length > 46) dispGen = dispGen.substring(0, 43) + '...';
        ctx.fillText(dispGen, width / 2, 85);

        // Draw QR
        ctx.drawImage(qrImg, (width - qrSize) / 2, headerHeight, qrSize, qrSize);

        const compositeDataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = compositeDataUrl;
        link.download = `QR-${orderId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('QR Code downloaded successfully.');
      };
      qrImg.onerror = () => {
        toast.error('Failed to parse QR code image.');
      };
      qrImg.src = qrCodeDataUrl;
    } catch (err) {
      console.error(err);
      toast.error('Failed to download QR code.');
    }
  };

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      toast.error('Cancellation reason is required.');
      return;
    }

    setCancelling(true);
    try {
      await api.patch(`/waste-orders/lead/${selectedGroup.lead_id}/cancel`, {
        cancel_reason: cancelReason
      });
      toast.success('Order cancelled successfully.');
      setShowCancelInput(false);
      setCancelReason('');
      fetchOrders();
      closePanel();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to cancel the order.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {panelOpen && selectedGroup ? (
        /* Order Details Screen */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-[1.25rem] border border-slate-205 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-violet-650 bg-violet-55/40 border border-violet-100 px-2.5 py-1 rounded-lg">
                  Order ID: {selectedGroup.order_id}
                </span>
                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                  Lead ID: {selectedGroup.lead_id}
                </span>
                <StatusBadge status={selectedGroup.first.status} />
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {selectedGroup.first.customer_legal_name || selectedGroup.first.contact_person || 'Unnamed Client'}
              </h2>
              <p className="text-xs text-slate-400 font-bold mt-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Booked On: <span className="text-slate-655 font-extrabold">{new Date(selectedGroup.first.updated_at).toLocaleDateString('en-IN')}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={closePanel}
                className="inline-flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
                Back to Orders
              </button>
            </div>
          </div>

          {/* Contract Validity Banner */}
          {selectedGroup.first.contract_start_date && selectedGroup.first.contract_end_date && (() => {
            const start = new Date(selectedGroup.first.contract_start_date);
            const end = new Date(selectedGroup.first.contract_end_date);
            const now = new Date();
            start.setHours(0,0,0,0);
            end.setHours(0,0,0,0);
            now.setHours(0,0,0,0);
            
            const diffTime = end - now;
            const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (daysRemaining < 0) {
              return (
                <div className="bg-rose-50 border border-rose-200 rounded-[1.25rem] p-5 flex items-center gap-4 text-rose-800 shadow-sm animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-5.5 h-5.5 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-rose-800">Contract Expired</h4>
                    <p className="text-[11px] font-bold text-rose-700/90 mt-0.5 leading-normal">
                      This order's contract has expired (End Date: {end.toLocaleDateString('en-IN')}). Please contact administrator to renew the contract.
                    </p>
                  </div>
                </div>
              );
            } else if (daysRemaining <= 30) {
              return (
                <div className="bg-amber-50 border border-amber-200 rounded-[1.25rem] p-5 flex items-center gap-4 text-amber-800 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5.5 h-5.5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-800">Contract Expiring Soon</h4>
                    <p className="text-[11px] font-bold text-amber-700/90 mt-0.5 leading-normal">
                      This order's contract is set to expire in {daysRemaining} days (End Date: {end.toLocaleDateString('en-IN')}). Please review for renewal.
                    </p>
                  </div>
                </div>
              );
            } else {
              return (
                <div className="bg-emerald-50 border border-emerald-200 rounded-[1.25rem] p-5 flex items-center gap-4 text-emerald-800 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5.5 h-5.5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800">Contract Valid & Active</h4>
                    <p className="text-[11px] font-bold text-emerald-700/90 mt-0.5 leading-normal">
                      The contract is active until {end.toLocaleDateString('en-IN')} ({daysRemaining} days remaining).
                    </p>
                  </div>
                </div>
              );
            }
          })()}

          {/* Pricing Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Weight, label: 'Total Expected Waste', value: `${selectedGroup.totalExpectedWaste.toFixed(2).replace(/\.00$/, '')} KG`, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200/80' },
              { icon: IndianRupee, label: 'Monthly Pricing', value: `₹${selectedGroup.totalMonthlyPrice.toLocaleString('en-IN')}`, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200/80' },
              { icon: TrendingUp, label: 'Yearly Estimate', value: `₹${selectedGroup.totalYearlyPrice.toLocaleString('en-IN')}`, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200/80' },
            ].map(pill => (
              <div key={pill.label} className={`${pill.bg} rounded-[1.25rem] p-4 border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow`}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white border border-slate-200/60 shadow-sm flex-shrink-0">
                  <pill.icon className={`w-5 h-5 ${pill.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{pill.label}</p>
                  <p className="text-lg font-black text-slate-800 mt-0.5">{pill.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Details Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              {/* Order mappings card */}
              <SectionCard title="Mapped Locations & Event Info" icon={Building} iconColor="text-violet-600">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <InfoItem icon={Building} label="Corporation" value={selectedGroup.first.corporation?.corporation_name} iconColor="text-violet-500" />
                  <InfoItem icon={MapPin} label="Zone" value={selectedGroup.first.zone?.zone_name} iconColor="text-violet-500" />
                  <InfoItem icon={MapPin} label="Ward" value={selectedGroup.first.ward?.ward_name} iconColor="text-violet-500" />
                  <InfoItem icon={Calendar} label="Collection Event" value={selectedGroup.first.collectionEvent?.event_name} iconColor="text-violet-500" />
                </div>
              </SectionCard>

              {/* Company details */}
              <SectionCard title="Company Details" icon={ClipboardList} iconColor="text-slate-600">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <InfoItem icon={Tag} label="Site Request" value={selectedGroup.first.site_request} iconColor="text-slate-500" />
                  <InfoItem icon={Building} label="Service Center Type" value={selectedGroup.first.service_center_type} iconColor="text-slate-500" />
                  <InfoItem icon={User} label="Employee Name" value={selectedGroup.first.employee_name} iconColor="text-slate-500" />
                  <InfoItem icon={Building} label="BWG Generator" value={selectedGroup.first.waste_generator_name} iconColor="text-slate-500" />
                  <InfoItem icon={MapPin} label="Region" value={selectedGroup.first.business_region} iconColor="text-slate-500" />
                  <InfoItem icon={MapPin} label="Sub Region" value={selectedGroup.first.business_sub_region} iconColor="text-slate-500" />
                  <InfoItem icon={Hash} label="Branch Code" value={selectedGroup.first.branch_code} iconColor="text-slate-500" />
                </div>
              </SectionCard>

              {/* Customer details */}
              <SectionCard title="Customer Details" icon={UserCheck} iconColor="text-slate-600">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <InfoItem icon={User} label="Customer Legal Name" value={selectedGroup.first.customer_legal_name} iconColor="text-slate-500" />
                  <InfoItem icon={User} label="Contact Person" value={selectedGroup.first.contact_person} iconColor="text-slate-500" />
                  <InfoItem icon={Phone} label="Mobile Number" value={selectedGroup.first.mobile_number} iconColor="text-slate-500" />
                  <InfoItem icon={Mail} label="Email Address" value={selectedGroup.first.email} iconColor="text-slate-500" />
                </div>
              </SectionCard>

              {/* Complete Address */}
              <SectionCard title="Complete Address" icon={MapPin} iconColor="text-slate-600">
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 leading-relaxed">
                    {selectedGroup.first.complete_address || 'N/A'}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem icon={MapPin} label="City / State" value={`${selectedGroup.first.city || '—'} / ${selectedGroup.first.state || '—'}`} />
                    <InfoItem icon={Hash} label="Pincode" value={selectedGroup.first.pincode} />
                  </div>
                </div>
              </SectionCard>

              {/* Service Details & Waste Breakdown */}
              <SectionCard title="Service Details & Waste Breakdown" icon={Layers} iconColor="text-slate-600">
                <div className="space-y-4 pt-1">
                  {selectedGroup.items.filter(item => item.subcategory_id).length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs italic font-medium bg-slate-50 rounded-xl border border-slate-100">
                      No waste details or subcategories were selected for this order.
                    </div>
                  ) : (
                    selectedGroup.items.map((item, idx) => {
                      const monthly_waste = parseFloat(item.monthly_waste || 0);
                      const yearly_waste = parseFloat(item.yearly_waste || 0);
                      const monthly_price = parseFloat(item.monthly_price || 0);
                      const yearly_price = parseFloat(item.yearly_price || 0);
                      const isBulk = parseFloat(item.expected_waste || 0) === 0 && monthly_price > 0;
                      
                      const cells = isBulk ? [
                        { label: 'Pricing Mode', value: 'Bulk', color: 'text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-bold' },
                        { label: 'Monthly Bulk Price', value: `₹${monthly_price.toLocaleString('en-IN')}`, color: 'text-slate-700 font-extrabold' },
                        { label: 'Yearly Bulk Price', value: `₹${yearly_price.toLocaleString('en-IN')}`, color: 'text-slate-700 font-extrabold' },
                      ] : [
                        { label: 'Pricing Mode', value: 'Per KG', color: 'text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-bold' },
                        { label: 'Expected Waste/Day', value: `${parseFloat(item.expected_waste || 0)} KG`, color: 'text-slate-700' },
                        { label: 'Agreed Price/KG', value: `₹${parseFloat(item.agreed_price || 0).toFixed(2)}`, color: 'text-slate-700' },
                        { label: 'Suggested Price/KG', value: `₹${parseFloat(item.suggested_price || 0).toFixed(2)}`, color: 'text-slate-500' },
                        { label: 'Monthly Waste', value: `${monthly_waste.toFixed(2)} KG`, color: 'text-slate-600' },
                        { label: 'Yearly Waste', value: `${yearly_waste.toFixed(2)} KG`, color: 'text-slate-600' },
                        { label: 'Monthly Price', value: `₹${monthly_price.toFixed(2)}`, color: 'text-slate-700 font-bold' },
                        { label: 'Yearly Price', value: `₹${yearly_price.toFixed(2)}`, color: 'text-slate-700 font-bold' },
                      ];

                      return (
                        <div key={idx} className="bg-slate-50/50 rounded-xl border border-slate-200/80 p-4 space-y-4">
                          {/* Cat / Subcat header */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.category?.name && (
                              <>
                                <span className="text-[9px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase tracking-wider">
                                  {item.category.name}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                              </>
                            )}
                            <span className="text-sm font-extrabold text-slate-800">{item.subCategory?.name || '—'}</span>
                            {item.variation?.variation_name && (
                              <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md">
                                Var: {item.variation.variation_name}
                              </span>
                            )}
                          </div>

                          {/* Price & waste grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {cells.map(cell => (
                              <div key={cell.label} className="bg-white rounded-lg border border-slate-200/80 px-3 py-2 shadow-xs">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{cell.label}</p>
                                <div className={`text-xs font-extrabold ${cell.color} mt-0.5`}>{cell.value}</div>
                              </div>
                            ))}
                          </div>

                          {/* Category Logistics Mapping */}
                          <div className="bg-white rounded-xl border border-slate-200/80 p-3 space-y-1.5 shadow-2xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Logistics Partner & Driver for {item.category?.name || 'Category'}</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-800">
                              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Vendor:</span>
                                <span>{item.vendor?.name || 'Unassigned'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Driver:</span>
                                <span>
                                  {item.vehicle?.driver?.name ? (
                                    `${item.vehicle.driver.name}${item.vehicle.registration_number ? ` (${item.vehicle.registration_number})` : ''}`
                                  ) : item.driverEmployee?.name ? (
                                    `${item.driverEmployee.name}${item.driverEmployee.driverVehicles?.[0]?.registration_number ? ` (${item.driverEmployee.driverVehicles[0].registration_number})` : ''}`
                                  ) : item.vehicle?.registration_number ? (
                                    `Vehicle: ${item.vehicle.registration_number}`
                                  ) : 'Unassigned'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </SectionCard>

              {/* Pricing Breakdown */}
              <SectionCard title="Pricing Breakdown" icon={CreditCard} iconColor="text-slate-600">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <InfoItem icon={IndianRupee} label="Total Order Value (Yearly)" value={selectedGroup.first.total_order_value ? `₹${parseFloat(selectedGroup.first.total_order_value).toLocaleString('en-IN')}` : '₹0.00'} iconColor="text-slate-500" />
                    <InfoItem icon={Tag} label="Discount (Yearly)" value={selectedGroup.first.discount ? `₹${parseFloat(selectedGroup.first.discount).toLocaleString('en-IN')}` : '₹0.00'} iconColor="text-slate-500" />
                    <InfoItem icon={IndianRupee} label="Discounted Price (Yearly)" value={selectedGroup.first.discounted_price ? `₹${parseFloat(selectedGroup.first.discounted_price).toLocaleString('en-IN')}` : '₹0.00'} iconColor="text-slate-500" />
                    <InfoItem icon={Info} label="SEZ (economic zone)" value={selectedGroup.first.sez} iconColor="text-slate-500" />
                    <InfoItem icon={TrendingUp} label="Taxability / GST" value={selectedGroup.first.taxibility} iconColor="text-slate-500" />
                    <InfoItem icon={IndianRupee} label="CGST" value={selectedGroup.first.cgst ? `₹${parseFloat(selectedGroup.first.cgst).toLocaleString('en-IN')}` : '₹0.00'} iconColor="text-slate-500" />
                    <InfoItem icon={IndianRupee} label="SGST" value={selectedGroup.first.sgst ? `₹${parseFloat(selectedGroup.first.sgst).toLocaleString('en-IN')}` : '₹0.00'} iconColor="text-slate-500" />
                    <InfoItem icon={IndianRupee} label="GST Amount" value={selectedGroup.first.gst_amount ? `₹${parseFloat(selectedGroup.first.gst_amount).toLocaleString('en-IN')}` : '₹0.00'} iconColor="text-slate-500" />
                    <InfoItem icon={IndianRupee} label="Final Price (Yearly)" value={selectedGroup.first.final_price ? `₹${parseFloat(selectedGroup.first.final_price).toLocaleString('en-IN')}` : '₹0.00'} iconColor="text-slate-600" />
                  </div>
                </div>
              </SectionCard>

              {/* Uploaded Documents & Certificates */}
              <SectionCard title="Uploaded Documents & Certificates" icon={FolderOpen} iconColor="text-slate-600">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                  {[
                    { label: 'MOM Copy (Agreement)', file: selectedGroup.first.mom_agreement_file },
                    { label: 'PO Copy', file: selectedGroup.first.po_copy_file },
                    { label: 'RWA Copy', file: selectedGroup.first.rwa_file },
                    { label: 'GST Certificate', file: selectedGroup.first.gst_file },
                    { label: 'PAN Card', file: selectedGroup.first.pan_file },
                    { label: 'Trade License', file: selectedGroup.first.trade_license_file },
                    { label: 'Email Copy', file: selectedGroup.first.email_copy_file },
                  ].filter(doc => doc.file).map((doc, idx) => {
                    const fileUrl = `${IMAGE_BASE_URL}/CollectionRequests/${doc.file}`;
                    const isPdf = doc.file.toLowerCase().endsWith('.pdf');
                    return (
                      <a
                        key={idx}
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative border border-slate-200 hover:border-slate-350 rounded-xl overflow-hidden bg-slate-50 aspect-video flex flex-col justify-between p-3 transition-all hover:shadow-md"
                      >
                        <div className="flex-1 flex items-center justify-center">
                          {isPdf ? (
                            <div className="text-center">
                              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                              <span className="text-[9px] font-bold text-slate-400 block mt-1 uppercase">PDF Document</span>
                            </div>
                          ) : (
                            <img
                              src={fileUrl}
                              alt={doc.label}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          )}
                        </div>
                        <div className="relative bg-slate-900/60 backdrop-blur-xs text-white p-1 text-[9px] font-bold rounded-md truncate w-full text-center">
                          {doc.label}
                        </div>
                      </a>
                    );
                  })}
                  {![
                    selectedGroup.first.mom_agreement_file,
                    selectedGroup.first.po_copy_file,
                    selectedGroup.first.rwa_file,
                    selectedGroup.first.gst_file,
                    selectedGroup.first.pan_file,
                    selectedGroup.first.trade_license_file,
                    selectedGroup.first.email_copy_file
                  ].some(Boolean) && (
                    <div className="col-span-full py-4 text-center text-slate-400 text-xs italic font-medium bg-slate-50 rounded-xl border border-slate-100">
                      No documents were uploaded for this order.
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>

            {/* Sidebar Columns - Resource QR, Vendor/Driver card & cancel actions */}
            <div className="space-y-6">
              {/* QR Code Card */}
              <SectionCard title="Order QR Code" icon={QrCode} iconColor="text-violet-650">
                <div className="flex flex-col items-center justify-center p-3 text-center space-y-4 bg-slate-50/40 rounded-xl border border-dashed border-slate-205 min-h-[250px]">
                  {qrLoading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <RefreshCw className="w-8 h-8 animate-spin text-violet-600 mb-2" />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Generating QR Code...</p>
                    </div>
                  ) : qrCodeDataUrl ? (
                    <>
                      <img
                        src={qrCodeDataUrl}
                        alt="Order QR Code Scan"
                        className="w-44 h-44 border-4 border-white shadow-md bg-white rounded-lg animate-in zoom-in duration-200"
                      />
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Scan QR to verify order details</p>
                      <button
                        onClick={handleDownloadQR}
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-[11px] rounded-lg transition-all shadow-2xs active:scale-95 cursor-pointer mt-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download QR Code
                      </button>
                    </>
                  ) : (
                    <div className="text-[10px] text-rose-500 font-bold py-8">Failed to generate QR code</div>
                  )}
                </div>
              </SectionCard>

              {/* Resource Assignments details */}
              <SectionCard title="Resource Assignments" icon={UserCheck} iconColor="text-purple-600">
                <div className="space-y-3">
                  <InfoItem icon={User} label="Assigned Vendor" value={selectedGroup.first.vendor?.name} iconColor="text-purple-500" />
                  <InfoItem icon={UserCheck} label="Assigned Driver" value={selectedGroup.first.driverEmployee?.name} iconColor="text-purple-500" />
                  {selectedGroup.first.driverEmployee?.mobile_number && (
                    <InfoItem icon={Phone} label="Driver Contact" value={selectedGroup.first.driverEmployee.mobile_number} iconColor="text-purple-500" />
                  )}
                  {selectedGroup.first.driverEmployee?.driverVehicles?.[0] ? (
                    <>
                      <InfoItem 
                        icon={Building} 
                        label="Vehicle Brand & Model" 
                        value={`${selectedGroup.first.driverEmployee.driverVehicles[0].brand} ${selectedGroup.first.driverEmployee.driverVehicles[0].model}`} 
                        iconColor="text-purple-500" 
                      />
                      <InfoItem 
                        icon={Hash} 
                        label="Vehicle Number Plate" 
                        value={selectedGroup.first.driverEmployee.driverVehicles[0].registration_number} 
                        iconColor="text-purple-500" 
                      />
                    </>
                  ) : (
                    <div className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                      No active vehicle assigned to this driver
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* License & Compliance Details */}
              <SectionCard title="License & Compliance Details" icon={Award} iconColor="text-slate-600">
                <div className="space-y-3">
                  <InfoItem icon={Building} label="Registered RWA" value={selectedGroup.first.registered_rwa} iconColor="text-slate-500" />
                  <InfoItem icon={FileText} label="GST Number" value={selectedGroup.first.gst_number} iconColor="text-slate-500" />
                  <InfoItem icon={FileText} label="PAN Number" value={selectedGroup.first.pan_number} iconColor="text-slate-500" />
                  <InfoItem icon={Tag} label="Trade License" value={selectedGroup.first.trade_license} iconColor="text-slate-500" />
                  <InfoItem icon={Calendar} label="Contract Start Date" value={selectedGroup.first.contract_start_date ? new Date(selectedGroup.first.contract_start_date).toLocaleDateString('en-IN') : '—'} iconColor="text-slate-500" />
                  <InfoItem icon={Calendar} label="Contract End Date" value={selectedGroup.first.contract_end_date ? new Date(selectedGroup.first.contract_end_date).toLocaleDateString('en-IN') : '—'} iconColor="text-slate-500" />
                </div>
              </SectionCard>



              {/* Status & Cancel actions panel */}
              <div className="shadow-lg rounded-[1.25rem] overflow-hidden">
                <SectionCard title="Status & Audit Actions" icon={ShieldAlert} iconColor="text-slate-700">
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Status</span>
                      <StatusBadge status={selectedGroup.first.status} />
                    </div>

                    {selectedGroup.first.status === 'Booked' && (
                      <div className="space-y-3.5">
                        {!showCancelInput ? (
                          <button
                            type="button"
                            onClick={() => setShowCancelInput(true)}
                            className="w-full py-2.5 px-4 border border-rose-250 bg-rose-50 hover:bg-rose-100 text-rose-650 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" /> Cancel Order
                          </button>
                        ) : (
                          <form onSubmit={handleCancelOrder} className="space-y-3 animate-in fade-in duration-150 text-left">
                            <label className="block text-[10px] font-black text-rose-500 uppercase tracking-wider">Cancellation Reason *</label>
                            <textarea
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              placeholder="Describe why the order is being cancelled..."
                              rows={3}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none focus:ring-4 focus:ring-rose-50 focus:border-rose-400 transition-all text-xs font-semibold text-slate-700"
                            />
                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => { setShowCancelInput(false); setCancelReason(''); }}
                                disabled={cancelling}
                                className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] rounded-lg transition-all cursor-pointer disabled:opacity-50"
                              >
                                Go Back
                              </button>
                              <button
                                type="submit"
                                disabled={cancelling || !cancelReason.trim()}
                                className="py-1.5 px-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                              >
                                {cancelling && <RefreshCw className="w-3 h-3 animate-spin mr-1" />}
                                Confirm Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}

                    {selectedGroup.first.status === 'Cancelled' && (
                      <div className="bg-rose-50/50 border border-rose-105 rounded-xl p-4.5 space-y-3 text-left">
                        <div className="flex items-center gap-2 text-rose-750 font-black text-xs">
                          <XCircle className="w-4 h-4" /> Order Cancelled
                        </div>
                        <p className="text-[11px] text-slate-500 font-bold">
                          Cancelled by: <span className="text-slate-700">{selectedGroup.first.canceller?.name || 'Admin'}</span>
                        </p>
                        {selectedGroup.first.cancelled_date && (
                          <p className="text-[10px] text-slate-450 font-semibold">
                            Date: {new Date(selectedGroup.first.cancelled_date).toLocaleString('en-IN')}
                          </p>
                        )}
                        <div className="border-t border-rose-100/60 pt-2.5 mt-2">
                          <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider block">Reason</span>
                          <p className="text-xs text-slate-655 font-semibold mt-1 bg-white p-2.5 rounded-lg border border-slate-105">{selectedGroup.first.cancel_reason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Orders list table view */
        <div className="space-y-6">
          {/* Header controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-[1.25rem] border border-slate-200 shadow-sm">
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <ClipboardList className="w-6 h-6 text-violet-600" /> Order Management
              </h1>
              <p className="text-xs text-slate-400 font-bold mt-1.5 uppercase tracking-wider">
                Monitor and manage all booked waste collection orders
              </p>
            </div>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-50 border border-slate-205 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-[1.25rem] border border-slate-200 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders (ID, client, generator, vendor, categories)..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-4 focus:ring-violet-50 focus:border-violet-400 transition-all text-xs font-semibold text-slate-700 shadow-2xs"
              />
            </div>

            {/* Filter Status */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-4 focus:ring-violet-50 focus:border-violet-400 transition-all text-xs font-bold text-slate-655 cursor-pointer shadow-2xs"
            >
              <option value="">All Statuses</option>
              <option value="Booked">Booked</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-[1.25rem] border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <RefreshCw className="w-10 h-10 animate-spin text-violet-600 mb-3" />
                <p className="text-sm font-black uppercase tracking-wider">Fetching waste orders list…</p>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <AlertCircle className="w-10 h-10 text-slate-300 mb-2.5" />
                <p className="text-sm font-bold">No orders found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-5">Order & Lead ID</th>
                      <th className="py-3.5 px-5">Client / Generator</th>
                      <th className="py-3.5 px-5">Location</th>
                      <th className="py-3.5 px-5 min-w-[340px]">Category Services & Assigned Logistics</th>
                      <th className="py-3.5 px-5 text-center">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 text-xs text-slate-600">
                    {filteredList.map(group => (
                      <tr key={group.order_id} className="hover:bg-slate-50/50 transition-colors">
                        {/* 1. Order ID & Lead ID */}
                        <td className="py-4 px-5 font-mono align-top">
                          <div className="font-extrabold text-violet-700 text-[13px]">
                            {group.order_id}
                          </div>
                          <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            Lead: {group.lead_id}
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-1">
                            {group.itemCount} {group.itemCount === 1 ? 'Category Item' : 'Category Items'}
                          </div>
                        </td>

                        {/* 2. Client / Generator */}
                        <td className="py-4 px-5 align-top">
                          <div className="font-extrabold text-slate-900 leading-snug">
                            {group.first.customer_legal_name || group.first.contact_person || '—'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            {group.first.waste_generator_name}
                          </div>
                          {group.first.mobile_number && (
                            <div className="text-[10px] text-slate-400 font-medium mt-1">
                              📞 {group.first.mobile_number}
                            </div>
                          )}
                        </td>

                        {/* 3. Location (Customer's Real Selected Address) */}
                        <td className="py-4 px-5 align-top max-w-[260px]">
                          {group.first.complete_address ? (
                            <div className="text-xs font-bold text-slate-800 leading-snug line-clamp-2" title={group.first.complete_address}>
                              📍 {group.first.complete_address}
                            </div>
                          ) : group.first.apartment_name ? (
                            <div className="text-xs font-bold text-slate-800 leading-snug">
                              🏢 {group.first.apartment_name}
                            </div>
                          ) : (
                            <div className="text-xs font-bold text-slate-800 leading-snug">
                              {group.first.city ? `${group.first.city}, ${group.first.state || ''}` : 'Customer Location Set'}
                            </div>
                          )}

                          {/* Corporation, Zone, Ward Badges */}
                          <div className="text-[10px] text-slate-500 font-semibold mt-1 flex items-center gap-1 flex-wrap">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-bold text-slate-700">
                              {group.first.corporation?.corporation_name || 'Corp'}
                            </span>
                            <span>•</span>
                            <span>{group.first.zone?.zone_name || 'Zone'}</span>
                            <span>•</span>
                            <span>{group.first.ward?.ward_name || 'Ward'}</span>
                          </div>

                          {group.first.collectionEvent?.event_name && (
                            <div className="text-[10px] text-emerald-700 font-bold mt-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                              Event: {group.first.collectionEvent.event_name}
                            </div>
                          )}
                        </td>

                        {/* 4. Category Services & Assigned Logistics (Compact Expandable View) */}
                        <td className="py-4 px-5 align-top min-w-[340px] max-w-[400px]">
                          {(() => {
                            const isExpanded = expandedOrders[group.order_id];
                            const displayItems = isExpanded ? group.items : group.items.slice(0, 1);
                            const hasMore = group.items.length > 1;

                            return (
                              <div className="space-y-1.5">
                                {displayItems.map((item, idx) => {
                                  const catTheme = getCategoryColorTheme(item.category?.name);
                                  const vehReg = item.vehicle?.registration_number || item.driverEmployee?.driverVehicles?.[0]?.registration_number;
                                  const driverName = item.vehicle?.driver?.name || item.driverEmployee?.name;

                                  return (
                                    <div
                                      key={item.id || idx}
                                      className="bg-slate-50/90 hover:bg-white border border-slate-200/90 rounded-xl p-2 space-y-1 transition-all shadow-2xs text-[11px]"
                                    >
                                      {/* Category Pill Badge & Subcategory Name */}
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${catTheme.badgeBg}`}>
                                            {item.category?.name || 'Waste'}
                                          </span>
                                          <span className="font-extrabold text-slate-900 text-[11px]">
                                            {item.subCategory?.name || item.subcategory_name || 'Sub-Category'}
                                          </span>
                                        </div>
                                        {item.pricing_mode === 'Bulk' ? (
                                          <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                                            Bulk: ₹{parseFloat(item.monthly_price || 0).toLocaleString('en-IN')}/mo
                                          </span>
                                        ) : item.expected_waste > 0 ? (
                                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                                            {parseFloat(item.expected_waste)} KG/day
                                          </span>
                                        ) : null}
                                      </div>

                                      {/* Compact Vendor & Driver Line */}
                                      <div className="flex items-center gap-2 text-[10px] pt-1 border-t border-slate-200/50 flex-wrap text-slate-600">
                                        <span className="inline-flex items-center gap-1 font-semibold">
                                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                                          <span className="text-slate-400">Vendor:</span>
                                          <strong className="text-slate-800">{item.vendor?.name || 'Unassigned'}</strong>
                                        </span>

                                        <span className="text-slate-300">|</span>

                                        <span className="inline-flex items-center gap-1 font-semibold">
                                          <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                                          <span className="text-slate-400">Driver:</span>
                                          <strong className="text-slate-800">
                                            {driverName ? (
                                              `${driverName}${vehReg ? ` (${vehReg})` : ''}`
                                            ) : (
                                              'Unassigned'
                                            )}
                                          </strong>
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}

                                {/* Toggle Expand / Collapse Button */}
                                {hasMore && (
                                  <button
                                    type="button"
                                    onClick={() => toggleExpandOrder(group.order_id)}
                                    className="w-full text-[10px] font-extrabold text-violet-700 hover:text-violet-900 bg-violet-50/80 hover:bg-violet-100 py-1 px-2.5 rounded-lg border border-violet-200 transition-all cursor-pointer flex items-center justify-center gap-1"
                                  >
                                    {isExpanded ? (
                                      <>▲ Collapse ({group.items.length} Categories)</>
                                    ) : (
                                      <>▼ +{group.items.length - 1} More {group.items.length - 1 === 1 ? 'Category' : 'Categories'} (Click to Expand)</>
                                    )}
                                  </button>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        {/* 5. Status */}
                        <td className="py-4 px-5 text-center align-top">
                          <StatusBadge status={group.first.status} />
                        </td>

                        {/* 6. Actions */}
                        <td className="py-4 px-5 text-right align-top">
                          <button
                            onClick={() => openPanel(group)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            View details
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
      )}
    </div>
  );
}
