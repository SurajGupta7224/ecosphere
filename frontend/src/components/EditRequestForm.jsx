import { useState, useEffect, useRef } from 'react';
import {
  ClipboardList, ClipboardCheck, RefreshCw, Search, Eye, X,
  User, Phone, Mail, MapPin, Building, Calendar, Clock,
  ShieldCheck, FileText, Layers, ChevronRight, Info,
  CheckCircle, XCircle, AlertCircle, Package, TrendingUp,
  IndianRupee, Weight, Tag, Home, Hash, Edit3, Save, MoreVertical, Trash2, Image as ImageIcon
} from 'lucide-react';
import api, { IMAGE_BASE_URL } from '../api';
import toast from 'react-hot-toast';

export default function EditRequestForm({ selectedGroup, onSuccess, onCancel }) {
  const [saving, setSaving] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [editSubcategoryCards, setEditSubcategoryCards] = useState([]);
  const [openDropdownCategoryId, setOpenDropdownCategoryId] = useState(null);

  // File management states for editing
  const [editSelectedFiles, setEditSelectedFiles] = useState([]);
  const [editFilePreviews, setEditFilePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // Individual document edit files
  const [editMomFile, setEditMomFile] = useState(null);
  const [editPoFile, setEditPoFile] = useState(null);
  const [editRwaFile, setEditRwaFile] = useState(null);
  const [editGstFile, setEditGstFile] = useState(null);
  const [editPanFile, setEditPanFile] = useState(null);
  const [editTradeFile, setEditTradeFile] = useState(null);
  const [editEmailFile, setEditEmailFile] = useState(null);

  // Business Regions and Sub-Regions states for dropdowns
  const [businessRegions, setBusinessRegions] = useState([]);
  const [businessSubRegions, setBusinessSubRegions] = useState([]);

  const [searchMobile, setSearchMobile] = useState('');
  const [searchingMobile, setSearchingMobile] = useState(false);
  const [matchingCustomers, setMatchingCustomers] = useState([]);
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);

  const [editFormData, setEditFormData] = useState({
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

    // B2B fields
    site_request: '',
    service_center_type: '',
    employee_name: '',
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
    billing_details: '',
    audit_requirement: '',
    technician_assign: '',
    technician: '',
    total_order_value: '0.00',
    total_yearly_amount: '0.00',
    discount: '0.00',
    discounted_price: '0.00',
    sez: 'No',
    taxibility: '0.00 %',
    cgst: '0.00',
    sgst: '0.00',
    gst_amount: '0.00',
    final_price: '0.00',
    sector: '',
  });

  const editAutocompleteRef = useRef(null);
  const editMapInstanceRef = useRef(null);
  const editMarkerRef = useRef(null);
  const editMapDivRef = useRef(null);

  // Load edit form fields when entering edit mode
  useEffect(() => {
    if (!selectedGroup) return;

    const first = selectedGroup.first || {};

    let parsedImages = [];
    if (first.images) {
      try {
        parsedImages = typeof first.images === 'string' ? JSON.parse(first.images) : first.images;
      } catch (err) {
        console.error("Failed to parse images:", err);
      }
    }
    setExistingImages(parsedImages || []);
    setEditSelectedFiles([]);
    setEditFilePreviews([]);
    setSearchMobile(first.mobile_number || '');

    let billing = {};
    if (first.billing_details) {
      try {
        const parsed = typeof first.billing_details === 'string' ? JSON.parse(first.billing_details) : first.billing_details;
        if (parsed && typeof parsed === 'object') {
          billing = parsed;
        }
      } catch (err) {
        console.error("Failed to parse billing_details:", err);
      }
    }

    setEditFormData({
      customer_type: first.customer_type || 'Individual',
      mobile_number: first.mobile_number || '',
      email: first.email || '',
      address_search: first.address_search || first.complete_address || '',
      latitude: first.latitude || '',
      longitude: first.longitude || '',
      waste_generator_name: first.waste_generator_name || '',
      complete_address: first.complete_address || '',
      area_sqm: first.area_sqm || '',
      no_of_dwelling_units: first.dwelling_units || first.no_of_dwelling_units || '',
      registered_rwa: first.registered_rwa || '',
      gst: first.gst_number || '',
      pan: first.pan_number || '',
      trade_license: first.trade_license || '',
      pickup_notes: first.pickup_notes || '',
      pickup_date: first.pickup_date || '',
      pickup_time: first.pickup_time || '',
      time_slot_id: first.time_slot_id || '',

      // B2B fields
      site_request: first.site_request || '',
      service_center_type: first.service_center_type || 'Service Center Type',
      employee_name: first.employee_name || '',
      billing_type: first.billing_type || '',
      business_region: first.business_region || '',
      business_sub_region: first.business_sub_region || '',
      branch_code: first.branch_code || '',
      business_lead: first.business_lead || '',
      customer_legal_name: first.customer_legal_name || '',
      customer_trade_name: first.customer_trade_name || '',
      contact_person: first.contact_person || '',
      designation: first.designation || '',
      phone_number_2: first.phone_number_2 || '',
      email_2: first.email_2 || '',
      others_note: first.others_note || '',
      google_map_link: first.google_map_link || '',
      landmark: first.landmark || '',
      city: first.city || '',
      state: first.state || '',
      pincode: first.pincode || '',
      country: first.country || '',
      billing_address_different: first.billing_address_different === true || first.billing_address_different === 1 || first.billing_address_different === 'true',
      billing_details: first.billing_details || '',
      audit_requirement: first.audit_requirement || '',
      technician_assign: first.technician_assign || '',
      technician: first.technician || '',
      total_order_value: first.total_order_value || '0.00',
      total_yearly_amount: first.total_yearly_amount || '0.00',
      discount: first.discount || '0.00',
      discounted_price: first.discounted_price || '0.00',
      sez: first.sez || 'No',
      taxibility: first.taxibility || '0.00 %',
      cgst: first.cgst || '0.00',
      sgst: first.sgst || '0.00',
      gst_amount: first.gst_amount || '0.00',
      final_price: first.final_price || '0.00',
      sector: first.sector || '',

      // Billing fields
      billing_customer_legal_name: billing.billing_customer_legal_name || billing.customer_legal_name || '',
      billing_customer_trade_name: billing.billing_customer_trade_name || billing.customer_trade_name || '',
      billing_contact_person: billing.billing_contact_person || billing.contact_person || '',
      billing_designation: billing.billing_designation || billing.designation || '',
      billing_mobile_number: billing.billing_phone_number_1 || billing.billing_mobile_number || billing.phone_number_1 || billing.mobile_number || billing.phone || '',
      billing_phone_number_2: billing.billing_phone_number_2 || billing.phone_number_2 || '',
      billing_email: billing.billing_email || billing.email || '',
      billing_email_2: billing.billing_email_2 || billing.email_2 || '',
      billing_gst: billing.billing_gstn || billing.billing_gst || billing.gstn || billing.gst || '',
      billing_complete_address: billing.billing_complete_address || billing.complete_address || '',
      billing_city: billing.billing_city || billing.city || '',
      billing_state: billing.billing_state || billing.state || '',
      billing_pincode: billing.billing_pincode || billing.pincode || '',
      billing_landmark: billing.billing_landmark || billing.landmark || '',
      billing_country: billing.billing_country || billing.country || '',
      billing_others_note: billing.billing_others || billing.billing_others_note || billing.others || billing.others_note || '',
    });

    // Fetch Regions & Sub-Regions
    const loadRegionsAndSubregions = async () => {
      try {
        const regRes = await api.get('/business-regions', { params: { status: 'Active', limit: 1000 } });
        const regs = regRes.data.businessRegions || [];
        setBusinessRegions(regs);
        if (first.business_region) {
          const regObj = regs.find(r => 
            (r.region_name?.toLowerCase() === first.business_region?.toLowerCase()) || 
            (r.state?.toLowerCase() === first.business_region?.toLowerCase())
          );
          if (regObj) {
            const matchedRegionName = regObj.region_name || regObj.state;
            setEditFormData(prev => ({ ...prev, business_region: matchedRegionName }));
            const subRes = await api.get(`/business-regions/${regObj.id}/sub-regions`);
            const subs = subRes.data.businessSubRegions || [];
            setBusinessSubRegions(subs);
            if (first.business_sub_region) {
              const subObj = subs.find(s => s.sub_region_name?.toLowerCase() === first.business_sub_region?.toLowerCase());
              if (subObj) {
                setEditFormData(prev => ({ 
                  ...prev, 
                  business_sub_region: subObj.sub_region_name,
                  branch_code: subObj.branch_code || prev.branch_code
                }));
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load regions & subregions in edit hook:", err);
      }
    };
    loadRegionsAndSubregions();

    const loadCatalogData = async () => {
      try {
        const [subcatRes, slotRes] = await Promise.all([
          api.get('/sub-categories', { params: { limit: 200 } }),
          api.get('/time-slots/active')
        ]);

        const slotsData = slotRes.data.slots || slotRes.data.timeSlots || slotRes.data || [];
        setTimeSlots(slotsData);

        const subCategories = subcatRes.data.subCategories || subcatRes.data || [];
        const subcatData = subCategories.map(sub => {
          const existingItem = selectedGroup.items.find(item => item.subcategory_id === sub.id);
          const isBulk = existingItem && (parseFloat(existingItem.expected_waste) === 0 || !existingItem.expected_waste) && parseFloat(existingItem.monthly_price) > 0;
          return {
            category_id: sub.category_id,
            category_name: sub.category?.name || '',
            subcategory_id: sub.id,
            subcategory_name: sub.name,
            variations: sub.variations || [],
            included: !!existingItem,
            selected_variation_id: existingItem ? existingItem.variation_id : '',
            custom_price: existingItem ? existingItem.agreed_price : '',
            expected_waste: existingItem ? existingItem.expected_waste : '',
            pricing_mode: isBulk ? 'Bulk' : 'KG',
            bulk_monthly_price: existingItem ? existingItem.monthly_price : '',
            bulk_yearly_price: existingItem ? existingItem.yearly_price : '',
          };
        });

        setEditSubcategoryCards(subcatData);
      } catch (err) {
        console.error("loadCatalogData error:", err);
        toast.error("Failed to load catalog details for editing.");
      }
    };

    loadCatalogData();
  }, [selectedGroup]);

  // Live Pricing Calculations Effect for Edit Mode
  useEffect(() => {
    const active = editSubcategoryCards.filter(c => c.included);
    let sumMonthly = 0;
    let sumYearly = 0;
    active.forEach(card => {
      if (card.pricing_mode === 'Bulk') {
        sumMonthly += parseFloat(card.bulk_monthly_price || 0);
        sumYearly += parseFloat(card.bulk_yearly_price || 0);
      } else {
        const expectedDaily = parseFloat(card.expected_waste) || 0;
        const selectedVar = (card.variations || []).find(v => v.id == card.selected_variation_id);
        const defaultPrice = selectedVar ? parseFloat(selectedVar.per_kg_price || 0) : 0;
        const customPriceVal = parseFloat(card.custom_price);
        const finalPrice = (!isNaN(customPriceVal) && customPriceVal >= 0 && card.custom_price !== '')
          ? customPriceVal
          : defaultPrice;

        sumMonthly += (expectedDaily * 30) * finalPrice;
        sumYearly += (expectedDaily * 365) * finalPrice;
      }
    });

    const totalYearlyVal = sumYearly.toFixed(2);
    const yearlyDiscountVal = parseFloat(editFormData.discount) || 0;
    const yearlyDiscountedPrice = Math.max(0, sumYearly - yearlyDiscountVal);
    const discountedVal = yearlyDiscountedPrice.toFixed(2);
    
    const taxPercent = editFormData.sez === 'Yes' ? 0 : (parseFloat(editFormData.taxibility) || 0);
    const taxRate = taxPercent / 100;

    // GST calculated on the Total Yearly Order Value (before discount)
    const gstVal = (parseFloat(totalYearlyVal) * taxRate).toFixed(2);
    const cgstVal = (parseFloat(gstVal) / 2).toFixed(2);
    const sgstVal = (parseFloat(gstVal) / 2).toFixed(2);
    const finalVal = (yearlyDiscountedPrice + parseFloat(gstVal)).toFixed(2);

    setEditFormData(prev => {
      if (
        prev.total_order_value === totalYearlyVal &&
        prev.total_yearly_amount === totalYearlyVal &&
        prev.discounted_price === discountedVal &&
        prev.cgst === cgstVal &&
        prev.sgst === sgstVal &&
        prev.gst_amount === gstVal &&
        prev.final_price === finalVal
      ) {
        return prev;
      }
      return {
        ...prev,
        total_order_value: totalYearlyVal,
        total_yearly_amount: totalYearlyVal,
        discounted_price: discountedVal,
        cgst: cgstVal,
        sgst: sgstVal,
        gst_amount: gstVal,
        final_price: finalVal
      };
    });
  }, [editSubcategoryCards, editFormData.discount, editFormData.sez, editFormData.taxibility]);

  // Autocomplete & Google Map setup for Edit Mode
  useEffect(() => {
    const DEFAULT_LAT = 20.5937;
    const DEFAULT_LNG = 78.9629;

    const first = selectedGroup?.first || {};
    const initialLat = parseFloat(first.latitude) || DEFAULT_LAT;
    const initialLng = parseFloat(first.longitude) || DEFAULT_LNG;

    const initMap = () => {
      if (!editMapDivRef.current || editMapInstanceRef.current) return;

      const map = new window.google.maps.Map(editMapDivRef.current, {
        center: { lat: initialLat, lng: initialLng },
        zoom: first.latitude ? 16 : 5,
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
      editMapInstanceRef.current = map;

      const marker = new window.google.maps.Marker({
        map,
        position: { lat: initialLat, lng: initialLng },
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        title: 'Drag to adjust location'
      });
      editMarkerRef.current = marker;

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

            setEditFormData(prev => ({
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
            setEditFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
          }
        });
      });

      // Autocomplete wired to update map + marker + fields
      const searchInput = document.getElementById('editMapSearchInput');
      if (searchInput) {
        const autocomplete = new window.google.maps.places.Autocomplete(searchInput, {
          types: ['geocode', 'establishment']
        });
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat().toFixed(6);
            const lng = place.geometry.location.lng().toFixed(6);
            const addr = place.formatted_address || '';
            const newPos = { lat: parseFloat(lat), lng: parseFloat(lng) };

            map.setCenter(newPos);
            map.setZoom(16);
            marker.setPosition(newPos);
            marker.setAnimation(window.google.maps.Animation.DROP);

            setEditFormData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              complete_address: addr,
              address_search: addr
            }));
          }
        });
      }
    };

    const waitForGoogle = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setTimeout(initMap, 400);
      } else {
        setTimeout(waitForGoogle, 100);
      }
    };
    waitForGoogle();

    return () => {
      editMapInstanceRef.current = null;
      editMarkerRef.current = null;
    };
  }, [selectedGroup]);

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
      setEditFormData(prev => ({
        ...prev,
        customer_type: 'Existing Customer',
        customer_legal_name: reqData.customer_legal_name || '',
        customer_trade_name: reqData.customer_trade_name || '',
        contact_person: reqData.contact_person || '',
        designation: reqData.designation || '',
        mobile_number: reqData.mobile_number || '',
        phone_number_2: reqData.phone_number_2 || '',
        email: reqData.email || '',
        email_2: reqData.email_2 || '',
        others_note: reqData.others_note || '',
        address_search: reqData.address_search || reqData.complete_address || '',
        latitude: reqData.latitude || '',
        longitude: reqData.longitude || '',
        complete_address: reqData.complete_address || '',
        landmark: reqData.landmark || '',
        city: reqData.city || '',
        state: reqData.state || '',
        pincode: reqData.pincode || '',
        country: reqData.country || '',
        google_map_link: reqData.google_map_link || '',
      }));

      if (reqData.latitude && reqData.longitude) {
        const latVal = parseFloat(reqData.latitude);
        const lngVal = parseFloat(reqData.longitude);
        if (!isNaN(latVal) && !isNaN(lngVal)) {
          const newPos = { lat: latVal, lng: lngVal };
          if (editMarkerRef.current) {
            editMarkerRef.current.setPosition(newPos);
          }
          if (editMapInstanceRef.current) {
            editMapInstanceRef.current.setCenter(newPos);
            editMapInstanceRef.current.setZoom(17);
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

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const valToSet = type === 'checkbox' ? checked : value;

    if (name === 'customer_type') {
      setEditFormData(prev => ({ ...prev, customer_type: value }));
      if (value === 'Existing Customer') {
        setSearchMobile(prev => prev || editFormData.mobile_number || '');
      }
      return;
    }

    if (name === 'google_map_link') {
      setEditFormData(prev => ({ ...prev, google_map_link: value }));
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
                  setEditFormData(prev => ({
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
                  if (editMarkerRef.current) {
                    editMarkerRef.current.setPosition(pos);
                  }
                  if (editMapInstanceRef.current) {
                    editMapInstanceRef.current.setCenter(pos);
                    editMapInstanceRef.current.setZoom(17);
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
      setEditFormData(prev => ({
        ...prev,
        sector: value,
        area_sqm: value === 'Apartment' ? '' : prev.area_sqm,
        no_of_dwelling_units: value === 'Apartment' ? prev.no_of_dwelling_units : ''
      }));
      return;
    }

    if (name === 'mobile_number' || name === 'phone_number_2' || name === 'billing_mobile_number' || name === 'billing_phone_number_2') {
      const sanitized = value.replace(/\D/g, '').slice(0, 10);
      setEditFormData(prev => ({ ...prev, [name]: sanitized }));
      return;
    }

    if (name === 'business_region') {
      setEditFormData(prev => ({ ...prev, business_region: value, business_sub_region: '' }));
      if (!value || value === 'Business Region' || value === '') {
        setBusinessSubRegions([]);
      } else {
        const regObj = businessRegions.find(r => (r.region_name || r.state) === value);
        if (regObj) {
          api.get(`/business-regions/${regObj.id}/sub-regions`)
            .then(res => {
              setBusinessSubRegions(res.data.businessSubRegions || []);
            })
            .catch(err => {
              console.error("Failed to load business sub regions:", err);
              setBusinessSubRegions([]);
            });
        } else {
          setBusinessSubRegions([]);
        }
      }
      return;
    }

    if (name === 'business_sub_region') {
      const subObj = businessSubRegions.find(s => s.sub_region_name === value);
      setEditFormData(prev => ({
        ...prev,
        business_sub_region: value,
        branch_code: subObj ? subObj.branch_code || '' : ''
      }));
      return;
    }

    if (name === 'time_slot_id') {
      const slotObj = (timeSlots || []).find(s => String(s.id) === String(value));
      const formattedTime = slotObj ? `${slotObj.start_time} - ${slotObj.end_time}` : '';
      setEditFormData(prev => ({
        ...prev,
        time_slot_id: value,
        pickup_time: formattedTime
      }));
      return;
    }

    if (name === 'sez') {
      setEditFormData(prev => ({
        ...prev,
        sez: value,
        taxibility: value === 'Yes' ? '0.00 %' : prev.taxibility
      }));
      return;
    }
    setEditFormData(prev => ({ ...prev, [name]: valToSet }));
  };

  const toggleSubcategoryCard = (subcatId) => {
    setEditSubcategoryCards(prev => prev.map(card => {
      if (card.subcategory_id === subcatId) {
        const nextIncluded = !card.included;
        return {
          ...card,
          included: nextIncluded,
          selected_variation_id: nextIncluded && (card.variations || []).length > 0 ? card.variations[0].id : '',
          custom_price: nextIncluded && (card.variations || []).length > 0 ? card.variations[0].per_kg_price || '' : '',
          expected_waste: nextIncluded ? '1' : ''
        };
      }
      return card;
    }));
  };

  const handleCardVariationChange = (subcatId, variationId) => {
    setEditSubcategoryCards(prev => prev.map(card => {
      if (card.subcategory_id === subcatId) {
        const selectedVar = (card.variations || []).find(v => v.id == variationId);
        return {
          ...card,
          selected_variation_id: variationId,
          custom_price: selectedVar ? selectedVar.per_kg_price || '' : '',
          bulk_monthly_price: selectedVar ? selectedVar.bulk_price || '' : '',
          bulk_yearly_price: selectedVar ? (parseFloat(selectedVar.bulk_price || 0) * 12).toString() || '' : ''
        };
      }
      return card;
    }));
  };

  const handleCardWasteChange = (subcatId, val) => {
    setEditSubcategoryCards(prev => prev.map(card => {
      if (card.subcategory_id === subcatId) {
        return { ...card, expected_waste: val };
      }
      return card;
    }));
  };

  const handleCardPriceChange = (subcatId, val) => {
    setEditSubcategoryCards(prev => prev.map(card => {
      if (card.subcategory_id === subcatId) {
        return { ...card, custom_price: val };
      }
      return card;
    }));
  };

  const handleCardPricingModeChange = (subcatId, mode) => {
    setEditSubcategoryCards(prev => prev.map(card => {
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
    setEditSubcategoryCards(prev => prev.map(card => {
      if (card.subcategory_id === subcatId) {
        if (field === 'bulk_monthly_price') {
          const monthlyPrice = parseFloat(val) || 0;
          return {
            ...card,
            bulk_monthly_price: val,
            bulk_yearly_price: val ? (monthlyPrice * 12).toFixed(2).replace(/\.00$/, '') : ''
          };
        }
        return { ...card, [field]: val };
      }
      return card;
    }));
  };

  useEffect(() => {
    const handleCloseDropdown = () => {
      setOpenDropdownCategoryId(null);
    };
    window.addEventListener('click', handleCloseDropdown);
    return () => window.removeEventListener('click', handleCloseDropdown);
  }, []);

  const renderEditDocumentUploadField = (file, setFile, existingFilename, title = "Upload Document", accept = ".pdf,image/*", containerId = "") => {
    const isNewFile = file instanceof File;
    const isNewImage = isNewFile && (file.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name));
    const newPreviewUrl = isNewFile ? URL.createObjectURL(file) : '';

    const hasExisting = file !== 'clear' && !isNewFile && existingFilename;
    const isExistingImage = hasExisting && /\.(jpg|jpeg|png|webp|gif)$/i.test(existingFilename);
    const existingPreviewUrl = hasExisting ? `${IMAGE_BASE_URL}/CollectionRequests/${existingFilename}` : '';

    const showFile = isNewFile || hasExisting;

    return (
      <div id={containerId} className="relative w-full h-36 border border-slate-200 rounded-2xl bg-slate-50/50 overflow-hidden group transition-all mt-2">
        {showFile ? (
          <div className="w-full h-full relative animate-in fade-in duration-200">
            {isNewFile ? (
              isNewImage ? (
                <img src={newPreviewUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-50 text-center">
                  <FileText className="w-10 h-10 text-rose-500 mb-2" />
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
                onClick={() => window.open(isNewFile ? newPreviewUrl : existingPreviewUrl, '_blank')}
                className="px-3.5 py-2 bg-white/95 hover:bg-white text-slate-800 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                View Document
              </button>
              <button
                type="button"
                onClick={() => {
                  setFile('clear');
                }}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Clear
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


  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files);
    setEditSelectedFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setEditFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeEditFile = (index) => {
    setEditSelectedFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(editFilePreviews[index]);
    setEditFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imgName) => {
    setExistingImages(prev => prev.filter(img => img !== imgName));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

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
    if (!editFormData.site_request) {
      invalidateField('site_request', "Please select a valid Site Request.");
      return;
    }
    if (!editFormData.service_center_type) {
      invalidateField('service_center_type', "Please select a valid Service Center Type.");
      return;
    }
    if (!editFormData.billing_type) {
      invalidateField('billing_type', "Please select a valid Billing Type.");
      return;
    }
    if (!editFormData.business_region) {
      invalidateField('business_region', "Please select a valid Business Region.");
      return;
    }
    if (!editFormData.business_sub_region) {
      invalidateField('business_sub_region', "Please select a valid Business Sub Region.");
      return;
    }
    if (!editFormData.customer_type) {
      invalidateField('customer_type', "Customer Type is required.");
      return;
    }
    if (!editFormData.business_lead) {
      invalidateField('business_lead', "Please select a valid Business Lead.");
      return;
    }
    const isB2B = true; // Always validate B2B fields
    if (isB2B) {
      if (!editFormData.customer_legal_name?.trim()) {
        invalidateField('customer_legal_name', "Customer Legal Name is required.");
        return;
      }
      if (!editFormData.contact_person?.trim()) {
        invalidateField('contact_person', "Contact Person Name is required.");
        return;
      }
    }

    // Mobile Number validation
    if (!editFormData.mobile_number?.trim()) {
      invalidateField('mobile_number', "Mobile Number is required.");
      return;
    }
    if (!/^\d{10}$/.test(editFormData.mobile_number)) {
      invalidateField('mobile_number', "Please enter a valid 10-digit mobile number.");
      return;
    }
    if (editFormData.phone_number_2 && !/^\d{10}$/.test(editFormData.phone_number_2)) {
      invalidateField('phone_number_2', "Please enter a valid 10-digit Phone Number 2.");
      return;
    }
    if (!editFormData.email?.trim()) {
      invalidateField('email', "Email is required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email)) {
      invalidateField('email', "Please enter a valid email address.");
      return;
    }
    if (editFormData.email_2 && !emailRegex.test(editFormData.email_2)) {
      invalidateField('email_2', "Please enter a valid E-Mail 2 address.");
      return;
    }
    if (editFormData.gst && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(editFormData.gst)) {
      invalidateField('gst', "Please enter a valid 15-character GST Number.");
      return;
    }
    if (editFormData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(editFormData.pan)) {
      invalidateField('pan', "Please enter a valid 10-character PAN Number.");
      return;
    }
    if (editFormData.billing_address_different) {
      if (editFormData.billing_mobile_number && !/^\d{10}$/.test(editFormData.billing_mobile_number)) {
        invalidateField('billing_mobile_number', "Please enter a valid 10-digit Billing Phone Number 1.");
        return;
      }
      if (editFormData.billing_phone_number_2 && !/^\d{10}$/.test(editFormData.billing_phone_number_2)) {
        invalidateField('billing_phone_number_2', "Please enter a valid 10-digit Billing Phone Number 2.");
        return;
      }
      if (editFormData.billing_email && !emailRegex.test(editFormData.billing_email)) {
        invalidateField('billing_email', "Please enter a valid Billing E-Mail.");
        return;
      }
      if (editFormData.billing_email_2 && !emailRegex.test(editFormData.billing_email_2)) {
        invalidateField('billing_email_2', "Please enter a valid Billing E-Mail 2.");
        return;
      }
    }

    if (!editFormData.address_search?.trim()) {
      invalidateField('editMapSearchInput', "Address Search is required.");
      return;
    }

    // Coordinates range checks
    if (!editFormData.latitude || !editFormData.longitude) {
      invalidateField('editMapSearchInput', "Coordinates (Latitude/Longitude) are required. Please search and select an address.");
      return;
    }
    const latVal = parseFloat(editFormData.latitude);
    const lngVal = parseFloat(editFormData.longitude);
    if (isNaN(latVal) || latVal < -90 || latVal > 90) {
      invalidateField('latitude', "Please enter a valid Latitude between -90 and 90.");
      return;
    }
    if (isNaN(lngVal) || lngVal < -180 || lngVal > 180) {
      invalidateField('longitude', "Please enter a valid Longitude between -180 and 180.");
      return;
    }

    if (!editFormData.waste_generator_name?.trim()) {
      invalidateField('waste_generator_name', "BWG Name is required.");
      return;
    }

    // Area & Flats validation if present
    if (editFormData.sector === 'Apartment') {
      if (!editFormData.no_of_dwelling_units) {
        invalidateField('no_of_dwelling_units', "Flats is required.");
        return;
      }
      const unitsVal = parseInt(editFormData.no_of_dwelling_units);
      if (isNaN(unitsVal) || unitsVal <= 0) {
        invalidateField('no_of_dwelling_units', "Flats must be a positive integer.");
        return;
      }
    } else if (editFormData.sector) {
      if (!editFormData.area_sqm) {
        invalidateField('area_sqm', "Area (SqM) is required.");
        return;
      }
      const areaVal = parseFloat(editFormData.area_sqm);
      if (isNaN(areaVal) || areaVal <= 0) {
        invalidateField('area_sqm', "Area (SqM) must be a positive number.");
        return;
      }
    }

    if (!editFormData.complete_address?.trim()) {
      invalidateField('complete_address', "Complete Address is required.");
      return;
    }

    const activeCards = editSubcategoryCards.filter(c => c.included);
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

    if (editFormData.pickup_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(editFormData.pickup_date);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        invalidateField('pickup_date', "Pickup date cannot be in the past.");
        return;
      }
    }

    setSaving(true);

    const payload = new FormData();
    Object.keys(editFormData).forEach(key => {
      // Skip separate billing fields since they go in billing_details JSON
      if (key.startsWith('billing_') && key !== 'billing_address_different' && key !== 'billing_type') {
        return;
      }
      if (editFormData[key] !== undefined && editFormData[key] !== null) {
        payload.append(key, editFormData[key]);
      }
    });

    // Compile billing_details JSON
    if (editFormData.billing_address_different) {
      const billingObj = {
        customer_legal_name: editFormData.billing_customer_legal_name,
        customer_trade_name: editFormData.billing_customer_trade_name,
        contact_person: editFormData.billing_contact_person,
        designation: editFormData.billing_designation,
        mobile_number: editFormData.billing_mobile_number,
        phone_number_1: editFormData.billing_mobile_number,
        billing_phone_number_1: editFormData.billing_mobile_number,
        phone_number_2: editFormData.billing_phone_number_2,
        email: editFormData.billing_email,
        email_2: editFormData.billing_email_2,
        gst: editFormData.billing_gst,
        gstn: editFormData.billing_gst,
        complete_address: editFormData.billing_complete_address,
        city: editFormData.billing_city,
        state: editFormData.billing_state,
        pincode: editFormData.billing_pincode,
        landmark: editFormData.billing_landmark,
        country: editFormData.billing_country,
        others_note: editFormData.billing_others_note,
        others: editFormData.billing_others_note,
      };
      payload.append('billing_details', JSON.stringify(billingObj));
    } else {
      payload.append('billing_details', '');
    }

    // Append individual documents if updated
    if (editMomFile && editMomFile !== 'clear') payload.append('mom_agreement_file', editMomFile);
    if (editPoFile && editPoFile !== 'clear') payload.append('po_copy_file', editPoFile);
    if (editRwaFile && editRwaFile !== 'clear') payload.append('rwa_file', editRwaFile);
    if (editGstFile && editGstFile !== 'clear') payload.append('gst_file', editGstFile);
    if (editPanFile && editPanFile !== 'clear') payload.append('pan_file', editPanFile);
    if (editTradeFile && editTradeFile !== 'clear') payload.append('trade_license_file', editTradeFile);
    if (editEmailFile && editEmailFile !== 'clear') payload.append('email_copy_file', editEmailFile);


    const subList = activeCards.map(card => ({
      category_id: card.category_id,
      subcategory_id: card.subcategory_id,
      variation_id: card.selected_variation_id,
      expected_waste: parseFloat(card.expected_waste) || 0,
      custom_price: parseFloat(card.custom_price) || 0,
      suggested_price: parseFloat((card.variations || []).find(v => v.id == card.selected_variation_id)?.per_kg_price || 0),
      pricing_mode: card.pricing_mode || 'KG',
      bulk_monthly_price: parseFloat(card.bulk_monthly_price) || 0,
      bulk_yearly_price: parseFloat(card.bulk_yearly_price) || 0
    }));
    payload.append('subcategories', JSON.stringify(subList));
    payload.append('existing_images', JSON.stringify(existingImages));

    editSelectedFiles.forEach(file => {
      payload.append('images', file);
    });

    try {
      await api.put(`/waste-collection-requests/lead/${selectedGroup.lead_id}`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success("Waste collection request updated successfully!");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update waste collection request.");
    } finally {
      setSaving(false);
    }
  };

  // Group edit subcategories by category
  const editCategoriesMap = {};
  editSubcategoryCards.forEach(card => {
    if (!editCategoriesMap[card.category_id]) {
      editCategoriesMap[card.category_id] = {
        category_id: card.category_id,
        category_name: card.category_name,
        subcategories: []
      };
    }
    editCategoriesMap[card.category_id].subcategories.push(card);
  });
  const groupedEditCategories = Object.values(editCategoriesMap);
  const isB2B = true; // Always use B2B layouts and validation

  return (
    <>
      <form onSubmit={handleEditSubmit} noValidate className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-mono text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-lg">
            Editing Lead: {selectedGroup.lead_id}
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Edit Waste Request Details
        </h2>
      </div>

      {/* Stacked Sections matching creation layout */}
      <div className="w-full space-y-6">

        {/* SECTION 1: Company Details */}
        <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-5 h-5 text-violet-500" /> Section 1: Company Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Site Request *</label>
              <select
                name="site_request"
                value={editFormData.site_request}
                onChange={handleEditInputChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
              >
                <option value="">Select Option</option>
                <option value="Commercial Route">Commercial Route</option>
                <option value="Commercial Onsite">Commercial Onsite</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Service Center Type *</label>
              <select
                name="service_center_type"
                value={editFormData.service_center_type}
                onChange={handleEditInputChange}
                required
                autoComplete="off"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
              >
                <option value="">Select Option</option>
                <option value="Ecosphere">Ecosphere</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employee Name *</label>
              <input
                type="text"
                name="employee_name"
                value={editFormData.employee_name}
                readOnly
                placeholder="e.g. John Doe"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none text-sm font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing Type *</label>
              <select
                name="billing_type"
                value={editFormData.billing_type}
                onChange={handleEditInputChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
              >
                <option value="">Select Option</option>
                <option value="Head Office">Head Office</option>
                <option value="Regional Office">Regional Office</option>
                <option value="Branch Office">Branch Office</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Region *</label>
              <select
                name="business_region"
                value={editFormData.business_region}
                onChange={handleEditInputChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
              >
                <option value="">Select Option</option>
                {Array.from(new Set(businessRegions.map(r => r.region_name || r.state))).filter(Boolean).map(stateName => (
                  <option key={stateName} value={stateName}>{stateName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Sub Region *</label>
              <select
                name="business_sub_region"
                value={editFormData.business_sub_region}
                onChange={handleEditInputChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
              >
                <option value="">Select Option</option>
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
                value={editFormData.branch_code}
                readOnly
                placeholder="Auto-generated"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none text-sm font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Dynamically show sub-region branch details spanning full width */}
            {editFormData.business_sub_region && businessSubRegions.find(s => s.sub_region_name === editFormData.business_sub_region) && (() => {
              const sub = businessSubRegions.find(s => s.sub_region_name === editFormData.business_sub_region);
              return (
                <div className="col-span-full bg-purple-50/50 border border-purple-100 rounded-xl p-4 text-xs space-y-2 mt-2 animate-in fade-in duration-150">
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

        {/* SECTION 2: Customer Details */}
        <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-violet-500" /> Section 2: Customer Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Type *</label>
                  <select
                    name="customer_type"
                    value={editFormData.customer_type}
                    onChange={handleEditInputChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
                  >
                    <option value="" disabled hidden>Select Option</option>
                    <option value="New Customer">New Customer</option>
                    <option value="Existing Customer">Existing Customer</option>
                  </select>
                </div>

                {editFormData.customer_type === 'Existing Customer' && (
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
                    value={editFormData.business_lead}
                    onChange={handleEditInputChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
                  >
                    <option value="">Select Option</option>
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
                    value={editFormData.customer_legal_name}
                    onChange={handleEditInputChange}
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
                    value={editFormData.customer_trade_name}
                    onChange={handleEditInputChange}
                    placeholder="e.g. Acme Waste Solutions"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Person *</label>
                  <input
                    type="text"
                    name="contact_person"
                    value={editFormData.contact_person}
                    onChange={handleEditInputChange}
                    required
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={editFormData.designation}
                    onChange={handleEditInputChange}
                    placeholder="e.g. Facility Manager"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number 1 *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="mobile_number"
                      value={editFormData.mobile_number}
                      onChange={handleEditInputChange}
                      required
                      placeholder="e.g. 9876543210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number 2</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="phone_number_2"
                      value={editFormData.phone_number_2}
                      onChange={handleEditInputChange}
                      placeholder="e.g. 9876543211"
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
                      value={editFormData.email}
                      onChange={handleEditInputChange}
                      required
                      placeholder="e.g. facility@acme.com"
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
                      value={editFormData.email_2}
                      onChange={handleEditInputChange}
                      placeholder="e.g. contact@acme.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Others</label>
                  <input
                    type="text"
                    name="others_note"
                    value={editFormData.others_note}
                    onChange={handleEditInputChange}
                    placeholder="e.g. Additional note"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                  />
                </div>
          </div>
        </div>

        {/* SECTION 3: License Details (Optional) */}
        <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-violet-500" /> Section 3: License Details (Optional)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registered RWA</label>
              <input
                type="text"
                name="registered_rwa"
                value={editFormData.registered_rwa}
                onChange={handleEditInputChange}
                placeholder="e.g. RWA Details"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
              />
              {renderEditDocumentUploadField(editRwaFile, setEditRwaFile, selectedGroup.first?.rwa_file, "Upload RWA Copy", ".pdf,image/*", "rwa_file_upload")}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GST Number</label>
              <input
                type="text"
                name="gst"
                value={editFormData.gst}
                onChange={handleEditInputChange}
                placeholder="e.g. 29AAAAA1111A1Z1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
              />
              {renderEditDocumentUploadField(editGstFile, setEditGstFile, selectedGroup.first?.gst_file, "Upload GST Copy", ".pdf,image/*", "gst_file_upload")}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">PAN Number</label>
              <input
                type="text"
                name="pan"
                value={editFormData.pan}
                onChange={handleEditInputChange}
                placeholder="e.g. ABCDE1234F"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
              />
              {renderEditDocumentUploadField(editPanFile, setEditPanFile, selectedGroup.first?.pan_file, "Upload PAN Copy", ".pdf,image/*", "pan_file_upload")}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Trade License</label>
              <input
                type="text"
                name="trade_license"
                value={editFormData.trade_license}
                onChange={handleEditInputChange}
                placeholder="e.g. LIC12345"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
              />
              {renderEditDocumentUploadField(editTradeFile, setEditTradeFile, selectedGroup.first?.trade_license_file, "Upload Trade License", ".pdf,image/*", "trade_file_upload")}
            </div>
          </div>
        </div>

        {/* SECTION 4: Location Details */}
        <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-5 h-5 text-violet-500" /> Section 4: Location Details
          </h3>

          <div className="space-y-6">
            {/* Row 1: Address Search (Full Width) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address Search *</label>
              <input
                id="editMapSearchInput"
                type="text"
                name="address_search"
                value={editFormData.address_search}
                onChange={handleEditInputChange}
                required
                placeholder="Search location on map..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
              />
            </div>

            {/* Row 2: Latitude and Longitude (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Latitude</label>
                <input
                  type="text"
                  name="latitude"
                  value={editFormData.latitude}
                  readOnly
                  placeholder="Latitude"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none text-sm font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Longitude</label>
                <input
                  type="text"
                  name="longitude"
                  value={editFormData.longitude}
                  readOnly
                  placeholder="Longitude"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none text-sm font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="relative border border-slate-200 rounded-2xl overflow-hidden min-h-[300px] shadow-inner bg-slate-50">
              <div ref={editMapDivRef} className="absolute inset-0 w-full h-full" />
            </div>
            <div className="space-y-6 animate-in fade-in duration-300">
                {/* Row 4: BWG Name and Sector (2 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">BWG Name *</label>
                    <input
                      type="text"
                      name="waste_generator_name"
                      value={editFormData.waste_generator_name}
                      onChange={handleEditInputChange}
                      required
                      placeholder="e.g. Smart Bazar"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sector *</label>
                    <select
                      name="sector"
                      value={editFormData.sector}
                      onChange={handleEditInputChange}
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
                      <option value="Airport, Railways & Expressway">Airport, Railways & Expressway</option>
                      <option value="Office Space">Office Space</option>
                    </select>
                  </div>
                </div>

                {/* Row 5: Flats/Area based on sector */}
                {editFormData.sector && (
                  <div className="animate-in fade-in duration-300">
                    {editFormData.sector === 'Apartment' ? (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Flats *</label>
                        <input
                          type="number"
                          name="no_of_dwelling_units"
                          value={editFormData.no_of_dwelling_units}
                          onChange={handleEditInputChange}
                          required
                          placeholder="e.g. 150"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Area (SqM) *</label>
                        <input
                          type="number"
                          name="area_sqm"
                          value={editFormData.area_sqm}
                          onChange={handleEditInputChange}
                          required
                          placeholder="e.g. 1200"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>


            {/* Row 6: Complete Address (Full Width) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Complete Address *</label>
              <textarea
                name="complete_address"
                value={editFormData.complete_address}
                onChange={handleEditInputChange}
                required
                placeholder="Complete postal address..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 resize-none"
              />
            </div>

            {/* Row 7: Landmark, City, State (3 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  value={editFormData.landmark}
                  onChange={handleEditInputChange}
                  placeholder="e.g. Near Central Park"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={editFormData.city}
                  onChange={handleEditInputChange}
                  placeholder="e.g. Bangalore"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={editFormData.state}
                  onChange={handleEditInputChange}
                  placeholder="e.g. Karnataka"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
              </div>
            </div>

            {/* Row 8: Pincode, Country, Google Map Link (3 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={editFormData.pincode}
                  onChange={handleEditInputChange}
                  placeholder="e.g. 560001"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  value={editFormData.country}
                  onChange={handleEditInputChange}
                  placeholder="e.g. India"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Google Map Link</label>
                <input
                  type="text"
                  name="google_map_link"
                  value={editFormData.google_map_link}
                  onChange={handleEditInputChange}
                  placeholder="e.g. https://www.google.com/maps/place/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
              </div>
            </div>

            {/* Billing address section trigger details */}
            <div className="border-t border-slate-100 pt-4 mt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="billing_address_different"
                  checked={editFormData.billing_address_different}
                  onChange={handleEditInputChange}
                  className="rounded text-violet-650 focus:ring-violet-500 border-slate-300 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Billing Address is different from complete address</span>
              </label>

              {editFormData.billing_address_different && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 p-4 border border-slate-200 bg-slate-50/30 rounded-2xl animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing Customer Legal Name *</label>
                    <input
                      type="text"
                      name="billing_customer_legal_name"
                      value={editFormData.billing_customer_legal_name}
                      onChange={handleEditInputChange}
                      required
                      placeholder="e.g. Acme Corporation"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing Customer Trade Name</label>
                    <input
                      type="text"
                      name="billing_customer_trade_name"
                      value={editFormData.billing_customer_trade_name}
                      onChange={handleEditInputChange}
                      placeholder="e.g. Acme Waste Solutions"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing Contact Person *</label>
                    <input
                      type="text"
                      name="billing_contact_person"
                      value={editFormData.billing_contact_person}
                      onChange={handleEditInputChange}
                      required
                      placeholder="e.g. Jane Doe"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing Designation</label>
                    <input
                      type="text"
                      name="billing_designation"
                      value={editFormData.billing_designation}
                      onChange={handleEditInputChange}
                      placeholder="e.g. Facility Manager"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing Mobile Number *</label>
                    <input
                      type="text"
                      name="billing_mobile_number"
                      value={editFormData.billing_mobile_number}
                      onChange={handleEditInputChange}
                      required
                      placeholder="e.g. 9876543210"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing Phone Number 2</label>
                    <input
                      type="text"
                      name="billing_phone_number_2"
                      value={editFormData.billing_phone_number_2}
                      onChange={handleEditInputChange}
                      placeholder="e.g. 9876543211"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing E-Mail *</label>
                    <input
                      type="email"
                      name="billing_email"
                      value={editFormData.billing_email}
                      onChange={handleEditInputChange}
                      required
                      placeholder="e.g. billing@acme.com"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing E-Mail 2</label>
                    <input
                      type="email"
                      name="billing_email_2"
                      value={editFormData.billing_email_2}
                      onChange={handleEditInputChange}
                      placeholder="e.g. accounts@acme.com"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing City *</label>
                    <input
                      type="text"
                      name="billing_city"
                      value={editFormData.billing_city}
                      onChange={handleEditInputChange}
                      required
                      placeholder="e.g. Bengaluru"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing State *</label>
                    <input
                      type="text"
                      name="billing_state"
                      value={editFormData.billing_state}
                      onChange={handleEditInputChange}
                      required
                      placeholder="e.g. Karnataka"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing Pincode *</label>
                    <input
                      type="text"
                      name="billing_pincode"
                      value={editFormData.billing_pincode}
                      onChange={handleEditInputChange}
                      required
                      placeholder="e.g. 560001"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing Landmark</label>
                    <input
                      type="text"
                      name="billing_landmark"
                      value={editFormData.billing_landmark}
                      onChange={handleEditInputChange}
                      placeholder="e.g. Near Metro Station"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing Country *</label>
                    <input
                      type="text"
                      name="billing_country"
                      value={editFormData.billing_country}
                      onChange={handleEditInputChange}
                      required
                      placeholder="e.g. India"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing Complete Address *</label>
                    <textarea
                      name="billing_complete_address"
                      value={editFormData.billing_complete_address}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Complete billing address..."
                      rows={2}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-xs font-semibold text-slate-700"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing Others Note</label>
                    <input
                      type="text"
                      name="billing_others_note"
                      value={editFormData.billing_others_note}
                      onChange={handleEditInputChange}
                      placeholder="Billing related extra instruction..."
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>        {/* SECTION 5: Service Details / Expected Waste (KG) */}
        <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ClipboardCheck className="w-5 h-5 text-violet-500" /> Section 5: Service Details / Expected Waste (KG)
          </h3>

          {groupedEditCategories.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              Loading waste categories...
            </div>
          ) : (
            <div className="space-y-4">
              {/* Grouped Category Selection Controls */}
              <div className="space-y-6 pb-6 border-b border-slate-100">
                {groupedEditCategories.map((cat) => {
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
                                toggleSubcategoryCard(sub.subcategory_id);
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
                                toggleSubcategoryCard(sub.subcategory_id);
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
              <div className="space-y-6">
                {editSubcategoryCards.filter(c => c.included).map((card) => {
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
                            onChange={(e) => handleCardVariationChange(card.subcategory_id, e.target.value)}
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
                                  className={`w-full border rounded-lg py-2.5 pl-3 pr-8 outline-none focus:ring-4 transition-all text-sm font-semibold text-slate-800 ${
                                    selectedVar
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
                                className={`w-full border rounded-lg py-2.5 px-3 outline-none focus:ring-4 transition-all text-sm font-semibold text-slate-800 ${
                                  selectedVar
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
                                  className={`w-full border rounded-lg py-2.5 pl-3 pr-12 outline-none focus:ring-4 transition-all text-sm font-semibold text-slate-800 ${
                                    selectedVar
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
            </div>
          )}
        </div>

        {/* SECTION 6: Price Section */}
        <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ClipboardCheck className="w-5 h-5 text-violet-500" /> Section 6: Price Section
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Order Value (Yearly)</label>
              <input
                type="text"
                name="total_order_value"
                value={editFormData.total_order_value}
                readOnly
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 outline-none text-sm font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">SEZ (Special Economic Zone)</label>
              <select
                name="sez"
                value={editFormData.sez}
                onChange={handleEditInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-purple-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Taxability / GST</label>
              <select
                name="taxibility"
                disabled={editFormData.sez === 'Yes'}
                value={editFormData.taxibility}
                onChange={handleEditInputChange}
                className={`w-full border border-slate-200 rounded-xl py-3 px-4 outline-none transition-all text-sm font-medium ${editFormData.sez === 'Yes' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 text-slate-700 cursor-pointer focus:ring-4 focus:ring-violet-100 focus:border-violet-400'}`}
              >
                <option value="0.00 %">0.00 %</option>
                <option value="5.00 %">5.00 %</option>
                <option value="12.00 %">12.00 %</option>
                <option value="18.00 %">18.00 %</option>
                <option value="28.00 %">28.00 %</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">CGST</label>
              <input
                type="text"
                name="cgst"
                value={editFormData.cgst}
                readOnly
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 outline-none text-sm font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">SGST</label>
              <input
                type="text"
                name="sgst"
                value={editFormData.sgst}
                readOnly
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 outline-none text-sm font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GST</label>
              <input
                type="text"
                name="gst_amount"
                value={editFormData.gst_amount}
                readOnly
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 outline-none text-sm font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Discount (Yearly)</label>
              <input
                type="number"
                name="discount"
                value={editFormData.discount}
                onChange={handleEditInputChange}
                placeholder="Discount"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Discounted Price (Yearly)</label>
              <input
                type="text"
                name="discounted_price"
                value={editFormData.discounted_price}
                readOnly
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 outline-none text-sm font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Final Price (Yearly)</label>
              <input
                type="text"
                name="final_price"
                value={editFormData.final_price}
                readOnly
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 outline-none text-sm font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* SECTION 7: Additional Details */}
        <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-5 h-5 text-violet-500" /> Section 7: Additional Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preferred Pickup Date</label>
              <input
                type="date"
                name="pickup_date"
                value={editFormData.pickup_date}
                onChange={handleEditInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preferred Pickup Time</label>
              <select
                name="time_slot_id"
                value={editFormData.time_slot_id}
                onChange={handleEditInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
              >
                <option value="">Select Time Slot</option>
                {timeSlots.map(slot => (
                  <option key={slot.id} value={slot.id}>
                    {slot.start_time} - {slot.end_time} ({slot.slot_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pickup Notes</label>
              <input
                type="text"
                name="pickup_notes"
                value={editFormData.pickup_notes}
                onChange={handleEditInputChange}
                placeholder="Preferred instruction or notes for pickup..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
              />
            </div>



            {/* Document upload copies */}
            <div className="sm:col-span-4 border-t border-slate-100 pt-4 mt-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">MOM Copy (Minutes of Meeting)</label>
                {renderEditDocumentUploadField(editMomFile, setEditMomFile, selectedGroup.first?.mom_agreement_file, "Upload MOM Copy", ".pdf,image/*", "edit_mom_file_upload")}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">PO Copy (Purchase Order)</label>
                {renderEditDocumentUploadField(editPoFile, setEditPoFile, selectedGroup.first?.po_copy_file, "Upload PO Copy", ".pdf,image/*", "edit_po_file_upload")}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Confirmation Copy</label>
                {renderEditDocumentUploadField(editEmailFile, setEditEmailFile, selectedGroup.first?.email_copy_file, "Upload Email Copy", ".pdf,image/*", "edit_email_file_upload")}
              </div>
            </div>

            {/* Waste Pictures management */}
            <div className="sm:col-span-4 border-t border-slate-100 pt-4 mt-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Waste Photos / Site Images</label>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {/* Existing Images */}
                {existingImages.map(img => (
                  <div key={img} className="relative rounded-2xl border border-slate-200 aspect-square overflow-hidden bg-slate-50 group">
                    <img src={`${IMAGE_BASE_URL}/CollectionRequests/${img}`} alt="Waste site" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* New Image Previews */}
                {editFilePreviews.map((url, idx) => (
                  <div key={idx} className="relative rounded-2xl border border-slate-200 aspect-square overflow-hidden bg-slate-50 group">
                    <img src={url} alt="Waste preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeEditFile(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Upload button */}
                <label className="border-2 border-dashed border-slate-200 hover:border-violet-400 transition-all rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer text-slate-400 group relative">
                  <ImageIcon className="w-6 h-6 mb-1 opacity-50 text-slate-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold">Add Photo</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleEditFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving changes...' : 'Save Request'}
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
