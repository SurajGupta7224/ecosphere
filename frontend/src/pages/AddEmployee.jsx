import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Send, RotateCcw, Upload, FileText, User,
  MapPin, Calendar, Clipboard, ShieldCheck,
  Activity, Star, CheckCircle2, ChevronLeft,
  ChevronRight, AlertCircle, Info, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { IMAGE_BASE_URL } from '../api';
import { useSettings } from '../context/SettingsContext';

const getFileUrl = (filename, fieldname) => {
  if (!filename) return '';
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('data:')) {
    return filename;
  }
  const folder = (fieldname === 'profile_photo' || fieldname === 'profile_pic') ? 'ProfilePics' : 'Employees';
  const cleanFilename = filename.replace(`/uploads/${folder}/`, '').replace('/uploads/Employees/', '').replace('/uploads/ProfilePics/', '');
  return `${IMAGE_BASE_URL}/${folder}/${cleanFilename}`;
};

const StepIndicator = ({ currentStep, steps, onStepClick }) => {
  const { settings } = useSettings();
  const primaryColor = settings?.theme?.primary_color || '#31975C';

  return (
    <div className="mb-8 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onStepClick(stepNum)}
              className="flex items-center space-x-3 flex-1 last:flex-none text-left focus:outline-none group w-full md:w-auto"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${isActive ? 'text-white shadow-lg scale-105' :
                    isCompleted ? 'bg-emerald-500 text-white shadow-sm' :
                      'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                  }`}
                style={isActive ? { backgroundColor: primaryColor, boxShadow: `0 4px 12px ${primaryColor}20` } : {}}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
              </div>
              <div className="min-w-0">
                <p
                  className="text-[10px] uppercase tracking-wider font-bold transition-colors"
                  style={isActive ? { color: primaryColor } : { color: '#94a3b8' }}
                >
                  Step {stepNum}
                </p>
                <p className={`text-xs font-extrabold truncate max-w-[130px] ${isActive ? 'text-slate-800' : 'text-slate-400 group-hover:text-slate-600'
                  }`}>
                  {step.title}
                </p>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden md:block flex-1 h-0.5 bg-slate-100 mx-4">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      backgroundColor: isCompleted ? 'rgba(16, 185, 129, 1)' : 'rgba(226, 232, 240, 1)',
                      width: isCompleted ? '100%' : '0%'
                    }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const FormField = ({ label, name, type = "text", value, onChange, required = false, placeholder = "", error, disabled = false }) => {
  const { settings } = useSettings();
  const primaryColor = settings?.theme?.primary_color || '#31975C';
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col">
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
        {label} {required && <span className="text-red-500 font-bold">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={isFocused && !error ? { borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}20` } : {}}
        className={`w-full bg-slate-50/50 border rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-200/80'
          }`}
      />
      {error && <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {error}</p>}
    </div>
  );
};

const FormSelect = ({ label, name, value, onChange, options, required = false, disabled = false, placeholder = "Choose...", error }) => {
  const { settings } = useSettings();
  const primaryColor = settings?.theme?.primary_color || '#31975C';
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col">
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
        {label} {required && <span className="text-red-500 font-bold">*</span>}
      </label>
      <div className="relative">
        <select
          name={name}
          value={value || ''}
          onChange={onChange}
          required={required}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={isFocused && !error ? { borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}20` } : {}}
          className={`w-full bg-slate-50/50 border rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:bg-white transition-all appearance-none disabled:opacity-60 disabled:cursor-not-allowed ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-200/80'
            }`}
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {error}</p>}
    </div>
  );
};

const FileUploadField = ({ label, name, onChange, required = false, accept = "image/*,.pdf", existingFile, error }) => {
  const [selectedFileName, setSelectedFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const { settings } = useSettings();
  const primaryColor = settings?.theme?.primary_color || '#31975C';

  const handleFileChangeLocal = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);

      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl("");
      }

      onChange(e);
    }
  };

  const displayFile = selectedFileName || (existingFile ? "Current File Uploaded" : "");

  return (
    <div className="flex flex-col">
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
        {label} {required && <span className="text-red-500 font-bold">*</span>}
      </label>
      <div
        className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all flex flex-col items-center justify-center bg-slate-50/20 hover:bg-white group ${error ? 'border-red-500' : 'border-slate-200 hover:border-purple-300'
          }`}
      >
        <input
          type="file"
          name={name}
          onChange={handleFileChangeLocal}
          accept={accept}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {previewUrl ? (
          <div className="w-full mb-2">
            <img
              src={previewUrl}
              alt="File Preview"
              className="w-full max-h-48 rounded-xl object-contain border border-slate-100 shadow-sm mx-auto animate-in zoom-in-50 duration-200 p-1 bg-white"
            />
          </div>
        ) : existingFile ? (
          <div className="w-full mb-2">
            {existingFile.match(/\.(jpeg|jpg|png|webp|gif)$/i) || !existingFile.toLowerCase().endsWith('.pdf') ? (
              <img
                src={getFileUrl(existingFile, name)}
                alt="File Preview"
                className="w-full max-h-48 rounded-xl object-contain border border-slate-100 shadow-sm mx-auto p-1 bg-white"
              />
            ) : (
              <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-500 mx-auto">
                <FileText className="w-8 h-8" />
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-white rounded-full shadow-sm text-slate-400 mb-2 border border-slate-100 group-hover:text-purple-600 transition-colors">
            <Upload className="w-5 h-5" />
          </div>
        )}

        <p className="text-xs text-slate-600 font-bold">
          {displayFile ? (
            <span className="max-w-[200px] truncate block mx-auto font-bold" style={{ color: primaryColor }}>{displayFile}</span>
          ) : (
            <>
              Click or drag here to upload
            </>
          )}
        </p>
        <span className="text-[10px] text-slate-400 mt-1 font-medium">Supports Image/PDF up to 5MB</span>
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {error}</p>}
    </div>
  );
};

const AddEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const { settings } = useSettings();
  const primaryColor = settings?.theme?.primary_color || '#31975C';

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Success state matching manual generated request layout
  const [successData, setSuccessData] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', mobile_number: '', gender: '', blood_group: '', marital_status: '',
    father_husband_name: '', dob: '', staff_type: '', address: '',
    aadhaar_number: '', pan_card_number: '', esi_number: '', epf_number: '',
    driving_license_number: '', police_verification_number: '',
    medical_certificate_number: '', eyesight_certificate_number: '',
    profile_approval_status: 'pending', employee_status: 'active',
    approved_by: '', approved_date: ''
  });

  const [fileData, setFileData] = useState({
    profile_photo: null, aadhaar_front_image: null, aadhaar_back_image: null, pan_card_image: null,
    driving_license_front_image: null, driving_license_back_image: null, police_verification_image: null,
    medical_certificate_image: null, eyesight_certificate_image: null
  });

  const [existingFiles, setExistingFiles] = useState({});

  // Wizard has 3 steps as status approval/reject details are removed for enrollment access
  const steps = [
    { title: "Personal Details" },
    { title: "KYC Verification" },
    { title: "Licenses & Verification" }
  ];

  useEffect(() => {
    if (isEditMode) {
      fetchEmployeeDetails();
    }
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      const res = await api.get(`/aggregator-employees/${id}`);
      const emp = res.data.employee;
      if (emp) {
        setFormData({
          name: emp.name || '',
          email: emp.email || '',
          mobile_number: emp.mobile_number || '',
          gender: emp.gender || '',
          blood_group: emp.blood_group || '',
          marital_status: emp.marital_status || '',
          father_husband_name: emp.father_husband_name || '',
          dob: emp.dob ? emp.dob.slice(0, 10) : '',
          staff_type: emp.staff_type || '',
          address: emp.address || '',
          aadhaar_number: emp.aadhaar_number || '',
          pan_card_number: emp.pan_card_number || '',
          esi_number: emp.esi_number || '',
          epf_number: emp.epf_number || '',
          driving_license_number: emp.driving_license_number || '',
          police_verification_number: emp.police_verification_number || '',
          medical_certificate_number: emp.medical_certificate_number || '',
          eyesight_certificate_number: emp.eyesight_certificate_number || '',
          profile_approval_status: emp.profile_approval_status || 'pending',
          employee_status: emp.employee_status || 'active',
          approved_by: emp.approver?.name || '',
          approved_date: emp.approved_date ? new Date(emp.approved_date).toLocaleDateString() : ''
        });

        setExistingFiles({
          profile_photo: emp.profile_photo,
          aadhaar_front_image: emp.aadhaar_front_image,
          aadhaar_back_image: emp.aadhaar_back_image,
          pan_card_image: emp.pan_card_image,
          driving_license_front_image: emp.driving_license_front_image,
          driving_license_back_image: emp.driving_license_back_image,
          police_verification_image: emp.police_verification_image,
          medical_certificate_image: emp.medical_certificate_image,
          eyesight_certificate_image: emp.eyesight_certificate_image
        });
      }
    } catch (err) {
      toast.error('Failed to load employee details');
      navigate('/aggregator-employees');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'mobile_number') {
      const numericVal = value.replace(/\D/g, '');
      finalValue = numericVal.slice(0, 10);
    }

    if (name === 'aadhaar_number') {
      const numericVal = value.replace(/\D/g, '');
      finalValue = numericVal.slice(0, 12);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors(prev => {
        const c = { ...prev };
        delete c[name];
        return c;
      });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFileData(prev => ({ ...prev, [name]: files[0] }));
      if (errors[name]) {
        setErrors(prev => {
          const c = { ...prev };
          delete c[name];
          return c;
        });
      }
    }
  };

  const scrollToError = (errObj) => {
    const errorKeys = Object.keys(errObj);
    if (errorKeys.length > 0) {
      const firstErrorName = errorKeys[0];
      let el = document.getElementsByName(firstErrorName)[0];
      if (el) {
        if (el.type === 'file') {
          el = el.parentElement;
        }
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    }
  };

  const handleStepClick = (stepNum) => {
    if (stepNum < currentStep) {
      setCurrentStep(stepNum);
    } else if (stepNum > currentStep) {
      let valid = true;
      for (let s = currentStep; s < stepNum; s++) {
        if (!validateStep(s)) {
          valid = false;
          break;
        }
      }
      if (valid) {
        setCurrentStep(stepNum);
      } else {
        toast.error("Please complete all required fields on the current step first.");
      }
    }
  };

  const validateStep = (step) => {
    const err = {};

    if (step === 1) {
      if (!formData.name || !formData.name.trim()) err.name = "Employee name is required";
      if (!formData.mobile_number || !formData.mobile_number.trim()) err.mobile_number = "Mobile number is required";
      else if (formData.mobile_number.trim().length !== 10) err.mobile_number = "Must be exactly 10 digits";
      if (!formData.gender) err.gender = "Gender is required";
      if (!formData.dob) err.dob = "Date of Birth is required";
      if (!formData.staff_type) err.staff_type = "Staff type is required";
      if (!formData.address || !formData.address.trim()) err.address = "Address is required";
    }

    if (step === 2) {
      // Aadhaar Details
      if (!formData.aadhaar_number || !formData.aadhaar_number.trim()) err.aadhaar_number = "Aadhaar number is required";
      else if (formData.aadhaar_number.trim().length !== 12) err.aadhaar_number = "Must be exactly 12 digits";

      const hasAadhaarFront = fileData.aadhaar_front_image || existingFiles.aadhaar_front_image;
      if (!hasAadhaarFront) err.aadhaar_front_image = "Aadhaar Front image is required";

      const hasAadhaarBack = fileData.aadhaar_back_image || existingFiles.aadhaar_back_image;
      if (!hasAadhaarBack) err.aadhaar_back_image = "Aadhaar Back image is required";

      // PAN Details
      if (!formData.pan_card_number || !formData.pan_card_number.trim()) err.pan_card_number = "PAN Card number is required";
      else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_card_number.trim().toUpperCase())) err.pan_card_number = "Must be valid PAN (e.g. ABCDE1234F)";

      const hasPanCard = fileData.pan_card_image || existingFiles.pan_card_image;
      if (!hasPanCard) err.pan_card_image = "PAN Card image is required";

      // ESI & EPF are required as per Step 2 instructions
      if (!formData.esi_number || !formData.esi_number.trim()) err.esi_number = "ESI Number is required";
      if (!formData.epf_number || !formData.epf_number.trim()) err.epf_number = "EPF Number is required";
    }

    if (step === 3) {
      if (formData.staff_type === 'driver') {
        if (!formData.driving_license_number || !formData.driving_license_number.trim()) err.driving_license_number = "License number is required for Driver";

        const hasLicenseFront = fileData.driving_license_front_image || existingFiles.driving_license_front_image;
        if (!hasLicenseFront) err.driving_license_front_image = "Front image is required";

        const hasLicenseBack = fileData.driving_license_back_image || existingFiles.driving_license_back_image;
        if (!hasLicenseBack) err.driving_license_back_image = "Back image is required";
      }
    }

    setErrors(err);
    if (Object.keys(err).length > 0) {
      scrollToError(err);
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.error("Please complete all required fields correctly.");
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Guard to prevent accidental submission on Enter key or button race conditions
    if (currentStep < steps.length) {
      handleNextStep();
      return;
    }

    if (!validateStep(currentStep)) {
      toast.error('Please resolve errors in the form');
      return;
    }

    setSubmitting(true);
    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '' && formData[key] !== null) {
        payload.append(key, formData[key]);
      }
    });

    Object.keys(fileData).forEach(key => {
      if (fileData[key]) {
        payload.append(key, fileData[key]);
      }
    });

    try {
      let res;
      if (isEditMode) {
        res = await api.put(`/aggregator-employees/${id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Employee record updated successfully');
        navigate('/aggregator-employees');
        return;
      } else {
        res = await api.post('/aggregator-employees', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        const successObj = {
          id: res.data.employeeId || 'N/A',
          name: formData.name,
          mobile_number: formData.mobile_number,
          staff_type: formData.staff_type,
          profile_approval_status: formData.profile_approval_status,
          employee_status: formData.employee_status
        };
        setSuccessData(successObj);
        setSubmitSuccess(true);
        toast.success('Employee enrolled successfully');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to save employee record';
      toast.error(errMsg);

      const newErrors = {};
      if (errMsg.toLowerCase().includes('mobile number')) {
        newErrors.mobile_number = errMsg;
        setCurrentStep(1);
        setTimeout(() => {
          scrollToError({ mobile_number: errMsg });
        }, 100);
      } else if (errMsg.toLowerCase().includes('aadhaar number')) {
        newErrors.aadhaar_number = errMsg;
        setCurrentStep(2);
        setTimeout(() => {
          scrollToError({ aadhaar_number: errMsg });
        }, 100);
      }
      setErrors(newErrors);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm shadow-emerald-50">
            <CheckCircle2 className="w-8 h-8 animate-in zoom-in duration-300" />
          </div>

          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Request Generated!</h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-md mx-auto">
            The aggregator employee record has been processed and saved in the system successfully.
          </p>

          <div className="mt-8 bg-slate-50 rounded-2xl p-6 border border-slate-200/60 text-left space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Employee Overview</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-semibold text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee ID</span>
                <span className="text-slate-800 font-bold">EMP-{successData?.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee Name</span>
                <span className="text-slate-800 font-bold">{successData?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Mobile Number</span>
                <span className="text-slate-800 font-bold">{successData?.mobile_number}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Staff Role</span>
                <span className="text-indigo-600 font-bold uppercase">{successData?.staff_type}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Approval Status</span>
                <span className="text-slate-800 font-bold uppercase">{successData?.profile_approval_status}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                <span className="text-slate-800 font-bold uppercase">{successData?.employee_status}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => {
                setSubmitSuccess(false);
                setFormData({
                  name: '', email: '', mobile_number: '', gender: '', blood_group: '', marital_status: '',
                  father_husband_name: '', dob: '', staff_type: '', address: '',
                  aadhaar_number: '', pan_card_number: '', esi_number: '', epf_number: '',
                  driving_license_number: '', police_verification_number: '',
                  medical_certificate_number: '', eyesight_certificate_number: '',
                  profile_approval_status: 'pending', employee_status: 'active',
                  approved_by: '', approved_date: ''
                });
                setFileData({
                  profile_photo: null, aadhaar_front_image: null, aadhaar_back_image: null, pan_card_image: null,
                  driving_license_front_image: null, driving_license_back_image: null, police_verification_image: null,
                  medical_certificate_image: null, eyesight_certificate_image: null
                });
                setExistingFiles({});
                setCurrentStep(1);
              }}
              style={{ backgroundColor: primaryColor }}
              className="w-full py-3 text-white rounded-xl font-bold transition-all text-xs hover:opacity-90 cursor-pointer shadow-md"
            >
              Enroll Another Employee
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1.5">
            {isEditMode ? 'Modify Aggregator Employee' : 'Enroll Aggregator Employee'}
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Fill in the sequential form below to securely register aggregator workforce details.
          </p>
        </div>

        <Link
          to="/aggregator-employees"
          className="flex items-center px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl bg-white text-xs font-bold shadow-sm transition-all"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Back to List
        </Link>
      </div>

      {/* Steps Indicator */}
      <StepIndicator currentStep={currentStep} steps={steps} onStepClick={handleStepClick} />

      {/* Form content */}
      <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm mb-6">
        <form onSubmit={handleSubmit} noValidate>

          {/* STEP 1: Personal Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-2 border-b border-slate-100 pb-3">
                <div className="p-2 bg-slate-50 rounded-xl" style={{ color: primaryColor }}>
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Personal Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Employee Name" name="name" value={formData.name} onChange={handleInputChange} required error={errors.name} placeholder="Enter full name" />
                <FormField label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="e.g. employee@company.com" />
                <FormField label="Mobile Number" name="mobile_number" value={formData.mobile_number} onChange={handleInputChange} required error={errors.mobile_number} placeholder="Enter 10-digit number" />
                <FormField label="Father's / Husband's Name" name="father_husband_name" value={formData.father_husband_name} onChange={handleInputChange} placeholder="Enter relative's name" />
                <FormField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleInputChange} required error={errors.dob} />

                <FormSelect
                  label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} required error={errors.gender}
                  options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]}
                />

                <FormSelect
                  label="Blood Group" name="blood_group" value={formData.blood_group} onChange={handleInputChange}
                  options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => ({ value: b, label: b }))}
                />

                <FormSelect
                  label="Marital Status" name="marital_status" value={formData.marital_status} onChange={handleInputChange}
                  options={['Single', 'Married', 'Divorced', 'Widowed'].map(m => ({ value: m, label: m }))}
                />

                <FormSelect
                  label="Staff Type" name="staff_type" value={formData.staff_type} onChange={handleInputChange} required error={errors.staff_type} placeholder="Select Driver / Helper"
                  options={[{ value: 'driver', label: 'Driver' }, { value: 'helper', label: 'Helper' }]}
                />

                <FileUploadField label="Profile Photo" name="profile_photo" onChange={handleFileChange} existingFile={existingFiles.profile_photo} />

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Full Address <span className="text-red-500 font-bold">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    placeholder="Enter complete residential address"
                    className={`w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white transition-all ${errors.address ? 'border-red-500 focus:border-red-500' : 'border-slate-200/80'
                      }`}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.address}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: KYC Verification */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center space-x-3 mb-2 border-b border-slate-100 pb-3">
                  <div className="p-2 bg-slate-50 rounded-xl" style={{ color: primaryColor }}>
                    <Clipboard className="w-5 h-5" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Identity & KYC Verification</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField label="Aadhaar Number" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleInputChange} required error={errors.aadhaar_number} placeholder="Enter 12-digit number" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2">
                    <FileUploadField label="Aadhaar Front Image" name="aadhaar_front_image" onChange={handleFileChange} required error={errors.aadhaar_front_image} existingFile={existingFiles.aadhaar_front_image} />
                    <FileUploadField label="Aadhaar Back Image" name="aadhaar_back_image" onChange={handleFileChange} required error={errors.aadhaar_back_image} existingFile={existingFiles.aadhaar_back_image} />
                  </div>

                  <FormField label="PAN Card Number" name="pan_card_number" value={formData.pan_card_number} onChange={handleInputChange} required error={errors.pan_card_number} placeholder="Enter alphanumeric code" />
                  <FileUploadField label="PAN Card Image" name="pan_card_image" onChange={handleFileChange} required error={errors.pan_card_image} existingFile={existingFiles.pan_card_image} />

                  <FormField label="ESI Number" name="esi_number" value={formData.esi_number} onChange={handleInputChange} required error={errors.esi_number} placeholder="Enter ESI Identifier" />
                  <FormField label="EPF Number" name="epf_number" value={formData.epf_number} onChange={handleInputChange} required error={errors.epf_number} placeholder="Enter EPF Identifier" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Driving License & Verification Certificates */}
          {currentStep === 3 && (
            <div className="space-y-8">
              {formData.staff_type === 'driver' && (
                <div>
                  <div className="flex items-center space-x-3 mb-2 border-b border-slate-100 pb-3">
                    <div className="p-2 bg-slate-50 rounded-xl" style={{ color: primaryColor }}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Driving License Details</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <FormField label="License Number" name="driving_license_number" value={formData.driving_license_number} onChange={handleInputChange} required error={errors.driving_license_number} placeholder="Enter DL Number" />
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FileUploadField label="License Front Image" name="driving_license_front_image" onChange={handleFileChange} required error={errors.driving_license_front_image} existingFile={existingFiles.driving_license_front_image} />
                      <FileUploadField label="License Back Image" name="driving_license_back_image" onChange={handleFileChange} required error={errors.driving_license_back_image} existingFile={existingFiles.driving_license_back_image} />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center space-x-3 mb-2 border-b border-slate-100 pb-3">
                  <div className="p-2 bg-slate-50 rounded-xl" style={{ color: primaryColor }}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Police Verification & Health Certificates</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 animate-fadeIn">
                  <FormField label="Police Verification Certificate Number" name="police_verification_number" value={formData.police_verification_number} onChange={handleInputChange} placeholder="Enter verification no." />
                  <FileUploadField label="Police Verification Document" name="police_verification_image" onChange={handleFileChange} existingFile={existingFiles.police_verification_image} />

                  <FormField label="Medical Certificate Number" name="medical_certificate_number" value={formData.medical_certificate_number} onChange={handleInputChange} placeholder="Enter medical certificate no." />
                  <FileUploadField label="Medical Certificate Document" name="medical_certificate_image" onChange={handleFileChange} existingFile={existingFiles.medical_certificate_image} />

                  <FormField label="Eyesight Certificate Number" name="eyesight_certificate_number" value={formData.eyesight_certificate_number} onChange={handleInputChange} placeholder="Enter eyesight certificate no." />
                  <FileUploadField label="Eyesight Certificate Document" name="eyesight_certificate_image" onChange={handleFileChange} existingFile={existingFiles.eyesight_certificate_image} />
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
            {currentStep > 1 ? (
              <button
                key="prev-btn"
                type="button"
                onClick={handlePrevStep}
                className="flex items-center px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-800 text-xs font-bold shadow-sm hover:bg-slate-50 transition-all select-none"
              >
                <ChevronLeft className="w-4 h-4 mr-1.5" /> Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < steps.length ? (
              <button
                key="next-btn"
                type="button"
                onClick={handleNextStep}
                style={{ backgroundColor: primaryColor }}
                className="flex items-center px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md shadow-emerald-100 hover:opacity-90 active:scale-95 transition-all select-none"
              >
                Next <ChevronRight className="w-4 h-4 ml-1.5" />
              </button>
            ) : (
              <button
                key="submit-btn"
                type="submit"
                disabled={submitting}
                style={{ backgroundColor: primaryColor }}
                className="flex items-center px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all select-none"
              >
                <Send className="w-4 h-4 mr-1.5" /> {submitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Confirm & Enroll')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
