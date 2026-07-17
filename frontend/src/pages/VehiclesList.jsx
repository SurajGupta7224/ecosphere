import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, SlidersHorizontal, Eye, Edit3, Trash2, Check, X,
  ShieldCheck, Calendar, Info, FileText, Phone, User,
  MapPin, Plus, ChevronRight, AlertCircle, ChevronDown, CheckCircle2,
  Smartphone, Truck, Settings, MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { IMAGE_BASE_URL } from '../api';
import { useSettings } from '../context/SettingsContext';

const VehiclesList = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const primaryColor = settings?.theme?.primary_color || '#31975C';

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  
  // Selection/View details state
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [detailedVehicle, setDetailedVehicle] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Load vehicles directory list
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/aggregator-vehicles');
      setVehicles(res.data.vehicles || []);
    } catch (err) {
      console.error("fetchVehicles error:", err);
      toast.error("Failed to load aggregator vehicles directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Fetch individual vehicle detail when ID selected
  useEffect(() => {
    if (!selectedVehicleId) {
      setDetailedVehicle(null);
      return;
    }

    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        const res = await api.get(`/aggregator-vehicles/${selectedVehicleId}`);
        setDetailedVehicle(res.data.vehicle);
      } catch (err) {
        console.error("fetchDetails error:", err);
        toast.error("Failed to load vehicle specifications details");
        setSelectedVehicleId(null);
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchDetails();
  }, [selectedVehicleId]);

  // Status Toggles
  const handleToggleStatus = async (vehicle, newStatus) => {
    try {
      await api.patch(`/aggregator-vehicles/${vehicle.id}/status`, { status: newStatus });
      toast.success(`Vehicle status updated to ${newStatus}`);
      fetchVehicles();
      if (detailedVehicle && detailedVehicle.id === vehicle.id) {
        setDetailedVehicle(prev => ({ ...prev, vehicle_status: newStatus }));
      }
    } catch (err) {
      console.error("handleToggleStatus error:", err);
      toast.error("Failed to update vehicle status");
    }
  };

  // Close active dropdowns on click-out
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdownId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Helper resolver for uploads URLs
  const getFileUrl = (filename) => {
    if (!filename) return null;
    return `${IMAGE_BASE_URL}/Vehicles/${filename}`;
  };

  // Warning calculations for compliance certificates expiry (30 days window)
  const getExpiryStatus = (expiryDateStr) => {
    if (!expiryDateStr) return { type: 'none', label: 'N/A' };
    const expiry = new Date(expiryDateStr);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { type: 'expired', label: 'Expired', days: Math.abs(diffDays) };
    } else if (diffDays <= 30) {
      return { type: 'expiring', label: `Expiring in ${diffDays} days`, days: diffDays };
    }
    return { type: 'valid', label: 'Valid', days: diffDays };
  };

  // Filter local logic
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.driver && v.driver.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "" || v.vehicle_status === statusFilter;
    const matchesType = typeFilter === "" || v.vehicle_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Render detail view layout (Full width page)
  if (detailedVehicle) {
    const veh = detailedVehicle;
    const pucStatus = getExpiryStatus(veh.emission_puc_expiry);
    const insStatus = getExpiryStatus(veh.insurance_expiry);
    const fcStatus = getExpiryStatus(veh.fc_expiry);

    // Accessories list parsing
    let accessories = [];
    if (veh.device_accessories_issued) {
      try {
        accessories = JSON.parse(veh.device_accessories_issued);
      } catch (e) {
        accessories = veh.device_accessories_issued.split(',');
      }
    }

    return (
      <div className="w-full mx-auto px-4 pb-16 animate-fadeIn">
        {/* Detail Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-700 shadow-sm" style={{ color: primaryColor }}>
              <Truck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <span className="font-mono font-bold text-slate-800 text-lg tracking-wider bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">
                  {veh.registration_number}
                </span>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border ${
                  veh.vehicle_status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' :
                  veh.vehicle_status === 'Under Maintenance' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  'bg-red-50 text-red-600 border-red-100'
                }`}>
                  {veh.vehicle_status}
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight mt-2">
                {veh.brand} {veh.model} <span className="text-slate-400 font-semibold text-xs uppercase">({veh.vehicle_type})</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/aggregator-vehicles/${veh.id}/edit`)}
              className="flex items-center px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl bg-white text-xs font-bold shadow-sm transition-all"
            >
              <Edit3 className="w-4 h-4 mr-2" /> Modify Profile
            </button>
            <button
              onClick={() => setSelectedVehicleId(null)}
              className="flex items-center px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl bg-white text-xs font-bold shadow-sm transition-all"
            >
              Back to Directory
            </button>
          </div>
        </div>

        {/* Dynamic Compliance expirations warnings */}
        {(pucStatus.type === 'expired' || insStatus.type === 'expired' || fcStatus.type === 'expired' ||
          pucStatus.type === 'expiring' || insStatus.type === 'expiring' || fcStatus.type === 'expiring') && (
          <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 mb-8 flex items-start space-x-3 text-red-800 text-xs font-medium animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm text-red-900 mb-1">Compliance Expiry Alert!</span>
              <ul className="list-disc pl-4 space-y-1 mt-1 text-red-700">
                {pucStatus.type === 'expired' && <li>PUC Certificate has expired ({pucStatus.days} days ago).</li>}
                {pucStatus.type === 'expiring' && <li>PUC Certificate is expiring soon (in {pucStatus.days} days).</li>}
                {insStatus.type === 'expired' && <li>Insurance Certificate has expired ({insStatus.days} days ago).</li>}
                {insStatus.type === 'expiring' && <li>Insurance Certificate is expiring soon (in {insStatus.days} days).</li>}
                {fcStatus.type === 'expired' && <li>Fitness Certificate (FC) has expired ({fcStatus.days} days ago).</li>}
                {fcStatus.type === 'expiring' && <li>Fitness Certificate (FC) is expiring soon (in {fcStatus.days} days).</li>}
              </ul>
            </div>
          </div>
        )}

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Metadata Tables (Left/Middle columns - spans 2) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vehicle Specs Specifications */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Technical Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-semibold text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Chassis Number</span>
                  <span className="text-slate-800 font-bold">{veh.chassis_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Engine Number</span>
                  <span className="text-slate-800 font-bold">{veh.engine_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Fuel Type</span>
                  <span className="text-slate-800 font-bold uppercase">{veh.fuel_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Manufacturing Year</span>
                  <span className="text-slate-800 font-bold">{veh.manufacturing_year}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Capacity (Load)</span>
                  <span className="text-slate-800 font-bold">{veh.capacity_kg} KG</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Kerb Weight</span>
                  <span className="text-slate-800 font-bold">{veh.kerb_weight_kg} KG</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Color</span>
                  <span className="text-slate-800 font-bold">{veh.color}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">No. of Axles</span>
                  <span className="text-slate-800 font-bold">{veh.no_of_axles}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Owner Type</span>
                  <span className="text-indigo-600 font-bold uppercase">{veh.owner_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Registration Date</span>
                  <span className="text-slate-800 font-bold">{new Date(veh.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Compliance details */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Compliance Expiry Dates</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs font-semibold text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Emission (PUC) Expiry</span>
                  <span className={`font-bold block ${pucStatus.type === 'expired' ? 'text-red-500' : pucStatus.type === 'expiring' ? 'text-amber-500' : 'text-slate-800'}`}>
                    {veh.emission_puc_expiry} ({pucStatus.label})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Insurance Expiry</span>
                  <span className={`font-bold block ${insStatus.type === 'expired' ? 'text-red-500' : insStatus.type === 'expiring' ? 'text-amber-500' : 'text-slate-800'}`}>
                    {veh.insurance_expiry} ({insStatus.label})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Fitness (FC) Expiry</span>
                  <span className={`font-bold block ${fcStatus.type === 'expired' ? 'text-red-500' : fcStatus.type === 'expiring' ? 'text-amber-500' : 'text-slate-800'}`}>
                    {veh.fc_expiry} ({fcStatus.label})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Permit Number</span>
                  <span className="text-slate-800 font-bold">{veh.permit_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Permit Expiry</span>
                  <span className="text-slate-800 font-bold">{veh.permit_expiry || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Road Tax Expiry</span>
                  <span className="text-slate-800 font-bold">{veh.road_tax_expiry || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Document Scans Gallery */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Compliance Document Scans</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* RC Front */}
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-500 mb-2">RC Front Image</span>
                  {veh.rc_front_image && veh.rc_front_image.endsWith(".pdf") ? (
                    <a href={getFileUrl(veh.rc_front_image)} target="_blank" rel="noreferrer" className="w-full h-24 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg text-emerald-600 hover:bg-slate-50 transition-colors">
                      <FileText className="w-8 h-8 mb-1" />
                      <span className="text-[9px] font-bold">VIEW PDF</span>
                    </a>
                  ) : (
                    <img src={getFileUrl(veh.rc_front_image)} alt="RC Front" className="w-full h-24 object-cover rounded-lg shadow-sm border border-slate-200/80 cursor-zoom-in" onClick={() => window.open(getFileUrl(veh.rc_front_image))} />
                  )}
                </div>
                {/* RC Back */}
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-500 mb-2">RC Back Image</span>
                  {veh.rc_back_image && veh.rc_back_image.endsWith(".pdf") ? (
                    <a href={getFileUrl(veh.rc_back_image)} target="_blank" rel="noreferrer" className="w-full h-24 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg text-emerald-600 hover:bg-slate-50 transition-colors">
                      <FileText className="w-8 h-8 mb-1" />
                      <span className="text-[9px] font-bold">VIEW PDF</span>
                    </a>
                  ) : (
                    <img src={getFileUrl(veh.rc_back_image)} alt="RC Back" className="w-full h-24 object-cover rounded-lg shadow-sm border border-slate-200/80 cursor-zoom-in" onClick={() => window.open(getFileUrl(veh.rc_back_image))} />
                  )}
                </div>
                {/* PUC scan */}
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-500 mb-2">PUC Certificate</span>
                  {veh.puc_certificate_image && veh.puc_certificate_image.endsWith(".pdf") ? (
                    <a href={getFileUrl(veh.puc_certificate_image)} target="_blank" rel="noreferrer" className="w-full h-24 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg text-emerald-600 hover:bg-slate-50 transition-colors">
                      <FileText className="w-8 h-8 mb-1" />
                      <span className="text-[9px] font-bold">VIEW PDF</span>
                    </a>
                  ) : (
                    <img src={getFileUrl(veh.puc_certificate_image)} alt="PUC Scan" className="w-full h-24 object-cover rounded-lg shadow-sm border border-slate-200/80 cursor-zoom-in" onClick={() => window.open(getFileUrl(veh.puc_certificate_image))} />
                  )}
                </div>
                {/* Insurance Scan */}
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-500 mb-2">Insurance Scan</span>
                  {veh.insurance_certificate_image && veh.insurance_certificate_image.endsWith(".pdf") ? (
                    <a href={getFileUrl(veh.insurance_certificate_image)} target="_blank" rel="noreferrer" className="w-full h-24 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg text-emerald-600 hover:bg-slate-50 transition-colors">
                      <FileText className="w-8 h-8 mb-1" />
                      <span className="text-[9px] font-bold">VIEW PDF</span>
                    </a>
                  ) : (
                    <img src={getFileUrl(veh.insurance_certificate_image)} alt="Insurance Scan" className="w-full h-24 object-cover rounded-lg shadow-sm border border-slate-200/80 cursor-zoom-in" onClick={() => window.open(getFileUrl(veh.insurance_certificate_image))} />
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Device scan card info */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Assigned Corporate Mobile Asset</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-semibold text-slate-600 mb-6">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Device Model</span>
                  <span className="text-slate-800 font-bold">{veh.device_brand} {veh.device_name_model}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">IMEI 1</span>
                  <span className="text-slate-800 font-bold">{veh.device_imei_1}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">IMEI 2</span>
                  <span className="text-slate-800 font-bold">{veh.device_imei_2 || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Serial Number</span>
                  <span className="text-slate-800 font-bold">{veh.device_serial_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Mobile SIM Phone</span>
                  <span className="text-slate-800 font-bold">{veh.device_mobile_number_sim} ({veh.device_sim_provider || 'N/A'})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Device Status</span>
                  <span className="text-emerald-600 font-bold uppercase">{veh.device_status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Device Condition</span>
                  <span className="text-slate-800 font-bold">{veh.device_condition}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Accessories Issued</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {accessories.map((acc, index) => (
                      <span key={index} className="inline-block bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {acc}
                      </span>
                    ))}
                    {accessories.length === 0 && <span className="text-[10px] text-slate-400 italic">None</span>}
                  </div>
                </div>
              </div>

              {/* Mobile device image documents */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-500 mb-2">Device Front Scan</span>
                  <img src={getFileUrl(veh.device_front_photo)} alt="Device Front" className="w-full h-20 object-cover rounded-lg shadow-sm border border-slate-200 cursor-zoom-in" onClick={() => window.open(getFileUrl(veh.device_front_photo))} />
                </div>
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-500 mb-2">Device Back Scan</span>
                  <img src={getFileUrl(veh.device_back_photo)} alt="Device Back" className="w-full h-20 object-cover rounded-lg shadow-sm border border-slate-200 cursor-zoom-in" onClick={() => window.open(getFileUrl(veh.device_back_photo))} />
                </div>
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-500 mb-2">IMEI Sticker Scan</span>
                  <img src={getFileUrl(veh.device_imei_sticker_photo)} alt="IMEI Sticker" className="w-full h-20 object-cover rounded-lg shadow-sm border border-slate-200 cursor-zoom-in" onClick={() => window.open(getFileUrl(veh.device_imei_sticker_photo))} />
                </div>
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-500 mb-2">Purchase Invoice Scan</span>
                  {veh.device_purchase_invoice && veh.device_purchase_invoice.endsWith(".pdf") ? (
                    <a href={getFileUrl(veh.device_purchase_invoice)} target="_blank" rel="noreferrer" className="w-full h-20 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg text-emerald-600 hover:bg-slate-50 transition-colors">
                      <FileText className="w-6 h-6 mb-0.5" />
                      <span className="text-[9px] font-bold">VIEW PDF</span>
                    </a>
                  ) : (
                    <img src={getFileUrl(veh.device_purchase_invoice)} alt="Device Invoice" className="w-full h-20 object-cover rounded-lg shadow-sm border border-slate-200 cursor-zoom-in" onClick={() => window.open(getFileUrl(veh.device_purchase_invoice))} />
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Assigned Driver/Helper Overview Card Panel (Right column - spans 1) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Driver Assigned */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Assigned Driver</h2>
              {veh.driver ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black text-sm">
                      {veh.driver.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block leading-none">{veh.driver.name}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase mt-1.5 block">Staff ID: EMP-{veh.driver.id}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600 space-y-2">
                    <div className="flex items-center"><Phone className="w-3.5 h-3.5 text-slate-400 mr-2" /> {veh.driver.mobile_number}</div>
                    <div className="flex items-center"><FileText className="w-3.5 h-3.5 text-slate-400 mr-2" /> {veh.driver.driving_license_number || 'N/A'}</div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-bold italic">No Driver Assigned</p>
              )}
            </div>

            {/* Helper Assigned */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Assigned Helper</h2>
              {veh.helper ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600 font-black text-sm">
                      {veh.helper.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block leading-none">{veh.helper.name}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase mt-1.5 block">Staff ID: EMP-{veh.helper.id}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
                    <div className="flex items-center"><Phone className="w-3.5 h-3.5 text-slate-400 mr-2" /> {veh.helper.mobile_number}</div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-bold italic">No Helper Assigned</p>
              )}
            </div>

            {/* Vehicle Photos Gallery */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Vehicle Photos</h2>
              <div className="grid grid-cols-2 gap-3">
                {veh.vehicle_front_photo && (
                  <div className="flex flex-col items-center">
                    <img src={getFileUrl(veh.vehicle_front_photo)} alt="Front" className="w-full h-20 object-cover rounded-lg shadow-sm border border-slate-200 cursor-zoom-in" onClick={() => window.open(getFileUrl(veh.vehicle_front_photo))} />
                    <span className="text-[9px] text-slate-400 font-bold mt-1">Front Scan</span>
                  </div>
                )}
                {veh.vehicle_rear_photo && (
                  <div className="flex flex-col items-center">
                    <img src={getFileUrl(veh.vehicle_rear_photo)} alt="Rear" className="w-full h-20 object-cover rounded-lg shadow-sm border border-slate-200 cursor-zoom-in" onClick={() => window.open(getFileUrl(veh.vehicle_rear_photo))} />
                    <span className="text-[9px] text-slate-400 font-bold mt-1">Rear Scan</span>
                  </div>
                )}
                {veh.vehicle_left_photo && (
                  <div className="flex flex-col items-center">
                    <img src={getFileUrl(veh.vehicle_left_photo)} alt="Left" className="w-full h-20 object-cover rounded-lg shadow-sm border border-slate-200/80 cursor-zoom-in" onClick={() => window.open(getFileUrl(veh.vehicle_left_photo))} />
                    <span className="text-[9px] text-slate-400 font-bold mt-1">Left Side</span>
                  </div>
                )}
                {veh.vehicle_right_photo && (
                  <div className="flex flex-col items-center">
                    <img src={getFileUrl(veh.vehicle_right_photo)} alt="Right" className="w-full h-20 object-cover rounded-lg shadow-sm border border-slate-200/80 cursor-zoom-in" onClick={() => window.open(getFileUrl(veh.vehicle_right_photo))} />
                    <span className="text-[9px] text-slate-400 font-bold mt-1">Right Side</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Render list view directory grid/table layout
  return (
    <div className="w-full mx-auto px-4 pb-16">
      
      {/* List Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold gap-4 text-slate-800 tracking-tight mt-1.5 flex items-center">
            <Truck className="w-6 h-6 mr-2.5 text-slate-500" style={{ color: primaryColor }} />
            Aggregator Vehicles Directory
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Manage aggregator vehicle specifications, compliance documents, driver mappings, and corporate mobile device assets.
          </p>
        </div>

        <button
          onClick={() => navigate('/aggregator-vehicles/add')}
          style={{ backgroundColor: primaryColor }}
          className="flex items-center px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all select-none cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Register Vehicle
        </button>
      </div>

      {/* Directory Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search registration, brand, driver..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-slate-300 focus:bg-white transition-colors placeholder-slate-400 text-slate-700"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full md:w-44 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white text-slate-600 font-semibold"
          >
            <option value="">All Vehicle Types</option>
            <option value="Mini Truck (LCV)">Mini Truck (LCV)</option>
            <option value="Heavy Truck (HCV)">Heavy Truck (HCV)</option>
            <option value="Medium Truck (MCV)">Medium Truck (MCV)</option>
            <option value="Auto Rickshaw (3-Wheeler)">Auto Rickshaw (3-Wheeler)</option>
            <option value="E-Rickshaw">E-Rickshaw</option>
            <option value="Tractor">Tractor</option>
            <option value="Others">Others</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-36 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white text-slate-600 font-semibold"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
        </div>
      </div>

      {/* Directory Table Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mb-4" style={{ borderColor: primaryColor }}></div>
            Loading vehicles database...
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">
            No registered vehicles found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <th className="p-4 pl-6">Registration Info</th>
                  <th className="p-4">Brand & Model</th>
                  <th className="p-4">Assigned Driver</th>
                  <th className="p-4">Compliance Status</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filteredVehicles.map((veh) => {
                  const pucStatus = getExpiryStatus(veh.emission_puc_expiry);
                  const insStatus = getExpiryStatus(veh.insurance_expiry);
                  const fcStatus = getExpiryStatus(veh.fc_expiry);
                  const isComplianceOk = pucStatus.type === 'valid' && insStatus.type === 'valid' && fcStatus.type === 'valid';

                  return (
                    <tr key={veh.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4 pl-6">
                        <span className="font-mono font-bold text-slate-800 text-xs tracking-wider bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                          {veh.registration_number}
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <span className="font-bold text-slate-800 text-sm block leading-none">{veh.brand} {veh.model}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block mt-1">{veh.vehicle_type}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {veh.driver ? (
                          <div>
                            <span className="font-semibold text-slate-700 text-xs block leading-none">{veh.driver.name}</span>
                            <span className="text-[9px] text-slate-400 font-semibold block mt-1">ID: EMP-{veh.driver.id} | {veh.driver.mobile_number}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4">
                        {isComplianceOk ? (
                          <span className="inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-lg bg-green-50 text-green-600 border border-green-100">
                            Compliant
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-lg bg-red-50 text-red-600 border border-red-100">
                            Expired Scan
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-lg border ${
                          veh.vehicle_status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' :
                          veh.vehicle_status === 'Under Maintenance' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {veh.vehicle_status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(activeDropdownId === veh.id ? null : veh.id);
                          }}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Actions Dropdown Menu */}
                        {activeDropdownId === veh.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-6 top-12 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-30 py-1.5 text-left animate-in fade-in slide-in-from-top-1 duration-150"
                          >
                            <button
                              onClick={() => {
                                setSelectedVehicleId(veh.id);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center"
                            >
                              <Eye className="w-3.5 h-3.5 mr-2 text-slate-400" /> View Details
                            </button>
                            <button
                              onClick={() => {
                                navigate(`/aggregator-vehicles/${veh.id}/edit`);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center"
                            >
                              <Edit3 className="w-3.5 h-3.5 mr-2 text-slate-400" /> Edit Record
                            </button>

                            <div className="border-t border-slate-100 my-1" />

                            {veh.vehicle_status !== 'Active' && (
                              <button
                                onClick={() => {
                                  handleToggleStatus(veh, 'Active');
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-4 py-2 text-xs font-bold text-green-600 hover:bg-green-50/30 flex items-center"
                              >
                                <Check className="w-3.5 h-3.5 mr-2" /> Mark Active
                              </button>
                            )}

                            {veh.vehicle_status !== 'Under Maintenance' && (
                              <button
                                onClick={() => {
                                  handleToggleStatus(veh, 'Under Maintenance');
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-4 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50/30 flex items-center"
                              >
                                <Settings className="w-3.5 h-3.5 mr-2" /> Mark Maintenance
                              </button>
                            )}

                            {veh.vehicle_status !== 'Inactive' && (
                              <button
                                onClick={() => {
                                  handleToggleStatus(veh, 'Inactive');
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50/30 flex items-center"
                              >
                                <X className="w-3.5 h-3.5 mr-2" /> Mark Inactive
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default VehiclesList;
