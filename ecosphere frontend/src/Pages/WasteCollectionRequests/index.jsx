import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, Image as ImageIcon, CheckCircle, CheckCircle2, Trash2, Calendar, Clock,
  User, Phone, Mail, MapPin, Building, ShieldCheck, ClipboardCheck, FileText, ArrowLeft,
  Info, ExternalLink, Copy
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

export default function WasteCollectionRequests() {
  const [subcategoryCards, setSubcategoryCards] = useState([]);
  const [openDropdownCategoryId, setOpenDropdownCategoryId] = useState(null);
  const [activeTab, setActiveTab] = useState('B2B');
  const [businessRegions, setBusinessRegions] = useState([]);
  const [businessSubRegions, setBusinessSubRegions] = useState([]);

  // Toast / Alert notification state
  const [toastMsg, setToastMsg] = useState({ type: '', message: '' });
  const showToast = (message, type = 'error') => {
    setToastMsg({ type, message });
    setTimeout(() => setToastMsg({ type: '', message: '' }), 5000);
  };

  const [formData, setFormData] = useState({
    // Section 1: Customer Details
    mobile_number: '',
    email: '',

    // Section 2: Property Details
    address_search: '',
    latitude: '',
    longitude: '',
    waste_generator_name: '',
    complete_address: '',
    area_sqm: '',
    no_of_dwelling_units: '',

    // Section 4: License Details
    registered_rwa: '',
    gst: '',
    pan: '',
    trade_license: '',

    // Section 5: Additional Details
    pickup_notes: '',
    pickup_date: '',
    pickup_time: '',
    time_slot_id: '',

    // New B2B / reference fields
    site_request: '',
    service_center_type: '',
    employee_name: '',
    billing_type: '',
    business_region: '',
    business_sub_region: '',
    branch_code: '',
    business_lead: 'Web Lead',
    customer_legal_name: '',
    customer_trade_name: '',
    contact_person: '',
    designation: '',
    phone_number_2: '',
    email_2: '',
    google_map_link: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    billing_address_different: false,
    billing_customer_legal_name: '',
    billing_customer_trade_name: '',
    billing_contact_person: '',
    billing_designation: '',
    billing_phone_number_1: '',
    billing_phone_number_2: '',
    billing_email: '',
    billing_email_2: '',
    billing_gstn: '',
    billing_complete_address: '',
    billing_others: '',
    billing_city: '',
    billing_state: '',
    billing_pincode: '',
    billing_landmark: '',
    billing_country: '',
    audit_requirement: 'Required',
    technician_assign: 'Required',
    technician: '',
    total_order_value: 0,
    total_yearly_amount: 0,
    discount: 0,
    discounted_price: 0,
    sez: 'No',
    taxibility: '0.00',
    sector: '',
    cgst: 0,
    sgst: 0,
    gst_amount: 0,
    final_price: 0,
    occupied_flats: ''
  });

  const navigate = useNavigate();

  // Auto-generate B2B branch code
  useEffect(() => {
    if (!formData.branch_code) {
      const code = "BR-" + Math.floor(100000 + Math.random() * 900000);
      setFormData(prev => ({ ...prev, branch_code: code }));
    }
  }, []);

  const [rwaFile, setRwaFile] = useState(null);
  const [gstFile, setGstFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [tradeLicenseFile, setTradeLicenseFile] = useState(null);

  // Calculate pricing fields dynamically for B2B Others section
  useEffect(() => {
    const activeCards = subcategoryCards.filter(c => c.included);
    let totalMonthly = 0;
    let totalYearly = 0;
    activeCards.forEach(card => {
      if (card.pricing_mode === 'Bulk') {
        totalMonthly += parseFloat(card.bulk_monthly_price || 0);
        totalYearly += parseFloat(card.bulk_yearly_price || 0);
      } else {
        const selectedVar = (card.variations || []).find(v => v.id == card.selected_variation_id);
        const price = parseFloat(card.custom_price) || (selectedVar ? parseFloat(selectedVar.per_kg_price || 0) : 0);
        const waste = parseFloat(card.expected_waste) || 0;
        totalMonthly += price * waste * 30;
        totalYearly += price * waste * 365;
      }
    });

    const totalYearlyVal = parseFloat(totalYearly.toFixed(2));
    const yearlyDiscountVal = parseFloat(formData.discount || 0);
    const yearlyDiscountedPrice = Math.max(0, totalYearlyVal - yearlyDiscountVal);
    const taxRate = formData.sez === 'Yes' ? 0 : (parseFloat(formData.taxibility || 0) / 100);

    const gstVal = parseFloat((totalYearlyVal * taxRate).toFixed(2));
    const cgstVal = parseFloat((gstVal / 2).toFixed(2));
    const sgstVal = parseFloat((gstVal / 2).toFixed(2));
    const finalPriceVal = parseFloat((yearlyDiscountedPrice + gstVal).toFixed(2));

    setFormData(prev => ({
      ...prev,
      total_order_value: totalYearlyVal,
      total_yearly_amount: totalYearlyVal,
      discounted_price: parseFloat(yearlyDiscountedPrice.toFixed(2)),
      cgst: cgstVal,
      sgst: sgstVal,
      gst_amount: gstVal,
      final_price: finalPriceVal
    }));
  }, [subcategoryCards, formData.discount, formData.taxibility, formData.sez]);

  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [generatedLeadId, setGeneratedLeadId] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // T&C state — shown first before the form
  const [tncAccepted, setTncAccepted] = useState(false);
  const [tncBoxes, setTncBoxes] = useState({
    tnc_agree: false,
    accuracy_agree: false,
    copyright_agree: false,
    promo_agree: false,
  });

  const handleTncAccept = async () => {
    const allChecked = Object.values(tncBoxes).every(Boolean);
    if (!allChecked) {
      showToast("Please accept all terms and conditions to continue.", "error");
      return;
    }
    setTncAccepted(true);
  };

  const renderDocumentUploadField = (file, setFile, title = "Upload Document", accept = ".pdf,image/*", containerId = "") => {
    const isNewImage = file && (file.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name));
    const newPreviewUrl = file ? URL.createObjectURL(file) : '';

    return (
      <div id={containerId} className="relative w-full h-36 border border-slate-200 rounded-2xl bg-slate-50/50 overflow-hidden group transition-all">
        {file ? (
          <div className="w-full h-full relative opacity-100">
            {isNewImage ? (
              <img src={newPreviewUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-50 text-center">
                <FileText className="w-10 h-10 text-rose-500 mb-2 animate-bounce" />
                <span className="text-xs font-bold text-slate-700 truncate max-w-[90%]">{file.name}</span>
                <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">PDF Document</span>
              </div>
            )}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.open(newPreviewUrl, '_blank')}
                className="px-3.5 py-2 bg-white/95 hover:bg-white text-slate-800 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                View Document
              </button>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full border-2 border-dashed border-slate-200 hover:border-violet-400 transition-all flex flex-col items-center justify-center cursor-pointer text-slate-400 p-4">
            <ImageIcon className="w-6 h-6 mb-2 opacity-50 text-slate-400" />
            <span className="text-xs font-bold text-slate-500">{title}</span>
            <span className="text-[10px] text-slate-400 mt-1">Image or PDF (Max 5MB)</span>
            <input
              type="file"
              accept={accept}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        )}
      </div>
    );
  };

  // Google Map refs
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const mapDivRef = useRef(null);

  // ── Effect 1: Load the Google Maps script ────────────
  useEffect(() => {
    if (!document.getElementById('google-maps-script')) {
      const script = document.createElement('script');
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || 'AIzaSyBmaR3DSseRPUCCvGT0Ru8aK-Jrm39NlTE';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.id = 'google-maps-script';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // ── Effect 2: Init map once T&C accepted ────────
  useEffect(() => {
    if (!tncAccepted) return;

    const DEFAULT_LAT = 20.5937;
    const DEFAULT_LNG = 78.9629;

    const initMap = () => {
      if (!mapDivRef.current || mapInstanceRef.current) return;

      const map = new window.google.maps.Map(mapDivRef.current, {
        center: { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
        zoom: 5,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER
        },
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] }
        ]
      });
      mapInstanceRef.current = map;

      const marker = new window.google.maps.Marker({
        map,
        position: { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        title: 'Drag to adjust location'
      });
      markerRef.current = marker;

      marker.addListener('dragend', () => {
        const pos = marker.getPosition();
        const lat = pos.lat().toFixed(6);
        const lng = pos.lng().toFixed(6);

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: pos }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const addr = results[0].formatted_address;
            let parsedCity = '';
            let parsedState = '';
            let parsedPincode = '';
            let parsedCountry = '';
            let parsedLandmark = '';

            if (results[0].address_components) {
              for (const comp of results[0].address_components) {
                const types = comp.types;
                if (types.includes('locality') || types.includes('sublocality') || types.includes('administrative_area_level_2')) {
                  parsedCity = comp.long_name;
                }
                if (types.includes('administrative_area_level_1')) {
                  parsedState = comp.long_name;
                }
                if (types.includes('postal_code')) {
                  parsedPincode = comp.long_name;
                }
                if (types.includes('country')) {
                  parsedCountry = comp.long_name;
                }
                if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
                  parsedLandmark = comp.long_name;
                }
              }
            }

            setFormData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              complete_address: addr,
              address_search: addr,
              city: parsedCity || prev.city,
              state: parsedState || prev.state,
              pincode: parsedPincode || prev.pincode,
              country: parsedCountry || prev.country,
              landmark: parsedLandmark || prev.landmark
            }));
          } else {
            setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
          }
        });
      });

    };

    const waitForGoogle = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setTimeout(initMap, 50);
      } else {
        setTimeout(waitForGoogle, 100);
      }
    };
    waitForGoogle();

  }, [tncAccepted]);

  // ── Effect 3: Bind Autocomplete to input dynamically ──────────────────────────
  useEffect(() => {
    if (!tncAccepted) return;

    let autocompleteInstance = null;

    const setupAutocomplete = () => {
      const searchInput = document.getElementById('mapSearchInput');
      if (!searchInput || !window.google || !window.google.maps || !window.google.maps.places) return;

      const autocomplete = new window.google.maps.places.Autocomplete(searchInput, {
        types: ['geocode', 'establishment']
      });
      autocompleteInstance = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat().toFixed(6);
          const lng = place.geometry.location.lng().toFixed(6);
          const addr = place.formatted_address || '';
          const newPos = { lat: parseFloat(lat), lng: parseFloat(lng) };

          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(newPos);
            mapInstanceRef.current.setZoom(16);
          }
          if (markerRef.current) {
            markerRef.current.setPosition(newPos);
            markerRef.current.setAnimation(window.google.maps.Animation.DROP);
          }

          let parsedCity = '';
          let parsedState = '';
          let parsedPincode = '';
          let parsedCountry = '';
          let parsedLandmark = '';

          if (place.address_components) {
            for (const comp of place.address_components) {
              const types = comp.types;
              if (types.includes('locality') || types.includes('sublocality') || types.includes('administrative_area_level_2')) {
                parsedCity = comp.long_name;
              }
              if (types.includes('administrative_area_level_1')) {
                parsedState = comp.long_name;
              }
              if (types.includes('postal_code')) {
                parsedPincode = comp.long_name;
              }
              if (types.includes('country')) {
                parsedCountry = comp.long_name;
              }
              if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
                parsedLandmark = comp.long_name;
              }
            }
          }

          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            complete_address: addr,
            address_search: addr,
            city: parsedCity || prev.city,
            state: parsedState || prev.state,
            pincode: parsedPincode || prev.pincode,
            country: parsedCountry || prev.country,
            landmark: parsedLandmark || prev.landmark
          }));
        }
      });
    };

    const interval = setInterval(() => {
      const searchInput = document.getElementById('mapSearchInput');
      if (searchInput && window.google && window.google.maps && window.google.maps.places) {
        setupAutocomplete();
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (autocompleteInstance) {
        window.google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [activeTab, tncAccepted]);

  // Fetch Sub Categories on mount
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const res = await api.get('/public/sub-categories', { params: { limit: 200, status: 1 } });
        const allSubCats = res.data.subCategories || res.data.data || [];

        const cards = allSubCats.map(sc => {
          return {
            subcategory_id: sc.id,
            subcategory_name: sc.name,
            category_name: sc.category?.name || 'Waste Category',
            category_id: sc.category_id,
            color: sc.color || '#6366f1',
            variations: sc.variations || [],
            selected_variation_id: '',
            expected_waste: '',
            included: false,
            pricing_mode: 'KG',
            bulk_monthly_price: '',
            bulk_yearly_price: ''
          };
        });
        setSubcategoryCards(cards);
      } catch (err) {
        console.error("Failed to load subcategories:", err);
      }
    };
    fetchSubCategories();
  }, []);

  // Fetch Active Business Regions on mount
  useEffect(() => {
    const fetchActiveRegions = async () => {
      try {
        const res = await api.get('/public/business-regions', { params: { status: 'Active', limit: 1000 } });
        setBusinessRegions(res.data.businessRegions || []);
      } catch (err) {
        console.error("Failed to load business regions:", err);
      }
    };
    fetchActiveRegions();
  }, []);

  // Handle Toggle Include/Exclude for a subcategory card
  const handleToggleInclude = (subcatId) => {
    setSubcategoryCards(prev => prev.map(card => {
      if (card.subcategory_id === subcatId) {
        const nextIncluded = !card.included;
        const defaultVar = card.variations?.[0] || null;
        return {
          ...card,
          included: nextIncluded,
          selected_variation_id: nextIncluded
            ? (card.selected_variation_id || (defaultVar ? defaultVar.id : ''))
            : '',
          custom_price: nextIncluded
            ? (card.custom_price || (defaultVar ? defaultVar.per_kg_price?.toString() || '' : ''))
            : '',
          expected_waste: nextIncluded ? card.expected_waste : ''
        };
      }
      return card;
    }));
  };

  // Handle variation selection in a card
  const handleSelectVariation = (subcatId, varId) => {
    setSubcategoryCards(prev => prev.map(card => {
      if (card.subcategory_id === subcatId) {
        const numericVarId = varId ? Number(varId) : '';
        const selectedVar = (card.variations || []).find(v => v.id == numericVarId) || null;
        return {
          ...card,
          selected_variation_id: numericVarId,
          custom_price: selectedVar ? selectedVar.per_kg_price?.toString() || '' : '',
          bulk_monthly_price: selectedVar ? selectedVar.bulk_price?.toString() || '' : '',
          bulk_yearly_price: selectedVar ? (parseFloat(selectedVar.bulk_price || 0) * 12).toString() || '' : ''
        };
      }
      return card;
    }));
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleCloseDropdown = () => {
      setOpenDropdownCategoryId(null);
    };
    window.addEventListener('click', handleCloseDropdown);
    return () => window.removeEventListener('click', handleCloseDropdown);
  }, []);

  // Handle expected waste input change
  const handleCardWasteChange = (subcatId, val) => {
    setSubcategoryCards(prev => prev.map(card => {
      if (card.subcategory_id === subcatId) {
        return {
          ...card,
          expected_waste: val
        };
      }
      return card;
    }));
  };

  // Handle custom price change in a card
  const handleCardPriceChange = (subcatId, val) => {
    setSubcategoryCards(prev => prev.map(card => {
      if (card.subcategory_id === subcatId) {
        return {
          ...card,
          custom_price: val
        };
      }
      return card;
    }));
  };

  const handleCardPricingModeChange = (subcatId, mode) => {
    setSubcategoryCards(prev => prev.map(card => {
      if (card.subcategory_id === subcatId) {
        const selectedVar = (card.variations || []).find(v => v.id == card.selected_variation_id) || null;
        return {
          ...card,
          pricing_mode: mode,
          bulk_monthly_price: mode === 'Bulk' && selectedVar ? (selectedVar.bulk_price?.toString() || '') : card.bulk_monthly_price,
          bulk_yearly_price: mode === 'Bulk' && selectedVar ? ((parseFloat(selectedVar.bulk_price || 0) * 12).toString() || '') : card.bulk_yearly_price
        };
      }
      return card;
    }));
  };

  const handleCardBulkPriceChange = (subcatId, field, val) => {
    setSubcategoryCards(prev => prev.map(card => {
      if (card.subcategory_id === subcatId) {
        if (field === 'bulk_monthly_price') {
          const monthlyPrice = parseFloat(val) || 0;
          return {
            ...card,
            bulk_monthly_price: val,
            bulk_yearly_price: val ? (monthlyPrice * 12).toFixed(2).replace(/\.00$/, '') : ''
          };
        }
        return {
          ...card,
          [field]: val
        };
      }
      return card;
    }));
  };

  const fetchActiveTimeSlots = async (date) => {
    setLoadingSlots(true);
    try {
      const res = await api.get('/public/time-slots/active', { params: { date } });
      if (res.data.success) {
        setTimeSlots(res.data.slots || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (formData.pickup_date) {
      fetchActiveTimeSlots(formData.pickup_date);
    } else {
      setTimeSlots([]);
    }
  }, [formData.pickup_date]);

  const handleRegionChange = async (e) => {
    const selectedRegionName = e.target.value;
    setFormData(prev => ({
      ...prev,
      business_region: selectedRegionName,
      business_sub_region: ''
    }));

    if (!selectedRegionName || selectedRegionName === 'Business Region' || selectedRegionName === '') {
      setBusinessSubRegions([]);
      return;
    }

    const regObj = businessRegions.find(r => (r.region_name || r.state) === selectedRegionName);
    if (!regObj) {
      setBusinessSubRegions([]);
      return;
    }

    try {
      const res = await api.get(`/public/business-regions/${regObj.id}/sub-regions`);
      setBusinessSubRegions(res.data.businessSubRegions || []);
    } catch (err) {
      console.error("Failed to load business sub regions:", err);
      setBusinessSubRegions([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    // Clear per-field error when user starts correcting
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Per-field validation — returns an errors object
  const validateForm = () => {
    const errors = {};

    if (!formData.customer_legal_name?.trim()) {
      errors.customer_legal_name = 'Customer Legal Name is required.';
    }
    if (!formData.contact_person?.trim()) {
      errors.contact_person = 'Contact Person is required.';
    }
    if (!formData.mobile_number?.trim()) {
      errors.mobile_number = 'Mobile Number is required.';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile_number.trim())) {
      errors.mobile_number = 'Enter a valid 10-digit Indian mobile number.';
    }
    if (!formData.email?.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (!formData.address_search?.trim() && !formData.complete_address?.trim()) {
      errors.address_search = 'Address / Location is required.';
      errors.complete_address = 'Address / Location is required.';
    }

    return errors;
  };

  // Submit Request
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setToastMsg({ type: '', message: '' });

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Also show the first error as a toast for accessibility
      const firstMsg = Object.values(errors)[0];
      showToast(firstMsg, 'error');
      // Scroll to first errored field
      const firstKey = Object.keys(errors)[0];
      const el = document.querySelector(`[name="${firstKey}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        payload.append(key, formData[key]);
      });

      payload.append("customer_type", activeTab || "B2B");

      // Selected Subcategories
      const selectedSubcats = subcategoryCards.filter(c => c.included).map(c => ({
        category_id: c.category_id,
        subcategory_id: c.subcategory_id,
        variation_id: c.selected_variation_id,
        expected_waste: c.expected_waste,
        agreed_price: c.custom_price,
        custom_price: c.custom_price,
        pricing_mode: c.pricing_mode,
        monthly_price: c.bulk_monthly_price,
        yearly_price: c.bulk_yearly_price,
        bulk_monthly_price: c.bulk_monthly_price,
        bulk_yearly_price: c.bulk_yearly_price
      }));
      payload.append("subcategories", JSON.stringify(selectedSubcats));

      if (rwaFile) payload.append("rwa_file", rwaFile);
      if (gstFile) payload.append("gst_file", gstFile);
      if (panFile) payload.append("pan_file", panFile);
      if (tradeLicenseFile) payload.append("trade_license_file", tradeLicenseFile);

      const res = await api.post('/customer-registration', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setSubmitSuccess(true);
        setGeneratedLeadId(res.data.data?.lead_id || "LD-SUCCESS");
      } else {
        showToast(res.data.message || "Failed to submit request.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to submit request. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Group subcategories by Category Name for UI render
  const groupedCategoriesMap = subcategoryCards.reduce((acc, card) => {
    const catId = card.category_id || 'other';
    if (!acc[catId]) {
      acc[catId] = {
        category_id: catId,
        category_name: card.category_name || 'Waste Category',
        subcategories: []
      };
    }
    acc[catId].subcategories.push(card);
    return acc;
  }, {});
  const groupedCategories = Object.values(groupedCategoriesMap);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pt-56 pb-10 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">

        {/* Toast Notification */}
{toastMsg.message && (
  <div
    className={`fixed top-6 right-6 z-[9999] min-w-[320px] max-w-[450px] p-4 rounded-xl text-sm font-bold flex items-center justify-between gap-4 shadow-2xl ${
      toastMsg.type === 'success'
        ? 'bg-emerald-600 text-white'
        : 'bg-rose-600 text-white'
    }`}
  >
    <span>{toastMsg.message}</span>

    <button
      type="button"
      onClick={() => setToastMsg({ type: '', message: '' })}
      className="text-white hover:opacity-80 font-bold text-lg leading-none"
    >
      ×
    </button>
  </div>
)}

        {/* ================= SCREEN 1: TERMS & CONDITIONS ================= */}
        {!tncAccepted ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden opacity-100">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-emerald-700" /> Waste Collection Requests
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">Please review and accept the Terms & Conditions to continue.</p>
              </div>
            </div>

            {/* Terms Box */}
            <div className="p-6 sm:p-8">
              <div className="bg-[#f6f2ff] border border-[#e8dcfc] rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-purple-700 shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">TERMS & CONDITIONS</h2>
                    <p className="text-xs text-slate-500">Read each point carefully and check the boxes to agree</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[#e4d9fd] cursor-pointer hover:border-purple-300 transition-all">
                    <input
                      type="checkbox"
                      checked={tncBoxes.tnc_agree}
                      onChange={(e) => setTncBoxes(prev => ({ ...prev, tnc_agree: e.target.checked }))}
                      className="mt-0.5 w-5 h-5 text-purple-600 rounded border-purple-300 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-purple-900 leading-relaxed">
                      By using our waste management services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, as well as the terms and conditions outlined in the MoU, which are hereby incorporated by reference.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[#e4d9fd] cursor-pointer hover:border-purple-300 transition-all">
                    <input
                      type="checkbox"
                      checked={tncBoxes.accuracy_agree}
                      onChange={(e) => setTncBoxes(prev => ({ ...prev, accuracy_agree: e.target.checked }))}
                      className="mt-0.5 w-5 h-5 text-purple-600 rounded border-purple-300 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-purple-900 leading-relaxed">
                      We warrant that the information provided by us is to the best of our knowledge and belief, accurate and current at the time of provisioning.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[#e4d9fd] cursor-pointer hover:border-purple-300 transition-all">
                    <input
                      type="checkbox"
                      checked={tncBoxes.copyright_agree}
                      onChange={(e) => setTncBoxes(prev => ({ ...prev, copyright_agree: e.target.checked }))}
                      className="mt-0.5 w-5 h-5 text-purple-600 rounded border-purple-300 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-purple-900 leading-relaxed">
                      Copyrights reserved with Ecosphere Waste Solutions and Mukka Protiens Limited.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[#e4d9fd] cursor-pointer hover:border-purple-300 transition-all">
                    <input
                      type="checkbox"
                      checked={tncBoxes.promo_agree}
                      onChange={(e) => setTncBoxes(prev => ({ ...prev, promo_agree: e.target.checked }))}
                      className="mt-0.5 w-5 h-5 text-purple-600 rounded border-purple-300 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-purple-900 leading-relaxed">
                      I agree to receive promotional emails
                    </span>
                  </label>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Decline
                </button>

                <button
                  type="button"
                  onClick={handleTncAccept}
                  className="px-8 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  Accept &amp; Continue →
                </button>
              </div>
            </div>
          </div>
        ) : submitSuccess ? (
          /* ================= SUCCESS SCREEN ================= */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 sm:p-14 text-center max-w-lg mx-auto">
            {/* Minimal check icon */}
            <div className="w-14 h-14 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Generated Successfully!</h2>
            <p className="text-slate-500 text-sm mb-6">
              Your waste collection request has been submitted to the team for verification.
              You'll be notified once your account is approved.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Home Page
            </button>
          </div>
        ) : (
    /* ================= SCREEN 2: MAIN REQUEST FORM ================= */
    <form onSubmit={handleFormSubmit} noValidate className="space-y-6 opacity-100">

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-emerald-600" /> Add Waste Collection Request
          </h1>
          <p className="text-xs text-slate-400 mt-1">Phase 1 — Enter request details manually.</p>
        </div>
      </div>

      {/* SECTION 1: Customer Details */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-5 h-5 text-violet-500" /> Customer Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Lead *</label>
            <select
              name="business_lead"
              value={formData.business_lead}
              onChange={handleInputChange}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
            >
              <option value="Web Lead">Web Lead</option>
              <option value="Exhibition">Exhibition</option>
              <option value="Service Lead">Service Lead</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Legal Name *</label>
            <input
              type="text"
              name="customer_legal_name"
              value={formData.customer_legal_name}
              onChange={handleInputChange}
              required
              placeholder="e.g. Acme Corporation"
              className={`w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 transition-all text-sm font-medium text-slate-700 ${fieldErrors.customer_legal_name ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-violet-400'}`}
            />
            {fieldErrors.customer_legal_name && (
              <p className="mt-1.5 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-100 inline-flex items-center justify-center text-rose-600 font-black text-[9px] flex-shrink-0">!</span>
                {fieldErrors.customer_legal_name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Trade Name</label>
            <input
              type="text"
              name="customer_trade_name"
              value={formData.customer_trade_name}
              onChange={handleInputChange}
              placeholder="e.g. Acme Trading"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Person *</label>
            <input
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleInputChange}
              required
              placeholder="e.g. John Doe"
              className={`w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 transition-all text-sm font-medium text-slate-700 ${fieldErrors.contact_person ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-violet-400'}`}
            />
            {fieldErrors.contact_person && (
              <p className="mt-1.5 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-100 inline-flex items-center justify-center text-rose-600 font-black text-[9px] flex-shrink-0">!</span>
                {fieldErrors.contact_person}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Designation</label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
              placeholder="e.g. Sales Manager"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number 1 *</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleInputChange}
                required
                placeholder="e.g. 9876543210"
                maxLength={10}
                className={`w-full bg-slate-50 border rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 transition-all text-sm font-medium text-slate-700 ${fieldErrors.mobile_number ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-violet-400'}`}
              />
            </div>
            {fieldErrors.mobile_number && (
              <p className="mt-1.5 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-100 inline-flex items-center justify-center text-rose-600 font-black text-[9px] flex-shrink-0">!</span>
                {fieldErrors.mobile_number}
              </p>
            )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number 2</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="tel"
              name="phone_number_2"
              value={formData.phone_number_2}
              onChange={handleInputChange}
              placeholder="e.g. +91 9123456780"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">E-Mail *</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="e.g. john@example.com"
              className={`w-full bg-slate-50 border rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 transition-all text-sm font-medium text-slate-700 ${fieldErrors.email ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-violet-400'}`}
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1.5 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-100 inline-flex items-center justify-center text-rose-600 font-black text-[9px] flex-shrink-0">!</span>
              {fieldErrors.email}
            </p>
          )}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">E-Mail 2</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="email"
            name="email_2"
            value={formData.email_2}
            onChange={handleInputChange}
            placeholder="e.g. contact@acme.com"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
          />
        </div>
      </div>
    </div>
              </div >

    {/* SECTION 2: License Details */ }
    < div className = "bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8" >
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ShieldCheck className="w-5 h-5 text-violet-500" /> Compliance (Optional)
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registered RWA</label>
                      <input
                        type="text"
                        name="registered_rwa"
                        value={formData.registered_rwa}
                        onChange={handleInputChange}
                        placeholder="e.g. Green Valley RWA"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GST Number</label>
                      <input
                        type="text"
                        name="gst"
                        value={formData.gst}
                        onChange={handleInputChange}
                        placeholder="e.g. 29ABCDE1234F1Z5"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">PAN Number</label>
                      <input
                        type="text"
                        name="pan"
                        value={formData.pan}
                        onChange={handleInputChange}
                        placeholder="e.g. ABCDE1234F"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Trade License</label>
                      <input
                        type="text"
                        name="trade_license"
                        value={formData.trade_license}
                        onChange={handleInputChange}
                        placeholder="e.g. TL-987654"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>
                  </div>

                  {/* Upload Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upload RWA Proof</label>
                      {renderDocumentUploadField(rwaFile, setRwaFile, "Upload RWA Proof", ".pdf,image/*")}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upload GST Certificate</label>
                      {renderDocumentUploadField(gstFile, setGstFile, "Upload GST Certificate", ".pdf,image/*")}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upload PAN Copy</label>
                      {renderDocumentUploadField(panFile, setPanFile, "Upload PAN Copy", ".pdf,image/*")}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upload Trade License Copy</label>
                      {renderDocumentUploadField(tradeLicenseFile, setTradeLicenseFile, "Upload Trade License Copy", ".pdf,image/*")}
                    </div>
                  </div>
                </div>
              </div >

    {/* SECTION 3: Location Details */ }
    < div className = "bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8" >
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Building className="w-5 h-5 text-violet-500" /> Location Tracking
                </h2>
                <div className="space-y-6">

                  {/* Address Search */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address Search *</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="mapSearchInput"
                        type="text"
                        name="address_search"
                        value={formData.address_search}
                        onChange={handleInputChange}
                        required
                        placeholder="Search locations using Google..."
                        className={`w-full bg-slate-50 border rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 transition-all text-sm font-medium text-slate-700 ${fieldErrors.address_search ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-violet-400'}`}
                      />
                    </div>
                    {fieldErrors.address_search && (
                      <p className="mt-1.5 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <span className="w-3.5 h-3.5 rounded-full bg-rose-100 inline-flex items-center justify-center text-rose-600 font-black text-[9px] flex-shrink-0">!</span>
                        {fieldErrors.address_search}
                      </p>
                    )}
      </div>

  {/* Lat/Lng */ }
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Latitude *</label>
      <input
        type="text"
        name="latitude"
        value={formData.latitude}
        onChange={handleInputChange}
        required
        placeholder="e.g. 28.7041"
        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
      />
    </div>

    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Longitude *</label>
      <input
        type="text"
        name="longitude"
        value={formData.longitude}
        onChange={handleInputChange}
        required
        placeholder="e.g. 77.1025"
        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
      />
    </div>
  </div>

  {/* Google Map Div Container */ }
                  <div>
                    <div ref={mapDivRef} className="w-full h-64 rounded-2xl border border-slate-200 overflow-hidden shadow-inner" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">BWG Name *</label>
                      <input
                        type="text"
                        name="waste_generator_name"
                        value={formData.waste_generator_name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Smart Bazar"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sector *</label>
                      <select
                        name="sector"
                        value={formData.sector}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
                      >
                        <option value="">Select Sector</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Food Processing">Food Processing</option>
                        <option value="Hospital and Health care">Hospital and Health care</option>
                        <option value="Ware House and Logistics">Ware House and Logistics</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Hospitality Sector">Hospitality Sector</option>
                        <option value="Pharma">Pharma</option>
                        <option value="Retail Industry">Retail Industry</option>
                        <option value="Education Institutions">Education Institutions</option>
                        <option value="Banking and Finance">Banking and Finance</option>
                        <option value="Airport Transportation">Airport Transportation</option>
                        <option value="IT / ITES / BPO">IT / ITES / BPO</option>
                        <option value="Housing and Society">Housing and Society</option>
                        <option value="Shopping Malls">Shopping Malls</option>
                        <option value="Hotel and Resort">Hotel and Resort</option>
                        <option value="Government Sector">Government Sector</option>
                        <option value="Agricultural Sector">Agricultural Sector</option>
                        <option value="Cinema Halls / Multiplex">Cinema Halls / Multiplex</option>
                        <option value="Airport, Railways & Expressway">Airport, Railways &amp; Expressway</option>
                        <option value="Office Space">Office Space</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                  </div>

  {/* Row 5: Flats/Area based on sector */ }
  {
    formData.sector && (
      <div className="w-full">
        {formData.sector === "Apartment" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Flats */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Flats *
              </label>

              <input
                type="number"
                name="no_of_dwelling_units"
                value={formData.no_of_dwelling_units}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="e.g. 150"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
              />
            </div>

            {/* Occupied Flats */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Occupied Flats *
              </label>

              <input
                type="number"
                name="occupied_flats"
                value={formData.occupied_flats}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="e.g. 120"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
              />
            </div>

          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Area (SqM) *
            </label>

            <input
              type="number"
              name="area_sqm"
              value={formData.area_sqm}
              onChange={handleInputChange}
              required
              min="0"
              placeholder="e.g. 500"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
            />
          </div>
        )}
      </div>
    )
  }
  {/* Complete Address */ }
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Complete Address *</label>
    <textarea
      name="complete_address"
      value={formData.complete_address}
      onChange={handleInputChange}
      required
      rows="3"
      placeholder="e.g. 456 Industrial Area, Bangalore"
      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm resize-none"
    />
  </div>



  {/* Landmark, City, State */ }
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Landmark</label>
      <input
        type="text"
        name="landmark"
        value={formData.landmark}
        onChange={handleInputChange}
        placeholder="e.g. Near Central Park"
        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
      />
    </div>

    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City</label>
      <input
        type="text"
        name="city"
        value={formData.city}
        onChange={handleInputChange}
        placeholder="e.g. Bangalore"
        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
      />
    </div>

    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">State</label>
      <input
        type="text"
        name="state"
        value={formData.state}
        onChange={handleInputChange}
        placeholder="e.g. Karnataka"
        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
      />
    </div>
  </div>

  {/* Pincode, Country, Google Map Link */ }
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pincode</label>
      <input
        type="text"
        name="pincode"
        value={formData.pincode}
        onChange={handleInputChange}
        placeholder="e.g. 560001"
        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
      />
    </div>

    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Country</label>
      <input
        type="text"
        name="country"
        value={formData.country}
        onChange={handleInputChange}
        placeholder="e.g. India"
        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
      />
    </div>

    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Google Map Link</label>
      <input
        type="text"
        name="google_map_link"
        value={formData.google_map_link}
        onChange={handleInputChange}
        placeholder="e.g. https://www.google.com/maps/place/..."
        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
      />
    </div>
  </div>
                </div >
              </div >

    {/* SECTION 4: Service Details / Expected Waste (KG) */ }
    < div className = "bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8" >
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ClipboardCheck className="w-5 h-5 text-violet-500" /> Section 4: Service Details / Expected Waste (KG)
                </h2>

                <div className="space-y-6">
                  {subcategoryCards.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm">
                      <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      Loading waste categories...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Category Selection Groups */}
                      <div className="space-y-6 pb-6 border-b border-slate-100">
                        {groupedCategories.map((cat) => {
                          const selectedSubcats = cat.subcategories.filter(s => s.included);
                          const isOpen = openDropdownCategoryId === cat.category_id;

                          return (
                            <div key={cat.category_id} className="space-y-2 relative">
                              <h3 className="text-lg font-black text-emerald-800 tracking-tight">
                                {cat.category_name}
                              </h3>

                              <label className="block text-xs font-bold text-slate-700 mt-2 mb-1">
                                Sub-Category
                              </label>

                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownCategoryId(isOpen ? null : cat.category_id);
                                }}
                                className="min-h-[50px] bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-2 flex flex-wrap gap-2 items-center cursor-pointer select-none transition-all"
                              >
                                {selectedSubcats.length === 0 ? (
                                  <span className="text-sm text-slate-400 pl-2">Select subcategories...</span>
                                ) : (
                                  selectedSubcats.map((sub) => (
                                    <span
                                      key={sub.subcategory_id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleInclude(sub.subcategory_id);
                                      }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                                    >
                                      <span className="font-bold">×</span>
                                      {sub.subcategory_name}
                                    </span>
                                  ))
                                )}
                              </div>

                              {/* Dropdown Options */}
                              {isOpen && (
                                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto py-1.5">
                                  {cat.subcategories.map((sub) => (
                                    <div
                                      key={sub.subcategory_id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleInclude(sub.subcategory_id);
                                      }}
                                      className={`px-4 py-2 text-sm font-medium cursor-pointer flex items-center justify-between transition-colors ${sub.included ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >
                                      <span>{sub.subcategory_name}</span>
                                      {sub.included && <CheckCircle className="w-4 h-4 text-blue-600" />}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Subcategory Detail Cards for Included Items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {subcategoryCards.filter(c => c.included).map((card) => {
                          const selectedVar = (card.variations || []).find(v => v.id == card.selected_variation_id) || null;
                          const expectedDaily = parseFloat(card.expected_waste) || 0;

                          const defaultVarPrice = selectedVar ? parseFloat(selectedVar.per_kg_price || 0) : 0;
                          const customPriceVal = parseFloat(card.custom_price);
                          const finalPrice = (!isNaN(customPriceVal) && customPriceVal >= 0 && card.custom_price !== '')
                            ? customPriceVal
                            : defaultVarPrice;

                          const estMonthlyWaste = expectedDaily * 30;
                          const estYearlyWaste = expectedDaily * 365;

                          const estMonthlyPrice = estMonthlyWaste * finalPrice;
                          const estYearlyPrice = estYearlyWaste * finalPrice;

                          return (
                            <div
                              key={card.subcategory_id}
                              className="bg-white border border-slate-200 hover:border-slate-300 rounded-[16px] p-6 space-y-6 transition-all duration-300 hover:shadow-md "
                            >
                              {/* Card Header */}
                              <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-extrabold text-emerald-800 tracking-tight">
                                  {card.subcategory_name}
                                </h3>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {/* 1. Billing Type Dropdown */}
                                <div className="space-y-1.5">
                                  <label className="block text-xs font-bold text-slate-700">Billing Type</label>
                                  <select
                                    value={card.pricing_mode || 'KG'}
                                    onChange={(e) => handleCardPricingModeChange(card.subcategory_id, e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-semibold text-slate-800 cursor-pointer"
                                  >
                                    <option value="KG">KG</option>
                                    <option value="Bulk">Bulk</option>
                                  </select>
                                </div>

                                {/* 2. Variation Dropdown */}
                                <div className="space-y-1.5">
                                  <label className="block text-xs font-bold text-slate-700">Variation</label>
                                  <select
                                    name={`variation_${card.subcategory_id}`}
                                    id={`variation_${card.subcategory_id}`}
                                    value={card.selected_variation_id}
                                    onChange={(e) => handleSelectVariation(card.subcategory_id, e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-semibold text-slate-800 cursor-pointer"
                                  >
                                    <option value="">-Select Type-</option>
                                    {(card.variations || []).map((v) => (
                                      <option key={v.id} value={v.id}>{v.variation_name}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* 3. No. of Services */}
                                <div className="space-y-1.5">
                                  <label className="block text-xs font-bold text-slate-700">No. of Services</label>
                                  <input
                                    type="text"
                                    disabled
                                    value={selectedVar ? selectedVar.number_of_sr || '0' : ''}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm font-semibold text-slate-500 cursor-not-allowed"
                                  />
                                </div>

                                {/* 4. Scheduled Every */}
                                <div className="space-y-1.5">
                                  <label className="block text-xs font-bold text-slate-700">Scheduled Every</label>
                                  <input
                                    type="text"
                                    disabled
                                    value={selectedVar ? `Every ${selectedVar.schedule_after_days || '1'} Days` : ''}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm font-semibold text-slate-500 cursor-not-allowed"
                                  />
                                </div>

                                {/* 5. Expected Waste Per Day (Only shown for Per KG pricing, hidden for Bulk) */}
                                {card.pricing_mode !== 'Bulk' && (
                                  <div className="space-y-1.5 sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700">Expected Waste (KG Per Day) *</label>
                                    <input
                                      name={`expected_waste_${card.subcategory_id}`}
                                      id={`expected_waste_${card.subcategory_id}`}
                                      type="number"
                                      min="1"
                                      step="any"
                                      required
                                      disabled={!selectedVar}
                                      value={card.expected_waste}
                                      onChange={e => handleCardWasteChange(card.subcategory_id, e.target.value)}
                                      placeholder="Enter waste in KG per day"
                                      className={`w-full border rounded-lg py-2.5 px-3 outline-none focus:ring-4 transition-all text-sm font-semibold text-slate-800 ${selectedVar
                                          ? 'bg-white border-slate-200 focus:ring-purple-100 focus:border-purple-400'
                                          : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                                        }`}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pickup Schedule */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preferred Pickup Date</label>
                      <input
                        type="date"
                        name="pickup_date"
                        value={formData.pickup_date}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time Slot</label>
                      <select
                        name="time_slot_id"
                        value={formData.time_slot_id}
                        onChange={handleInputChange}
                        disabled={loadingSlots || timeSlots.length === 0}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer disabled:opacity-50"
                      >
                        <option value="">{loadingSlots ? "Loading slots..." : timeSlots.length === 0 ? "Select Date First" : "Select Time Slot"}</option>
                        {timeSlots.map(slot => (
                          <option key={slot.id} value={slot.id}>{slot.slot_name} ({slot.start_time} - {slot.end_time})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div >

    {/* Bottom Action Bar */ }
    < div className = "flex items-center justify-end gap-4 pt-4" >
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Reset Form
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating Request...
                    </>
                  ) : (
                    "Generate Request"
                  )}
                </button>
              </div >

            </form >
          )
}
        </div >
      </div >
    );
}
