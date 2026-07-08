import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Key, Send, RotateCcw } from 'lucide-react';
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
      className="w-full bg-transparent border-b border-slate-200 focus:border-[#7c3aed] outline-none py-2 text-sm text-slate-800 transition-colors placeholder-slate-400 font-mono" 
    />
  </div>
);

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    permission_name: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, permission_name: '' });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions');
      setPermissions(response.data.permissions || []);
    } catch (err) {
      toast.error('Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddForm = () => {
    setIsEditMode(false);
    setFormData({ permission_name: '' });
    setIsFormOpen(true);
  };

  const openEditForm = (perm) => {
    setIsEditMode(true);
    setEditingId(perm.id);
    setFormData({ permission_name: perm.permission_name });
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
        await api.put(`/permissions/${editingId}`, formData);
        toast.success("Permission updated successfully");
      } else {
        await api.post('/permissions', formData);
        toast.success("Permission created successfully");
      }
      closeForm();
      fetchPermissions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save permission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id, permission_name) => {
    setDeleteModal({ isOpen: true, id, permission_name });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/permissions/${deleteModal.id}`);
      toast.success("Permission deleted successfully!");
      setDeleteModal({ isOpen: false, id: null, permission_name: '' });
      fetchPermissions();
    } catch(err) {
      toast.error("Failed to delete permission");
    } finally {
      setDeleting(false);
    }
  };


  if (isFormOpen) {
    return (
      <div className="w-full">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Permission' : 'Create Permission Endpoint'}</h2>
          <button onClick={closeForm} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              <div>
                <InputField 
                  label="Permission Identifier String" 
                  name="permission_name" 
                  value={formData.permission_name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g. USER_CREATE, DASHBOARD_VIEW" 
                />
                <p className="text-xs text-slate-500 mt-2">Use ALL_CAPS_WITH_UNDERSCORES convention generally.</p>
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
                <Send className="w-4 h-4 mr-2" /> {submitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Permission')}
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
          <h1 className="text-2xl font-bold text-slate-800">Permission Registry</h1>
          <p className="text-slate-500 mt-1 text-sm">Define bare-metal permissions securely applied to generic roles.</p>
        </div>
        <button 
          onClick={openAddForm}
          className="flex items-center px-4 py-2 bg-[#7c3aed] hover:bg-purple-700 text-white rounded font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Permission
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading permissions...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4">ID</th>
                  <th className="p-4 w-full">Permission Identifier</th>
                  <th className="p-4 text-right flex-shrink-0 min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissions.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-slate-500 text-xs font-mono w-16">#{p.id}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <Key className="w-4 h-4 text-purple-400 mr-3 hidden sm:block" />
                        <span className="text-[#7c3aed] font-mono tracking-wide bg-purple-50 border border-purple-100 px-3 py-1 rounded text-sm">{p.permission_name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                      <button 
                        onClick={() => openEditForm(p)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors inline-block"
                        title="Edit Permission"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(p.id, p.permission_name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors inline-block"
                        title="Delete Permission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {permissions.length === 0 && (
                  <tr>
                    <td colSpan="3" className="p-12 text-center text-slate-500">
                      No permissions currently defined.
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
              <h2 className="text-lg font-bold text-slate-800 text-center mb-2">Delete Permission</h2>
              <p className="text-slate-500 text-center text-sm mb-6">
                Are you sure you want to delete <span className="text-slate-800 font-medium font-mono">{deleteModal.permission_name}</span>? Roles connected will automatically lose this flag.
              </p>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, id: null, permission_name: '' })}
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

export default Permissions;
