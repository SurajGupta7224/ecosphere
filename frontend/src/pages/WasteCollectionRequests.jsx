import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, Image as ImageIcon, CheckCircle, Trash2, Calendar, Clock,
  User, Phone, Mail, MapPin, Building, ShieldCheck, ClipboardCheck, FileText, ArrowLeft,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { IMAGE_BASE_URL } from '../api';

export default function WasteCollectionRequests() {
  const [subcategoryCards, setSubcategoryCards] = useState([]);
  const [openDropdownCategoryId, setOpenDropdownCategoryId] = useState(null);
  const [activeTab, setActiveTab] = useState('B2B'); // B2B only
  const [businessRegions, setBusinessRegions] = useState([]);
  const [businessSubRegions, setBusinessSubRegions] = useState([]);

  const [formData, setFormData] = useState({
    // Section 1: Customer Details
    customer_type: '',
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
    employee_name: JSON.parse(localStorage.getItem('user') || '{}').name || '',
    billing_type: '',
    business_region: '',
    business_sub_region: '',
    branch_code: '',
    business_lead: '',
    customer_legal_name: '',
    customer_trade_name: '',
    contact_person: '',
    designation: '',
    phone_number_2: '',
    email_2: '',
    others_note: '',
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
    final_price: 0
  });

  const navigate = useNavigate();

  // Auto-generate B2B branch code
  useEffect(() => {
    if (!formData.branch_code) {
      const code = "BR-" + Math.floor(100000 + Math.random() * 900000);
      setFormData(prev => ({ ...prev, branch_code: code }));
    }
  }, []);

  const [momFile, setMomFile] = useState(null);
  const [poFile, setPoFile] = useState(null);
  const [emailCopyFile, setEmailCopyFile] = useState(null);
  const [rwaFile, setRwaFile] = useState(null);
  const [gstFile, setGstFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [tradeLicenseFile, setTradeLicenseFile] = useState(null);

  // Existing files states for existing customer profile pre-fill
  const [existingMomFile, setExistingMomFile] = useState(null);
  const [existingPoFile, setExistingPoFile] = useState(null);
  const [existingEmailFile, setExistingEmailFile] = useState(null);
  const [existingRwaFile, setExistingRwaFile] = useState(null);
  const [existingGstFile, setExistingGstFile] = useState(null);
  const [existingPanFile, setExistingPanFile] = useState(null);
  const [existingTradeFile, setExistingTradeFile] = useState(null);



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

    // GST calculated on the Total Yearly Order Value (before discount)
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

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [searchMobile, setSearchMobile] = useState('');
  const [searchingMobile, setSearchingMobile] = useState(false);
  const [matchingCustomers, setMatchingCustomers] = useState([]);
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);

  // T&C state — shown first before the form
  const [tncAccepted, setTncAccepted] = useState(false);
  const [tncSaving, setTncSaving] = useState(false);
  const [tncBoxes, setTncBoxes] = useState({
    tnc_agree: false,
    accuracy_agree: false,
    copyright_agree: false,
    promo_agree: false,
  });

  const handleTncAccept = async () => {
    const allChecked = Object.values(tncBoxes).every(Boolean);
    if (!allChecked) {
      toast.error("Please accept all terms and conditions to continue.");
      return;
    }
    setTncSaving(true);
    try {
      await api.post('/tnc/accept', {
        accepted_checkboxes: JSON.stringify(tncBoxes)
      });
    } catch (err) {
      console.warn('TnC save failed (non-blocking):', err);
    } finally {
      setTncSaving(false);
      setTncAccepted(true);
    }
  };

  const renderDocumentUploadField = (file, setFile, existingFilename = null, setExistingFile = null, title = "Upload Document", accept = ".pdf,image/*", containerId = "") => {
    const isNewImage = file && (file.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name));
    const newPreviewUrl = file ? URL.createObjectURL(file) : '';

    const hasExisting = !file && existingFilename;
    const isExistingImage = hasExisting && /\.(jpg|jpeg|png|webp|gif)$/i.test(existingFilename);
    const existingPreviewUrl = hasExisting ? `${IMAGE_BASE_URL}/CollectionRequests/${existingFilename}` : '';

    const showFile = file || hasExisting;

    return (
      <div id={containerId} className="relative w-full h-36 border border-slate-200 rounded-2xl bg-slate-50/50 overflow-hidden group transition-all">
        {showFile ? (
          <div className="w-full h-full relative animate-in fade-in duration-200">
            {file ? (
              isNewImage ? (
                <img src={newPreviewUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-50 text-center">
                  <FileText className="w-10 h-10 text-rose-500 mb-2 animate-bounce" />
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[90%]">{file.name}</span>
                  <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">PDF Document</span>
                </div>
              )
            ) : (
              isExistingImage ? (
                <img src={existingPreviewUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-50 text-center">
                  <FileText className="w-10 h-10 text-rose-500 mb-2" />
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[90%]">{existingFilename}</span>
                  <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">PDF Document</span>
                </div>
              )
            )}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.open(file ? newPreviewUrl : existingPreviewUrl, '_blank')}
                className="px-3.5 py-2 bg-white/95 hover:bg-white text-slate-800 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                View Document
              </button>
              <button
                type="button"
                onClick={() => {
                  if (file) {
                    setFile(null);
                  } else if (setExistingFile) {
                    setExistingFile(null);
                  }
                }}
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

  const handleTncDecline = () => {
    navigate('/');
  };

  // Google Map refs
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const mapDivRef = useRef(null);

  // ── Effect 1: Load the Google Maps script only (no map init yet) ────────────
  useEffect(() => {
    if (!document.getElementById('google-maps-script')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY || ''}&libraries=places`;
      script.id = 'google-maps-script';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // ── Effect 2: Init map once T&C accepted (form div now exists in DOM) ────────
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

      // When marker is dragged → update lat/lng fields + reverse geocode
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

    // Small delay to ensure the map div has painted after tncAccepted state change
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

          // Parse address components
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
        const res = await api.get('/sub-categories', { params: { limit: 200, status: 1 } });
        const allSubCats = res.data.subCategories || [];

        // Initialize cards for all active subcategories
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
            included: false, // Default to false (not selected initially)
            pricing_mode: 'KG',
            bulk_monthly_price: '',
            bulk_yearly_price: ''
          };
        });
        setSubcategoryCards(cards);
      } catch (err) {
        console.error("Failed to load subcategories:", err);
        toast.error("Failed to load waste subcategories.");
      }
    };
    fetchSubCategories();
  }, []);

  // Fetch Active Business Regions on mount
  useEffect(() => {
    const fetchActiveRegions = async () => {
      try {
        const res = await api.get('/business-regions', { params: { status: 'Active', limit: 1000 } });
        setBusinessRegions(res.data.businessRegions || []);
      } catch (err) {
        console.error("Failed to load business regions:", err);
      }
    };
    fetchActiveRegions();
  }, []);

  // Prevent number inputs from changing values on page scroll / wheel events
  useEffect(() => {
    const handleWheel = (e) => {
      if (document.activeElement && document.activeElement.type === 'number') {
        document.activeElement.blur();
      }
    };
    document.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
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
            : '', // Pre-set to suggested price on toggle
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
      const res = await api.get('/time-slots/active', { params: { date } });
      if (res.data.success) {
        setTimeSlots(res.data.slots || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load time slots for the selected date.");
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      if (formData.pickup_date) {
        fetchActiveTimeSlots(formData.pickup_date);
      } else {
        setTimeSlots([]);
      }
      setFormData(prev => ({ ...prev, time_slot_id: '', pickup_time: '' }));
    });
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
      const res = await api.get(`/business-regions/${regObj.id}/sub-regions`);
      setBusinessSubRegions(res.data.businessSubRegions || []);
    } catch (err) {
      console.error("Failed to load business sub regions:", err);
      setBusinessSubRegions([]);
    }
  };

  const handleSearchMobile = async () => {
    if (!searchMobile.trim()) {
      toast.error("Please enter a mobile number to search.");
      return;
    }
    setSearchingMobile(true);
    try {
      const res = await api.get('/waste-collection-requests/search-mobile', { params: { mobile: searchMobile } });
      if (res.data.success && res.data.requests) {
        if (res.data.requests.length === 0) {
          toast.error("No existing request found with this mobile number.");
          return;
        }

        // Group the requests by lead_id
        const grouped = {};
        res.data.requests.forEach(req => {
          if (!grouped[req.lead_id]) {
            grouped[req.lead_id] = {
              lead_id: req.lead_id,
              customer_legal_name: req.customer_legal_name,
              mobile_number: req.mobile_number,
              complete_address: req.complete_address,
              created_at: req.created_at || req.createdAt || null,
              first: req,
              items: []
            };
          }
          grouped[req.lead_id].items.push(req);
        });

        const groupedList = Object.values(grouped);
        setMatchingCustomers(groupedList);
        setShowCustomerPopup(true);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to search customer by mobile number.");
    } finally {
      setSearchingMobile(false);
    }
  };

  const selectExistingCustomer = async (custGroup) => {
    try {
      const reqData = custGroup.first;

      // Parse billing details
      let billingObj = {};
      if (reqData.billing_details) {
        try {
          const parsed = typeof reqData.billing_details === 'string' ? JSON.parse(reqData.billing_details) : reqData.billing_details;
          if (parsed && typeof parsed === 'object') {
            billingObj = parsed;
          }
        } catch (e) {
          console.error("Failed to parse billing details:", e);
        }
      }

      // Set existing files filenames
      setExistingMomFile(reqData.mom_agreement_file || null);
      setExistingPoFile(reqData.po_copy_file || null);
      setExistingEmailFile(reqData.email_copy_file || null);
      setExistingRwaFile(reqData.rwa_file || null);
      setExistingGstFile(reqData.gst_file || null);
      setExistingPanFile(reqData.pan_file || null);
      setExistingTradeFile(reqData.trade_license_file || null);

      // Reset new files if selected
      setMomFile(null);
      setPoFile(null);
      setEmailCopyFile(null);
      setRwaFile(null);
      setGstFile(null);
      setPanFile(null);
      setTradeLicenseFile(null);

      setFormData(prev => ({
        ...prev,
        // Section 1: Company Details (B2B)
        site_request: reqData.site_request || prev.site_request,
        service_center_type: reqData.service_center_type || prev.service_center_type,
        employee_name: reqData.employee_name || prev.employee_name,
        billing_type: reqData.billing_type || prev.billing_type,
        business_region: reqData.business_region || '',
        business_sub_region: reqData.business_sub_region || '',
        branch_code: reqData.branch_code || prev.branch_code,

        // Section 2: Customer Details
        customer_type: reqData.customer_type || prev.customer_type,
        contact_person: reqData.contact_person || '',
        business_lead: reqData.business_lead || prev.business_lead,
        customer_legal_name: reqData.customer_legal_name || '',
        customer_trade_name: reqData.customer_trade_name || '',
        contact_person: reqData.contact_person || '',
        designation: reqData.designation || '',
        mobile_number: reqData.mobile_number || '',
        phone_number_2: reqData.phone_number_2 || '',
        email: reqData.email || '',
        email_2: reqData.email_2 || '',
        others_note: reqData.others_note || '',

        // Section 3: License Details
        gst: reqData.gst_number || reqData.gst || '',
        pan: reqData.pan_number || reqData.pan || '',
        trade_license: reqData.trade_license || '',
        registered_rwa: reqData.registered_rwa || '',

        // Section 4: Location Details
        address_search: reqData.address_search || reqData.complete_address || '',
        latitude: reqData.latitude || '',
        longitude: reqData.longitude || '',
        waste_generator_name: reqData.waste_generator_name || '',
        complete_address: reqData.complete_address || '',
        area_sqm: reqData.area_sqm != null ? String(reqData.area_sqm) : '',
        no_of_dwelling_units: reqData.dwelling_units != null ? String(reqData.dwelling_units) : (reqData.no_of_dwelling_units != null ? String(reqData.no_of_dwelling_units) : ''),
        landmark: reqData.landmark || '',
        city: reqData.city || '',
        state: reqData.state || '',
        pincode: reqData.pincode || '',
        country: reqData.country || '',
        google_map_link: reqData.google_map_link || '',

        // Section 6: Pricing
        sez: reqData.sez || 'No',
        taxibility: reqData.taxibility ? String(reqData.taxibility).replace('%', '').trim() : '0.00',
        sector: reqData.sector || '',
        discount: reqData.discount != null ? String(reqData.discount) : '0',
        total_order_value: reqData.total_order_value != null ? parseFloat(reqData.total_order_value) : 0,
        total_yearly_amount: reqData.total_yearly_amount != null ? parseFloat(reqData.total_yearly_amount) : 0,
        discounted_price: reqData.discounted_price != null ? parseFloat(reqData.discounted_price) : 0,
        cgst: reqData.cgst != null ? parseFloat(reqData.cgst) : 0,
        sgst: reqData.sgst != null ? parseFloat(reqData.sgst) : 0,
        gst_amount: reqData.gst_amount != null ? parseFloat(reqData.gst_amount) : 0,
        final_price: reqData.final_price != null ? parseFloat(reqData.final_price) : 0,

        // Section 7: Additional Details
        pickup_date: reqData.pickup_date || '',
        pickup_time: reqData.pickup_time || '',
        pickup_notes: reqData.pickup_notes || '',
        audit_requirement: reqData.audit_requirement || 'Required',
        technician_assign: reqData.technician_assign || 'Required',
        technician: reqData.technician || '',

        // Section 7: Billing Address
        billing_address_different: reqData.billing_address_different === true || reqData.billing_address_different === 1 || reqData.billing_address_different === 'true',
        // billing_details JSON is stored with keys: customer_legal_name, customer_trade_name, contact_person,
        // designation, phone_number_1, phone_number_2, email, email_2, gstn, complete_address, others, city, state, pincode, landmark, country
        billing_customer_legal_name: billingObj.billing_customer_legal_name || billingObj.customer_legal_name || '',
        billing_customer_trade_name: billingObj.billing_customer_trade_name || billingObj.customer_trade_name || '',
        billing_contact_person: billingObj.billing_contact_person || billingObj.contact_person || '',
        billing_designation: billingObj.billing_designation || billingObj.designation || '',
        billing_phone_number_1: billingObj.billing_phone_number_1 || billingObj.phone_number_1 || billingObj.phone || '',
        billing_phone_number_2: billingObj.billing_phone_number_2 || billingObj.phone_number_2 || '',
        billing_email: billingObj.billing_email || billingObj.email || '',
        billing_email_2: billingObj.billing_email_2 || billingObj.email_2 || '',
        billing_complete_address: billingObj.billing_complete_address || billingObj.complete_address || '',
        billing_others: billingObj.billing_others || billingObj.others || '',
        billing_city: billingObj.billing_city || billingObj.city || '',
        billing_state: billingObj.billing_state || billingObj.state || '',
        billing_pincode: billingObj.billing_pincode || billingObj.pincode || '',
        billing_landmark: billingObj.billing_landmark || billingObj.landmark || '',
        billing_country: billingObj.billing_country || billingObj.country || '',
        billing_gstn: billingObj.billing_gstn || billingObj.gstn || billingObj.gst || ''
      }));

      // Trigger loading subregions for this business region
      if (reqData.business_region) {
        const regObj = (businessRegions || []).find(r => (r.region_name || r.state) === reqData.business_region);
        if (regObj) {
          try {
            const res = await api.get(`/business-regions/${regObj.id}/sub-regions`);
            setBusinessSubRegions(res.data?.businessSubRegions || []);
          } catch (err) {
            console.error("Failed to load business sub regions:", err);
            setBusinessSubRegions([]);
          }
        }
      }

      // Map subcategories cards
      // NOTE: pricing_mode ('KG'/'Bulk') is not stored as a separate DB field.
      // We infer it: if monthly_price > 0 and expected_waste == 0, it's Bulk mode.
      const updatedCards = subcategoryCards.map(card => {
        const matchedItem = custGroup.items.find(item =>
          parseInt(item.subcategory_id) === parseInt(card.subcategory_id)
        );
        if (matchedItem) {
          const monthlyPrice = parseFloat(matchedItem.monthly_price || 0);
          const expectedWaste = parseFloat(matchedItem.expected_waste || 0);
          // Infer Bulk mode: if monthly_price is set and expected_waste is 0
          const isBulk = monthlyPrice > 0 && expectedWaste === 0;
          const pricingMode = isBulk ? 'Bulk' : 'KG';

          return {
            ...card,
            included: true,
            pricing_mode: pricingMode,
            selected_variation_id: matchedItem.variation_id ? Number(matchedItem.variation_id) : '',
            expected_waste: isBulk ? '' : (expectedWaste > 0 ? String(expectedWaste) : ''),
            custom_price: isBulk ? '' : (parseFloat(matchedItem.agreed_price || 0) > 0 ? String(parseFloat(matchedItem.agreed_price)) : ''),
            bulk_monthly_price: isBulk ? String(monthlyPrice) : '',
            bulk_yearly_price: isBulk ? String(parseFloat(matchedItem.yearly_price || 0)) : ''
          };
        }
        return {
          ...card,
          included: false,
          selected_variation_id: '',
          expected_waste: '',
          custom_price: '',
          bulk_monthly_price: '',
          bulk_yearly_price: ''
        };
      });
      setSubcategoryCards(updatedCards);

      // Sync google map pin and view
      if (reqData.latitude && reqData.longitude) {
        const latVal = parseFloat(reqData.latitude);
        const lngVal = parseFloat(reqData.longitude);
        if (!isNaN(latVal) && !isNaN(lngVal)) {
          const newPos = { lat: latVal, lng: lngVal };
          if (markerRef.current) {
            markerRef.current.setPosition(newPos);
          }
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(newPos);
            mapInstanceRef.current.setZoom(17);
          }
        }
      }

      setShowCustomerPopup(false);
      toast.success("Existing customer details loaded successfully.");
    } catch (err) {
      console.error("Error in selectExistingCustomer:", err);
      toast.error("Failed to load customer profile details: " + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    if (name === 'google_map_link') {
      setFormData(prev => ({ ...prev, google_map_link: value }));
      if (value) {
        const extractLatLng = (urlStr) => {
          let latVal = null;
          let lngVal = null;
          // Try matching place marker coordinates !3d<lat>!4d<lng> first (most specific to the business place)
          let match = urlStr.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
          if (match) {
            latVal = parseFloat(match[1]);
            lngVal = parseFloat(match[2]);
          } else {
            // Viewport/query coordinate fallbacks
            match = urlStr.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (match) {
              latVal = parseFloat(match[1]);
              lngVal = parseFloat(match[2]);
            } else {
              match = urlStr.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
              if (match) {
                latVal = parseFloat(match[1]);
                lngVal = parseFloat(match[2]);
              } else {
                match = urlStr.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (match) {
                  latVal = parseFloat(match[1]);
                  lngVal = parseFloat(match[2]);
                }
              }
            }
          }
          return latVal && lngVal ? { lat: latVal, lng: lngVal } : null;
        };

        const processUrl = async (urlToProcess) => {
          let coords = extractLatLng(urlToProcess);
          if (!coords && (urlToProcess.includes('maps.app.goo.gl') || urlToProcess.includes('goo.gl/maps') || urlToProcess.includes('maps.google'))) {
            try {
              const res = await api.get('/waste-collection-requests/resolve-map-link', { params: { url: urlToProcess } });
              if (res.data.success && res.data.resolvedUrl) {
                coords = extractLatLng(res.data.resolvedUrl);
              }
            } catch (err) {
              console.error("Failed to resolve short map link:", err);
            }
          }

          if (coords) {
            const { lat, lng } = coords;
            const pos = { lat, lng };
            if (window.google && window.google.maps) {
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
                    latitude: String(lat),
                    longitude: String(lng),
                    complete_address: addr,
                    address_search: addr,
                    city: parsedCity || prev.city,
                    state: parsedState || prev.state,
                    pincode: parsedPincode || prev.pincode,
                    country: parsedCountry || prev.country,
                    landmark: parsedLandmark || prev.landmark
                  }));
                  if (markerRef.current) {
                    markerRef.current.setPosition(pos);
                  }
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setCenter(pos);
                    mapInstanceRef.current.setZoom(17);
                  }
                }
              });
            }
          }
        };

        processUrl(value);
      }
      return;
    }
    if (name === 'sector') {
      setFormData(prev => ({
        ...prev,
        sector: value,
        area_sqm: value === 'Apartment' ? '' : prev.area_sqm,
        no_of_dwelling_units: value === 'Apartment' ? prev.no_of_dwelling_units : ''
      }));
      return;
    }
    if (name === 'mobile_number' || name === 'phone_number_2' || name === 'billing_phone_number_1' || name === 'billing_phone_number_2') {
      const sanitized = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: sanitized }));
      return;
    }
    if (name === 'business_sub_region') {
      const subObj = businessSubRegions.find(s => s.sub_region_name === value);
      setFormData(prev => ({
        ...prev,
        business_sub_region: value,
        branch_code: subObj ? subObj.branch_code || '' : ''
      }));
      return;
    }
    if (name === 'sez') {
      setFormData(prev => ({
        ...prev,
        sez: value,
        taxibility: value === 'Yes' ? '0.00' : prev.taxibility
      }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(filePreviews[index]);
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      customer_type: '',
      mobile_number: '',
      email: '',
      address_search: '',
      latitude: '',
      longitude: '',
      waste_generator_name: '',
      complete_address: '',
      area_sqm: '',
      no_of_dwelling_units: '',
      registered_rwa: '',
      gst: '',
      pan: '',
      trade_license: '',
      pickup_notes: '',
      pickup_date: '',
      pickup_time: '',
      time_slot_id: '',

      // Reset new fields
      site_request: '',
      service_center_type: '',
      employee_name: JSON.parse(localStorage.getItem('user') || '{}').name || '',
      billing_type: '',
      business_region: '',
      business_sub_region: '',
      branch_code: "BR-" + Math.floor(100000 + Math.random() * 900000),
      business_lead: '',
      customer_legal_name: '',
      customer_trade_name: '',
      contact_person: '',
      designation: '',
      phone_number_2: '',
      email_2: '',
      others_note: '',
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
      final_price: 0
    });
    setSubcategoryCards(prev => prev.map(card => {
      return {
        ...card,
        selected_variation_id: '',
        custom_price: '',
        expected_waste: '',
        included: false
      };
    }));
    setSelectedFiles([]);
    filePreviews.forEach(url => URL.revokeObjectURL(url));
    setFilePreviews([]);
    setMomFile(null);
    setPoFile(null);
    setEmailCopyFile(null);
    setRwaFile(null);
    setGstFile(null);
    setPanFile(null);
    setTradeLicenseFile(null);
  };

  const handleFormSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const invalidateField = (name, message, isFile = false) => {
      toast.error(message);
      let element = null;
      if (isFile) {
        element = document.getElementById(name);
      } else {
        element = document.getElementsByName(name)[0] || document.getElementById(name);
      }
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

    // Section 1: Company Details validations
    if (!formData.site_request) {
      invalidateField('site_request', "Please select a valid Site Request.");
      return;
    }
    if (!formData.service_center_type) {
      invalidateField('service_center_type', "Please select a valid Service Center Type.");
      return;
    }
    if (!formData.billing_type) {
      invalidateField('billing_type', "Please select a valid Billing Type.");
      return;
    }
    if (!formData.business_region) {
      invalidateField('business_region', "Please select a valid Business Region.");
      return;
    }
    if (!formData.business_sub_region) {
      invalidateField('business_sub_region', "Please select a valid Business Sub Region.");
      return;
    }
    if (!formData.business_lead) {
      invalidateField('business_lead', "Please select a valid Business Lead.");
      return;
    }

    if (!formData.customer_type) {
      invalidateField('customer_type', "Customer Type is required.");
      return;
    }
    if (activeTab === 'B2C') {
      if (!formData.contact_person?.trim()) {
        invalidateField('contact_person', "Contact Person Name is required.");
        return;
      }
    } else {
      if (!formData.customer_legal_name?.trim()) {
        invalidateField('customer_legal_name', "Customer Legal Name is required.");
        return;
      }
      if (!formData.contact_person?.trim()) {
        invalidateField('contact_person', "Contact Person Name is required.");
        return;
      }
    }
    if (!formData.mobile_number?.trim()) {
      invalidateField('mobile_number', "Mobile Number is required.");
      return;
    }
    if (!/^\d{10}$/.test(formData.mobile_number)) {
      invalidateField('mobile_number', "Please enter a valid 10-digit mobile number.");
      return;
    }
    if (formData.phone_number_2 && !/^\d{10}$/.test(formData.phone_number_2)) {
      invalidateField('phone_number_2', "Please enter a valid 10-digit Phone Number 2.");
      return;
    }
    if (!formData.email?.trim()) {
      invalidateField('email', "Email is required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      invalidateField('email', "Please enter a valid email address.");
      return;
    }
    if (formData.email_2 && !emailRegex.test(formData.email_2)) {
      invalidateField('email_2', "Please enter a valid E-Mail 2 address.");
      return;
    }
    if (formData.gst && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(formData.gst)) {
      invalidateField('gst', "Please enter a valid 15-character GST Number.");
      return;
    }
    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.pan)) {
      invalidateField('pan', "Please enter a valid 10-character PAN Number.");
      return;
    }
    if (formData.billing_address_different) {
      if (formData.billing_phone_number_1 && !/^\d{10}$/.test(formData.billing_phone_number_1)) {
        invalidateField('billing_phone_number_1', "Please enter a valid 10-digit Billing Phone Number 1.");
        return;
      }
      if (formData.billing_phone_number_2 && !/^\d{10}$/.test(formData.billing_phone_number_2)) {
        invalidateField('billing_phone_number_2', "Please enter a valid 10-digit Billing Phone Number 2.");
        return;
      }
      if (formData.billing_email && !emailRegex.test(formData.billing_email)) {
        invalidateField('billing_email', "Please enter a valid Billing E-Mail.");
        return;
      }
      if (formData.billing_email_2 && !emailRegex.test(formData.billing_email_2)) {
        invalidateField('billing_email_2', "Please enter a valid Billing E-Mail 2.");
        return;
      }
    }
    if (!formData.address_search?.trim()) {
      invalidateField('mapSearchInput', "Address Search is required.");
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      invalidateField('mapSearchInput', "Coordinates (Latitude/Longitude) are required. Please search and select an address.");
      return;
    }
    const latVal = parseFloat(formData.latitude);
    const lngVal = parseFloat(formData.longitude);
    if (isNaN(latVal) || latVal < -90 || latVal > 90) {
      invalidateField('latitude', "Please enter a valid Latitude between -90 and 90.");
      return;
    }
    if (isNaN(lngVal) || lngVal < -180 || lngVal > 180) {
      invalidateField('longitude', "Please enter a valid Longitude between -180 and 180.");
      return;
    }
    if (!formData.waste_generator_name?.trim()) {
      invalidateField('waste_generator_name', "BWG Name is required.");
      return;
    }
    if (formData.area_sqm) {
      const areaVal = parseFloat(formData.area_sqm);
      if (isNaN(areaVal) || areaVal <= 0) {
        invalidateField('area_sqm', "Area (SqM) must be a positive number.");
        return;
      }
    }
    if (formData.no_of_dwelling_units) {
      const unitsVal = parseInt(formData.no_of_dwelling_units);
      if (isNaN(unitsVal) || unitsVal <= 0) {
        invalidateField('no_of_dwelling_units', "Flats must be a positive integer.");
        return;
      }
    }
    if (!formData.complete_address?.trim()) {
      invalidateField('complete_address', "Complete Address is required.");
      return;
    }

    // Field Validations for active subcategory cards (Only validated if selected)
    const activeCards = subcategoryCards.filter(c => c.included);
    for (const card of activeCards) {
      if (card.pricing_mode === 'Bulk') {
        if (!card.selected_variation_id) {
          toast.error(`Please select a variation for ${card.subcategory_name}.`);
          return;
        }
        const mp = parseFloat(card.bulk_monthly_price);
        const yp = parseFloat(card.bulk_yearly_price);
        if (isNaN(mp) || mp < 0 || isNaN(yp) || yp < 0) {
          toast.error(`Please enter valid Monthly and Yearly bulk prices for ${card.subcategory_name}.`);
          return;
        }
      } else {
        if (!card.selected_variation_id || !card.expected_waste || !card.custom_price) {
          toast.error(`Please select a variation, expected waste, and price for ${card.subcategory_name}.`);
          return;
        }
        const val = parseFloat(card.expected_waste);
        if (isNaN(val) || val < 1) {
          toast.error(`Please enter a valid Expected Waste (min 1 KG) for ${card.subcategory_name}.`);
          return;
        }
        const priceVal = parseFloat(card.custom_price);
        if (isNaN(priceVal) || priceVal < 0) {
          toast.error(`Please enter a valid Price (min 0) for ${card.subcategory_name}.`);
          return;
        }
      }
    }

    // Date validation (Only if pickup date is provided)
    if (formData.pickup_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.pickup_date);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        invalidateField('pickup_date', "Pickup date cannot be in the past.");
        return;
      }
    }

    // Require MOM (Agreement) Copy (Always required)
    if (!momFile && !existingMomFile) {
      invalidateField('mom_file_upload', "MOM (Agreement) Copy is always required.", true);
      return;
    }
    // Require PO Copy or Email Copy (At least one is required)
    if (!poFile && !existingPoFile && !emailCopyFile && !existingEmailFile) {
      invalidateField('po_file_upload', "Please upload at least one document: PO Copy or Email Copy.", true);
      return;
    }

    setSubmitting(true);

    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '' && formData[key] !== null) {
        payload.append(key, formData[key]);
      }
    });

    if (momFile) {
      payload.append('mom_agreement_file', momFile);
    } else if (existingMomFile) {
      payload.append('mom_agreement_file', existingMomFile);
    }

    if (poFile) {
      payload.append('po_copy_file', poFile);
    } else if (existingPoFile) {
      payload.append('po_copy_file', existingPoFile);
    }

    if (emailCopyFile) {
      payload.append('email_copy_file', emailCopyFile);
    } else if (existingEmailFile) {
      payload.append('email_copy_file', existingEmailFile);
    }

    if (rwaFile) {
      payload.append('rwa_file', rwaFile);
    } else if (existingRwaFile) {
      payload.append('rwa_file', existingRwaFile);
    }

    if (gstFile) {
      payload.append('gst_file', gstFile);
    } else if (existingGstFile) {
      payload.append('gst_file', existingGstFile);
    }

    if (panFile) {
      payload.append('pan_file', panFile);
    } else if (existingPanFile) {
      payload.append('pan_file', existingPanFile);
    }

    if (tradeLicenseFile) {
      payload.append('trade_license_file', tradeLicenseFile);
    } else if (existingTradeFile) {
      payload.append('trade_license_file', existingTradeFile);
    }



    // Build subcategories array
    const subcategoriesData = activeCards.map(card => {
      const selectedVar = (card.variations || []).find(v => v.id == card.selected_variation_id);
      const defaultVarPrice = selectedVar ? parseFloat(selectedVar.per_kg_price || 0) : 0;
      const customPriceVal = parseFloat(card.custom_price);
      const finalPrice = (!isNaN(customPriceVal) && customPriceVal >= 0 && card.custom_price !== '')
        ? customPriceVal
        : defaultVarPrice;

      const expectedWaste = parseFloat(card.expected_waste) || 0;
      return {
        category_id: card.category_id,
        subcategory_id: card.subcategory_id,
        variation_id: selectedVar ? selectedVar.id : '',
        expected_waste: expectedWaste,
        custom_price: finalPrice,
        suggested_price: defaultVarPrice,
        pricing_mode: card.pricing_mode || 'KG',
        bulk_monthly_price: parseFloat(card.bulk_monthly_price) || 0,
        bulk_yearly_price: parseFloat(card.bulk_yearly_price) || 0
      };
    });

    payload.append('subcategories', JSON.stringify(subcategoriesData));

    // Append Files
    selectedFiles.forEach(file => {
      payload.append('images', file);
    });

    try {
      await api.post('/waste-collection-requests', payload);
      setSuccessData({
        branch_code: formData.branch_code,
        employee_name: formData.employee_name,
        business_region: formData.business_region,
        final_price: formData.final_price
      });
      setSubmitSuccess(true);
      resetForm();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate waste collection request.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── T&C Screen (shown first, before the form) ─────────────────────────────
  if (!tncAccepted) {
    const TNC_ITEMS = [
      {
        key: 'tnc_agree',
        text: 'By using our waste management services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, as well as the terms and conditions outlined in the MoU, which are hereby incorporated by reference.',
      },
      {
        key: 'accuracy_agree',
        text: 'We warrant that the information provided by us is to the best of our knowledge and belief, accurate and current at the time of provisioning.',
      },
      {
        key: 'copyright_agree',
        text: 'Copyrights reserved with Ecosphere Waste Solutions and Mukka Protiens Limited.',
      },
      {
        key: 'promo_agree',
        text: 'I agree to receive promotional emails',
      },
    ];

    return (
      <div className="w-full pb-12 px-0 font-sans">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={handleTncDecline}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-violet-600" /> Waste Collection Requests
            </h1>
            <p className="text-slate-400 mt-0.5 text-sm">Please review and accept the Terms & Conditions to continue.</p>
          </div>
        </div>

        {/* T&C Card */}
        <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center gap-3 px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Terms &amp; Conditions</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Read each point carefully and check the boxes to agree</p>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="px-8 py-6 space-y-3">
            {TNC_ITEMS.map(({ key, text }) => (
              <label
                key={key}
                className={`flex items-start gap-4 rounded-2xl px-5 py-4 cursor-pointer select-none transition-all border ${tncBoxes[key]
                  ? 'bg-violet-50 border-violet-200 shadow-sm'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
              >
                <input
                  type="checkbox"
                  checked={tncBoxes[key]}
                  onChange={() => setTncBoxes(prev => ({ ...prev, [key]: !prev[key] }))}
                  className="mt-0.5 flex-shrink-0 w-4 h-4 cursor-pointer accent-violet-600"
                />
                <p className={`text-sm leading-relaxed font-medium ${tncBoxes[key] ? 'text-violet-800' : 'text-slate-600'}`}>
                  {text}
                </p>
              </label>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 px-8 py-6 bg-slate-50 border-t border-slate-100">
            <button
              type="button"
              onClick={handleTncDecline}
              className="px-8 py-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl text-sm transition-all cursor-pointer shadow-sm"
            >
              Decline
            </button>
            <button
              type="button"
              disabled={tncSaving || !Object.values(tncBoxes).every(Boolean)}
              onClick={handleTncAccept}
              className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-violet-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {tncSaving ? 'Saving…' : 'Accept & Continue →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="w-full pb-12 px-4 font-sans flex items-center justify-center min-h-[75vh] bg-slate-50/50">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-[900px] w-full text-center border border-slate-200 shadow-xl relative overflow-hidden animate-in zoom-in-95 duration-300">
          {/* Top Decorative Wave/Bar */}
          <div className="w-24 h-24 bg-emerald-50 border-4 border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-md">
            <CheckCircle className="w-12 h-12 animate-in zoom-in duration-300" />
          </div>

          <h2 className="text-3xl font-black text-slate-800 tracking-tight animate-in slide-in-from-bottom duration-300">Request Generated!</h2>
          <p className="text-slate-500 mt-3 text-sm leading-relaxed max-w-md mx-auto">
            Your manual waste collection request has been saved successfully and is set to
            <span className="font-extrabold text-violet-600 bg-violet-50 px-2 py-0.5 rounded mx-1.5 border border-violet-100 text-xs">PENDING</span>
            status.
          </p>

          {/* Detailed summary inside a clean card */}
          <div className="mt-8 bg-slate-50 rounded-2xl p-6 border border-slate-200/60 text-left space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Request Overview</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-medium text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Branch Code</span>
                <span className="text-slate-800 font-bold">{successData?.branch_code || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee Name</span>
                <span className="text-slate-800 font-bold">{successData?.employee_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Business Region</span>
                <span className="text-slate-800 font-bold">{successData?.business_region || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Final Price (Yearly)</span>
                <span className="text-violet-600 font-extrabold">₹{parseFloat(successData?.final_price || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => setSubmitSuccess(false)}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-bold transition-all hover:-translate-y-0.5 cursor-pointer text-sm"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Group subcategories by category
  const categoriesMap = {};
  subcategoryCards.forEach(card => {
    if (!categoriesMap[card.category_id]) {
      categoriesMap[card.category_id] = {
        category_id: card.category_id,
        category_name: card.category_name,
        color: card.color,
        subcategories: []
      };
    }
    categoriesMap[card.category_id].subcategories.push(card);
  });
  const groupedCategories = Object.values(categoriesMap);

  return (
    <div className="w-full pb-12 px-0 font-sans">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-violet-600" /> Add Waste Collection Request
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Phase 1 — Enter request details manually.</p>
        </div>


      </div>

      <form onSubmit={handleFormSubmit} noValidate className="space-y-4">

        {/* B2B ONLY: Company Details */}
        {activeTab === 'B2B' && (
          <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-6 sm:p-8 animate-in fade-in duration-300">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building className="w-5 h-5 text-violet-500" /> Section 1: Company Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Site Request *</label>
                <select
                  name="site_request"
                  value={formData.site_request}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
                >
                  <option value="" disabled hidden>Select Option</option>
                  <option value="Commercial Route">Commercial Route</option>
                  <option value="Commercial Onsite">Commercial Onsite</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Service Center Type *</label>
                <select
                  name="service_center_type"
                  value={formData.service_center_type}
                  onChange={handleInputChange}
                  required
                  autoComplete="off"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
                >
                  <option value="" disabled hidden>Select Option</option>
                  <option value="Ecosphere">Ecosphere</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employee Name</label>
                <input
                  type="text"
                  name="employee_name"
                  readOnly
                  value={formData.employee_name}
                  onChange={handleInputChange}
                  placeholder="Enter employee name"
                  className="w-full cursor-not-allowed bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing *</label>
                <select
                  name="billing_type"
                  value={formData.billing_type}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
                >
                  <option value="" disabled hidden>Select Option</option>
                  <option value="Head Office">Head Office</option>
                  <option value="Regional Office">Regional Office</option>
                  <option value="Branch Office">Branch Office</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Region *</label>
                <select
                  name="business_region"
                  value={formData.business_region}
                  onChange={handleRegionChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
                >
                  <option value="" disabled hidden>Select Option</option>
                  {Array.from(new Set(businessRegions.map(r => r.region_name || r.state))).filter(Boolean).map(stateName => {
                    const regObj = businessRegions.find(r => (r.region_name || r.state) === stateName);
                    if (!regObj) return null;
                    return (
                      <option key={regObj.id} value={stateName}>{stateName}</option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Sub Region *</label>
                <select
                  name="business_sub_region"
                  value={formData.business_sub_region}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
                >
                  <option value="" disabled hidden>- Select Branch -</option>
                  {businessSubRegions.map(subReg => (
                    <option key={subReg.id} value={subReg.sub_region_name}>{subReg.sub_region_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Branch Code</label>
                <input
                  type="text"
                  name="branch_code"
                  value={formData.branch_code}
                  readOnly
                  placeholder="Auto-generated"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 outline-none text-sm font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Dynamically show sub-region branch details */}
              {formData.business_sub_region && (() => {
                const sub = (businessSubRegions || []).find(s => s.sub_region_name === formData.business_sub_region);
                if (!sub) return null;
                return (
                  <div className="col-span-full bg-purple-50/50 border border-purple-100 rounded-xl p-4 text-xs space-y-2 mt-2">
                    <p className="font-bold text-purple-800 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-purple-600" /> Branch Information: {sub.branch_name || sub.sub_region_name}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                      <div><strong className="text-slate-500 font-bold">Branch Code:</strong> {sub.branch_code || 'N/A'}</div>
                      <div><strong className="text-slate-500 font-bold">Contact Person:</strong> {sub.contact_person_name || 'N/A'}</div>
                      <div><strong className="text-slate-500 font-bold">Contact Number:</strong> {sub.contact_number || 'N/A'}</div>
                      <div><strong className="text-slate-500 font-bold">Email ID:</strong> {sub.email_id || 'N/A'}</div>
                      {sub.office_address && <div className="sm:col-span-2"><strong className="text-slate-500 font-bold">Office Address:</strong> {sub.office_address}</div>}
                      <div className="sm:col-span-2 flex flex-wrap gap-2 mt-1">
                        {sub.gstn && <span className="bg-white border border-purple-100 px-2 py-0.5 rounded text-[10px] font-bold text-purple-700">GSTN: {sub.gstn}</span>}
                        {sub.agri_licence && <span className="bg-white border border-purple-100 px-2 py-0.5 rounded text-[10px] font-bold text-purple-700">Agri Licence: {sub.agri_licence}</span>}
                        {sub.shop_establishment && <span className="bg-white border border-purple-100 px-2 py-0.5 rounded text-[10px] font-bold text-purple-700">Shop Est: {sub.shop_establishment}</span>}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* SECTION 1/2: Customer Details */}
        <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-violet-500" /> {activeTab === 'B2C' ? 'Section 1: Customer Details' : 'Section 2: Customer Details'}
          </h2>

          {activeTab === 'B2C' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-300">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Type *</label>
                <select
                  name="customer_type"
                  value={formData.customer_type}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
                >
                  <option value="Individual">Individual</option>
                  <option value="Commercial">Commercial</option>
                  <option value="RWA">RWA</option>
                  <option value="Residential">Residential</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Person *</label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter 10-digit number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="example@mail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Type *</label>
                <select
                  name="customer_type"
                  value={formData.customer_type}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
                >
                  <option value="" disabled hidden>Select Option</option>
                  <option value="New Customer">New Customer</option>
                  <option value="Existing Customer">Existing Customer</option>
                </select>
              </div>

              {formData.customer_type === 'Existing Customer' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Search Customer Mobile *</label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={searchMobile}
                      onChange={(e) => setSearchMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter the number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={handleSearchMobile}
                      disabled={searchingMobile}
                      className="px-5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      {searchingMobile ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Lead *</label>
                <select
                  name="business_lead"
                  value={formData.business_lead}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
                >
                  <option value="" disabled hidden>Select Option</option>
                  <option value="Exhibition">Exhibition</option>
                  <option value="Web Lead">Web Lead</option>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
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
                    placeholder="e.g. +91 9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                  />
                </div>
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                  />
                </div>
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

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Others</label>
                <input
                  type="text"
                  name="others_note"
                  value={formData.others_note}
                  onChange={handleInputChange}
                  placeholder="e.g. Additional note"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION: License Details (B2C Section 2, B2B Section 3) */}
        {(activeTab === 'B2C' || activeTab === 'B2B') && (
          <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-6 sm:p-8 animate-in fade-in duration-300">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-violet-500" /> {activeTab === 'B2C' ? 'Section 2: License Details' : 'Section 3: License Details'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registered RWA</label>
                <input
                  type="text"
                  name="registered_rwa"
                  value={formData.registered_rwa}
                  onChange={handleInputChange}
                  placeholder="e.g. Green Valley Association"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
                <div className="mt-2">
                  {renderDocumentUploadField(rwaFile, setRwaFile, existingRwaFile, setExistingRwaFile, "Upload RWA Proof", ".pdf,image/*", "rwa_file_upload")}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GST Number</label>
                <input
                  type="text"
                  name="gst"
                  value={formData.gst}
                  onChange={handleInputChange}
                  placeholder="e.g. 07AAAAA1111A1Z1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
                <div className="mt-2">
                  {renderDocumentUploadField(gstFile, setGstFile, existingGstFile, setExistingGstFile, "Upload GST Certificate", ".pdf,image/*", "gst_file_upload")}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">PAN Number</label>
                <input
                  type="text"
                  name="pan"
                  value={formData.pan}
                  onChange={handleInputChange}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
                <div className="mt-2">
                  {renderDocumentUploadField(panFile, setPanFile, existingPanFile, setExistingPanFile, "Upload PAN Copy", ".pdf,image/*", "pan_file_upload")}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Trade License</label>
                <input
                  type="text"
                  name="trade_license"
                  value={formData.trade_license}
                  onChange={handleInputChange}
                  placeholder="e.g. TL-998877"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
                <div className="mt-2">
                  {renderDocumentUploadField(tradeLicenseFile, setTradeLicenseFile, existingTradeFile, setExistingTradeFile, "Upload Trade License Copy", ".pdf,image/*", "trade_file_upload")}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 4: Location Details */}
        <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-5 h-5 text-violet-500" /> Section 4: Location Details
          </h2>
          <div className="space-y-6">

            {/* Row 1: Address Search (Shared) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address Search *</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  id="mapSearchInput"
                  name="address_search"
                  value={formData.address_search}
                  onChange={handleInputChange}
                  required
                  placeholder="Search locations using Google..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
              </div>
            </div>

            {/* Row 2: Latitude & Longitude (Shared) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Latitude *</label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  readOnly={activeTab === 'B2B'}
                  required
                  placeholder="e.g. 28.7041"
                  className={`w-full border rounded-xl py-3 px-4 outline-none transition-all text-sm font-medium ${activeTab === 'B2B'
                      ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-50 border-slate-200 text-slate-700 focus:ring-4 focus:ring-violet-100 focus:border-violet-400'
                    }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Longitude *</label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  readOnly={activeTab === 'B2B'}
                  required
                  placeholder="e.g. 77.1025"
                  className={`w-full border rounded-xl py-3 px-4 outline-none transition-all text-sm font-medium ${activeTab === 'B2B'
                      ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-50 border-slate-200 text-slate-700 focus:ring-4 focus:ring-violet-100 focus:border-violet-400'
                    }`}
                />
              </div>
            </div>

            {/* Row 3: Map Container (Shared) */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
              <div
                ref={mapDivRef}
                id="propertyMap"
                style={{ height: '320px', width: '100%' }}
              />
              {!formData.latitude && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 pointer-events-none">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-500">Search an address above to pin the location</p>
                    <p className="text-[11px] text-slate-400 mt-1">You can also drag the marker to adjust</p>
                  </div>
                </div>
              )}
            </div>

            {activeTab === 'B2B' ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Row 4: BWG Name and Sector (side-by-side) */}
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

                {/* Row 5: Flats/Area based on sector (Full Width) */}
                {formData.sector && (
                  <div className="animate-in fade-in duration-300">
                    {formData.sector === 'Apartment' ? (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Flats *</label>
                        <input
                          type="number"
                          name="no_of_dwelling_units"
                          value={formData.no_of_dwelling_units}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. 12"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Area (SqM) *</label>
                        <input
                          type="number"
                          name="area_sqm"
                          value={formData.area_sqm}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. 500"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Row 6: Complete Address (Full Width) */}
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

                {/* Row 7: Landmark, City, State (3 columns) */}
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

                {/* Row 8: Pincode, Country, Google Map Link (3 columns) */}
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

                {/* Billing Address Option Checkbox */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="billing_address_different"
                    name="billing_address_different"
                    checked={formData.billing_address_different}
                    onChange={handleInputChange}
                    className="w-4 h-4 cursor-pointer accent-violet-600 rounded"
                  />
                  <label htmlFor="billing_address_different" className="text-sm font-semibold text-slate-600 cursor-pointer select-none">
                    Billing Address is Different
                  </label>
                </div>

                {/* Billing Address Details Form */}
                {formData.billing_address_different && (
                  <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Legal Name</label>
                      <input
                        type="text"
                        name="billing_customer_legal_name"
                        value={formData.billing_customer_legal_name}
                        onChange={handleInputChange}
                        placeholder="e.g. Acme Corporation"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Trade Name</label>
                      <input
                        type="text"
                        name="billing_customer_trade_name"
                        value={formData.billing_customer_trade_name}
                        onChange={handleInputChange}
                        placeholder="e.g. Acme Trading"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Person</label>
                      <input
                        type="text"
                        name="billing_contact_person"
                        value={formData.billing_contact_person}
                        onChange={handleInputChange}
                        placeholder="e.g. John Doe"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Designation</label>
                      <input
                        type="text"
                        name="billing_designation"
                        value={formData.billing_designation}
                        onChange={handleInputChange}
                        placeholder="e.g. Sales Manager"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number 1</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          name="billing_phone_number_1"
                          value={formData.billing_phone_number_1}
                          onChange={handleInputChange}
                          placeholder="e.g. +91 9876543210"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number 2</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          name="billing_phone_number_2"
                          value={formData.billing_phone_number_2}
                          onChange={handleInputChange}
                          placeholder="e.g. +91 9123456780"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">E-Mail</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          name="billing_email"
                          value={formData.billing_email}
                          onChange={handleInputChange}
                          placeholder="e.g. john@example.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">E-Mail 2</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          name="billing_email_2"
                          value={formData.billing_email_2}
                          onChange={handleInputChange}
                          placeholder="e.g. contact@acme.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address *</label>
                      <textarea
                        name="billing_complete_address"
                        value={formData.billing_complete_address}
                        onChange={handleInputChange}
                        required={formData.billing_address_different}
                        rows="3"
                        placeholder="e.g. 456 Industrial Area, Bangalore"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Others</label>
                      <input
                        type="text"
                        name="billing_others"
                        value={formData.billing_others}
                        onChange={handleInputChange}
                        placeholder="e.g. Additional note"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City *</label>
                      <input
                        type="text"
                        name="billing_city"
                        value={formData.billing_city}
                        onChange={handleInputChange}
                        required={formData.billing_address_different}
                        placeholder="e.g. Bangalore"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">State *</label>
                      <input
                        type="text"
                        name="billing_state"
                        value={formData.billing_state}
                        onChange={handleInputChange}
                        required={formData.billing_address_different}
                        placeholder="e.g. Karnataka"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pincode *</label>
                      <input
                        type="text"
                        name="billing_pincode"
                        value={formData.billing_pincode}
                        onChange={handleInputChange}
                        required={formData.billing_address_different}
                        placeholder="e.g. 560001"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Landmark</label>
                      <input
                        type="text"
                        name="billing_landmark"
                        value={formData.billing_landmark}
                        onChange={handleInputChange}
                        placeholder="e.g. Near Central Park"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Country *</label>
                      <input
                        type="text"
                        name="billing_country"
                        value={formData.billing_country}
                        onChange={handleInputChange}
                        required={formData.billing_address_different}
                        placeholder="e.g. India"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">BWG Name *</label>
                    <input
                      type="text"
                      name="waste_generator_name"
                      value={formData.waste_generator_name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Smart Bazar / RWA Residency"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Area (SqM)</label>
                      <input
                        type="number"
                        name="area_sqm"
                        value={formData.area_sqm}
                        onChange={handleInputChange}
                        placeholder="e.g. 500"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Flats</label>
                      <input
                        type="number"
                        name="no_of_dwelling_units"
                        value={formData.no_of_dwelling_units}
                        onChange={handleInputChange}
                        placeholder="e.g. 12"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Complete Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                    <textarea
                      name="complete_address"
                      value={formData.complete_address}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      placeholder="Enter complete detailed street address..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* SECTION 5: Service Details / Expected Waste (KG) */}
        <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ClipboardCheck className="w-5 h-5 text-violet-500" /> Section 5: Service Details / Expected Waste (KG)
          </h2>
          <div className="space-y-6">

            {subcategoryCards.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                Loading waste categories...
              </div>
            ) : (
              <div className="space-y-8">
                {/* Grouped Category Selection Controls */}
                <div className="space-y-6 pb-6 border-b border-slate-100">
                  {groupedCategories.map((cat) => {
                    const selectedSubcats = cat.subcategories.filter(s => s.included);
                    const isOpen = openDropdownCategoryId === cat.category_id;

                    return (
                      <div key={cat.category_id} className="space-y-2 relative">
                        {/* Category Header */}
                        <h3 className="text-lg font-black text-emerald-800 tracking-tight">
                          {cat.category_name}
                        </h3>

                        {/* Sub-Category Label */}
                        <label className="block text-xs font-bold text-slate-700 mt-2 mb-1">
                          Sub-Category
                        </label>

                        {/* Multiselect Box */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownCategoryId(isOpen ? null : cat.category_id);
                          }}
                          className="min-h-[50px] bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-2 flex flex-wrap gap-2 items-center cursor-pointer select-none transition-all focus-within:ring-2 focus-within:ring-violet-500/20"
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

                        {/* Dropdown Menu */}
                        {isOpen && (
                          <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                            {cat.subcategories.map((sub) => (
                              <div
                                key={sub.subcategory_id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleInclude(sub.subcategory_id);
                                }}
                                className={`px-4 py-2 text-sm font-medium cursor-pointer hover:bg-slate-50 flex items-center justify-between ${sub.included ? 'text-violet-600 bg-violet-50/50' : 'text-slate-700'
                                  }`}
                              >
                                <span>{sub.subcategory_name}</span>
                                {sub.included && (
                                  <span className="text-violet-600 font-bold">✓</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Render Cards only for selected subcategories */}
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
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-[16px] p-6 space-y-6 transition-all duration-300 hover:shadow-md animate-in fade-in duration-300"
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

                        {card.pricing_mode === 'Bulk' ? (
                          <>
                            {/* 5. Bulk Monthly Price */}
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-700">Monthly Price *</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  disabled={!selectedVar}
                                  value={card.bulk_monthly_price}
                                  onChange={e => handleCardBulkPriceChange(card.subcategory_id, 'bulk_monthly_price', e.target.value)}
                                  placeholder="Enter monthly price"
                                  className={`w-full border rounded-lg py-2.5 pl-3 pr-8 outline-none focus:ring-4 transition-all text-sm font-semibold text-slate-800 ${selectedVar
                                      ? 'bg-white border-slate-200 focus:ring-purple-100 focus:border-purple-400'
                                      : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                              </div>
                            </div>

                            {/* 6. Suggested Bulk Price */}
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-700">Suggested Bulk Price</label>
                              <input
                                type="text"
                                disabled
                                value={selectedVar ? `₹${selectedVar.bulk_price || '0'}/Month` : ''}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm font-semibold text-slate-500 cursor-not-allowed"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            {/* 5. Expected Waste Per Day */}
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-700">Expected Waste (KG Per Day) *</label>
                              <input
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

                            {/* 6. Agreed Price */}
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-700">Agreed Price *</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  required
                                  disabled={!selectedVar}
                                  value={card.custom_price}
                                  onChange={e => handleCardPriceChange(card.subcategory_id, e.target.value)}
                                  placeholder="Enter price"
                                  className={`w-full border rounded-lg py-2.5 pl-3 pr-12 outline-none focus:ring-4 transition-all text-sm font-semibold text-slate-800 ${selectedVar
                                      ? 'bg-white border-slate-200 focus:ring-purple-100 focus:border-purple-400'
                                      : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹/KG</span>
                              </div>
                            </div>

                            {/* 7. Suggested Price */}
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-700">Suggested Price</label>
                              <input
                                type="text"
                                disabled
                                value={selectedVar ? `₹${selectedVar.per_kg_price || '0'}/KG` : ''}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm font-semibold text-slate-500 cursor-not-allowed"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Live Calculations Section */}
                      {selectedVar && (
                        card.pricing_mode === 'Bulk' ? (
                          (parseFloat(card.bulk_monthly_price) > 0 || parseFloat(card.bulk_yearly_price) > 0) && (
                            <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-300">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price Summary</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Monthly Price</span>
                                  <span className="font-extrabold text-purple-700 text-sm block mt-0.5">
                                    ₹{parseFloat(card.bulk_monthly_price || 0).toLocaleString('en-IN')}
                                  </span>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Yearly Price</span>
                                  <span className="font-extrabold text-purple-700 text-sm block mt-0.5">
                                    ₹{parseFloat(card.bulk_yearly_price || 0).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        ) : (
                          expectedDaily > 0 && (
                            <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-300">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Estimates</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Monthly Waste</span>
                                  <span className="font-extrabold text-slate-800 text-sm block mt-0.5">{estMonthlyWaste.toFixed(2).replace(/\.00$/, '')} KG</span>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Yearly Waste</span>
                                  <span className="font-extrabold text-slate-800 text-sm block mt-0.5">{estYearlyWaste.toFixed(2).replace(/\.00$/, '')} KG</span>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Monthly Price</span>
                                  <span className="font-extrabold text-purple-700 text-sm block mt-0.5">₹{estMonthlyPrice.toFixed(2).replace(/\.00$/, '')}</span>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Yearly Price</span>
                                  <span className="font-extrabold text-purple-700 text-sm block mt-0.5">₹{estYearlyPrice.toFixed(2).replace(/\.00$/, '')}</span>
                                </div>
                              </div>
                            </div>
                          )
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* SECTION 6: Price Section */}
        {activeTab === 'B2B' && (
          <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-6 sm:p-8 animate-in fade-in duration-300">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ClipboardCheck className="w-5 h-5 text-violet-500" /> Section 6: Price Section
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Order Value (Yearly)</label>
                <input
                  type="number"
                  name="total_order_value"
                  readOnly
                  value={formData.total_order_value}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 outline-none text-sm font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">SEZ *</label>
                <select
                  name="sez"
                  value={formData.sez}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Taxability (%) *</label>
                <select
                  name="taxibility"
                  disabled={formData.sez === 'Yes'}
                  value={formData.taxibility}
                  onChange={handleInputChange}
                  required
                  className={`w-full border border-slate-200 rounded-xl py-3 px-4 outline-none transition-all text-sm font-medium ${formData.sez === 'Yes' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 text-slate-700 cursor-pointer focus:ring-4 focus:ring-violet-100 focus:border-violet-400'}`}
                >
                  <option value="0.00">0.00 %</option>
                  <option value="5.00">5.00 %</option>
                  <option value="12.00">12.00 %</option>
                  <option value="18.00">18.00 %</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">CGST</label>
                <input
                  type="number"
                  name="cgst"
                  readOnly
                  value={formData.cgst}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 outline-none text-sm font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">SGST</label>
                <input
                  type="number"
                  name="sgst"
                  readOnly
                  value={formData.sgst}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 outline-none text-sm font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GST</label>
                <input
                  type="number"
                  name="gst_amount"
                  readOnly
                  value={formData.gst_amount}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 outline-none text-sm font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Discount (Yearly) *</label>
                <input
                  type="number"
                  name="discount"
                  min="0"
                  step="any"
                  value={formData.discount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Discounted Price (Yearly)</label>
                <input
                  type="number"
                  name="discounted_price"
                  readOnly
                  value={formData.discounted_price}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 outline-none text-sm font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Final Price (Yearly)</label>
                <input
                  type="number"
                  name="final_price"
                  readOnly
                  value={formData.final_price}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 outline-none text-sm font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 7: Additional Details */}
        <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-5 h-5 text-violet-500" /> Section 7: Additional Details
          </h2>
          <div className="space-y-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preferred Pickup Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    name="pickup_date"
                    value={formData.pickup_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-semibold text-slate-700 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preferred Pickup Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="pickup_time"
                    disabled
                    value={formData.pickup_time}
                    placeholder="Select a time slot card below..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-semibold text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Selectable Time Slot Cards */}
            {formData.pickup_date && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Select Available Time Slot
                </label>
                {loadingSlots ? (
                  <div className="text-slate-400 text-xs flex items-center gap-2 py-2">
                    <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading available time slots...
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs font-bold flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-500" />
                    No active time slots are available for the selected date. Please choose another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {timeSlots.map((slot) => {
                      const isSelected = formData.time_slot_id == slot.id;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              time_slot_id: slot.id,
                              pickup_time: `${slot.start_time_formatted} - ${slot.end_time_formatted}`
                            }));
                          }}
                          className={`flex flex-col justify-center p-4 rounded-2xl border text-left transition-all duration-200 h-20 ${isSelected
                            ? 'bg-violet-600 border-violet-600 text-white shadow-md'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer text-slate-700'
                            }`}
                        >
                          <div className="w-full">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-sm block truncate max-w-[80%]">
                                {slot.slot_name}
                              </span>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected
                                ? 'border-white bg-white'
                                : 'border-slate-300 bg-white'
                                }`}>
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-violet-600" />
                                )}
                              </div>
                            </div>
                            <span className={`text-[11px] font-bold block mt-1 ${isSelected ? 'text-violet-100' : 'text-slate-500'}`}>
                              {slot.start_time_formatted} - {slot.end_time_formatted}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pickup Notes</label>
              <textarea
                name="pickup_notes"
                value={formData.pickup_notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Provide instructions, landmarks, or special details for the driver..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm resize-none"
              />
            </div>

            {/* Upload Waste Images */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upload Waste Images (Multiple)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                {/* Image Add Box */}
                <div className="relative h-28 border-2 border-dashed border-slate-200 hover:border-violet-400 transition-colors bg-slate-50/50 rounded-xl flex flex-col items-center justify-center cursor-pointer text-center text-slate-400 p-2">
                  <ImageIcon className="w-7 h-7 mb-1 opacity-50 text-slate-400" />
                  <span className="text-[10px] font-bold">Add Photo</span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                {/* Previews */}
                {filePreviews.map((url, idx) => (
                  <div key={idx} className="relative h-28 border border-slate-200 rounded-xl bg-slate-100 overflow-hidden">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-rose-500 text-white rounded-full opacity-90 hover:opacity-100 shadow-md transition-all active:scale-90"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

              </div>
            </div>

            {/* Document Uploads: MOM / PO / Email Copy */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                Required Documents <span className="text-[10px] text-slate-400 font-medium font-sans normal-case">(MOM is always required; Either PO or Email copy is required)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

                {/* MOM (Agreement) Copy */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600 flex items-center gap-1">
                    MOM (Agreement) Copy <span className="text-rose-500 font-bold">*</span>
                  </label>
                  {renderDocumentUploadField(momFile, setMomFile, existingMomFile, setExistingMomFile, "Upload MOM / Agreement Copy", ".pdf,image/*", "mom_file_upload")}
                </div>

                {/* PO Copy */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">PO Copy</label>
                  {renderDocumentUploadField(poFile, setPoFile, existingPoFile, setExistingPoFile, "Upload PO Copy", ".pdf,image/*", "po_file_upload")}
                </div>

                {/* Email Copy */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">Email Copy</label>
                  {renderDocumentUploadField(emailCopyFile, setEmailCopyFile, existingEmailFile, setExistingEmailFile, "Upload Email Copy", ".pdf,image/*", "email_file_upload")}
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Form Action Footer */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={resetForm}
            className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-sm transition-all cursor-pointer shadow-sm"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-10 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-violet-100 transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Generating Request…' : 'Generate Request'}
          </button>
        </div>

      </form>

      {/* Existing Customer Selection Modal */}
      {showCustomerPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-800">Select Existing Customer Profile</h3>
                <p className="text-xs text-slate-400 mt-0.5">Found {matchingCustomers.length} matching sites for mobile: <strong className="text-slate-600 font-bold">{searchMobile}</strong></p>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomerPopup(false)}
                className="p-2 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/30">
              {matchingCustomers.map((custGroup) => {
                const req = custGroup.first;
                return (
                  <div
                    key={custGroup.lead_id}
                    className="bg-white border border-slate-200 hover:border-violet-300 rounded-[1.25rem] p-5 shadow-sm transition-all hover:shadow-md relative group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="bg-violet-50 text-violet-700 font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-violet-100 mb-1.5 inline-block">
                            {req.customer_type}
                          </span>
                          <h4 className="text-sm font-bold text-slate-800">
                            {req.customer_legal_name || 'Unnamed Customer'}
                          </h4>
                          {req.customer_trade_name && (
                            <p className="text-xs text-slate-400 mt-0.5">Trade Name: {req.customer_trade_name}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => selectExistingCustomer(custGroup)}
                          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow shadow-violet-100 hover:shadow-violet-200 cursor-pointer"
                        >
                          Select Profile
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-600 border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">Generator: <strong>{req.waste_generator_name || 'N/A'}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>Last Booking: <strong>{req.created_at || req.createdAt ? new Date(req.created_at || req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</strong></span>
                        </div>
                        <div className="sm:col-span-2 flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2 leading-relaxed">{req.complete_address || 'No address details'}</span>
                        </div>
                      </div>

                      {/* Display items from this booking */}
                      <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 mt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Previous Services Selected</span>
                        <div className="flex flex-wrap gap-1.5">
                          {custGroup.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="bg-white border border-slate-200/80 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-600"
                            >
                              {item.subCategory?.name || 'Item'} ({item.billing_type === 'Bulk' ? 'Bulk' : `${item.expected_waste} KG`})
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

