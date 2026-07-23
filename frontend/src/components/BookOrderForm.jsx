import { useState, useEffect } from 'react';
import {
  Building, MapPin, Calendar, User, UserCheck,
  ChevronRight, ArrowLeft, Check, RefreshCw, X, AlertTriangle, ShieldCheck
} from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function BookOrderForm({ selectedGroup, onSuccess, onCancel }) {
  const firstReq = selectedGroup.first || {};
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  // Data lists
  const [corporations, setCorporations] = useState([]);
  const [zones, setZones] = useState([]);
  const [wards, setWards] = useState([]);
  const [collectionEvents, setCollectionEvents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Loadings
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    corporation_id: '',
    zone_id: '',
    ward_id: '',
    collection_event_id: '',
    vendor_id: '',
    driver_id: ''
  });

  // Fetch corporations on mount
  useEffect(() => {
    const fetchCorporations = async () => {
      setLoadingLocations(true);
      try {
        const res = await api.get('/corporations');
        setCorporations(res.data.corporations || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load corporations.');
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchCorporations();
  }, []);

  // Fetch zones when corporation changes
  useEffect(() => {
    if (!formData.corporation_id) {
      setZones([]);
      setFormData(prev => ({ ...prev, zone_id: '', ward_id: '', collection_event_id: '' }));
      return;
    }

    const fetchZones = async () => {
      try {
        const res = await api.get(`/corporations/${formData.corporation_id}/zones`);
        setZones(res.data.zones || []);
        setFormData(prev => ({ ...prev, zone_id: '', ward_id: '', collection_event_id: '' }));
      } catch (err) {
        console.error(err);
        toast.error('Failed to load zones for this corporation.');
      }
    };
    fetchZones();
  }, [formData.corporation_id]);

  // Fetch wards when zone changes
  useEffect(() => {
    if (!formData.zone_id) {
      setWards([]);
      setFormData(prev => ({ ...prev, ward_id: '', collection_event_id: '' }));
      return;
    }

    const fetchWards = async () => {
      try {
        const res = await api.get(`/zones/${formData.zone_id}/wards`);
        setWards(res.data.wards || []);
        setFormData(prev => ({ ...prev, ward_id: '', collection_event_id: '' }));
      } catch (err) {
        console.error(err);
        toast.error('Failed to load wards for this zone.');
      }
    };
    fetchWards();
  }, [formData.zone_id]);

  // Fetch collection events when corporation, zone, or ward changes
  useEffect(() => {
    const fetchEvents = async () => {
      if (!formData.corporation_id || !formData.zone_id || !formData.ward_id) {
        setCollectionEvents([]);
        setFormData(prev => ({ ...prev, collection_event_id: '' }));
        return;
      }
      try {
        const res = await api.get('/collection-events', {
          params: {
            corporation_id: formData.corporation_id,
            zone_id: formData.zone_id,
            ward_id: formData.ward_id,
            limit: 100,
            status: 'Active'
          }
        });
        setCollectionEvents(res.data.collectionEvents || []);
        setFormData(prev => ({ ...prev, collection_event_id: '' }));
      } catch (err) {
        console.error(err);
        toast.error('Failed to load collection events.');
      }
    };
    fetchEvents();
  }, [formData.corporation_id, formData.zone_id, formData.ward_id]);

  // Fetch vendors and drivers when entering step 2
  useEffect(() => {
    if (step !== 2) return;

    const fetchResources = async () => {
      setLoadingResources(true);
      try {
        // Fetch vendors
        const usersRes = await api.get('/users');
        const activeVendors = (usersRes.data.users || []).filter(u => {
          const nameMatch = u.role?.role_name?.toLowerCase() || '';
          return (nameMatch.includes('vendor') || nameMatch.includes('seller')) && u.status === 'active';
        });
        setVendors(activeVendors);

        // Fetch drivers
        const empRes = await api.get('/aggregator-employees');
        const activeEmployees = (empRes.data.employees || []).filter(e => e.employee_status === 'active');
        setDrivers(activeEmployees.filter(e => e.staff_type === 'driver'));
      } catch (err) {
        console.error(err);
        toast.error('Failed to load booking resources.');
      } finally {
        setLoadingResources(false);
      }
    };
    fetchResources();
  }, [step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (!formData.corporation_id || !formData.zone_id || !formData.ward_id || !formData.collection_event_id) {
      toast.error('Please select Corporation, Zone, Ward, and Collection Event.');
      return;
    }
    setStep(2);
  };

  const handleReview = (e) => {
    e.preventDefault();
    if (!formData.vendor_id || !formData.driver_id) {
      toast.error('Please assign a Vendor and a Driver.');
      return;
    }
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/waste-collection-requests/lead/${selectedGroup.lead_id}/book`, formData);
      toast.success('Order booked successfully!');
      setIsBooked(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to book the order.');
    } finally {
      setLoading(false);
    }
  };

  // Filter drivers based on selected vendor and ensure they have a vehicle
  const filteredDrivers = drivers.filter(d => {
    const belongsToVendor = String(d.user_id) === String(formData.vendor_id);
    const hasVehicle = d.driverVehicles && d.driverVehicles.length > 0;
    return belongsToVendor && hasVehicle;
  });

  // Find names for review details
  const selectedCorp = corporations.find(c => String(c.id) === String(formData.corporation_id))?.corporation_name || '—';
  const selectedZone = zones.find(z => String(z.id) === String(formData.zone_id))?.zone_name || '—';
  const selectedWard = wards.find(w => String(w.id) === String(formData.ward_id))?.ward_name || '—';
  const selectedEvent = collectionEvents.find(e => String(e.id) === String(formData.collection_event_id))?.event_name || '—';
  const selectedVendor = vendors.find(v => String(v.id) === String(formData.vendor_id))?.name || '—';
  const selectedDriverObj = drivers.find(d => String(d.id) === String(formData.driver_id));
  const selectedDriver = selectedDriverObj?.name || '—';
  const selectedDriverVeh = selectedDriverObj?.driverVehicles?.[0];
  const selectedDriverVehText = selectedDriverVeh
    ? `${selectedDriverVeh.registration_number} (${selectedDriverVeh.brand} ${selectedDriverVeh.model})`
    : '—';

  // If order is successfully booked, show the results page directly here
  if (isBooked) {
    return (
      <div className="rounded-[1.25rem]  overflow-hidden w-full animate-in fade-in duration-300">
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50 shadow-xs">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Order Booked Successfully!</h2>
            <p className="text-xs text-slate-400 font-bold mt-1.5 uppercase tracking-wider">
              Lead ID: <span className="font-mono text-slate-655 font-extrabold">{selectedGroup.lead_id}</span>
            </p>
          </div>

          <div className="bg-slate-50/70 border border-slate-150 rounded-2xl p-5 max-w-xl mx-auto space-y-3.5 text-left">
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-200/60 pb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-555" /> Confirmed Order Mapping details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Corporation</span>
                <span className="text-xs font-bold text-slate-700 mt-0.5 block">{selectedCorp}</span>
              </div>
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Zone / Ward</span>
                <span className="text-xs font-bold text-slate-700 mt-0.5 block">{selectedZone} / {selectedWard}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Collection Event</span>
                <span className="text-xs font-bold text-slate-700 mt-0.5 block">{selectedEvent}</span>
              </div>
              <div className="col-span-2 border-t border-slate-200/60 pt-2.5">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Vendor</span>
                <span className="text-xs font-bold text-slate-700 mt-0.5 block">{selectedVendor}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Driver & Vehicle</span>
                <span className="text-xs font-bold text-slate-700 mt-0.5 block">{selectedDriver} ({selectedDriverVehText})</span>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="button"
              onClick={onSuccess}
              className="py-3 px-8 bg-violet-600 hover:bg-violet-750 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-100 transition-all cursor-pointer hover:-translate-y-0.5 active:scale-97"
            >
              Exit & View Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[1.25rem] border border-slate-205 shadow-sm overflow-hidden w-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-slate-50/50 to-white border-b border-slate-150">
        <div>
          <span className="font-mono text-[10px] font-extrabold text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-md">
            Lead ID: {selectedGroup.lead_id}
          </span>
          <h2 className="text-lg font-black text-slate-800 mt-2 tracking-tight">Book Waste Collection Order</h2>
          <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider flex items-center gap-1">
            Generator: <span className="text-slate-600 font-extrabold">{firstReq.waste_generator_name}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-655 rounded-xl transition-all cursor-pointer shadow-2xs bg-white border border-slate-105"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 3-Step Progress Indicator */}
      <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-5">
        <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
          {/* Step 1 Tab */}
          <button
            type="button"
            onClick={() => step > 1 && setStep(1)}
            className={`flex items-center gap-2.5 group transition-all text-left outline-none ${step > 1 ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center font-bold text-xs shadow-2xs border transition-all ${step === 1
              ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-100'
              : 'bg-emerald-50 border-emerald-250 text-emerald-600'
              }`}>
              {step > 1 ? <Check className="w-3.5 h-3.5" /> : '01'}
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Step 01</p>
              <p className={`text-[11px] font-black mt-1 ${step === 1 ? 'text-slate-800' : 'text-slate-450'}`}>Location</p>
            </div>
          </button>

          {/* Connect 1-2 */}
          <div className="flex-1 flex items-center justify-center px-2">
            <div className={`h-0.5 w-full rounded-full transition-all duration-300 ${step > 1 ? 'bg-emerald-450' : 'bg-slate-200'}`} />
          </div>

          {/* Step 2 Tab */}
          <button
            type="button"
            onClick={() => step > 2 && setStep(2)}
            className={`flex items-center gap-2.5 group transition-all text-left outline-none ${step > 2 ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center font-bold text-xs shadow-2xs border transition-all ${step === 2
              ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-100'
              : step > 2
                ? 'bg-emerald-50 border-emerald-250 text-emerald-600'
                : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
              {step > 2 ? <Check className="w-3.5 h-3.5" /> : '02'}
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Step 02</p>
              <p className={`text-[11px] font-black mt-1 ${step === 2 ? 'text-slate-800' : 'text-slate-450'}`}>Vendor & Driver</p>
            </div>
          </button>

          {/* Connect 2-3 */}
          <div className="flex-1 flex items-center justify-center px-2">
            <div className={`h-0.5 w-full rounded-full transition-all duration-300 ${step > 2 ? 'bg-emerald-450' : 'bg-slate-200'}`} />
          </div>

          {/* Step 3 Tab */}
          <div className="flex items-center gap-2.5 text-left">
            <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center font-bold text-xs shadow-2xs border transition-all ${step === 3
              ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-100'
              : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
              03
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Step 03</p>
              <p className={`text-[11px] font-black mt-1 ${step === 3 ? 'text-slate-800' : 'text-slate-455'}`}>Review & Book</p>
            </div>
          </div>
        </div>
      </div>

      {/* Forms switch */}
      {step === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="p-6 space-y-6">
          <div className="space-y-4 animate-in fade-in duration-300">
            {loadingLocations ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <RefreshCw className="w-9 h-9 animate-spin text-violet-500 mb-3" />
                <p className="text-sm font-bold">Loading Locations Data…</p>
              </div>
            ) : (
              <div className="bg-slate-50/30 rounded-2xl border border-slate-150 p-6 space-y-5">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <MapPin className="w-4.5 h-4.5 text-slate-400" /> Specify Location Boundaries
                </h3>

                {/* Corporation */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Corporation *
                  </label>
                  <select
                    name="corporation_id"
                    value={formData.corporation_id}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
                  >
                    <option value="">Select Corporation</option>
                    {corporations.map(corp => (
                      <option key={corp.id} value={corp.id}>{corp.corporation_name}</option>
                    ))}
                  </select>
                </div>

                {/* Zone */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Zone *
                  </label>
                  <select
                    name="zone_id"
                    value={formData.zone_id}
                    onChange={handleChange}
                    disabled={!formData.corporation_id}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-xs font-bold text-slate-700 cursor-pointer shadow-2xs disabled:bg-slate-50 disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Zone</option>
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.zone_name}</option>
                    ))}
                  </select>
                </div>

                {/* Ward */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Ward *
                  </label>
                  <select
                    name="ward_id"
                    value={formData.ward_id}
                    onChange={handleChange}
                    disabled={!formData.zone_id}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-xs font-bold text-slate-700 cursor-pointer shadow-2xs disabled:bg-slate-50 disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Ward</option>
                    {wards.map(w => (
                      <option key={w.id} value={w.id}>{w.ward_name}</option>
                    ))}
                  </select>
                </div>

                {/* Collection Event */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Collection Event *
                  </label>
                  <select
                    name="collection_event_id"
                    value={formData.collection_event_id}
                    onChange={handleChange}
                    disabled={!formData.ward_id}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-xs font-bold text-slate-700 cursor-pointer shadow-2xs disabled:bg-slate-50 disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Collection Event</option>
                    {collectionEvents.map(event => (
                      <option key={event.id} value={event.id}>{event.event_name}</option>
                    ))}
                  </select>
                  {formData.ward_id && collectionEvents.length === 0 && (
                    <span className="text-[10px] text-amber-500 font-extrabold block mt-1.5 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg">
                      No active collection events found for this Ward.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onCancel}
              className="py-2.5 px-5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5.5 bg-violet-600 hover:bg-violet-750 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-100 transition-all flex items-center gap-2 cursor-pointer hover:-translate-y-0.5 active:scale-97"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleReview} className="p-6 space-y-6">
          <div className="space-y-4 animate-in fade-in duration-300">
            {loadingResources ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <RefreshCw className="w-9 h-9 animate-spin text-violet-500 mb-3" />
                <p className="text-sm font-bold">Loading Resources Registries…</p>
              </div>
            ) : (
              <div className="bg-slate-50/30 rounded-2xl border border-slate-150 p-6 space-y-5">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <User className="w-4.5 h-4.5 text-slate-400" /> Resource Assignments
                </h3>

                {/* Vendor Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Vendor *
                  </label>
                  <select
                    name="vendor_id"
                    value={formData.vendor_id}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.email})</option>
                    ))}
                  </select>
                </div>

                {/* Driver Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Driver *
                  </label>
                  <select
                    name="driver_id"
                    value={formData.driver_id}
                    onChange={handleChange}
                    disabled={!formData.vendor_id}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-xs font-bold text-slate-700 cursor-pointer shadow-2xs disabled:bg-slate-50 disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Driver</option>
                    {filteredDrivers.map(d => {
                      const veh = d.driverVehicles && d.driverVehicles[0];
                      const vehText = veh ? ` - Vehicle: ${veh.registration_number} (${veh.brand} ${veh.model})` : '';
                      return (
                        <option key={d.id} value={d.id}>{d.name}{vehText}</option>
                      );
                    })}
                  </select>
                  {formData.vendor_id && filteredDrivers.length === 0 && (
                    <span className="text-[10px] text-amber-500 font-extrabold block mt-1.5 bg-amber-50/60 border border-amber-100 px-3 py-1.5 rounded-lg">
                      No drivers with assigned vehicles found for the selected Vendor.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-2.5 px-5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="submit"
              className="py-2.5 px-5.5 bg-violet-600 hover:bg-violet-750 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-100 transition-all flex items-center gap-2 cursor-pointer hover:-translate-y-0.5 active:scale-97"
            >
              Review Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Review Cards */}
            <div className="bg-slate-50/40 rounded-2xl border border-slate-150 p-6 space-y-6">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-200/60 pb-3">
                <ShieldCheck className="w-5 h-5 text-violet-555" /> Review Mapped Assignments
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Section 1: Location boundaries */}
                <div className="space-y-3.5 text-left bg-white border border-slate-200/70 p-4.5 rounded-xl">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                    <MapPin className="w-4 h-4 text-slate-400" /> Location Details
                  </h4>
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Corporation</span>
                    <span className="text-xs font-bold text-slate-700 mt-0.5 block">{selectedCorp}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Zone & Ward</span>
                    <span className="text-xs font-bold text-slate-700 mt-0.5 block">{selectedZone} / {selectedWard}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Collection Event</span>
                    <span className="text-xs font-bold text-slate-700 mt-0.5 block">{selectedEvent}</span>
                  </div>
                </div>

                {/* Section 2: Resource Assignment */}
                <div className="space-y-3.5 text-left bg-white border border-slate-200/70 p-4.5 rounded-xl">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                    <User className="w-4 h-4 text-slate-400" /> Assigned Resources
                  </h4>
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Vendor</span>
                    <span className="text-xs font-bold text-slate-700 mt-0.5 block">{selectedVendor}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Driver Name</span>
                    <span className="text-xs font-bold text-slate-700 mt-0.5 block">{selectedDriver}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Driver's Vehicle</span>
                    <span className="text-xs font-bold text-slate-700 mt-0.5 block font-mono">{selectedDriverVehText}</span>
                  </div>
                </div>
              </div>

              {/* Warn info */}
              <div className="flex items-start gap-2.5 bg-amber-50/60 border border-amber-150 p-4 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-550 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                  Clicking <strong>Confirm & Book</strong> will lock this request and transition its status to <strong>Booked</strong>. You can verify and exit on the next screen.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="py-2.5 px-5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-6 bg-violet-650 hover:bg-violet-750 text-white bg-[#31975c] text-xs font-bold rounded-xl border shadow-md shadow-violet-100 transition-all flex items-center gap-2 cursor-pointer text-black disabled:opacity-60 hover:-translate-y-0.5 active:scale-97"
            >
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              Confirm & Book
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
