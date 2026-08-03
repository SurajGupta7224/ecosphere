import { useState } from 'react';
import {
  X, User, Phone, Mail, MapPin, Building, Calendar, Clock,
  FileText, Layers, ChevronRight, Info, CheckCircle, XCircle, Weight,
  IndianRupee, TrendingUp, Tag, Hash, Home, ArrowUpRight,
  UserCheck, Receipt, FolderOpen, ShieldAlert, Award
} from 'lucide-react';
import api, { IMAGE_BASE_URL } from '../api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  Pending: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  Approved: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Verified: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  Booked: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
  Rejected: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  Completed: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold border uppercase tracking-wider ${s.bg} ${s.border} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
      {status}
    </span>
  );
}

// Render InfoItem with clean font sizes: 12px for label, 14px for value. If forceShow is true, renders '—' when value is absent.
function InfoItem({ icon: Icon, label, value, iconColor = 'text-emerald-600', forceShow = false }) {
  const displayVal = (value !== null && value !== undefined && String(value).trim() !== '' && value !== '—' && value !== '--') ? String(value) : (forceShow ? '—' : null);
  
  if (displayVal === null) {
    return null;
  }

  return (
    <div className="flex items-start gap-3 bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 min-w-0 transition-all hover:bg-white hover:shadow-xs">
      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[12px] font-medium text-slate-500 block leading-tight">{label}</span>
        <span className="text-[14px] font-semibold text-slate-800 mt-0.5 block break-words leading-snug">{displayVal}</span>
      </div>
    </div>
  );
}

// Section card with 16px title
function SectionCard({ title, icon: Icon, iconColor = 'text-emerald-600', children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all hover:shadow-xs">
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-slate-50/80 border-b border-slate-200">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white border border-slate-200 shadow-2xs">
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h3 className="text-[16px] font-bold text-slate-800 tracking-tight">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function ViewRequestDetails({ selectedGroup, isAdmin, onEditClick, onBookClick, onStatusUpdated, onClose }) {
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === 'Rejected' && !rejectionReason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }

    setUpdatingStatus(true);
    try {
      const res = await api.patch(`/waste-collection-requests/lead/${selectedGroup.lead_id}/status`, {
        status: newStatus,
        rejected_reason: newStatus === 'Rejected' ? rejectionReason : undefined
      });
      toast.success(`Request marked as ${newStatus} successfully!`);
      setShowRejectionInput(false);
      setRejectionReason('');
      onStatusUpdated(newStatus, res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update request status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const firstReq = selectedGroup.first || {};

  // Find dwelling units (flats) and occupied flats across firstReq and group items
  const flatsVal = firstReq.dwelling_units ?? firstReq.flats ?? selectedGroup.items.find(i => i.dwelling_units != null || i.flats != null)?.dwelling_units;
  const occupiedFlatsVal = firstReq.occupied_flats ?? firstReq.occupiedFlats ?? selectedGroup.items.find(i => i.occupied_flats != null || i.occupiedFlats != null)?.occupied_flats;

  // Parse billing details if different
  let billing = {};
  if (firstReq.billing_details) {
    try {
      const parsed = typeof firstReq.billing_details === 'string'
        ? JSON.parse(firstReq.billing_details)
        : firstReq.billing_details;
      if (parsed && typeof parsed === 'object') {
        billing = parsed;
      }
    } catch (e) {
      console.error("Failed to parse billing details:", e);
    }
  }

  // Check if License & Compliance has any populated field
  const hasComplianceDetails = [
    firstReq.registered_rwa,
    firstReq.gst || firstReq.gst_number,
    firstReq.pan || firstReq.pan_number,
    firstReq.trade_license
  ].some(v => v && v !== '—' && v !== '--' && String(v).trim() !== '');

  // Determine Map Query for embedded location map
  const hasCoords = firstReq.latitude && firstReq.longitude;
  const mapQuery = hasCoords
    ? `${firstReq.latitude},${firstReq.longitude}`
    : (firstReq.complete_address || `${firstReq.city || ''}, ${firstReq.state || ''} ${firstReq.pincode || ''}`);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Page Header Card - 20px Main Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[12px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
              Lead ID: {selectedGroup.lead_id}
            </span>
            <StatusBadge status={firstReq.status} />
          </div>
          <h2 className="text-[20px] font-bold text-slate-900 leading-tight">
            {firstReq.customer_legal_name || firstReq.waste_generator_name || firstReq.contact_person || 'Unnamed Client'}
          </h2>
          {firstReq.pickup_date && (
            <p className="text-[12px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Preferred Pickup: <strong className="text-slate-800 font-semibold">{firstReq.pickup_date}</strong>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <button
              onClick={onEditClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              Edit Request
            </button>
          )}
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-semibold rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <X className="w-3.5 h-3.5" />
            Back to List
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Weight, label: 'Total Expected Waste', value: `${selectedGroup.totalExpectedWaste.toFixed(2).replace(/\.00$/, '')} KG`, color: 'text-emerald-700', bg: 'bg-emerald-50/60 border-emerald-200/80' },
          { icon: IndianRupee, label: 'Estimated Monthly', value: `₹${selectedGroup.totalMonthlyPrice.toLocaleString('en-IN')}`, color: 'text-purple-700', bg: 'bg-purple-50/60 border-purple-200/80' },
          { icon: TrendingUp, label: 'Estimated Yearly', value: `₹${selectedGroup.totalYearlyPrice.toLocaleString('en-IN')}`, color: 'text-emerald-700', bg: 'bg-emerald-50/60 border-emerald-200/80' },
        ].map(pill => (
          <div key={pill.label} className={`${pill.bg} rounded-2xl p-4 border shadow-2xs flex items-center gap-3.5 hover:shadow-xs transition-shadow`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200 shadow-2xs flex-shrink-0">
              <pill.icon className={`w-5 h-5 ${pill.color}`} />
            </div>
            <div>
              <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">{pill.label}</p>
              <p className="text-[16px] font-bold text-slate-900 mt-0.5">{pill.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Details Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* Left Column - Location, Service & Documents */}
        <div className="lg:col-span-2 space-y-5">

          {/* Location & Property Details with Embedded Location Map */}
          <SectionCard title="Location & Property Details" icon={MapPin} iconColor="text-emerald-600">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <InfoItem icon={Building} label="BWG Name" value={firstReq.waste_generator_name} forceShow />
                <InfoItem icon={Tag} label="Sector" value={firstReq.sector} forceShow />
                
                {/* Render Flats & Occupied Flats or Area */}
                {firstReq.sector === 'Apartment' ? (
                  <>
                    <InfoItem icon={Hash} label="Flats" value={flatsVal != null ? String(flatsVal) : null} forceShow />
                    <InfoItem icon={Home} label="Occupied Flats" value={occupiedFlatsVal != null ? String(occupiedFlatsVal) : null} forceShow />
                  </>
                ) : (
                  <InfoItem icon={Home} label="Area (SqM)" value={firstReq.area_sqm ? `${firstReq.area_sqm} SqM` : null} forceShow />
                )}

                <InfoItem icon={MapPin} label="City" value={firstReq.city} forceShow />
                <InfoItem icon={MapPin} label="State" value={firstReq.state} forceShow />
                <InfoItem icon={Hash} label="Pincode" value={firstReq.pincode} forceShow />
                <InfoItem icon={MapPin} label="Landmark" value={firstReq.landmark} forceShow />
                <InfoItem icon={Info} label="Country" value={firstReq.country} forceShow />
              </div>

              {firstReq.complete_address && (
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider block">Complete Address</span>
                  <p className="text-[14px] font-semibold text-slate-800 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                    {firstReq.complete_address}
                  </p>
                </div>
              )}

              {/* Embedded Small Location Map */}
              {mapQuery && (
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Location Map
                    </span>
                    {firstReq.google_map_link && (
                      <a
                        href={firstReq.google_map_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                      >
                        Open in Google Maps <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 shadow-2xs h-48 w-full bg-slate-100">
                    <iframe
                      title="Request Location Map"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`}
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Billing Address Details (Only if different billing address is provided) */}
          {(firstReq.billing_address_different === true || firstReq.billing_address_different === 1 || firstReq.billing_address_different === 'true') && billing && (
            <SectionCard title="Billing Address Details" icon={Receipt} iconColor="text-emerald-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <InfoItem icon={User} label="Legal Name" value={billing.billing_customer_legal_name || billing.customer_legal_name} forceShow />
                <InfoItem icon={User} label="Trade Name" value={billing.billing_customer_trade_name || billing.customer_trade_name} forceShow />
                <InfoItem icon={User} label="Contact Person" value={billing.billing_contact_person || billing.contact_person} forceShow />
                <InfoItem icon={Tag} label="Designation" value={billing.billing_designation || billing.designation} forceShow />
                <InfoItem icon={Phone} label="Phone (Mobile)" value={billing.billing_phone_number_1 || billing.billing_mobile_number || billing.phone_number_1 || billing.mobile_number} forceShow />
                <InfoItem icon={Mail} label="Email" value={billing.billing_email || billing.email} forceShow />
                <InfoItem icon={MapPin} label="City" value={billing.billing_city || billing.city} forceShow />
                <InfoItem icon={MapPin} label="State" value={billing.billing_state || billing.state} forceShow />
                <InfoItem icon={Hash} label="Pincode" value={billing.billing_pincode || billing.pincode} forceShow />
              </div>
              {(billing.billing_complete_address || billing.complete_address) && (
                <div className="border-t border-slate-100 pt-3 mt-3">
                  <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider block">Billing Address</span>
                  <p className="text-[14px] font-semibold text-slate-800 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                    {billing.billing_complete_address || billing.complete_address}
                  </p>
                </div>
              )}
            </SectionCard>
          )}

          {/* Service Details & Waste Items Breakdown */}
          <SectionCard title="Service Details & Expected Waste Breakdown" icon={Layers} iconColor="text-emerald-600">
            <div className="space-y-3">
              {selectedGroup.items.filter(item => item.subcategory_id).length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-[12px] italic font-medium bg-slate-50 rounded-xl border border-slate-200">
                  No waste subcategories selected for this request.
                </div>
              ) : (
                selectedGroup.items.map((item, idx) => {
                  const monthly_waste = parseFloat(item.monthly_waste || 0);
                  const yearly_waste = parseFloat(item.yearly_waste || 0);
                  const monthly_price = parseFloat(item.monthly_price || 0);
                  const yearly_price = parseFloat(item.yearly_price || 0);
                  const isBulk = item.pricing_mode === 'Bulk' || (parseFloat(item.expected_waste || 0) === 0 && monthly_price > 0);

                  return (
                    <div key={idx} className="bg-slate-50/70 rounded-xl border border-slate-200 p-3.5 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.category?.name && (
                          <span className="text-[12px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                            {item.category.name}
                          </span>
                        )}
                        <span className="text-[14px] font-bold text-slate-900">{item.subCategory?.name || item.subcategory_name || 'Waste Item'}</span>
                        {item.variation?.variation_name && (
                          <span className="text-[12px] font-medium text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                            {item.variation.variation_name}
                          </span>
                        )}
                      </div>

                      {/* Waste Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="bg-white rounded-lg border border-slate-200 px-2.5 py-1.5">
                          <span className="text-[12px] font-medium text-slate-400 uppercase block">Billing Type</span>
                          <span className="text-[14px] font-bold text-slate-800">{isBulk ? 'Bulk' : 'Per KG'}</span>
                        </div>
                        {!isBulk && (
                          <>
                            <div className="bg-white rounded-lg border border-slate-200 px-2.5 py-1.5">
                              <span className="text-[12px] font-medium text-slate-400 uppercase block">Expected Waste</span>
                              <span className="text-[14px] font-bold text-slate-800">{parseFloat(item.expected_waste || 0)} KG/Day</span>
                            </div>
                            <div className="bg-white rounded-lg border border-slate-200 px-2.5 py-1.5">
                              <span className="text-[12px] font-medium text-slate-400 uppercase block">Agreed Rate</span>
                              <span className="text-[14px] font-bold text-slate-800">₹{parseFloat(item.agreed_price || 0).toFixed(2)}/KG</span>
                            </div>
                          </>
                        )}
                        <div className="bg-white rounded-lg border border-slate-200 px-2.5 py-1.5">
                          <span className="text-[12px] font-medium text-slate-400 uppercase block">Est. Monthly</span>
                          <span className="text-[14px] font-bold text-emerald-700">₹{monthly_price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard>

          {/* Uploaded Documents & Certificates */}
          <SectionCard title="Uploaded Compliance Documents" icon={FolderOpen} iconColor="text-emerald-600">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'RWA Copy', file: firstReq.rwa_file },
                { label: 'GST Certificate', file: firstReq.gst_file },
                { label: 'PAN Card', file: firstReq.pan_file },
                { label: 'Trade License', file: firstReq.trade_license_file },
                { label: 'MOM Copy', file: firstReq.mom_agreement_file },
                { label: 'PO Copy', file: firstReq.po_copy_file },
                { label: 'Email Copy', file: firstReq.email_copy_file },
              ].filter(doc => doc.file).map((doc, idx) => {
                const fileUrl = `${IMAGE_BASE_URL}/CollectionRequests/${doc.file}`;
                const isPdf = doc.file.toLowerCase().endsWith('.pdf');
                return (
                  <a
                    key={idx}
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative border border-slate-200 hover:border-emerald-500 rounded-xl overflow-hidden bg-slate-50 aspect-video flex flex-col justify-between p-2.5 transition-all hover:shadow-xs"
                  >
                    <div className="flex-1 flex items-center justify-center">
                      {isPdf ? (
                        <div className="text-center">
                          <FileText className="w-7 h-7 text-emerald-600 mx-auto" />
                          <span className="text-[12px] font-medium text-slate-500 block mt-0.5 uppercase">PDF File</span>
                        </div>
                      ) : (
                        <img
                          src={fileUrl}
                          alt={doc.label}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                    </div>
                    <div className="relative bg-slate-900/70 backdrop-blur-xs text-white p-1 text-[12px] font-semibold rounded-md truncate w-full text-center">
                      {doc.label}
                    </div>
                  </a>
                );
              })}
              {![
                firstReq.rwa_file,
                firstReq.gst_file,
                firstReq.pan_file,
                firstReq.trade_license_file,
                firstReq.mom_agreement_file,
                firstReq.po_copy_file,
                firstReq.email_copy_file
              ].some(Boolean) && (
                <div className="col-span-full py-4 text-center text-slate-400 text-[12px] italic font-medium bg-slate-50 rounded-xl border border-slate-200">
                  No compliance documents uploaded.
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right Column - Customer & Contact Details, License & Admin Status */}
        <div className="space-y-5">
          
          {/* Customer & Contact Details (Shown on RIGHT SIDE as requested) */}
          <SectionCard title="Customer & Contact Details" icon={UserCheck} iconColor="text-emerald-600">
            <div className="space-y-2.5">
              <InfoItem icon={User} label="Customer Type" value={firstReq.customer_type} forceShow />
              <InfoItem icon={Building} label="Customer Legal Name" value={firstReq.customer_legal_name} forceShow />
              <InfoItem icon={Building} label="Customer Trade Name" value={firstReq.customer_trade_name} forceShow />
              <InfoItem icon={User} label="Contact Person" value={firstReq.contact_person} forceShow />
              <InfoItem icon={Tag} label="Designation" value={firstReq.designation} forceShow />
              <InfoItem icon={Phone} label="Mobile Number" value={firstReq.mobile_number} forceShow />
              <InfoItem icon={Phone} label="Phone Number 2" value={firstReq.phone_number_2} forceShow />
              <InfoItem icon={Mail} label="Email" value={firstReq.email} forceShow />
              <InfoItem icon={Mail} label="Email 2" value={firstReq.email_2} forceShow />
              <InfoItem icon={Info} label="Others Note" value={firstReq.others_note} forceShow />
            </div>
          </SectionCard>

          {/* License & Compliance Details */}
          <SectionCard title="License & Compliance" icon={Award} iconColor="text-emerald-600">
            <div className="space-y-2.5">
              <InfoItem icon={Building} label="Registered RWA" value={firstReq.registered_rwa} forceShow />
              <InfoItem icon={FileText} label="GST Number" value={firstReq.gst_number || firstReq.gst || firstReq.gst_no} forceShow />
              <InfoItem icon={FileText} label="PAN Number" value={firstReq.pan_number || firstReq.pan || firstReq.pan_no} forceShow />
              <InfoItem icon={Tag} label="Trade License" value={firstReq.trade_license || firstReq.trade_license_number} forceShow />
            </div>
          </SectionCard>

          {/* Status & Actions Card */}
          <div className="sticky top-6 z-10 shadow-xs rounded-2xl overflow-hidden">
            <SectionCard title="Request Status & Actions" icon={ShieldAlert} iconColor="text-emerald-700">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Status</span>
                  <StatusBadge status={firstReq.status} />
                </div>

                {firstReq.status === 'Approved' && (
                  <div className="space-y-3">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1">
                      <div className="flex items-center gap-2 text-emerald-800 font-semibold text-[14px]">
                        <CheckCircle className="w-4 h-4 text-emerald-600" /> Approved
                      </div>
                      <p className="text-[12px] text-slate-600 font-medium">
                        Approved by <strong className="text-slate-800 font-semibold">{firstReq.approver?.name || 'Admin'}</strong>
                      </p>
                    </div>
                    {isAdmin && onBookClick && (
                      <button
                        type="button"
                        onClick={onBookClick}
                        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[14px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Calendar className="w-4 h-4" /> Book Order Now
                      </button>
                    )}
                  </div>
                )}

                {firstReq.status === 'Rejected' && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-2 text-rose-700 font-semibold text-[14px]">
                      <XCircle className="w-4 h-4" /> Rejected
                    </div>
                    {firstReq.rejected_reason && (
                      <p className="text-[12px] text-slate-700 font-medium mt-1 bg-white p-2 rounded-lg border border-slate-200">{firstReq.rejected_reason}</p>
                    )}
                  </div>
                )}

                {isAdmin && (firstReq.status === 'Pending' || firstReq.status === 'Verified') && (
                  <div className="space-y-3 pt-1">
                    {!showRejectionInput ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus('Approved')}
                          disabled={updatingStatus}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[12px] rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRejectionInput(true)}
                          disabled={updatingStatus}
                          className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[12px] rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 animate-in fade-in duration-150">
                        <label className="block text-[12px] font-medium text-slate-500 uppercase tracking-wider">Rejection Reason *</label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Enter rejection reason..."
                          rows={3}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-rose-500 transition-all text-[12px] font-medium text-slate-700"
                        />
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => { setShowRejectionInput(false); setRejectionReason(''); }}
                            className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-[12px] rounded-lg transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus('Rejected')}
                            disabled={updatingStatus || !rejectionReason.trim()}
                            className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[12px] rounded-lg shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            Confirm Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </SectionCard>
          </div>

        </div>
      </div>
    </div>
  );
}
