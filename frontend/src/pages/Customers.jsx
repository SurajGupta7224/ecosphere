import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Users, User, Phone, Mail, Award, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const InputField = ({ label, name, type="text", value, onChange, required=false, placeholder="" }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-600 mb-1">
      {label} {required && <span className="text-violet-600">*</span>}
    </label>
    <input 
      type={type} 
      name={name} 
      value={value} 
      onChange={onChange} 
      required={required}
      placeholder={placeholder}
      className="w-full bg-transparent border-b border-slate-200 focus:border-violet-600 outline-none py-2 text-sm text-slate-800 transition-colors placeholder:text-slate-400" 
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, required=false, disabled=false, placeholder="Choose" }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-600 mb-1">
      {label} {required && <span className="text-violet-600">*</span>}
    </label>
    <select 
      name={name} 
      value={value} 
      onChange={onChange} 
      required={required}
      disabled={disabled}
      className="w-full bg-transparent border-b border-slate-200 focus:border-violet-600 outline-none py-2 text-sm text-slate-800 transition-colors disabled:opacity-50 appearance-none"
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals / Drawer State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Form State
  const initialFormState = {
    customer_name: '',
    mobile: '',
    email: '',
    status: 'active',
    profie_pic: '',
    referral_code: '',
    referral_id: '',
    notification_status: true,
    login_type: 'email',
    customer_type: 'admin',
    created_by: 'admin'
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers');
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error("fetchCustomers error:", err);
      toast.error("Failed to load customers list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openAddModal = () => {
    setFormData(initialFormState);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const openEditModal = (c) => {
    setFormData({
      customer_name: c.customer_name || '',
      mobile: c.mobile || '',
      email: c.email || '',
      status: c.status || 'active',
      profie_pic: c.profie_pic || '',
      referral_code: c.referral_code || '',
      referral_id: c.referral_id || '',
      notification_status: c.notification_status !== undefined ? c.notification_status : true,
      login_type: c.login_type || 'email',
      customer_type: c.customer_type || 'admin',
      created_by: c.created_by || 'admin'
    });
    setSelectedCustomerId(c.id);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/customers/${selectedCustomerId}`, formData);
        toast.success("Customer account updated successfully");
      } else {
        await api.post('/customers', formData);
        toast.success("Customer account created successfully");
      }
      setIsFormOpen(false);
      fetchCustomers();
    } catch (err) {
      console.error("Form submit error:", err);
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer account permanently?")) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success("Customer account deleted successfully");
      fetchCustomers();
      if (isDrawerOpen && selectedCustomer?.id === id) {
        setIsDrawerOpen(false);
      }
    } catch (err) {
      console.error("Delete customer error:", err);
      toast.error("Failed to delete customer");
    }
  };

  const openDetailsDrawer = (c) => {
    setSelectedCustomer(c);
    setIsDrawerOpen(true);
  };

  const filteredCustomers = customers.filter(c => 
    c.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.mobile?.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Customer Accounts</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Manage storefront customer accounts, referral codes, login logs and configuration types</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-100 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-violet-500 transition-colors bg-slate-50/50"
          />
          <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        </div>
        <div className="text-xs text-slate-400 font-bold">
          Showing {filteredCustomers.length} of {customers.length} customer records
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-xs font-medium">Loading customers list...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs italic font-medium">
            No customer accounts found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="py-3.5 px-6 w-16">ID</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Login Type</th>
                  <th className="py-3.5 px-4">Created By</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date Created</th>
                  <th className="py-3.5 px-6 text-right w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-400">#{c.id}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 font-extrabold shadow-inner shrink-0">
                          {c.profie_pic ? (
                            <img src={c.profie_pic} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            (c.customer_name || '?').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <span
                            onClick={() => openDetailsDrawer(c)}
                            className="font-bold text-slate-800 hover:text-violet-600 cursor-pointer block truncate"
                          >
                            {c.customer_name || '—'}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">{c.email || 'No Email'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold capitalize text-slate-700">{c.login_type}</span>
                        <span className="text-[10px] text-slate-500">{c.mobile || 'No Mobile'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {c.created_by === 'admin' ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-100 uppercase tracking-wider">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 uppercase tracking-wider">
                          Customer
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {c.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : c.status === 'inactive' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-400">
                          <AlertTriangle className="w-3 h-3" /> Inactive
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-500">
                          <ShieldAlert className="w-3 h-3" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-medium">
                      {new Date(c.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-violet-600 transition-colors"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-red-500 transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE & EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-250">
            {/* Modal Header */}
            <div className="px-6 py-4.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">
                {isEditMode ? 'Modify Customer Profile' : 'Register New Customer'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 max-h-[75vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <InputField
                  label="Customer Name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. John Doe"
                />
                <InputField
                  label="Mobile Number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="e.g. +91 9876543210"
                />
                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. john@example.com"
                />
                <InputField
                  label="Profile Picture URL"
                  name="profie_pic"
                  value={formData.profie_pic}
                  onChange={handleInputChange}
                  placeholder="https://image-url.com"
                />
                <InputField
                  label="Referral Code"
                  name="referral_code"
                  value={formData.referral_code}
                  onChange={handleInputChange}
                  placeholder="e.g. REF500"
                />
                <InputField
                  label="Referral ID"
                  name="referral_id"
                  type="number"
                  value={formData.referral_id}
                  onChange={handleInputChange}
                  placeholder="e.g. 12"
                />
                <SelectField
                  label="Login Method"
                  name="login_type"
                  value={formData.login_type}
                  onChange={handleInputChange}
                  options={[
                    { value: 'email', label: 'Email based Login' },
                    { value: 'mobile', label: 'Mobile based Login' }
                  ]}
                />
                <SelectField
                  label="Account Status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'suspended', label: 'Suspended' }
                  ]}
                />
                <SelectField
                  label="Customer Type"
                  name="customer_type"
                  value={formData.customer_type}
                  onChange={handleInputChange}
                  options={[
                    { value: 'admin', label: 'Admin Created' },
                    { value: 'website', label: 'Website Created' }
                  ]}
                />
                <SelectField
                  label="Created By Role"
                  name="created_by"
                  value={formData.created_by}
                  onChange={handleInputChange}
                  options={[
                    { value: 'admin', label: 'Admin' },
                    { value: 'customer', label: 'Customer (Self-Created)' }
                  ]}
                />
                <div className="mb-4 flex items-center pt-5">
                  <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="notification_status"
                      checked={formData.notification_status}
                      onChange={handleInputChange}
                      className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-slate-600">Enable Push Notifications</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg shadow-md shadow-violet-100 transition-colors cursor-pointer"
                >
                  {isEditMode ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS DRAWER */}
      {isDrawerOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div onClick={() => setIsDrawerOpen(false)} className="absolute inset-0 bg-slate-900/35 backdrop-blur-xs transition-opacity" />

          {/* Drawer container */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-100 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-violet-600" />
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">Customer Details</h3>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Card Summary */}
              <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
                <div className="w-20 h-20 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 text-3xl font-extrabold border-2 border-violet-100 shadow-inner mb-3">
                  {selectedCustomer.profie_pic ? (
                    <img src={selectedCustomer.profie_pic} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (selectedCustomer.customer_name || '?').charAt(0).toUpperCase()
                  )}
                </div>
                <h4 className="text-base font-bold text-slate-800">{selectedCustomer.customer_name || '—'}</h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{selectedCustomer.email || 'No Email Address'}</p>
                <div className="mt-3 flex items-center gap-2">
                  {selectedCustomer.created_by === 'admin' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-100 uppercase tracking-wider">
                      Created by Admin
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 uppercase tracking-wider">
                      Created by Customer
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    selectedCustomer.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    selectedCustomer.status === 'inactive' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                    'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {selectedCustomer.status}
                  </span>
                </div>
              </div>

              {/* Customer Contact & Meta Data */}
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">Profile Info</h5>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Mobile Number</span>
                    <span className="font-semibold text-slate-700">{selectedCustomer.mobile || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Login Protocol</span>
                    <span className="font-semibold text-slate-700 capitalize">{selectedCustomer.login_type}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Referral Code</span>
                    <span className="font-mono font-bold text-violet-600">{selectedCustomer.referral_code || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Referral User ID</span>
                    <span className="font-semibold text-slate-700">{selectedCustomer.referral_id || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Push Notification</span>
                    <span className="font-semibold text-slate-700">{selectedCustomer.notification_status ? 'Subscribed' : 'Muted'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Customer Type</span>
                    <span className="font-semibold text-slate-700 capitalize">{selectedCustomer.customer_type || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Database Identifier</span>
                    <span className="font-mono font-bold text-slate-400">ID #{selectedCustomer.id}</span>
                  </div>
                </div>
              </div>

              {/* Logging and Audit Info */}
              <div className="space-y-4 pt-2">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">Origin Logs</h5>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4.5 space-y-3">
                  <div className="flex items-start justify-between text-xs">
                    <span className="text-slate-500 font-medium">Account Created:</span>
                    <span className="text-slate-800 font-bold">
                      {new Date(selectedCustomer.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-start justify-between text-xs">
                    <span className="text-slate-500 font-medium">Last Profile Update:</span>
                    <span className="text-slate-800 font-bold">
                      {new Date(selectedCustomer.updated_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-start justify-between text-xs">
                    <span className="text-slate-500 font-medium">Account Creator Role:</span>
                    <span className="text-slate-800 font-bold capitalize">
                      {selectedCustomer.created_by === 'admin' ? 'Admin Panel Interface' : 'Customer Account Interface'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => openEditModal(selectedCustomer)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Edit Details
              </button>
              <button
                onClick={() => handleDelete(selectedCustomer.id)}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
