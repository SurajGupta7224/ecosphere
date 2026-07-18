import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Send, RotateCcw, Upload, FileText, User, 
  MapPin, Calendar, Clipboard, ShieldCheck, 
  Activity, Star, CheckCircle2, ChevronLeft, ChevronDown,
  AlertCircle, Info, Lock, Truck, Smartphone, Plus, Trash2, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { IMAGE_BASE_URL } from '../api';
import { useSettings } from '../context/SettingsContext';

// Helper component for styled form inputs
const FormField = ({ label, name, value, onChange, type = "text", required = false, error, placeholder, disabled = false }) => {
  const { settings } = useSettings();
  const primaryColor = settings?.theme?.primary_color || '#31975C';
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col w-full text-left">
      <label className="block text-xs font-bold text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500 font-bold">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={isFocused && !error ? { borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}20` } : {}}
        className={`w-full bg-white border rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
          error ? 'border-red-500 focus:border-red-500' : 'border-slate-300'
        }`}
      />
      {error && <p className="text-red-500 text-[10px] mt-1 font-semibold flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {error}</p>}
    </div>
  );
};

// Helper component for dropdown select fields
const FormSelect = ({ label, name, value, onChange, required = false, error, options, placeholder = "Select option", disabled = false }) => {
  const { settings } = useSettings();
  const primaryColor = settings?.theme?.primary_color || '#31975C';
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col w-full text-left">
      <label className="block text-xs font-bold text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500 font-bold">*</span>}
      </label>
      <div className="relative">
        <select
          name={name}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={isFocused && !error ? { borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}20` } : {}}
          className={`w-full bg-white border rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none transition-all appearance-none disabled:opacity-60 disabled:cursor-not-allowed ${
            error ? 'border-red-500 focus:border-red-500' : 'border-slate-300'
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>
      {error && <p className="text-red-500 text-[10px] mt-1 font-semibold flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {error}</p>}
    </div>
  );
};

// Format long filenames for preview box display
const formatFilename = (filename) => {
  if (!filename) return "";
  if (filename.length <= 15) return filename;
  const dotIndex = filename.lastIndexOf('.');
  const ext = dotIndex !== -1 ? filename.slice(dotIndex) : '';
  const base = dotIndex !== -1 ? filename.slice(0, dotIndex) : filename;
  if (base.length <= 12) return filename;
  return base.slice(0, 8) + "..." + base.slice(-4) + ext;
};

// Helper component for file uploads with previews
const FileUploadField = ({ label, name, onChange, required = false, error, existingFile }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const getFileUrl = (filename) => {
    if (!filename) return null;
    return `${IMAGE_BASE_URL}/Vehicles/${filename}`;
  };

  useEffect(() => {
    if (!existingFile && !selectedFileName) {
      setPreviewUrl(null);
      setSelectedFileName("");
    }
  }, [existingFile, selectedFileName]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);

      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
      onChange(e);
    }
  };

  const hasPreview = previewUrl || existingFile;

  return (
    <div className="flex flex-col w-full text-left">
      <label className="block text-xs font-bold text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500 font-bold">*</span>}
      </label>
      <div 
        className={`relative border border-slate-300 border-dashed rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center bg-slate-50/10 hover:bg-white group ${
          error ? 'border-red-500 bg-red-50/5' : 'hover:border-emerald-400'
        }`}
      >
        <input
          type="file"
          name={name}
          onChange={handleFileChange}
          accept="image/*,application/pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {hasPreview && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPreviewUrl(null);
              setSelectedFileName("");
              onChange({ target: { name, files: [] } });
            }}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-all z-20 shadow-sm"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        
        {hasPreview ? (
          <div className="w-full flex flex-col items-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={label}
                className="w-full h-28 object-contain rounded-lg border border-slate-100 mb-1.5 bg-white"
              />
            ) : existingFile && existingFile.endsWith(".pdf") ? (
              <div className="w-full h-28 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-slate-400">
                <FileText className="w-6 h-6 text-emerald-500 mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wider">PDF Certificate</span>
              </div>
            ) : (
              <img
                src={getFileUrl(existingFile)}
                alt={label}
                className="w-full h-28 object-contain rounded-lg border border-slate-100 mb-1.5 bg-white"
              />
            )}
            <span 
              title={selectedFileName || existingFile}
              className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 max-w-full truncate block text-center"
            >
              {selectedFileName ? formatFilename(selectedFileName) : (existingFile ? formatFilename(existingFile) : "Uploaded File")}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center py-1">
            <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 transition-colors mb-1.5" />
            <span className="text-[11px] font-bold text-slate-600">Upload {label.replace(" (Optional)", "").replace(" *", "")}</span>
            <span className="text-[8px] text-slate-400 mt-0.5">JPG, PNG, PDF (Max. 2MB)</span>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-[10px] mt-1 font-semibold flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {error}</p>}
    </div>
  );
};

const AddVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { settings } = useSettings();
  const primaryColor = settings?.theme?.primary_color || '#31975C';

  // DB resources for driver & helper mapping dropdowns
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Dynamic helper tracking
  const [selectedDriverDetails, setSelectedDriverDetails] = useState(null);
  const [selectedHelperDetails, setSelectedHelperDetails] = useState(null);

  // Accessories tracking list state
  const [accessoriesInput, setAccessoriesInput] = useState("");
  const [accessoriesList, setAccessoriesList] = useState(["Earphones", "Power Bank", "Back Cover"]);

  // Form Fields State
  const [formData, setFormData] = useState({
    registration_number: '', brand: '', model: '', vehicle_type: '', capacity_kg: '', kerb_weight_kg: '',
    fuel_type: '', manufacturing_year: '', chassis_number: '', engine_number: '', color: '',
    no_of_axles: 2, owner_type: '', vehicle_status: 'Active',
    
    emission_puc_expiry: '', insurance_expiry: '', fc_expiry: '', permit_number: '', permit_expiry: '', road_tax_expiry: '',
    driver_id: '', helper_id: '',

    // Mobile Device Assignment
    device_name_model: '', device_brand: '', device_imei_1: '', device_imei_2: '', device_serial_number: '',
    device_mobile_number_sim: '', device_sim_provider: '', device_sim_iccid: '', device_purchase_date: '',
    device_warranty_expiry: '', device_assigned_date: '', device_returned_date: '', device_status: 'Assigned',
    device_condition: 'New', device_cost: '', device_vendor: '', device_invoice_number: '', device_asset_number_tag: '',
    device_qr_code_tag: '', device_gps_enabled: true, device_mdm_enrolled: false, device_remarks: '',
    
    device_assigned_to: 'Driver', device_assignment_date: '', device_assignment_status: 'Active', device_lock_status: 'Enabled',
    device_security_pin_set: false, device_charger_issued: false, device_accessories_issued: '', device_additional_notes: ''
  });

  // Files Data State
  const [fileData, setFileData] = useState({
    rc_front_image: null, rc_back_image: null, vehicle_front_photo: null, vehicle_rear_photo: null,
    vehicle_left_photo: null, vehicle_right_photo: null, puc_certificate_image: null, insurance_certificate_image: null,
    fc_certificate_image: null, permit_certificate_image: null, road_tax_receipt_image: null,
    device_front_photo: null, device_back_photo: null, device_imei_sticker_photo: null, device_purchase_invoice: null,
    device_warranty_card: null, device_box_imei_photo: null, device_charger_photo: null, device_accessories_photo: null,
    device_other_document: null
  });

  // Database existing files URLs reference
  const [existingFiles, setExistingFiles] = useState({});

  // Load backend employees for driver/helper dropdown assignment mappings
  useEffect(() => {
    const fetchEmployeesList = async () => {
      try {
        const res = await api.get('/aggregator-employees');
        // Accept only active employees
        const list = res.data.employees || [];
        setEmployees(list.filter(e => e.employee_status === 'active'));
      } catch (err) {
        console.error("fetchEmployeesList error:", err);
        toast.error("Failed to load employee list data");
      }
    };
    fetchEmployeesList();
  }, []);

  // Fetch single vehicle details on edit mode mount
  useEffect(() => {
    if (!isEditMode) return;

    const fetchVehicleDetails = async () => {
      try {
        const res = await api.get(`/aggregator-vehicles/${id}`);
        const veh = res.data.vehicle;
        
        // Populate form data
        setFormData({
          registration_number: veh.registration_number,
          brand: veh.brand,
          model: veh.model,
          vehicle_type: veh.vehicle_type,
          capacity_kg: veh.capacity_kg,
          kerb_weight_kg: veh.kerb_weight_kg,
          fuel_type: veh.fuel_type,
          manufacturing_year: veh.manufacturing_year,
          chassis_number: veh.chassis_number,
          engine_number: veh.engine_number,
          color: veh.color,
          no_of_axles: veh.no_of_axles || 2,
          owner_type: veh.owner_type,
          vehicle_status: veh.vehicle_status,
          
          emission_puc_expiry: veh.emission_puc_expiry ? veh.emission_puc_expiry.slice(0, 10) : '',
          insurance_expiry: veh.insurance_expiry ? veh.insurance_expiry.slice(0, 10) : '',
          fc_expiry: veh.fc_expiry ? veh.fc_expiry.slice(0, 10) : '',
          permit_number: veh.permit_number || '',
          permit_expiry: veh.permit_expiry ? veh.permit_expiry.slice(0, 10) : '',
          road_tax_expiry: veh.road_tax_expiry ? veh.road_tax_expiry.slice(0, 10) : '',
          
          driver_id: veh.driver_id || '',
          helper_id: veh.helper_id || '',

          device_name_model: veh.device_name_model,
          device_brand: veh.device_brand,
          device_imei_1: veh.device_imei_1,
          device_imei_2: veh.device_imei_2 || '',
          device_serial_number: veh.device_serial_number || '',
          device_mobile_number_sim: veh.device_mobile_number_sim,
          device_sim_provider: veh.device_sim_provider || '',
          device_sim_iccid: veh.device_sim_iccid || '',
          device_purchase_date: veh.device_purchase_date ? veh.device_purchase_date.slice(0, 10) : '',
          device_warranty_expiry: veh.device_warranty_expiry ? veh.device_warranty_expiry.slice(0, 10) : '',
          device_assigned_date: veh.device_assigned_date ? veh.device_assigned_date.slice(0, 10) : '',
          device_returned_date: veh.device_returned_date ? veh.device_returned_date.slice(0, 10) : '',
          device_status: veh.device_status,
          device_condition: veh.device_condition,
          device_cost: veh.device_cost || '',
          device_vendor: veh.device_vendor || '',
          device_invoice_number: veh.device_invoice_number || '',
          device_asset_number_tag: veh.device_asset_number_tag || '',
          device_qr_code_tag: veh.device_qr_code_tag || '',
          device_gps_enabled: veh.device_gps_enabled,
          device_mdm_enrolled: veh.device_mdm_enrolled,
          device_remarks: veh.device_remarks || '',
          
          device_assigned_to: veh.device_assigned_to,
          device_assignment_date: veh.device_assignment_date ? veh.device_assignment_date.slice(0, 10) : '',
          device_assignment_status: veh.device_assignment_status,
          device_lock_status: veh.device_lock_status,
          device_security_pin_set: veh.device_security_pin_set,
          device_charger_issued: veh.device_charger_issued,
          device_accessories_issued: veh.device_accessories_issued || '',
          device_additional_notes: veh.device_additional_notes || ''
        });

        // Parse accessories list
        if (veh.device_accessories_issued) {
          try {
            setAccessoriesList(JSON.parse(veh.device_accessories_issued));
          } catch (e) {
            setAccessoriesList(veh.device_accessories_issued.split(','));
          }
        }

        // Map existing files references
        setExistingFiles({
          rc_front_image: veh.rc_front_image,
          rc_back_image: veh.rc_back_image,
          vehicle_front_photo: veh.vehicle_front_photo,
          vehicle_rear_photo: veh.vehicle_rear_photo,
          vehicle_left_photo: veh.vehicle_left_photo,
          vehicle_right_photo: veh.vehicle_right_photo,
          puc_certificate_image: veh.puc_certificate_image,
          insurance_certificate_image: veh.insurance_certificate_image,
          fc_certificate_image: veh.fc_certificate_image,
          permit_certificate_image: veh.permit_certificate_image,
          road_tax_receipt_image: veh.road_tax_receipt_image,
          device_front_photo: veh.device_front_photo,
          device_back_photo: veh.device_back_photo,
          device_imei_sticker_photo: veh.device_imei_sticker_photo,
          device_purchase_invoice: veh.device_purchase_invoice,
          device_warranty_card: veh.device_warranty_card,
          device_box_imei_photo: veh.device_box_imei_photo,
          device_charger_photo: veh.device_charger_photo,
          device_accessories_photo: veh.device_accessories_photo,
          device_other_document: veh.device_other_document
        });

      } catch (err) {
        console.error("fetchVehicleDetails error:", err);
        toast.error("Failed to load vehicle record details");
        navigate('/aggregator-vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [id, isEditMode, navigate]);

  // Track Driver / Helper assignment displays when dropdown selection changes
  useEffect(() => {
    if (formData.driver_id && employees.length > 0) {
      const match = employees.find(e => String(e.id) === String(formData.driver_id));
      setSelectedDriverDetails(match || null);
    } else {
      setSelectedDriverDetails(null);
    }
  }, [formData.driver_id, employees]);

  useEffect(() => {
    if (formData.helper_id && employees.length > 0) {
      const match = employees.find(e => String(e.id) === String(formData.helper_id));
      setSelectedHelperDetails(match || null);
    } else {
      setSelectedHelperDetails(null);
    }
  }, [formData.helper_id, employees]);

  // Handle text field updates and input format constraints
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : value;

    if (name === 'registration_number') {
      val = value.toUpperCase();
    }

    setFormData(prev => ({ ...prev, [name]: val }));
    // Clear validation error on type
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle uploaded scan files update
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFileData(prev => ({ ...prev, [name]: files[0] }));
      setExistingFiles(prev => ({ ...prev, [name]: null }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    } else {
      setFileData(prev => ({ ...prev, [name]: null }));
      setExistingFiles(prev => ({ ...prev, [name]: null }));
    }
  };

  // Helper function to focus and auto scroll to errors smoothly
  const scrollToError = (errObj) => {
    const firstErrField = Object.keys(errObj)[0];
    const element = document.getElementsByName(firstErrField)[0];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
    }
  };

  // Form Validation Logic
  const validateForm = () => {
    const err = {};

    // 1. Vehicle details checks
    if (!formData.registration_number || !formData.registration_number.trim()) err.registration_number = "Registration number is required";
    if (!formData.brand || !formData.brand.trim()) err.brand = "Brand is required";
    if (!formData.model || !formData.model.trim()) err.model = "Model is required";
    if (!formData.vehicle_type) err.vehicle_type = "Vehicle Type is required";
    if (!formData.capacity_kg) err.capacity_kg = "Capacity is required";
    if (!formData.kerb_weight_kg) err.kerb_weight_kg = "Kerb Weight is required";
    if (!formData.fuel_type) err.fuel_type = "Fuel Type is required";
    if (!formData.manufacturing_year) err.manufacturing_year = "Manufacturing Year is required";
    if (!formData.chassis_number || !formData.chassis_number.trim()) err.chassis_number = "Chassis Number is required";
    if (!formData.engine_number || !formData.engine_number.trim()) err.engine_number = "Engine Number is required";
    if (!formData.color) err.color = "Color is required";
    if (!formData.owner_type) err.owner_type = "Owner Type is required";

    // 2. Vehicle scans checks
    const hasRcFront = fileData.rc_front_image || existingFiles.rc_front_image;
    if (!hasRcFront) err.rc_front_image = "RC Front image is required";

    const hasRcBack = fileData.rc_back_image || existingFiles.rc_back_image;
    if (!hasRcBack) err.rc_back_image = "RC Back image is required";

    // 3. License certificates checks
    if (!formData.emission_puc_expiry) err.emission_puc_expiry = "PUC Expiry date is required";
    if (!formData.insurance_expiry) err.insurance_expiry = "Insurance Expiry date is required";
    if (!formData.fc_expiry) err.fc_expiry = "Fitness (FC) Expiry date is required";

    const hasPuc = fileData.puc_certificate_image || existingFiles.puc_certificate_image;
    if (!hasPuc) err.puc_certificate_image = "PUC Certificate image is required";

    const hasInsurance = fileData.insurance_certificate_image || existingFiles.insurance_certificate_image;
    if (!hasInsurance) err.insurance_certificate_image = "Insurance Certificate image is required";

    const hasFc = fileData.fc_certificate_image || existingFiles.fc_certificate_image;
    if (!hasFc) err.fc_certificate_image = "Fitness Certificate (FC) image is required";

    // 4. Driver assignments checks
    if (!formData.driver_id) err.driver_id = "Assigned Driver is required";

    // 5. Mobile Device information checks
    if (!formData.device_name_model || !formData.device_name_model.trim()) err.device_name_model = "Device Model is required";
    if (!formData.device_brand || !formData.device_brand.trim()) err.device_brand = "Device Brand is required";
    if (!formData.device_imei_1 || !formData.device_imei_1.trim()) err.device_imei_1 = "IMEI 1 is required";
    if (!formData.device_mobile_number_sim || !formData.device_mobile_number_sim.trim()) err.device_mobile_number_sim = "SIM mobile number is required";
    if (!formData.device_assigned_date) err.device_assigned_date = "Assigned Date is required";
    if (!formData.device_status) err.device_status = "Device Status is required";
    if (!formData.device_assigned_to) err.device_assigned_to = "Device Assignee field is required";
    if (!formData.device_assignment_date) err.device_assignment_date = "Assignment Date is required";

    // 6. Mobile Scans checks
    const hasDevFront = fileData.device_front_photo || existingFiles.device_front_photo;
    if (!hasDevFront) err.device_front_photo = "Mobile front scan is required";

    const hasDevBack = fileData.device_back_photo || existingFiles.device_back_photo;
    if (!hasDevBack) err.device_back_photo = "Mobile back scan is required";

    const hasImeiStr = fileData.device_imei_sticker_photo || existingFiles.device_imei_sticker_photo;
    if (!hasImeiStr) err.device_imei_sticker_photo = "IMEI sticker scan is required";

    const hasInvoice = fileData.device_purchase_invoice || existingFiles.device_purchase_invoice;
    if (!hasInvoice) err.device_purchase_invoice = "Invoice receipt scan is required";

    setErrors(err);
    if (Object.keys(err).length > 0) {
      scrollToError(err);
      toast.error("Please complete all required fields correctly.");
      return false;
    }
    return true;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const payload = new FormData();

    // Map properties
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '' && formData[key] !== null) {
        payload.append(key, formData[key]);
      }
    });

    // Accessories list payload
    payload.set('device_accessories_issued', JSON.stringify(accessoriesList));

    // Map uploads
    Object.keys(fileData).forEach(key => {
      if (fileData[key]) {
        payload.append(key, fileData[key]);
      }
    });

    try {
      if (isEditMode) {
        await api.put(`/aggregator-vehicles/${id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success("Vehicle records updated successfully");
        navigate('/aggregator-vehicles');
      } else {
        await api.post('/aggregator-vehicles', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success("Vehicle registered successfully");
        navigate('/aggregator-vehicles');
      }
    } catch (err) {
      console.error("handleSubmit error:", err);
      const errMsg = err.response?.data?.message || 'Failed to save vehicle details';
      toast.error(errMsg);

      // Handle duplicate warnings
      if (errMsg.toLowerCase().includes("registration number")) {
        setErrors(prev => ({ ...prev, registration_number: errMsg }));
        setTimeout(() => {
          scrollToError({ registration_number: errMsg });
        }, 100);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Accessories management
  const addAccessory = () => {
    if (!accessoriesInput.trim()) return;
    if (!accessoriesList.includes(accessoriesInput.trim())) {
      setAccessoriesList(prev => [...prev, accessoriesInput.trim()]);
    }
    setAccessoriesInput("");
  };

  const removeAccessory = (indexToRemove) => {
    setAccessoriesList(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  // Pre-calculated lists for selects
  const vehicleTypes = [
    { value: "Compactor", label: "Compactor" },
    { value: "AutoTipper", label: "AutoTipper" }
  ];

  const fuelTypes = [
    { value: "Diesel", label: "Diesel" },
    { value: "CNG", label: "CNG" },
    { value: "Electric", label: "Electric" },
    { value: "Petrol", label: "Petrol" },
    { value: "Hybrid", label: "Hybrid" }
  ];

  const colors = [
    { value: "White", label: "White" },
    { value: "Black", label: "Black" },
    { value: "Silver", label: "Silver" },
    { value: "Grey", label: "Grey" },
    { value: "Red", label: "Red" },
    { value: "Blue", label: "Blue" },
    { value: "Yellow", label: "Yellow" },
    { value: "Green", label: "Green" },
    { value: "Others", label: "Others" }
  ];

  const ownerTypes = [
    { value: "Owned", label: "Owned" },
    { value: "Leased", label: "Leased" },
    { value: "Rented", label: "Rented" },
    { value: "Vendor", label: "Vendor" }
  ];

  const statuses = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "Under Maintenance", label: "Under Maintenance" }
  ];

  const deviceStatuses = [
    { value: "Assigned", label: "Assigned" },
    { value: "Available", label: "Available" },
    { value: "Damaged", label: "Damaged" },
    { value: "Under Repair", label: "Under Repair" },
    { value: "Lost", label: "Lost" }
  ];

  const deviceConditions = [
    { value: "New", label: "New" },
    { value: "Good", label: "Good" },
    { value: "Fair", label: "Fair" },
    { value: "Damaged", label: "Damaged" }
  ];

  return (
    <div className="w-full mx-auto px-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold gap-4 text-slate-800 tracking-tight mt-1.5 flex items-center">
            <Truck className="w-6 h-6 mr-2.5 text-slate-500" style={{ color: primaryColor }} />
            {isEditMode ? 'Modify Aggregator Vehicle' : 'Register Aggregator Vehicle'}
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Register vehicle specifications, compliance documents, driver mappings, and corporate mobile device assets.
          </p>
        </div>

        <Link
          to="/aggregator-vehicles"
          className="flex items-center px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl bg-white text-xs font-bold shadow-sm transition-all"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Back to List
        </Link>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        
        {/* SECTION 1: VEHICLE DETAILS */}
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-3">
            <div className="p-2 bg-slate-50 rounded-xl" style={{ color: primaryColor }}>
              <Truck className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Vehicle Details</h2>
          </div>

          <div className="space-y-6">
            {/* Row 1: 4 columns */}
            <div className="grid grid-cols-1 md:grid-cols-custom-4 gap-3">
              <FormField label="Registration Number" name="registration_number" value={formData.registration_number} onChange={handleInputChange} required error={errors.registration_number} placeholder="e.g. KA 01 AB 1234" />
              <FormField label="Brand" name="brand" value={formData.brand} onChange={handleInputChange} required error={errors.brand} placeholder="e.g. Tata" />
              <FormField label="Model" name="model" value={formData.model} onChange={handleInputChange} required error={errors.model} placeholder="e.g. Intra V30" />
              <FormSelect label="Vehicle Type" name="vehicle_type" value={formData.vehicle_type} onChange={handleInputChange} required error={errors.vehicle_type} options={vehicleTypes} />
            </div>

            {/* Row 2: 5 columns */}
            <div className="grid grid-cols-1 md:grid-cols-custom-5 gap-3">
              <FormField label="Capacity (KG)" name="capacity_kg" type="number" value={formData.capacity_kg} onChange={handleInputChange} required error={errors.capacity_kg} placeholder="e.g. 1000" />
              <FormField label="Kerb Weight (KG)" name="kerb_weight_kg" type="number" value={formData.kerb_weight_kg} onChange={handleInputChange} required error={errors.kerb_weight_kg} placeholder="e.g. 950" />
              <FormSelect label="Fuel Type" name="fuel_type" value={formData.fuel_type} onChange={handleInputChange} required error={errors.fuel_type} options={fuelTypes} />
              <FormField label="Manufacturing Year" name="manufacturing_year" type="number" value={formData.manufacturing_year} onChange={handleInputChange} required error={errors.manufacturing_year} placeholder="e.g. 2024" />
              <FormField label="Chassis Number" name="chassis_number" value={formData.chassis_number} onChange={handleInputChange} required error={errors.chassis_number} placeholder="Enter Chassis Number" />
            </div>

            {/* Row 3: 4 columns */}
            <div className="grid grid-cols-1 md:grid-cols-custom-4 gap-3">
              <FormField label="Engine Number" name="engine_number" value={formData.engine_number} onChange={handleInputChange} required error={errors.engine_number} placeholder="Enter Engine Number" />
              <FormSelect label="Color" name="color" value={formData.color} onChange={handleInputChange} required error={errors.color} options={colors} placeholder="Select Color" />
              <FormSelect label="Owner Type" name="owner_type" value={formData.owner_type} onChange={handleInputChange} required error={errors.owner_type} options={ownerTypes} />
              <FormSelect label="Vehicle Status" name="vehicle_status" value={formData.vehicle_status} onChange={handleInputChange} required error={errors.vehicle_status} options={statuses} />
            </div>
          </div>

          {/* Document Uploads Row: 6 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-custom-6 gap-4 mt-8 border-t border-slate-100 pt-6">
            <div>
              <FileUploadField label="RC Front Image" name="rc_front_image" onChange={handleFileChange} required error={errors.rc_front_image} existingFile={existingFiles.rc_front_image} />
            </div>
            <div>
              <FileUploadField label="RC Back Image" name="rc_back_image" onChange={handleFileChange} required error={errors.rc_back_image} existingFile={existingFiles.rc_back_image} />
            </div>
            <div>
              <FileUploadField label="Vehicle Front Photo (Optional)" name="vehicle_front_photo" onChange={handleFileChange} existingFile={existingFiles.vehicle_front_photo} />
            </div>
            <div>
              <FileUploadField label="Vehicle Rear Photo (Optional)" name="vehicle_rear_photo" onChange={handleFileChange} existingFile={existingFiles.vehicle_rear_photo} />
            </div>
            <div>
              <FileUploadField label="Vehicle Left Side Photo (Optional)" name="vehicle_left_photo" onChange={handleFileChange} existingFile={existingFiles.vehicle_left_photo} />
            </div>
            <div>
              <FileUploadField label="Vehicle Right Side Photo (Optional)" name="vehicle_right_photo" onChange={handleFileChange} existingFile={existingFiles.vehicle_right_photo} />
            </div>
          </div>
        </div>

        {/* SECTION 2: LICENSE & CERTIFICATES */}
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-3">
            <div className="p-2 bg-slate-50 rounded-xl" style={{ color: primaryColor }}>
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">License & Certificates</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-custom-6 gap-3">
            <FormField label="Emission (PUC) Expiry" name="emission_puc_expiry" type="date" value={formData.emission_puc_expiry} onChange={handleInputChange} required error={errors.emission_puc_expiry} />
            <FormField label="Insurance Expiry" name="insurance_expiry" type="date" value={formData.insurance_expiry} onChange={handleInputChange} required error={errors.insurance_expiry} />
            <FormField label="FC Expiry" name="fc_expiry" type="date" value={formData.fc_expiry} onChange={handleInputChange} required error={errors.fc_expiry} />
            <FormField label="Permit Number" name="permit_number" value={formData.permit_number} onChange={handleInputChange} error={errors.permit_number} placeholder="Enter Permit No." />
            <FormField label="Permit Expiry" name="permit_expiry" type="date" value={formData.permit_expiry} onChange={handleInputChange} error={errors.permit_expiry} />
            <FormField label="Road Tax Expiry" name="road_tax_expiry" type="date" value={formData.road_tax_expiry} onChange={handleInputChange} error={errors.road_tax_expiry} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-custom-5 gap-4 mt-8 border-t border-slate-100 pt-6">
            <div>
              <FileUploadField label="PUC Certificate Image" name="puc_certificate_image" onChange={handleFileChange} required error={errors.puc_certificate_image} existingFile={existingFiles.puc_certificate_image} />
            </div>
            <div>
              <FileUploadField label="Insurance Certificate Image" name="insurance_certificate_image" onChange={handleFileChange} required error={errors.insurance_certificate_image} existingFile={existingFiles.insurance_certificate_image} />
            </div>
            <div>
              <FileUploadField label="Fitness Certificate (FC) Image" name="fc_certificate_image" onChange={handleFileChange} required error={errors.fc_certificate_image} existingFile={existingFiles.fc_certificate_image} />
            </div>
            <div>
              <FileUploadField label="Permit Certificate Image" name="permit_certificate_image" onChange={handleFileChange} existingFile={existingFiles.permit_certificate_image} />
            </div>
            <div>
              <FileUploadField label="Road Tax Receipt Image" name="road_tax_receipt_image" onChange={handleFileChange} existingFile={existingFiles.road_tax_receipt_image} />
            </div>
          </div>
        </div>

        {/* SECTION 3: DRIVER ASSIGNMENT */}
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-3">
            <div className="p-2 bg-slate-50 rounded-xl" style={{ color: primaryColor }}>
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Driver & Helper Assignment</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-custom-7 gap-3">
            <FormSelect 
              label="Driver" name="driver_id" value={formData.driver_id} onChange={handleInputChange} required error={errors.driver_id} placeholder="Select Driver"
              options={employees.filter(e => e.staff_type === 'driver').map(e => ({ value: e.id, label: e.name }))}
            />
            <FormField label="Driver ID" name="driver_id_disp" value={selectedDriverDetails ? `DRV${String(selectedDriverDetails.id).padStart(5, '0')}` : ''} disabled />
            <FormField label="Driver Mobile" name="driver_mobile_disp" value={selectedDriverDetails?.mobile_number || ''} disabled />
            <FormField label="License Number" name="driver_license_disp" value={selectedDriverDetails?.driving_license_number || ''} disabled />
            
            <FormSelect 
              label="Helper" name="helper_id" value={formData.helper_id} onChange={handleInputChange} error={errors.helper_id} placeholder="Select Helper"
              options={employees.filter(e => e.staff_type === 'helper').map(e => ({ value: e.id, label: e.name }))}
            />
            <FormField label="Helper ID" name="helper_id_disp" value={selectedHelperDetails ? `HLP${String(selectedHelperDetails.id).padStart(5, '0')}` : ''} disabled />
            <FormField label="Helper Mobile" name="helper_mobile_disp" value={selectedHelperDetails?.mobile_number || ''} disabled />
          </div>
        </div>

        {/* SECTION 4: MOBILE DEVICE ASSIGNMENT */}
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-3">
            <div className="p-2 bg-slate-50 rounded-xl" style={{ color: primaryColor }}>
              <Smartphone className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Mobile Device Assignment</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* DEVICE INFORMATION (Left Column) */}
            <div className="space-y-5 bg-slate-50/10 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">Device Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Device Name / Model" name="device_name_model" value={formData.device_name_model} onChange={handleInputChange} required error={errors.device_name_model} placeholder="e.g. Redmi 12 5G" />
                <FormField label="Brand" name="device_brand" value={formData.device_brand} onChange={handleInputChange} required error={errors.device_brand} placeholder="e.g. Xiaomi" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="IMEI 1 Number" name="device_imei_1" value={formData.device_imei_1} onChange={handleInputChange} required error={errors.device_imei_1} placeholder="IMEI 1" />
                <FormField label="IMEI 2 Number" name="device_imei_2" value={formData.device_imei_2} onChange={handleInputChange} placeholder="IMEI 2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Serial Number" name="device_serial_number" value={formData.device_serial_number} onChange={handleInputChange} placeholder="e.g. RDI2G..." />
                <FormField label="Mobile Number (SIM)" name="device_mobile_number_sim" value={formData.device_mobile_number_sim} onChange={handleInputChange} required error={errors.device_mobile_number_sim} placeholder="e.g. 9876..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormSelect label="SIM Provider" name="device_sim_provider" value={formData.device_sim_provider} onChange={handleInputChange} options={['Jio', 'Airtel', 'Vi', 'BSNL'].map(p => ({ value: p, label: p }))} />
                <FormField label="SIM ICCID Number" name="device_sim_iccid" value={formData.device_sim_iccid} onChange={handleInputChange} placeholder="SIM ICCID" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Purchase Date" name="device_purchase_date" type="date" value={formData.device_purchase_date} onChange={handleInputChange} />
                <FormField label="Warranty Expiry" name="device_warranty_expiry" type="date" value={formData.device_warranty_expiry} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Assigned Date" name="device_assigned_date" type="date" value={formData.device_assigned_date} onChange={handleInputChange} required error={errors.device_assigned_date} />
                <FormField label="Returned Date" name="device_returned_date" type="date" value={formData.device_returned_date} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormSelect label="Device Status" name="device_status" value={formData.device_status} onChange={handleInputChange} required error={errors.device_status} options={deviceStatuses} />
                <FormSelect label="Device Condition" name="device_condition" value={formData.device_condition} onChange={handleInputChange} options={deviceConditions} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Device Cost (₹)" name="device_cost" type="number" value={formData.device_cost} onChange={handleInputChange} placeholder="12,999" />
                <FormField label="Vendor / Purchased From" name="device_vendor" value={formData.device_vendor} onChange={handleInputChange} placeholder="e.g. Reliance Digital" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Invoice Number" name="device_invoice_number" value={formData.device_invoice_number} onChange={handleInputChange} placeholder="INV/2024/..." />
                
                <div className="flex flex-col text-left">
                  <span className="block text-xs font-bold text-slate-700 mb-1.5">GPS Enabled</span>
                  <div className="flex items-center space-x-4 mt-1">
                    <label className="flex items-center text-xs font-bold text-slate-600 cursor-pointer">
                      <input type="radio" name="device_gps_enabled" value="true" checked={formData.device_gps_enabled === true || formData.device_gps_enabled === "true"} onChange={handleInputChange} className="mr-2" style={{ accentColor: primaryColor }} /> Yes
                    </label>
                    <label className="flex items-center text-xs font-bold text-slate-600 cursor-pointer">
                      <input type="radio" name="device_gps_enabled" value="false" checked={formData.device_gps_enabled === false || formData.device_gps_enabled === "false"} onChange={handleInputChange} className="mr-2" style={{ accentColor: primaryColor }} /> No
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Remarks</label>
                <textarea name="device_remarks" value={formData.device_remarks} onChange={handleInputChange} placeholder="Company issued mobile for communication" rows={2} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 placeholder-slate-400 focus:ring-1 focus:ring-blue-100 disabled:opacity-60 transition-all" />
              </div>
            </div>

            {/* MOBILE DOCUMENTS (Middle Column) */}
            <div className="space-y-6 bg-slate-50/10 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Mobile Documents</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FileUploadField label="Mobile Front Photo" name="device_front_photo" onChange={handleFileChange} required error={errors.device_front_photo} existingFile={existingFiles.device_front_photo} />
                  </div>
                  <div>
                    <FileUploadField label="Mobile Back Photo" name="device_back_photo" onChange={handleFileChange} required error={errors.device_back_photo} existingFile={existingFiles.device_back_photo} />
                  </div>
                  <div>
                    <FileUploadField label="IMEI Sticker Photo" name="device_imei_sticker_photo" onChange={handleFileChange} required error={errors.device_imei_sticker_photo} existingFile={existingFiles.device_imei_sticker_photo} />
                  </div>

                  <div>
                    <FileUploadField label="Purchase Invoice / Receipt" name="device_purchase_invoice" onChange={handleFileChange} required error={errors.device_purchase_invoice} existingFile={existingFiles.device_purchase_invoice} />
                  </div>
                  <div>
                    <FileUploadField label="Warranty Card (Optional)" name="device_warranty_card" onChange={handleFileChange} existingFile={existingFiles.device_warranty_card} />
                  </div>
                  <div>
                    <FileUploadField label="Box IMEI Photo (Optional)" name="device_box_imei_photo" onChange={handleFileChange} existingFile={existingFiles.device_box_imei_photo} />
                  </div>

                  <div>
                    <FileUploadField label="Charger Photo (Optional)" name="device_charger_photo" onChange={handleFileChange} existingFile={existingFiles.device_charger_photo} />
                  </div>
                  <div>
                    <FileUploadField label="Accessories Photo (Optional)" name="device_accessories_photo" onChange={handleFileChange} existingFile={existingFiles.device_accessories_photo} />
                  </div>
                  <div>
                    <FileUploadField label="Other Document (Optional)" name="device_other_document" onChange={handleFileChange} existingFile={existingFiles.device_other_document} />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 italic">Allowed: JPG, PNG, PDF (Max. 2MB each)</span>
              </div>
            </div>

            {/* ASSIGNMENT INFORMATION (Right Column) */}
            <div className="space-y-5 bg-slate-50/10 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">Assignment Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormSelect label="Assigned To" name="device_assigned_to" value={formData.device_assigned_to} onChange={handleInputChange} required error={errors.device_assigned_to} options={[{ value: 'Driver', label: 'Driver' }, { value: 'Helper', label: 'Helper' }]} />
                
                <FormSelect
                  label="Employee Name"
                  name={formData.device_assigned_to === 'Driver' ? 'driver_id' : 'helper_id'}
                  value={formData.device_assigned_to === 'Driver' ? formData.driver_id : formData.helper_id}
                  onChange={handleInputChange}
                  required
                  error={formData.device_assigned_to === 'Driver' ? errors.driver_id : errors.helper_id}
                  placeholder="Select Employee"
                  options={employees.filter(e => e.staff_type === (formData.device_assigned_to === 'Driver' ? 'driver' : 'helper')).map(e => ({ value: e.id, label: e.name }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Employee ID" name="device_employee_id_disp" value={formData.device_assigned_to === 'Driver' ? (formData.driver_id ? `DRV${String(formData.driver_id).padStart(5, '0')}` : 'Select driver') : (formData.helper_id ? `HLP${String(formData.helper_id).padStart(5, '0')}` : 'Select helper')} disabled />
                <FormField label="Assigned By" name="assigned_by" value="Admin (System)" disabled />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Assignment Date" name="device_assignment_date" type="date" value={formData.device_assignment_date} onChange={handleInputChange} required error={errors.device_assignment_date} />
                <FormField label="Return Date" name="return_date" type="date" value={formData.device_returned_date} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormSelect label="Assignment Status" name="device_assignment_status" value={formData.device_assignment_status} onChange={handleInputChange} required error={errors.device_assignment_status} options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }, { value: 'Completed', label: 'Completed' }]} />
                <FormSelect label="Device Lock Status" name="device_lock_status" value={formData.device_lock_status} onChange={handleInputChange} options={[{ value: 'Enabled', label: 'Enabled' }, { value: 'Disabled', label: 'Disabled' }]} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col text-left">
                  <span className="block text-xs font-bold text-slate-700 mb-1.5">Charger Issued</span>
                  <div className="flex items-center space-x-4 mt-1">
                    <label className="flex items-center text-xs font-bold text-slate-600 cursor-pointer">
                      <input type="radio" name="device_charger_issued" value="true" checked={formData.device_charger_issued === true || formData.device_charger_issued === "true"} onChange={handleInputChange} className="mr-2" style={{ accentColor: primaryColor }} /> Yes
                    </label>
                    <label className="flex items-center text-xs font-bold text-slate-600 cursor-pointer">
                      <input type="radio" name="device_charger_issued" value="false" checked={formData.device_charger_issued === false || formData.device_charger_issued === "false"} onChange={handleInputChange} className="mr-2" style={{ accentColor: primaryColor }} /> No
                    </label>
                  </div>
                </div>
              </div>

              {/* Accessories Issued Tag Input */}
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Accessories Issued</label>
                <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {accessoriesList.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                      {tag}
                      <button type="button" onClick={() => removeAccessory(idx)} className="ml-1 text-slate-400 hover:text-red-500">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  {accessoriesList.length === 0 && <span className="text-[10px] text-slate-400 italic">No accessories listed</span>}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={accessoriesInput}
                    onChange={(e) => setAccessoriesInput(e.target.value)}
                    placeholder="Add accessory"
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 placeholder-slate-400 focus:ring-1 focus:ring-blue-100 disabled:opacity-60 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addAccessory}
                    style={{ backgroundColor: primaryColor }}
                    className="px-2.5 py-1 text-white font-bold text-xs rounded-lg flex items-center shadow-sm hover:opacity-90 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-left">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Additional Notes (Optional)</label>
                <textarea name="device_additional_notes" value={formData.device_additional_notes} onChange={handleInputChange} placeholder="Handle with care. Return immediately if not in use." rows={2} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 placeholder-slate-400 focus:ring-1 focus:ring-blue-100 disabled:opacity-60 transition-all" />
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setFormData({
                registration_number: '', brand: '', model: '', vehicle_type: '', capacity_kg: '', kerb_weight_kg: '',
                fuel_type: '', manufacturing_year: '', chassis_number: '', engine_number: '', color: '',
                no_of_axles: 2, owner_type: '', vehicle_status: 'Active',
                emission_puc_expiry: '', insurance_expiry: '', fc_expiry: '', permit_number: '', permit_expiry: '', road_tax_expiry: '',
                driver_id: '', helper_id: '',
                device_name_model: '', device_brand: '', device_imei_1: '', device_imei_2: '', device_serial_number: '',
                device_mobile_number_sim: '', device_sim_provider: '', device_sim_iccid: '', device_purchase_date: '',
                device_warranty_expiry: '', device_assigned_date: '', device_returned_date: '', device_status: 'Assigned',
                device_condition: 'New', device_cost: '', device_vendor: '', device_invoice_number: '', device_asset_number_tag: '',
                device_qr_code_tag: '', device_gps_enabled: true, device_mdm_enrolled: false, device_remarks: '',
                device_assigned_to: 'Driver', device_assignment_date: '', device_assignment_status: 'Active', device_lock_status: 'Enabled',
                device_security_pin_set: false, device_charger_issued: false, device_accessories_issued: '', device_additional_notes: ''
              });
              setFileData({
                rc_front_image: null, rc_back_image: null, vehicle_front_photo: null, vehicle_rear_photo: null,
                vehicle_left_photo: null, vehicle_right_photo: null, puc_certificate_image: null, insurance_certificate_image: null,
                fc_certificate_image: null, permit_certificate_image: null, road_tax_receipt_image: null,
                device_front_photo: null, device_back_photo: null, device_imei_sticker_photo: null, device_purchase_invoice: null,
                device_warranty_card: null, device_box_imei_photo: null, device_charger_photo: null, device_accessories_photo: null,
                device_other_document: null
              });
              setAccessoriesList(["Earphones", "Power Bank", "Back Cover"]);
              setErrors({});
              toast.success("Form cleared successfully");
            }}
            className="flex items-center px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-800 text-xs font-bold shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" /> Reset
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{ backgroundColor: primaryColor }}
            className="flex items-center px-8 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 mr-1.5" /> {submitting ? 'Processing...' : (isEditMode ? 'Save Vehicle Details' : 'Save Vehicle Details')}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddVehicle;
