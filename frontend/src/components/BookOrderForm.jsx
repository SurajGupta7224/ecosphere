import { useState, useEffect, useRef } from 'react';
import {
  Building, MapPin, Calendar, User, UserCheck,
  ChevronRight, ArrowLeft, Check, RefreshCw, X, AlertTriangle, ShieldCheck,
  ClipboardCheck, ClipboardList, Clock, Tag, Percent, FileText, CheckCircle2, Eye, Trash2, UploadCloud, Plus
} from 'lucide-react';
import api, { IMAGE_BASE_URL } from '../api';
import toast from 'react-hot-toast';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Fallback active time slots if DB list is empty
const DEFAULT_TIME_SLOTS = [
  { id: 'ts-1', slot_name: 'Morning Slot', start_time_formatted: '08:00 AM', end_time_formatted: '11:00 AM' },
  { id: 'ts-2', slot_name: 'Midday Slot', start_time_formatted: '11:00 AM', end_time_formatted: '02:00 PM' },
  { id: 'ts-3', slot_name: 'Afternoon Slot', start_time_formatted: '02:00 PM', end_time_formatted: '05:00 PM' },
  { id: 'ts-4', slot_name: 'Evening Slot', start_time_formatted: '05:00 PM', end_time_formatted: '08:00 PM' }
];

// Distinct color themes per waste category
const getCategoryColorTheme = (categoryName = '') => {
  const name = String(categoryName).toLowerCase();
  if (name.includes('wet') || name.includes('organic')) {
    return {
      bgGradient: 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-white',
      border: 'border-emerald-300/80',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      accentText: 'text-emerald-800'
    };
  }
  if (name.includes('dry') || name.includes('recycle')) {
    return {
      bgGradient: 'bg-gradient-to-r from-blue-500/10 via-sky-500/5 to-white',
      border: 'border-blue-300/80',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      accentText: 'text-blue-800'
    };
  }
  if (name.includes('sanitary') || name.includes('medical') || name.includes('hazard') || name.includes('bio')) {
    return {
      bgGradient: 'bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-white',
      border: 'border-rose-300/80',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
      accentText: 'text-rose-800'
    };
  }
  if (name.includes('e-waste') || name.includes('electronic') || name.includes('metal') || name.includes('c&d')) {
    return {
      bgGradient: 'bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-white',
      border: 'border-amber-300/80',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      accentText: 'text-amber-800'
    };
  }
  return {
    bgGradient: 'bg-gradient-to-r from-purple-200/10 via-emerald-100/5 to-white',
    border: 'border-teal-300/80',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
    accentText: 'text-teal-800'
  };
};

export default function BookOrderForm({ selectedGroup, onSuccess, onCancel }) {
  const firstReq = selectedGroup.first || {};
  const [loading, setLoading] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  // Multiselect dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Data lists
  const [corporations, setCorporations] = useState([]);
  const [zones, setZones] = useState([]);
  const [wards, setWards] = useState([]);
  const [collectionEvents, setCollectionEvents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [businessRegions, setBusinessRegions] = useState([]);
  const [businessSubRegions, setBusinessSubRegions] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);

  // Loadings
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);

  // Pickup Days (7 Days selection - Default: All 7 Days selected)
  const [pickupDays, setPickupDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

  // Document Upload File States & Image Previews
  const [momFile, setMomFile] = useState(null);
  const [momPreview, setMomPreview] = useState(null);

  const [poFile, setPoFile] = useState(null);
  const [poPreview, setPoPreview] = useState(null);

  const [emailCopyFile, setEmailCopyFile] = useState(null);
  const [emailCopyPreview, setEmailCopyPreview] = useState(null);

  // Existing document file paths from firstReq
  const [existingMomFile, setExistingMomFile] = useState(firstReq.mom_agreement_file || null);
  const [existingPoFile, setExistingPoFile] = useState(firstReq.po_copy_file || null);
  const [existingEmailFile, setExistingEmailFile] = useState(firstReq.email_copy_file || null);

  // Form state
  const [formData, setFormData] = useState({
    corporation_id: firstReq.corporation_id || '',
    zone_id: firstReq.zone_id || '',
    ward_id: firstReq.ward_id || '',
    collection_event_id: firstReq.collection_event_id || '',
    vendor_id: firstReq.vendor_id || '',
    driver_id: firstReq.driver_id || '',

    // Company Details - Read-only employee name coming from logged in profile
    site_request: firstReq.site_request || 'Commercial Onsite',
    service_center_type: firstReq.service_center_type || 'Ecosphere',
    employee_name: firstReq.employee_name || JSON.parse(localStorage.getItem('user') || '{}').name || 'Ecosphere Profile User',
    billing_type: firstReq.billing_type || 'Head Office',
    business_region: firstReq.business_region || '',
    business_sub_region: firstReq.business_sub_region || '',
    branch_code: firstReq.branch_code || ("EC-" + Math.floor(100 + Math.random() * 900)),
    business_lead: firstReq.business_lead || 'Exhibition',

    // Price Section
    sez: firstReq.sez || 'No',
    taxibility: firstReq.taxibility || '0.00 %',
    discount: firstReq.discount || 0,
    total_order_value: firstReq.total_order_value || 0,
    discounted_price: firstReq.discounted_price || 0,
    cgst: firstReq.cgst || 0,
    sgst: firstReq.sgst || 0,
    gst_amount: firstReq.gst_amount || 0,
    final_price: firstReq.final_price || 0,

    // Additional Details
    pickup_date: firstReq.pickup_date ? new Date(firstReq.pickup_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    pickup_time: firstReq.pickup_time || '',
    time_slot_id: firstReq.time_slot_id || '',
    pickup_notes: firstReq.pickup_notes || '',
  });

  // Items pricing state (KG or Bulk wise per waste item)
  const [itemsPricing, setItemsPricing] = useState(() => {
    return (selectedGroup.items || []).map(item => {
      const isBulk = item.pricing_mode === 'Bulk' || item.pricing_mode === 'bulk' ||
        ((parseFloat(item.expected_waste || 0) === 0 || parseFloat(item.agreed_price || 0) === 0) &&
         (parseFloat(item.monthly_price || 0) > 0 || parseFloat(item.yearly_price || 0) > 0 || parseFloat(item.bulk_monthly_price || 0) > 0));

      return {
        id: item.id,
        subcategory_id: item.subcategory_id,
        subcategory_name: item.subCategory?.name || item.subCategory?.sub_category_name || item.subcategory_name || 'Waste Item',
        category_name: item.category?.name || item.category?.category_name || item.category_name || 'Waste',
        variation_id: item.selected_variation_id || item.variation?.id || '',
        variation_name: item.variation?.variation_name || 'Daily 365(Days)',
        number_of_sr: item.variation?.number_of_sr || 365,
        schedule_after_days: item.variation?.schedule_after_days || 1,
        expected_waste: isBulk ? 0 : (parseFloat(item.expected_waste) || 0),
        agreed_price: isBulk ? 0 : (parseFloat(item.agreed_price) || parseFloat(item.variation?.per_kg_price) || 0),
        suggested_price: parseFloat(item.variation?.per_kg_price) || 0,
        pricing_mode: isBulk ? 'Bulk' : 'KG',
        bulk_monthly_price: isBulk ? (parseFloat(item.monthly_price) || parseFloat(item.bulk_monthly_price) || parseFloat(item.variation?.bulk_price) || 0) : (parseFloat(item.bulk_monthly_price) || parseFloat(item.variation?.bulk_price) || 0)
      };
    });
  });

  // Fetch initial registries on mount
  useEffect(() => {
    const initData = async () => {
      setLoadingLocations(true);
      setLoadingResources(true);
      try {
        const [corpRes, regionRes, slotRes, usersRes, empRes, subCatRes] = await Promise.all([
          api.get('/corporations'),
          api.get('/business-regions', { params: { status: 'Active', limit: 1000 } }),
          api.get('/time-slots/active').catch(() => api.get('/time-slots')),
          api.get('/users'),
          api.get('/aggregator-employees'),
          api.get('/sub-categories', { params: { limit: 1000 } }).catch(() => null)
        ]);

        setCorporations(corpRes.data.corporations || []);
        const regList = regionRes.data.businessRegions || [];
        setBusinessRegions(regList);

        let loadedSlots = slotRes.data.timeSlots || slotRes.data.slots || [];
        if (!loadedSlots.length) {
          loadedSlots = DEFAULT_TIME_SLOTS;
        }
        setTimeSlots(loadedSlots);

        const subCats = subCatRes?.data?.subCategories || subCatRes?.data?.rows || subCatRes?.data?.data || [];
        setAllSubCategories(subCats);

        // Pre-select first time slot automatically if not set
        if (loadedSlots.length > 0 && !formData.pickup_time) {
          const firstSlot = loadedSlots[0];
          const slotFormattedText = `${firstSlot.start_time_formatted} - ${firstSlot.end_time_formatted}${firstSlot.slot_name ? ` (${firstSlot.slot_name})` : ''}`;
          setFormData(prev => ({
            ...prev,
            time_slot_id: firstSlot.id,
            pickup_time: slotFormattedText
          }));
        }

        const activeVendors = (usersRes.data.users || []).filter(u => {
          const nameMatch = u.role?.role_name?.toLowerCase() || '';
          return (nameMatch.includes('vendor') || nameMatch.includes('seller')) && u.status === 'active';
        });
        setVendors(activeVendors);

        const activeEmployees = (empRes.data.employees || []).filter(e => e.employee_status === 'active');
        setDrivers(activeEmployees.filter(e => e.staff_type === 'driver'));

      } catch (err) {
        console.error("Initial data load error:", err);
        setTimeSlots(DEFAULT_TIME_SLOTS);
      } finally {
        setLoadingLocations(false);
        setLoadingResources(false);
      }
    };
    initData();
  }, []);

  // Fetch Business Sub-Regions when region changes
  useEffect(() => {
    if (!formData.business_region) {
      setBusinessSubRegions([]);
      return;
    }
    const fetchSub = async () => {
      try {
        const selectedReg = businessRegions.find(r => (r.region_name || r.state) === formData.business_region || r.id == formData.business_region);
        if (selectedReg) {
          const res = await api.get(`/business-regions/${selectedReg.id}/sub-regions`);
          const list = res.data.subRegions || res.data.businessSubRegions || [];
          setBusinessSubRegions(list);
        } else {
          const res = await api.get(`/business-sub-regions`, { params: { limit: 1000 } }).catch(() => null);
          const list = res?.data?.subRegions || res?.data?.businessSubRegions || [];
          setBusinessSubRegions(list);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSub();
  }, [formData.business_region, businessRegions]);

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
      } catch (err) {
        console.error(err);
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
      } catch (err) {
        console.error(err);
      }
    };
    fetchWards();
  }, [formData.zone_id]);

  // Fetch collection events when ward changes
  useEffect(() => {
    if (!formData.corporation_id || !formData.zone_id || !formData.ward_id) {
      setCollectionEvents([]);
      return;
    }
    const fetchEvents = async () => {
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
      } catch (err) {
        console.error(err);
      }
    };
    fetchEvents();
  }, [formData.corporation_id, formData.zone_id, formData.ward_id]);

  // Recalculate Price Section values dynamically
  useEffect(() => {
    let subtotalYearly = 0;
    itemsPricing.forEach(item => {
      if (item.pricing_mode === 'Bulk') {
        const monthly = parseFloat(item.bulk_monthly_price || 0);
        subtotalYearly += monthly * 12;
      } else {
        const dailyKG = parseFloat(item.expected_waste || 0);
        const rateKG = parseFloat(item.agreed_price || 0);
        subtotalYearly += dailyKG * rateKG * 365;
      }
    });

    const disc = parseFloat(formData.discount || 0);
    const afterDisc = Math.max(0, subtotalYearly - disc);

    let taxRate = 0;
    if (formData.sez !== 'Yes') {
      const match = (formData.taxibility || '').match(/([\d.]+)/);
      if (match) taxRate = parseFloat(match[1]);
    }

    const gstAmt = afterDisc * (taxRate / 100);
    const halfGst = gstAmt / 2;
    const finalTotal = afterDisc + gstAmt;

    setFormData(prev => ({
      ...prev,
      total_order_value: subtotalYearly.toFixed(2),
      discounted_price: afterDisc.toFixed(2),
      cgst: halfGst.toFixed(2),
      sgst: halfGst.toFixed(2),
      gst_amount: gstAmt.toFixed(2),
      final_price: finalTotal.toFixed(2)
    }));
  }, [itemsPricing, formData.discount, formData.sez, formData.taxibility]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeSlotSelect = (slotVal) => {
    const matchedSlot = timeSlots.find(s => String(s.id) === String(slotVal));
    if (matchedSlot) {
      const formattedText = `${matchedSlot.start_time_formatted} - ${matchedSlot.end_time_formatted}${matchedSlot.slot_name ? ` (${matchedSlot.slot_name})` : ''}`;
      setFormData(prev => ({
        ...prev,
        time_slot_id: matchedSlot.id,
        pickup_time: formattedText
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        time_slot_id: slotVal,
        pickup_time: slotVal
      }));
    }
  };

  const handleItemPricingChange = (itemId, field, value) => {
    setItemsPricing(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleRemoveWasteItem = (itemId) => {
    if (itemsPricing.length <= 1) {
      toast.error("At least one waste item must remain.");
      return;
    }
    setItemsPricing(prev => prev.filter(i => i.id !== itemId));
    toast.success("Waste item removed.");
  };

  const toggleSubCategoryItem = (sub) => {
    const subId = sub.subcategory_id || sub.id;
    const subName = sub.name || sub.subcategory_name || sub.sub_category_name || 'Waste Item';
    const catName = sub.category_name || sub.category?.name || sub.category?.category_name || 'Waste';

    const existsIndex = itemsPricing.findIndex(item =>
      (subId && String(item.subcategory_id) === String(subId)) ||
      String(item.subcategory_name).toLowerCase() === String(subName).toLowerCase()
    );

    if (existsIndex !== -1) {
      if (itemsPricing.length <= 1) {
        toast.error("At least one waste item must remain.");
        return;
      }
      setItemsPricing(prev => prev.filter((_, idx) => idx !== existsIndex));
      toast.success(`Removed ${subName}`);
    } else {
      const orig = sub.original || sub;
      const defaultVar = orig.variations?.[0] || orig.subCategoryVariations?.[0];
      const newItem = {
        id: `new-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        subcategory_id: subId || `sub-${Date.now()}`,
        subcategory_name: subName,
        category_name: catName,
        variation_id: defaultVar?.id || '',
        variation_name: defaultVar?.variation_name || 'Daily 365(Days)',
        number_of_sr: defaultVar?.number_of_sr || 365,
        schedule_after_days: defaultVar?.schedule_after_days || 1,
        expected_waste: 10,
        agreed_price: defaultVar?.per_kg_price || 10,
        suggested_price: defaultVar?.per_kg_price || 10,
        pricing_mode: 'KG',
        bulk_monthly_price: defaultVar?.bulk_price || 15000
      };
      setItemsPricing(prev => [...prev, newItem]);
      toast.success(`Added ${subName}`);
    }
  };

  const handleFileUpload = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const previewUrl = isImage ? URL.createObjectURL(file) : null;

    if (fileType === 'mom') {
      setMomFile(file);
      setMomPreview(previewUrl);
    } else if (fileType === 'po') {
      setPoFile(file);
      setPoPreview(previewUrl);
    } else if (fileType === 'email') {
      setEmailCopyFile(file);
      setEmailCopyPreview(previewUrl);
    }
  };

  const toggleDay = (day) => {
    setPickupDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleAllDays = () => {
    if (pickupDays.length === 7) {
      setPickupDays([]);
    } else {
      setPickupDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    }
  };

  const invalidateField = (name, message) => {
    toast.error(message);
    const element = document.getElementsByName(name)[0] || document.getElementById(name);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.style.borderColor = '#ef4444';
      element.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.3)';
      element.focus();
      setTimeout(() => {
        element.style.borderColor = '';
        element.style.boxShadow = '';
      }, 5000);
    }
  };

  const validateForm = () => {
    if (!formData.corporation_id) {
      invalidateField('corporation_id', 'Please select a Corporation.');
      return false;
    }
    if (!formData.zone_id) {
      invalidateField('zone_id', 'Please select a Zone.');
      return false;
    }
    if (!formData.ward_id) {
      invalidateField('ward_id', 'Please select a Ward.');
      return false;
    }
    if (!formData.collection_event_id) {
      invalidateField('collection_event_id', 'Please select a Collection Event.');
      return false;
    }
    if (!formData.vendor_id) {
      invalidateField('vendor_id', 'Please select a Vendor.');
      return false;
    }
    if (!formData.driver_id) {
      invalidateField('driver_id', 'Please assign a Driver.');
      return false;
    }
    if (!formData.business_region) {
      invalidateField('business_region', 'Please select a Business Region.');
      return false;
    }
    if (!formData.business_sub_region) {
      invalidateField('business_sub_region', 'Please select a Sub Region.');
      return false;
    }
    if (!formData.pickup_date) {
      invalidateField('pickup_date', 'Please select a Preferred Pickup Date.');
      return false;
    }
    if (!formData.pickup_time) {
      invalidateField('pickup_time', 'Please select a Preferred Pickup Time Slot.');
      return false;
    }
    if (pickupDays.length === 0) {
      toast.error('Please select at least one pickup day.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null) {
          payload.append(key, formData[key]);
        }
      });
      payload.append('items_pricing', JSON.stringify(itemsPricing));
      payload.append('pickup_days', JSON.stringify(pickupDays));

      if (momFile) payload.append('mom_agreement_file', momFile);
      if (poFile) payload.append('po_copy_file', poFile);
      if (emailCopyFile) payload.append('email_copy_file', emailCopyFile);

      await api.patch(`/waste-collection-requests/lead/${selectedGroup.lead_id}/book`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Order booked successfully!');
      setIsBooked(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to book the order.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = drivers.filter(d => {
    const belongsToVendor = String(d.user_id) === String(formData.vendor_id);
    const hasVehicle = d.driverVehicles && d.driverVehicles.length > 0;
    return belongsToVendor && hasVehicle;
  });

  const selectedCorp = corporations.find(c => String(c.id) === String(formData.corporation_id))?.corporation_name || '';
  const selectedZone = zones.find(z => String(z.id) === String(formData.zone_id))?.zone_name || '';
  const selectedWard = wards.find(w => String(w.id) === String(formData.ward_id))?.ward_name || '';
  const selectedVendor = vendors.find(v => String(v.id) === String(formData.vendor_id))?.name || '';
  const selectedDriverObj = drivers.find(d => String(d.id) === String(formData.driver_id));
  const selectedDriver = selectedDriverObj?.name || '';
  const selectedDriverVeh = selectedDriverObj?.driverVehicles?.[0];

  if (isBooked) {
    const formattedPickupDate = formData.pickup_date
      ? new Date(formData.pickup_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
      <div className="rounded-3xl overflow-hidden w-full bg-white p-8 text-center space-y-6 animate-in fade-in duration-300 border border-slate-200/80 shadow-xs max-w-4xl mx-auto">

        {/* Top Check Icon matching screenshot */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 z-10">
            <Check className="w-9 h-9 stroke-[3]" />
          </div>
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300"></div>
          <div className="absolute bottom-1 -left-2 w-2 h-2 rounded-full bg-teal-400"></div>
          <div className="absolute top-2 -left-3 w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">Order Booked Successfully!</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Your waste collection order has been scheduled.
          </p>
          <div className="w-10 h-1 bg-emerald-500 rounded-full mx-auto my-3"></div>
        </div>

        {/* Lead ID Pill Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-sm font-bold font-mono shadow-xs">
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>LEAD ID:</span>
          <span className="text-emerald-700 font-extrabold">{selectedGroup.lead_id}</span>
        </div>

        {/* Booking Details Card Container */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-left space-y-4 max-w-3xl mx-auto shadow-xs">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-5 h-5 text-emerald-600" /> Booking Details
          </h3>

          <div className="space-y-3.5 divide-y divide-slate-100 text-xs sm:text-sm">
            {/* Pickup Date & Time */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-3 text-slate-500 font-medium">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Pickup Date & Time</span>
              </div>
              <div className="flex items-center gap-3 font-semibold text-slate-800 flex-wrap">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-emerald-600" /> {formattedPickupDate}</span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-600" /> {formData.pickup_time || 'Scheduled Slot'}</span>
              </div>
            </div>

            {/* Vendor & Driver */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3">
              <div className="flex items-center gap-3 text-slate-500 font-medium">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span>Vendor & Driver</span>
              </div>
              <div className="font-bold text-slate-900">
                {selectedVendor ? `${selectedVendor} — ${selectedDriver || 'Assigned Driver'} (${selectedDriverVeh?.registration_number || 'N/A'})` : 'Default Vendor & Driver'}
              </div>
            </div>

            {/* Pickup Days */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3">
              <div className="flex items-center gap-3 text-slate-500 font-medium">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Pickup Days</span>
              </div>
              <div className="font-bold text-slate-800">
                {pickupDays.join(', ')}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-center pt-2">
          <button
            type="button"
            onClick={() => {
              if (onSuccess) onSuccess();
            }}
            className="py-3.5 px-8 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <ClipboardList className="w-4.5 h-4.5" />
            Back to Requests List
          </button>
        </div>

      </div>
    );
  }

  // Dynamic list built purely from backend subcategories & selected items (NO DUMMY DATA)
  const displaySubCats = (() => {
    const map = new Map();

    (allSubCategories || []).forEach(sub => {
      const id = sub.id || sub.subcategory_id;
      const name = sub.name || sub.sub_category_name || sub.subcategory_name || 'Sub-Category';
      const catName = sub.category?.name || sub.category?.category_name || sub.category_name || 'Waste Category';
      if (id) {
        map.set(String(id), {
          id,
          subcategory_id: id,
          name,
          subcategory_name: name,
          category_name: catName,
          original: sub
        });
      }
    });

    itemsPricing.forEach(item => {
      const id = item.subcategory_id || item.id;
      const name = item.subcategory_name || 'Sub-Category';
      const catName = item.category_name || 'Waste Category';
      if (id && !map.has(String(id))) {
        map.set(String(id), {
          id,
          subcategory_id: id,
          name,
          subcategory_name: name,
          category_name: catName
        });
      }
    });

    return Array.from(map.values());
  })();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full animate-in fade-in duration-200">

      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[12px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
            Lead ID: {selectedGroup.lead_id}
          </span>
          <div>
            <h2 className="text-[20px] font-bold text-slate-900 leading-tight">
              Book Waste Collection Order
            </h2>
            <span className="text-[12px] text-slate-500 font-medium">
              Generator: <strong className="text-slate-800 font-semibold">{firstReq.waste_generator_name || firstReq.customer_legal_name || 'N/A'}</strong>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[12px] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-300"
          title="Cancel Booking"
        >
          <X className="w-4 h-4 text-slate-500" />
          Cancel
        </button>
      </div>

      {/* SINGLE-PAGE FORM WITHOUT DOUBLE SCROLLBAR */}
      <form onSubmit={handleSubmit} className="p-5 space-y-5">

        {/* 1. Location Boundaries & Logistics Mapping */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
          <h3 className="text-[16px] font-bold text-slate-800 border-b border-slate-200 pb-2.5 flex items-center gap-2">
            <MapPin className="w-4.5 h-4.5 text-emerald-600" /> Location Boundaries & Logistics Mapping *
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Row 1: Corp, Zone, Ward */}
            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Corporation *</label>
              <select
                name="corporation_id"
                value={formData.corporation_id}
                onChange={handleChange}
                required
                className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="">Select Corp</option>
                {corporations.map(c => (
                  <option key={c.id} value={c.id}>{c.corporation_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Zone *</label>
              <select
                name="zone_id"
                value={formData.zone_id}
                onChange={handleChange}
                disabled={!formData.corporation_id}
                required
                className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:bg-slate-100 disabled:opacity-60"
              >
                <option value="">Select Zone</option>
                {zones.map(z => (
                  <option key={z.id} value={z.id}>{z.zone_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Ward *</label>
              <select
                name="ward_id"
                value={formData.ward_id}
                onChange={handleChange}
                disabled={!formData.zone_id}
                required
                className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:bg-slate-100 disabled:opacity-60"
              >
                <option value="">Select Ward</option>
                {wards.map(w => (
                  <option key={w.id} value={w.id}>{w.ward_name}</option>
                ))}
              </select>
            </div>

            {/* Row 2: Event, Vendor, Driver */}
            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Collection Event *</label>
              <select
                name="collection_event_id"
                value={formData.collection_event_id}
                onChange={handleChange}
                disabled={!formData.ward_id}
                required
                className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:bg-slate-100 disabled:opacity-60"
              >
                <option value="">Select Event</option>
                {collectionEvents.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.event_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Vendor *</label>
              <select
                name="vendor_id"
                value={formData.vendor_id}
                onChange={handleChange}
                required
                className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="">Select Vendor</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Driver & Vehicle *</label>
              <select
                name="driver_id"
                value={formData.driver_id}
                onChange={handleChange}
                disabled={!formData.vendor_id}
                required
                className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:bg-slate-100 disabled:opacity-60"
              >
                <option value="">Select Driver</option>
                {filteredDrivers.map(d => {
                  const veh = d.driverVehicles && d.driverVehicles[0];
                  const vehText = veh ? ` (${veh.registration_number})` : '';
                  return (
                    <option key={d.id} value={d.id}>{d.name}{vehText}</option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Company Details */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
          <h3 className="text-[16px] font-bold text-slate-800 border-b border-slate-200 pb-2.5 flex items-center gap-2">
            <Building className="w-4.5 h-4.5 text-emerald-600" /> Company Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Row 1 */}
            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Site Request *</label>
              <select name="site_request" value={formData.site_request} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-800 outline-none">
                <option value="Commercial Onsite">Commercial Onsite</option>
                <option value="Commercial Route">Commercial Route</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Service Center *</label>
              <select name="service_center_type" value={formData.service_center_type} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-800 outline-none">
                <option value="Ecosphere">Ecosphere</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Employee Name</label>
              <input
                type="text"
                name="employee_name"
                value={formData.employee_name}
                readOnly
                disabled
                className="w-full bg-slate-100 border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-600 cursor-not-allowed"
                title="Employee name coming from logged in profile"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Billing Type *</label>
              <select name="billing_type" value={formData.billing_type} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-800 outline-none">
                <option value="Head Office">Head Office</option>
                <option value="Regional Office">Regional Office</option>
                <option value="Branch Office">Branch Office</option>
              </select>
            </div>

            {/* Row 2 */}
            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Business Region *</label>
              <select name="business_region" value={formData.business_region} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-800 outline-none">
                <option value="">Select Region</option>
                {Array.from(new Set(businessRegions.map(r => r.region_name || r.state))).filter(Boolean).map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Sub Region *</label>
              <select name="business_sub_region" value={formData.business_sub_region} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-800 outline-none">
                <option value="">Select Sub Region</option>
                {businessSubRegions.map(sub => (
                  <option key={sub.id} value={sub.sub_region_name || sub.name}>{sub.sub_region_name || sub.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Branch Code</label>
              <input type="text" name="branch_code" value={formData.branch_code} readOnly className="w-full bg-slate-100 border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-600 cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Business Lead *</label>
              <select name="business_lead" value={formData.business_lead} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-800 outline-none">
                <option value="Exhibition">Exhibition</option>
                <option value="Web Lead">Web Lead</option>
                <option value="Service Lead">Service Lead</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Sub-Category Dynamic Multiselect Box & Dropdown (Matching Edit Form UI) */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-3 relative" ref={dropdownRef}>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
              <Tag className="w-4.5 h-4.5 text-emerald-600" /> Waste Sub-Categories Selection *
            </h3>
            <span className="text-[12px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              {itemsPricing.length} Selected
            </span>
          </div>

          <label className="block text-[12px] font-semibold text-slate-600 uppercase">
            Sub-Category (Click input box to select from dynamic backend dropdown):
          </label>

          <div className="relative">
            {/* Input Box Container */}
            <div
              onClick={() => setIsDropdownOpen(prev => !prev)}
              className="min-h-[50px] bg-white border border-slate-300 hover:border-emerald-500 rounded-xl p-2.5 flex flex-wrap gap-2 items-center cursor-pointer select-none transition-all focus-within:ring-2 focus-within:ring-emerald-500/20"
            >
              {itemsPricing.length === 0 ? (
                <span className="text-sm text-slate-400 pl-2">Select subcategories...</span>
              ) : (
                itemsPricing.map((item) => (
                  <span
                    key={item.subcategory_id || item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveWasteItem(item.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-2xs"
                  >
                    <span className="font-bold text-[14px]">×</span>
                    {item.subcategory_name}
                  </span>
                ))
              )}
              <div className="ml-auto text-slate-400 pr-2 text-xs">▼</div>
            </div>

            {/* Dropdown Menu matching Edit form */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                {displaySubCats.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-400 text-center">Loading subcategories...</div>
                ) : (
                  displaySubCats.map((sub) => {
                    const subId = sub.subcategory_id || sub.id;
                    const isIncluded = itemsPricing.some(item => String(item.subcategory_id) === String(subId));

                    return (
                      <div
                        key={subId}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSubCategoryItem(sub);
                        }}
                        className={`px-4 py-2.5 text-sm font-medium cursor-pointer hover:bg-slate-50 flex items-center justify-between transition-colors ${isIncluded ? 'text-emerald-700 bg-emerald-50/60 font-bold' : 'text-slate-700'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">[{sub.category_name}]</span>
                          <span>{sub.name || sub.subcategory_name}</span>
                        </div>
                        {isIncluded && (
                          <span className="text-emerald-600 font-extrabold text-base">✓</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* 4. Waste Items & Pricing Cards with Soft Linear Gradients per Category */}
        <div className="space-y-4">
          {itemsPricing.map((item) => {
            const expectedDaily = parseFloat(item.expected_waste) || 0;
            const agreedRate = parseFloat(item.agreed_price) || 0;
            const bulkMonthlyRate = parseFloat(item.bulk_monthly_price) || 0;

            const estMonthlyWaste = expectedDaily * 30;
            const estYearlyWaste = expectedDaily * 365;
            const estMonthlyPrice = item.pricing_mode === 'Bulk' ? bulkMonthlyRate : (expectedDaily * agreedRate * 30);
            const estYearlyPrice = item.pricing_mode === 'Bulk' ? (bulkMonthlyRate * 12) : (expectedDaily * agreedRate * 365);

            // Dynamic Category Theme Colors
            const theme = getCategoryColorTheme(item.category_name);

            // Clean suggested price string
            const formattedSuggestedPrice = item.pricing_mode === 'Bulk'
              ? `₹${parseFloat(item.bulk_monthly_price || 15000).toLocaleString('en-IN')}/Month`
              : `₹${parseFloat(item.suggested_price || 10).toFixed(2)}/KG`;

            return (
              <div
                key={item.id}
                className={`${theme.bgGradient} border ${theme.border} rounded-2xl p-4.5 space-y-3.5 shadow-2xs transition-all`}
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${theme.badgeBg} border px-2.5 py-0.5 rounded-md`}>
                      {item.category_name}
                    </span>
                    <h4 className="text-[15px] font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className={`w-4 h-4 ${theme.accentText}`} /> {item.subcategory_name}
                    </h4>
                  </div>

                  {itemsPricing.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveWasteItem(item.id)}
                      className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Remove Waste Item"
                    >
                      <Trash2 className="w-4 h-4" /> Remove Item
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Row 1 */}
                  <div>
                    <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Billing Type</label>
                    <select
                      value={item.pricing_mode}
                      onChange={e => handleItemPricingChange(item.id, 'pricing_mode', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-800 outline-none cursor-pointer"
                    >
                      <option value="KG">KG</option>
                      <option value="Bulk">Bulk</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Variation</label>
                    <select
                      value={item.variation_name}
                      onChange={e => handleItemPricingChange(item.id, 'variation_name', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-800 outline-none cursor-pointer"
                    >
                      <option value={item.variation_name}>{item.variation_name}</option>
                    </select>
                  </div>

                  {item.pricing_mode === 'Bulk' ? (
                    <div>
                      <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Monthly Price *</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.bulk_monthly_price}
                          onChange={e => handleItemPricingChange(item.id, 'bulk_monthly_price', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-3 pr-8 text-[14px] font-semibold text-slate-800 outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400">₹</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Expected Waste (KG/Day) *</label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={item.expected_waste}
                        onChange={e => handleItemPricingChange(item.id, 'expected_waste', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-800 outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
                  {item.pricing_mode === 'Bulk' ? (
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Suggested Price</label>
                      <input type="text" disabled value={formattedSuggestedPrice} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-500 cursor-not-allowed" />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Agreed Price *</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.agreed_price}
                            onChange={e => handleItemPricingChange(item.id, 'agreed_price', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-3 pr-12 text-[14px] font-semibold text-slate-800 outline-none"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400">₹/KG</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Suggested Price</label>
                        <input type="text" disabled value={formattedSuggestedPrice} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-500 cursor-not-allowed" />
                      </div>
                    </>
                  )}

                  <div className="bg-white/90 border border-slate-200 rounded-xl p-3 flex flex-col justify-center shadow-2xs">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Est. Revenue</span>
                    <span className={`text-[14px] font-bold ${theme.accentText}`}>
                      ₹{estMonthlyPrice.toLocaleString('en-IN')}/mo (₹{estYearlyPrice.toLocaleString('en-IN')}/yr)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5. Price Section */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
          <h3 className="text-[16px] font-bold text-slate-800 border-b border-slate-200 pb-2.5 flex items-center gap-2">
            <ClipboardCheck className="w-4.5 h-4.5 text-emerald-600" /> Price Section
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Row 1 */}
            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Total Order Value</label>
              <input type="text" readOnly value={`₹${parseFloat(formData.total_order_value || 0).toLocaleString('en-IN')}`} className="w-full bg-slate-100 border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-700 cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">SEZ Zone</label>
              <select name="sez" value={formData.sez} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-800 outline-none">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Taxability / GST</label>
              <select
                name="taxibility"
                disabled={formData.sez === 'Yes'}
                value={formData.taxibility}
                onChange={handleChange}
                className={`w-full border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold ${formData.sez === 'Yes' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-800 outline-none'}`}
              >
                <option value="0.00 %">0.00 %</option>
                <option value="5.00 %">5.00 %</option>
                <option value="12.00 %">12.00 %</option>
                <option value="18.00 %">18.00 %</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Discount (Yearly)</label>
              <input type="number" name="discount" min="0" step="any" value={formData.discount} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-800 outline-none" />
            </div>

            {/* Row 2 */}
            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">CGST</label>
              <input type="text" readOnly value={`₹${parseFloat(formData.cgst || 0).toLocaleString('en-IN')}`} className="w-full bg-slate-100 border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-700 cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">SGST</label>
              <input type="text" readOnly value={`₹${parseFloat(formData.sgst || 0).toLocaleString('en-IN')}`} className="w-full bg-slate-100 border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-700 cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">GST Amount</label>
              <input type="text" readOnly value={`₹${parseFloat(formData.gst_amount || 0).toLocaleString('en-IN')}`} className="w-full bg-slate-100 border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-700 cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Final Price (Yearly)</label>
              <input type="text" readOnly value={`₹${parseFloat(formData.final_price || 0).toLocaleString('en-IN')}`} className="w-full bg-emerald-50 border border-emerald-300 rounded-xl py-2 px-3 text-[14px] font-bold text-emerald-800 cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* 6. Pickup Schedule & Documents */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
          <h3 className="text-[16px] font-bold text-slate-800 border-b border-slate-200 pb-2.5 flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-emerald-600" /> Pickup Schedule & Documents
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Preferred Pickup Date */}
            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Preferred Pickup Date *</label>
              <input
                type="date"
                name="pickup_date"
                required
                value={formData.pickup_date}
                onChange={handleChange}
                className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-800 outline-none cursor-pointer"
              />
            </div>

            {/* Preferred Pickup Time Slot */}
            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Preferred Pickup Time *</label>
              <select
                name="pickup_time"
                value={formData.pickup_time || formData.time_slot_id}
                onChange={e => handleTimeSlotSelect(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="">Select Time Slot</option>
                {timeSlots.map(slot => {
                  const label = `${slot.start_time_formatted} - ${slot.end_time_formatted}${slot.slot_name ? ` (${slot.slot_name})` : ''}`;
                  return (
                    <option key={slot.id} value={label}>{label}</option>
                  );
                })}
              </select>
            </div>

            {/* Pickup Notes */}
            <div>
              <label className="block text-[12px] font-medium text-slate-600 uppercase mb-1">Pickup Notes</label>
              <input
                type="text"
                name="pickup_notes"
                value={formData.pickup_notes}
                onChange={handleChange}
                placeholder="Driver instructions or notes..."
                className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[14px] font-medium text-slate-800 outline-none"
              />
            </div>
          </div>

          {/* 7 Days Checkboxes for Pickup Schedule (Sleek Emerald Pills) */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[12px] font-medium text-slate-600 uppercase">
                Pickup Days (7 Days Selection) *
              </label>
              <button
                type="button"
                onClick={toggleAllDays}
                className="text-[12px] font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                {pickupDays.length === 7 ? 'Deselect All' : 'Select All 7 Days'}
              </button>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {ALL_DAYS.map(day => {
                const checked = pickupDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer select-none flex items-center gap-2 border ${checked
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-2xs font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-slate-100'
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${checked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Document Uploads with Image Previews and File Names Below */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <label className="block text-[12px] font-medium text-slate-600 uppercase">Document Uploads & Live Previews</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* MOM Copy */}
              <div className="space-y-2">
                <label className="block text-[12px] font-medium text-slate-700">MOM Copy (Minutes of Meeting)</label>
                <div className="relative border-2 border-dashed border-slate-300 hover:border-emerald-600 bg-white rounded-xl p-3 flex flex-col items-center justify-center text-center transition-colors min-h-[160px]">
                  {momPreview ? (
                    <div className="w-full flex flex-col items-center gap-2 p-1">
                      <img src={momPreview} alt="MOM Preview" className="max-h-36 max-w-full object-contain rounded-xl border border-slate-200 shadow-xs p-1 bg-white mx-auto" />
                      <div className="flex items-center justify-center gap-2 w-full">
                        <span className="text-[12px] font-bold text-slate-800 break-all text-center px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200">{momFile?.name}</span>
                        <button type="button" onClick={() => { setMomFile(null); setMomPreview(null); }} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Remove Uploaded Image">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (momFile || existingMomFile) ? (
                    <div className="w-full flex flex-col items-center gap-2 p-1">
                      <FileText className="w-10 h-10 text-emerald-600 mb-1" />
                      <span className="text-[12px] font-bold text-slate-800 break-all text-center px-2 py-1 bg-slate-100 rounded-md border border-slate-200">{momFile ? momFile.name : existingMomFile.split('/').pop()}</span>
                      <div className="flex items-center gap-2">
                        {momFile ? (
                          <button type="button" onClick={() => setMomFile(null)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <Trash2 className="w-4 h-4" /> Remove
                          </button>
                        ) : (
                          <a href={`${IMAGE_BASE_URL}/${existingMomFile}`} target="_blank" rel="noreferrer" className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <Eye className="w-4 h-4" /> View Document
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-center">
                      <UploadCloud className="w-8 h-8 text-emerald-600 mb-1.5 opacity-80" />
                      <span className="text-[12px] font-semibold text-slate-700">Click to Upload MOM Copy</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">PDF / Image</span>
                      <input type="file" accept=".pdf,image/*" onChange={e => handleFileUpload(e, 'mom')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  )}
                </div>
              </div>

              {/* PO Copy */}
              <div className="space-y-2">
                <label className="block text-[12px] font-medium text-slate-700">PO Copy (Purchase Order)</label>
                <div className="relative border-2 border-dashed border-slate-300 hover:border-emerald-600 bg-white rounded-xl p-3 flex flex-col items-center justify-center text-center transition-colors min-h-[160px]">
                  {poPreview ? (
                    <div className="w-full flex flex-col items-center gap-2 p-1">
                      <img src={poPreview} alt="PO Preview" className="max-h-36 max-w-full object-contain rounded-xl border border-slate-200 shadow-xs p-1 bg-white mx-auto" />
                      <div className="flex items-center justify-center gap-2 w-full">
                        <span className="text-[12px] font-bold text-slate-800 break-all text-center px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200">{poFile?.name}</span>
                        <button type="button" onClick={() => { setPoFile(null); setPoPreview(null); }} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Remove Uploaded Image">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (poFile || existingPoFile) ? (
                    <div className="w-full flex flex-col items-center gap-2 p-1">
                      <FileText className="w-10 h-10 text-emerald-600 mb-1" />
                      <span className="text-[12px] font-bold text-slate-800 break-all text-center px-2 py-1 bg-slate-100 rounded-md border border-slate-200">{poFile ? poFile.name : existingPoFile.split('/').pop()}</span>
                      <div className="flex items-center gap-2">
                        {poFile ? (
                          <button type="button" onClick={() => setPoFile(null)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <Trash2 className="w-4 h-4" /> Remove
                          </button>
                        ) : (
                          <a href={`${IMAGE_BASE_URL}/${existingPoFile}`} target="_blank" rel="noreferrer" className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <Eye className="w-4 h-4" /> View Document
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-center">
                      <UploadCloud className="w-8 h-8 text-emerald-600 mb-1.5 opacity-80" />
                      <span className="text-[12px] font-semibold text-slate-700">Click to Upload PO Copy</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">PDF / Image</span>
                      <input type="file" accept=".pdf,image/*" onChange={e => handleFileUpload(e, 'po')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  )}
                </div>
              </div>

              {/* Email Copy */}
              <div className="space-y-2">
                <label className="block text-[12px] font-medium text-slate-700">Email Confirmation Copy</label>
                <div className="relative border-2 border-dashed border-slate-300 hover:border-emerald-600 bg-white rounded-xl p-3 flex flex-col items-center justify-center text-center transition-colors min-h-[160px]">
                  {emailCopyPreview ? (
                    <div className="w-full flex flex-col items-center gap-2 p-1">
                      <img src={emailCopyPreview} alt="Email Copy Preview" className="max-h-36 max-w-full object-contain rounded-xl border border-slate-200 shadow-xs p-1 bg-white mx-auto" />
                      <div className="flex items-center justify-center gap-2 w-full">
                        <span className="text-[12px] font-bold text-slate-800 break-all text-center px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200">{emailCopyFile?.name}</span>
                        <button type="button" onClick={() => { setEmailCopyFile(null); setEmailCopyPreview(null); }} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Remove Uploaded Image">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (emailCopyFile || existingEmailFile) ? (
                    <div className="w-full flex flex-col items-center gap-2 p-1">
                      <FileText className="w-10 h-10 text-emerald-600 mb-1" />
                      <span className="text-[12px] font-bold text-slate-800 break-all text-center px-2 py-1 bg-slate-100 rounded-md border border-slate-200">{emailCopyFile ? emailCopyFile.name : existingEmailFile.split('/').pop()}</span>
                      <div className="flex items-center gap-2">
                        {emailCopyFile ? (
                          <button type="button" onClick={() => setEmailCopyFile(null)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <Trash2 className="w-4 h-4" /> Remove
                          </button>
                        ) : (
                          <a href={`${IMAGE_BASE_URL}/${existingEmailFile}`} target="_blank" rel="noreferrer" className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <Eye className="w-4 h-4" /> View Document
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-center">
                      <UploadCloud className="w-8 h-8 text-emerald-600 mb-1.5 opacity-80" />
                      <span className="text-[12px] font-semibold text-slate-700">Click to Upload Email Copy</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">PDF / Image</span>
                      <input type="file" accept=".pdf,image/*" onChange={e => handleFileUpload(e, 'email')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 bg-slate-50 p-4 rounded-2xl border">
          <div className="flex items-center gap-4 text-[12px] font-semibold">
            <div>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Final Order Value (Total)</span>
              <span className="text-2xl font-black text-emerald-900 font-mono tracking-tight drop-shadow-sm">
                ₹{parseFloat(formData.final_price || 0).toLocaleString('en-IN')}
              </span>
            </div>
            {selectedVendor && (
              <div className="hidden sm:block border-l border-slate-700/80 pl-5">
                <span className="text-[12px] font-bold text-black-400 uppercase tracking-wider block">Logistics Partner & Driver</span>
                <span className="text-sm font-semibold text-slate-400">{selectedVendor} {selectedDriver ? `(${selectedDriver})` : ''}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="py-2.5 px-5 bg-white hover:bg-slate-100 text-slate-700 text-[12px] font-semibold rounded-xl transition-colors cursor-pointer border border-slate-300"
            >
              Cancel Booking
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-3 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Booking Order…
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Confirm & Book Order Now
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
