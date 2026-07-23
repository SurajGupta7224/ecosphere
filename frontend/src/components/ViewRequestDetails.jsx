import { useState } from 'react';
import {
  X, User, Phone, Mail, MapPin, Building, Calendar, Clock,
  ShieldCheck, FileText, Layers, ChevronRight, Info,
  CheckCircle, XCircle, Weight, IndianRupee, TrendingUp, Tag, Hash, Home, ArrowUpRight,
  Briefcase, UserCheck, Receipt, FolderOpen, CreditCard, ShieldAlert, Award
} from 'lucide-react';
import api, { IMAGE_BASE_URL } from '../api';
import toast from 'react-hot-toast';

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
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${s.bg} ${s.border} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
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

function SectionCard({ title, icon: Icon, iconColor = 'text-slate-600', children }) {
  return (
    <div className="bg-white rounded-[1.25rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300 hover:shadow-md transition-shadow">
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

  // Parse billing details
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-[1.25rem] border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
              Lead ID: {selectedGroup.lead_id}
            </span>
            <StatusBadge status={firstReq.status} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {firstReq.customer_legal_name || firstReq.contact_person || 'Unnamed Client'}
          </h2>
          <p className="text-xs text-slate-400 font-bold mt-1.5 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Preferred Pickup: <span className="text-slate-600 font-extrabold">{firstReq.pickup_date || 'N/A'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={onEditClick}
              className="inline-flex items-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-violet-100 hover:-translate-y-0.5 active:scale-95"
            >
              Edit Request
            </button>
          )}
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <X className="w-3.5 h-3.5" />
            Back to List
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
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

      {/* Main Details Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Columns - Detailed breakdown & client info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Company Details */}
          <SectionCard title="Company Details" icon={Briefcase} iconColor="text-slate-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <InfoItem icon={Tag} label="Site Request" value={firstReq.site_request} iconColor="text-slate-500" />
              <InfoItem icon={Building} label="Service Center Type" value={firstReq.service_center_type} iconColor="text-slate-500" />
              <InfoItem icon={User} label="Employee Name" value={firstReq.employee_name} iconColor="text-slate-500" />
              <InfoItem icon={FileText} label="Billing Type" value={firstReq.billing_type} iconColor="text-slate-500" />
              <InfoItem icon={MapPin} label="Business Region" value={firstReq.business_region} iconColor="text-slate-500" />
              <InfoItem icon={MapPin} label="Business Sub Region" value={firstReq.business_sub_region} iconColor="text-slate-500" />
              <InfoItem icon={Hash} label="Branch Code" value={firstReq.branch_code} iconColor="text-slate-500" />
            </div>
          </SectionCard>
          
          {/* Customer Details */}
          <SectionCard title="Customer Details" icon={UserCheck} iconColor="text-slate-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <InfoItem icon={User} label="Customer Type" value={firstReq.customer_type} iconColor="text-slate-500" />
              <InfoItem icon={TrendingUp} label="Business Lead" value={firstReq.business_lead} iconColor="text-slate-500" />
              <InfoItem icon={Building} label="Customer Legal Name" value={firstReq.customer_legal_name} iconColor="text-slate-500" />
              <InfoItem icon={Building} label="Customer Trade Name" value={firstReq.customer_trade_name} iconColor="text-slate-500" />
              <InfoItem icon={User} label="Contact Person" value={firstReq.contact_person} iconColor="text-slate-500" />
              <InfoItem icon={Tag} label="Designation" value={firstReq.designation} iconColor="text-slate-500" />
              <InfoItem icon={Phone} label="Mobile Number" value={firstReq.mobile_number} iconColor="text-slate-500" />
              <InfoItem icon={Phone} label="Phone Number 2" value={firstReq.phone_number_2} iconColor="text-slate-500" />
              <InfoItem icon={Mail} label="Email" value={firstReq.email} iconColor="text-slate-500" />
              <InfoItem icon={Mail} label="Email 2" value={firstReq.email_2} iconColor="text-slate-500" />
              <InfoItem icon={Info} label="Others Note" value={firstReq.others_note} iconColor="text-slate-500" />
            </div>
          </SectionCard>

          {/* Location Details */}
          <SectionCard title="Location Details" icon={MapPin} iconColor="text-slate-600">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <InfoItem icon={Building} label="BWG Name" value={firstReq.waste_generator_name} iconColor="text-slate-500" />
                <InfoItem icon={Tag} label="Sector" value={firstReq.sector} iconColor="text-slate-500" />
                {firstReq.sector === 'Apartment' ? (
                  <InfoItem icon={Hash} label="Flats" value={firstReq.dwelling_units?.toString()} iconColor="text-slate-500" />
                ) : (
                  <InfoItem icon={Home} label="Area (SqM)" value={firstReq.area_sqm ? `${firstReq.area_sqm} SqM` : null} iconColor="text-slate-500" />
                )}
                <InfoItem icon={MapPin} label="City" value={firstReq.city} iconColor="text-slate-500" />
                <InfoItem icon={MapPin} label="State" value={firstReq.state} iconColor="text-slate-500" />
                <InfoItem icon={Hash} label="Pincode" value={firstReq.pincode} iconColor="text-slate-500" />
                <InfoItem icon={MapPin} label="Landmark" value={firstReq.landmark} iconColor="text-slate-500" />
                <InfoItem icon={Info} label="Country" value={firstReq.country} iconColor="text-slate-500" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem icon={MapPin} label="Address Search String" value={firstReq.address_search} iconColor="text-slate-500" />
                <InfoItem icon={MapPin} label="Coordinates (Lat/Lng)" value={firstReq.latitude && firstReq.longitude ? `${firstReq.latitude}, ${firstReq.longitude}` : null} iconColor="text-slate-500" />
              </div>
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Complete Address</span>
                <p className="text-xs font-semibold text-slate-700 mt-1 bg-slate-50/50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                  {firstReq.complete_address || 'N/A'}
                </p>
              </div>
              {firstReq.google_map_link && (
                <div className="pt-2">
                  <a
                    href={firstReq.google_map_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-xs transition-colors"
                  >
                    <span>View on Google Maps</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Billing Address Details */}
          {(firstReq.billing_address_different === true || firstReq.billing_address_different === 1 || firstReq.billing_address_different === 'true') && billing && (
            <SectionCard title="Billing Address Details" icon={Receipt} iconColor="text-slate-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <InfoItem icon={User} label="Legal Name" value={billing.billing_customer_legal_name || billing.customer_legal_name} iconColor="text-slate-500" />
                <InfoItem icon={User} label="Trade Name" value={billing.billing_customer_trade_name || billing.customer_trade_name} iconColor="text-slate-500" />
                <InfoItem icon={User} label="Contact Person" value={billing.billing_contact_person || billing.contact_person} iconColor="text-slate-500" />
                <InfoItem icon={Tag} label="Designation" value={billing.billing_designation || billing.designation} iconColor="text-slate-500" />
                <InfoItem icon={Phone} label="Phone 1 (Mobile)" value={billing.billing_phone_number_1 || billing.billing_mobile_number || billing.phone_number_1 || billing.mobile_number || billing.phone} iconColor="text-slate-500" />
                <InfoItem icon={Phone} label="Phone 2" value={billing.billing_phone_number_2 || billing.phone_number_2} iconColor="text-slate-500" />
                <InfoItem icon={Mail} label="Email" value={billing.billing_email || billing.email} iconColor="text-slate-500" />
                <InfoItem icon={Mail} label="Email 2" value={billing.billing_email_2 || billing.email_2} iconColor="text-slate-500" />
                <InfoItem icon={MapPin} label="City" value={billing.billing_city || billing.city} iconColor="text-slate-500" />
                <InfoItem icon={MapPin} label="State" value={billing.billing_state || billing.state} iconColor="text-slate-500" />
                <InfoItem icon={Hash} label="Pincode" value={billing.billing_pincode || billing.pincode} iconColor="text-slate-500" />
                <InfoItem icon={MapPin} label="Landmark" value={billing.billing_landmark || billing.landmark} iconColor="text-slate-500" />
                <InfoItem icon={Info} label="Country" value={billing.billing_country || billing.country} iconColor="text-slate-500" />
                <InfoItem icon={Info} label="Others Note" value={billing.billing_others || billing.billing_others_note || billing.others || billing.others_note} iconColor="text-slate-500" />
              </div>
              <div className="border-t border-slate-100 pt-3 mt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billing Complete Address</span>
                <p className="text-xs font-semibold text-slate-700 mt-1 bg-slate-50/50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                  {billing.billing_complete_address || billing.complete_address || 'N/A'}
                </p>
              </div>
            </SectionCard>
          )}

          {/* Service Details & Waste Breakdown */}
          <SectionCard title="Service Details & Waste Breakdown" icon={Layers} iconColor="text-slate-600">
            <div className="space-y-4 pt-1">
              {selectedGroup.items.filter(item => item.subcategory_id).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs italic font-medium bg-slate-50 rounded-xl border border-slate-100">
                  No waste details or subcategories were selected for this request.
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
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard>

          {/* Uploaded Documents & Certificates */}
          <SectionCard title="Uploaded Documents & Certificates" icon={FolderOpen} iconColor="text-slate-600">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              {[
                { label: 'MOM Copy (Agreement)', file: firstReq.mom_agreement_file },
                { label: 'PO Copy', file: firstReq.po_copy_file },
                { label: 'RWA Copy', file: firstReq.rwa_file },
                { label: 'GST Certificate', file: firstReq.gst_file },
                { label: 'PAN Card', file: firstReq.pan_file },
                { label: 'Trade License', file: firstReq.trade_license_file },
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
                firstReq.mom_agreement_file,
                firstReq.po_copy_file,
                firstReq.rwa_file,
                firstReq.gst_file,
                firstReq.pan_file,
                firstReq.trade_license_file,
                firstReq.email_copy_file
              ].some(Boolean) && (
                <div className="col-span-full py-4 text-center text-slate-400 text-xs italic font-medium bg-slate-50 rounded-xl border border-slate-100">
                  No documents were uploaded for this request.
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right Column (Side details) */}
        <div className="space-y-6">
          


          {/* License & Compliance Details */}
          <SectionCard title="License & Compliance Details" icon={Award} iconColor="text-slate-600">
            <div className="space-y-3">
              <InfoItem icon={Building} label="Registered RWA" value={firstReq.registered_rwa} iconColor="text-slate-500" />
              <InfoItem icon={FileText} label="GST Number" value={firstReq.gst || firstReq.gst_number} iconColor="text-slate-500" />
              <InfoItem icon={FileText} label="PAN Number" value={firstReq.pan || firstReq.pan_number} iconColor="text-slate-500" />
              <InfoItem icon={Tag} label="Trade License" value={firstReq.trade_license} iconColor="text-slate-500" />
            </div>
          </SectionCard>

          {/* Pricing Breakdown */}
          <SectionCard title="Pricing Breakdown" icon={CreditCard} iconColor="text-slate-600">
            <div className="space-y-3">
              <InfoItem icon={IndianRupee} label="Total Order Value (Yearly)" value={firstReq.total_order_value ? `₹${parseFloat(firstReq.total_order_value).toLocaleString('en-IN')}` : '₹0.00'} iconColor="text-slate-500" />
              <InfoItem icon={Tag} label="Discount (Yearly)" value={firstReq.discount ? `₹${parseFloat(firstReq.discount).toLocaleString('en-IN')}` : '₹0.00'} iconColor="text-slate-500" />
              <InfoItem icon={IndianRupee} label="Discounted Price (Yearly)" value={firstReq.discounted_price ? `₹${parseFloat(firstReq.discounted_price).toLocaleString('en-IN')}` : '₹0.00'} iconColor="text-slate-500" />
              <InfoItem icon={Info} label="SEZ (economic zone)" value={firstReq.sez} iconColor="text-slate-500" />
              <InfoItem icon={TrendingUp} label="Taxability / GST" value={firstReq.taxibility} iconColor="text-slate-500" />
              <InfoItem icon={IndianRupee} label="CGST" value={firstReq.cgst ? `₹${parseFloat(firstReq.cgst).toLocaleString('en-IN')}` : '₹0.00'} iconColor="text-slate-500" />
              <InfoItem icon={IndianRupee} label="SGST" value={firstReq.sgst ? `₹${parseFloat(firstReq.sgst).toLocaleString('en-IN')}` : '₹0.00'} iconColor="text-slate-500" />
              <InfoItem icon={IndianRupee} label="GST Amount" value={firstReq.gst_amount ? `₹${parseFloat(firstReq.gst_amount).toLocaleString('en-IN')}` : '₹0.00'} iconColor="text-slate-500" />
              <InfoItem icon={IndianRupee} label="Final Price (Yearly)" value={firstReq.final_price ? `₹${parseFloat(firstReq.final_price).toLocaleString('en-IN')}` : null} iconColor="text-slate-600" />
            </div>
          </SectionCard>

          {/* Pickup Schedule & Additional Details */}
          <SectionCard title="Pickup Schedule & Additional Details" icon={Calendar} iconColor="text-slate-600">
            <div className="space-y-3">
              <InfoItem icon={Calendar} label="Preferred Pickup Date" value={firstReq.pickup_date} iconColor="text-slate-500" />
              <InfoItem icon={Clock} label="Preferred Pickup Time" value={firstReq.pickup_time} iconColor="text-slate-500" />
              <InfoItem icon={Info} label="Pickup Notes" value={firstReq.pickup_notes} iconColor="text-slate-500" />
              <InfoItem icon={User} label="Request Source" value={firstReq.request_source} iconColor="text-slate-500" />
            </div>
          </SectionCard>

          {/* Status & Actions Card - Sticky at the bottom of the sidebar */}
          <div id="status-audit-actions" className="sticky top-6 z-10 shadow-lg rounded-[1.25rem] overflow-hidden">
            <SectionCard title="Status & Audit Actions" icon={ShieldAlert} iconColor="text-slate-700">
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Status</span>
                  <StatusBadge status={firstReq.status} />
                </div>

                {firstReq.status === 'Approved' && (
                  <div className="space-y-3">
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                        <CheckCircle className="w-4 h-4" /> Approved
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        Approved by <span className="font-bold">{firstReq.approver?.name || 'Admin'}</span>
                      </p>
                      {firstReq.approved_date && (
                        <p className="text-[9px] text-slate-400 font-semibold">
                          Date: {new Date(firstReq.approved_date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                    {isAdmin && onBookClick && (
                      <button
                        type="button"
                        onClick={onBookClick}
                        className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-md shadow-violet-100 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4" /> Book Order
                      </button>
                    )}
                  </div>
                )}



                {firstReq.status === 'Rejected' && (
                  <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                      <XCircle className="w-4 h-4" /> Rejected
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Rejected by <span className="font-bold">{firstReq.rejector?.name || 'Admin'}</span>
                    </p>
                    {firstReq.rejected_date && (
                      <p className="text-[9px] text-slate-400 font-semibold">
                        Date: {new Date(firstReq.rejected_date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    {firstReq.rejected_reason && (
                      <div className="border-t border-rose-100/50 pt-2 mt-2">
                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Reason</p>
                        <p className="text-xs text-slate-600 font-medium mt-1 bg-white p-2 rounded-lg border border-slate-100">{firstReq.rejected_reason}</p>
                      </div>
                    )}
                  </div>
                )}

                {isAdmin && (firstReq.status === 'Pending' || firstReq.status === 'Verified') && (
                  <div className="space-y-3 pt-2">
                    {!showRejectionInput ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus('Approved')}
                          disabled={updatingStatus}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRejectionInput(true)}
                          disabled={updatingStatus}
                          className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 animate-in fade-in duration-150">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rejection Reason *</label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Enter message or reason..."
                          rows={3}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-400 transition-all text-xs font-semibold text-slate-700"
                        />
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => { setShowRejectionInput(false); setRejectionReason(''); }}
                            className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus('Rejected')}
                            disabled={updatingStatus || !rejectionReason.trim()}
                            className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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
