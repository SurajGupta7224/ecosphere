import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Eye, UserCheck, ShieldCheck, 
  Search, SlidersHorizontal, Check, X, FileText, 
  ExternalLink, Calendar, Phone, Mail, Award, ChevronLeft, MoreVertical
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

const DetailRow = ({ label, value }) => (
  <div className="flex flex-col border-b border-slate-50 py-2">
    <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400">{label}</span>
    <span className="text-xs font-bold text-slate-700 mt-0.5">{value || 'N/A'}</span>
  </div>
);

const DocumentCard = ({ label, path, fieldname }) => {
  const fileUrl = getFileUrl(path, fieldname);
  if (!path) {
    return (
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
        <div className="h-32 bg-slate-100/50 rounded-xl flex items-center justify-center text-slate-300">
          <span className="text-xs font-semibold">Not Uploaded</span>
        </div>
      </div>
    );
  }

  const isPdf = path.toLowerCase().endsWith('.pdf');

  return (
    <div className="bg-white border border-slate-150 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
        <div className="relative group bg-slate-50 rounded-xl overflow-hidden border border-slate-100 h-36 flex items-center justify-center">
          {isPdf ? (
            <div className="text-center p-3">
              <FileText className="w-10 h-10 text-red-400 mx-auto mb-1.5" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block truncate max-w-[130px]">{path}</span>
            </div>
          ) : (
            <img
              src={fileUrl}
              alt={label}
              className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-105"
            />
          )}
          
          {/* Hover Action Overlay */}
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-white text-slate-800 text-[10px] font-bold rounded-lg shadow-md hover:bg-slate-50 transition-all flex items-center"
            >
              Open Full <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeesList = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const primaryColor = settings?.theme?.primary_color || '#31975C';

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [filterStaffType, setFilterStaffType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterApproval, setFilterApproval] = useState('all');

  // Detail view state (In-page details view)
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Dropdown list management
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/aggregator-employees');
      setEmployees(res.data.employees || []);
    } catch (err) {
      toast.error('Failed to load aggregator employee records');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (emp) => {
    const newStatus = emp.employee_status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/aggregator-employees/${emp.id}/status`, { status: newStatus });
      toast.success(`Aggregator Employee marked as ${newStatus}`);
      fetchEmployees();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleViewDetails = (emp) => {
    setSelectedEmployee(emp);
    setIsDetailOpen(true);
  };

  // Filtering
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.mobile_number?.includes(searchTerm) ||
                          emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStaffType = filterStaffType === 'all' || emp.staff_type === filterStaffType;
    const matchesStatus = filterStatus === 'all' || emp.employee_status === filterStatus;
    const matchesApproval = filterApproval === 'all' || emp.profile_approval_status === filterApproval;

    return matchesSearch && matchesStaffType && matchesStatus && matchesApproval;
  });

  // Render Full-page details if details mode is active (Zero Unwanted Space, Grid documents cards view)
  if (isDetailOpen && selectedEmployee) {
    return (
      <div className="w-full">
        {/* Header with back button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center space-x-4">
            {selectedEmployee.profile_photo ? (
              <img
                src={getFileUrl(selectedEmployee.profile_photo, 'profile_photo')}
                alt="profile"
                className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm"
              />
            ) : (
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner"
                style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
              >
                {selectedEmployee.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">{selectedEmployee.name}</h1>
              <div className="flex items-center space-x-2 mt-1.5">
                <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold rounded bg-slate-100 text-slate-600">ID: EMP-{selectedEmployee.id}</span>
                <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold rounded ${
                  selectedEmployee.staff_type === 'driver' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                }`}>{selectedEmployee.staff_type}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setIsDetailOpen(false);
              setSelectedEmployee(null);
            }}
            className="flex items-center px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl bg-white text-xs font-bold shadow-sm transition-all"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Back to List
          </button>
        </div>

        {/* Dynamic Detail Body Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Card 1: Personal Details */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center">
              <span className="w-1 h-3 rounded-full mr-2" style={{ backgroundColor: primaryColor }}></span>
              Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              <DetailRow label="Father / Husband Name" value={selectedEmployee.father_husband_name} />
              <DetailRow label="Gender" value={selectedEmployee.gender} />
              <DetailRow label="Date of Birth" value={selectedEmployee.dob ? new Date(selectedEmployee.dob).toLocaleDateString() : ''} />
              <DetailRow label="Blood Group" value={selectedEmployee.blood_group} />
              <DetailRow label="Marital Status" value={selectedEmployee.marital_status} />
              <DetailRow label="Mobile Number" value={selectedEmployee.mobile_number} />
              <div className="sm:col-span-2">
                <DetailRow label="Email Address" value={selectedEmployee.email} />
              </div>
              <div className="sm:col-span-2">
                <DetailRow label="Residential Address" value={selectedEmployee.address} />
              </div>
            </div>
          </div>

          {/* Card 2: KYC & System Logs */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center">
              <span className="w-1 h-3 rounded-full mr-2" style={{ backgroundColor: primaryColor }}></span>
              KYC, Verification & Logs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              <DetailRow label="Aadhaar Card Number" value={selectedEmployee.aadhaar_number} />
              <DetailRow label="PAN Card Number" value={selectedEmployee.pan_card_number} />
              <DetailRow label="ESI Number" value={selectedEmployee.esi_number} />
              <DetailRow label="EPF Number" value={selectedEmployee.epf_number} />
              {selectedEmployee.staff_type === 'driver' && (
                <DetailRow label="Driving License Number" value={selectedEmployee.driving_license_number} />
              )}
              <DetailRow label="Police Verification Certificate" value={selectedEmployee.police_verification_number} />
              <DetailRow label="Medical Certificate" value={selectedEmployee.medical_certificate_number} />
              <DetailRow label="Eyesight Certificate" value={selectedEmployee.eyesight_certificate_number} />
              <DetailRow label="Approval Status" value={selectedEmployee.profile_approval_status} />
              <DetailRow label="Approved By" value={selectedEmployee.approver?.name} />
              <div className="sm:col-span-2">
                <DetailRow label="Approved Date" value={selectedEmployee.approved_date ? new Date(selectedEmployee.approved_date).toLocaleString() : ''} />
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Section - Full width list preview cards similar to Waste Requests layout */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm mt-6">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center">
            <span className="w-1 h-3 rounded-full mr-2" style={{ backgroundColor: primaryColor }}></span>
            Verification Scans & Documents
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <DocumentCard label="Aadhaar Front Scan" path={selectedEmployee.aadhaar_front_image} fieldname="aadhaar_front_image" />
            <DocumentCard label="Aadhaar Back Scan" path={selectedEmployee.aadhaar_back_image} fieldname="aadhaar_back_image" />
            <DocumentCard label="PAN Card Scan" path={selectedEmployee.pan_card_image} fieldname="pan_card_image" />
            {selectedEmployee.staff_type === 'driver' && (
              <>
                <DocumentCard label="License Front Scan" path={selectedEmployee.driving_license_front_image} fieldname="driving_license_front_image" />
                <DocumentCard label="License Back Scan" path={selectedEmployee.driving_license_back_image} fieldname="driving_license_back_image" />
              </>
            )}
            <DocumentCard label="Police Verification Scan" path={selectedEmployee.police_verification_image} fieldname="police_verification_image" />
            <DocumentCard label="Medical Certificate Scan" path={selectedEmployee.medical_certificate_image} fieldname="medical_certificate_image" />
            <DocumentCard label="Eyesight Certificate Scan" path={selectedEmployee.eyesight_certificate_image} fieldname="eyesight_certificate_image" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1.5">
            Aggregator Employees Directory
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Search, filter, and manage details of aggregator drivers and helpers.
          </p>
        </div>

        <Link
          to="/aggregator-employees/add"
          style={{ backgroundColor: primaryColor, boxShadow: `0 4px 12px ${primaryColor}20` }}
          className="inline-flex items-center justify-center px-4 py-2.5 text-white rounded-xl text-xs font-bold transition-all hover:opacity-90 active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Aggregator Employee
        </Link>
      </div>

      {/* Control bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Filters</span>
          </div>

          <select
            value={filterStaffType}
            onChange={(e) => setFilterStaffType(e.target.value)}
            className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-600 focus:outline-none focus:border-purple-600 transition-all"
          >
            <option value="all">All Roles</option>
            <option value="driver">Drivers</option>
            <option value="helper">Helpers</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-600 focus:outline-none focus:border-purple-600 transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={filterApproval}
            onChange={(e) => setFilterApproval(e.target.value)}
            className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-600 focus:outline-none focus:border-purple-600 transition-all"
          >
            <option value="all">All Approvals</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mb-4" style={{ borderColor: primaryColor }}></div>
            Loading employees database...
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <th className="p-4 pl-6">Aggregator Employee</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Staff Role</th>
                  <th className="p-4">Approval</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center space-x-3">
                        {emp.profile_photo ? (
                          <img
                            src={getFileUrl(emp.profile_photo, 'profile_photo')}
                            alt={emp.name}
                            className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-100"
                          />
                        ) : (
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                            style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                          >
                            {emp.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-800 text-sm block leading-none">{emp.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium block mt-1">ID: EMP-{emp.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col text-xs font-semibold text-slate-600 space-y-1">
                        <span className="flex items-center"><Phone className="w-3 h-3 text-slate-400 mr-1.5" /> {emp.mobile_number}</span>
                        {emp.email && <span className="flex items-center"><Mail className="w-3 h-3 text-slate-400 mr-1.5" /> {emp.email}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${
                        emp.staff_type === 'driver' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {emp.staff_type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${
                        emp.profile_approval_status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                        emp.profile_approval_status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {emp.profile_approval_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(emp)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm transition-all active:scale-95 ${
                          emp.employee_status === 'active' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${emp.employee_status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {emp.employee_status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 pr-6 text-right relative">
                      <div className="inline-block text-left">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === emp.id ? null : emp.id)}
                          className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl transition-all inline-flex items-center justify-center border border-slate-100 focus:outline-none"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {openDropdownId === emp.id && (
                          <>
                            {/* Backdrop click-away listener */}
                            <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)}></div>
                            <div className="absolute right-0 mt-2 w-32 rounded-xl bg-white border border-slate-150 shadow-lg z-20 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                              <button
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  handleViewDetails(emp);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center"
                              >
                                <Eye className="w-3.5 h-3.5 mr-2 text-slate-400" /> View Details
                              </button>
                              <button
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  navigate(`/aggregator-employees/${emp.id}/edit`);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center"
                              >
                                <Edit2 className="w-3.5 h-3.5 mr-2 text-slate-400" /> Edit Record
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-400 font-medium">
                      No aggregator employee records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default EmployeesList;
