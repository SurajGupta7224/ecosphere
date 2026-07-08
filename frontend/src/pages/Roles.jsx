import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, ShieldCheck, Send, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const InputField = ({ label, name, type="text", value, onChange, required=false, placeholder="" }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-600 mb-1">
      {label} {required && <span className="text-blue-500">*</span>}
    </label>
    <input 
      type={type} 
      name={name} 
      value={value} 
      onChange={onChange} 
      required={required}
      placeholder={placeholder}
      className="w-full bg-transparent border-b border-slate-200 focus:border-[#7c3aed] outline-none py-2 text-sm text-slate-800 transition-colors placeholder-slate-400" 
    />
  </div>
);

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    role_name: '',
    permission_ids: []
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, role_name: '' });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data.roles || []);
    } catch (err) {
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions');
      setPermissions(response.data.permissions || []);
    } catch (err) {
      console.error('Failed to fetch permissions');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePermission = (permId) => {
    const isSelected = formData.permission_ids.includes(permId);
    let updated;
    if (isSelected) {
      updated = formData.permission_ids.filter(id => id !== permId);
    } else {
      updated = [...formData.permission_ids, permId];
    }
    setFormData({ ...formData, permission_ids: updated });
  };

  const openAddForm = () => {
    setIsEditMode(false);
    setFormData({ role_name: '', permission_ids: [] });
    setIsFormOpen(true);
  };

  const openEditForm = (role) => {
    setIsEditMode(true);
    setEditingId(role.id);
    const linkedPermIds = role.permissions ? role.permissions.map(p => p.id) : [];
    setFormData({
      role_name: role.role_name,
      permission_ids: linkedPermIds
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditMode) {
        await api.put(`/roles/${editingId}`, formData);
        toast.success("Role updated successfully");
      } else {
        await api.post('/roles', formData);
        toast.success("Role created successfully");
      }
      closeForm();
      fetchRoles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id, role_name) => {
    setDeleteModal({ isOpen: true, id, role_name });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/roles/${deleteModal.id}`);
      toast.success("Role deleted successfully!");
      setDeleteModal({ isOpen: false, id: null, role_name: '' });
      fetchRoles();
    } catch(err) {
      toast.error("Failed to delete role");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };


  if (isFormOpen) {
    return (
      <div className="w-full">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Role' : 'Create New Role'}</h2>
          <button onClick={closeForm} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              <div className="max-w-md">
                <InputField 
                  label="Role Name" 
                  name="role_name" 
                  value={formData.role_name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g. System Admin" 
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                  <label className="block text-sm font-bold text-slate-800">Assign Permissions</label>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium border border-slate-200">
                    {formData.permission_ids.length} selected
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-64 overflow-y-auto custom-scrollbar">
                  {permissions.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">No permissions defined in the system yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {permissions.map(perm => (
                        <label 
                          key={perm.id} 
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                            formData.permission_ids.includes(perm.id) 
                              ? 'bg-purple-50 border-purple-300 text-purple-800' 
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-[#7c3aed] focus:ring-purple-500/50 mr-3 accent-[#7c3aed]"
                            checked={formData.permission_ids.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                          />
                          <span className="text-sm font-medium">{perm.permission_name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-10 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={closeForm}
                className="flex items-center px-6 py-2 rounded font-medium bg-slate-400 hover:bg-slate-500 text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center px-6 py-2 rounded font-medium bg-[#7c3aed] hover:bg-purple-700 text-white transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" /> {submitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Role')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Role Management</h1>
          <p className="text-slate-500 mt-1 text-sm">Create specific roles and attach fine-grained system permissions.</p>
        </div>
        <button 
          onClick={openAddForm}
          className="flex items-center px-4 py-2 bg-[#7c3aed] hover:bg-purple-700 text-white rounded font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Role
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading roles...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4">ID</th>
                  <th className="p-4">Role Identity</th>
                  <th className="p-4">Attached Permissions</th>
                  <th className="p-4">Created On</th>
                  <th className="p-4 text-right flex-shrink-0 min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roles.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-slate-500 text-xs font-mono w-16">#{r.id}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded bg-purple-50 border border-purple-100 flex items-center justify-center mr-3 text-purple-600">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="text-slate-800 font-medium capitalize tracking-wide">{r.role_name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5 max-w-sm">
                        {r.permissions && r.permissions.length > 0 ? (
                          r.permissions.map(p => (
                            <span key={p.id} className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                              {p.permission_name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No permissions assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 text-sm whitespace-nowrap">{formatDate(r.created_at)}</td>
                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                      <button 
                        onClick={() => openEditForm(r)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors inline-block"
                        title="Edit Role"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(r.id, r.role_name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors inline-block"
                        title="Delete Role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {roles.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-500">
                      No roles defined in the system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 text-center mb-2">Delete Role</h2>
              <p className="text-slate-500 text-center text-sm mb-6">
                Are you sure you want to delete <span className="text-slate-800 font-medium capitalize">{deleteModal.role_name}</span>? This action breaks user assignments permanently.
              </p>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, id: null, role_name: '' })}
                  disabled={deleting}
                  className="flex-1 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded border border-slate-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-all disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
