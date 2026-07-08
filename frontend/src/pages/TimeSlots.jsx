import { useState, useEffect } from 'react';
import { 
  Clock, Plus, Edit2, Trash2, ShieldCheck, 
  Search, SlidersHorizontal, ToggleLeft, ToggleRight,
  Info, RefreshCw, Calendar, CheckCircle, XCircle
} from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const TimeSlots = () => {
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState({
    totalSlots: 0,
    activeSlots: 0,
    inactiveSlots: 0
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form State
  const [form, setForm] = useState({
    slot_name: '',
    start_time: '',
    end_time: '',
    max_bookings: 20,
    status: 'Active',
    description: ''
  });

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('start_time'); // start_time, end_time
  const [sortOrder, setSortOrder] = useState('ASC'); // ASC, DESC

  useEffect(() => {
    fetchTimeSlots();
  }, [search, statusFilter, sortBy, sortOrder]);

  const fetchTimeSlots = async () => {
    setLoading(true);
    try {
      const res = await api.get('/time-slots', {
        params: {
          search,
          status: statusFilter
        }
      });

      if (res.data.success) {
        let fetchedSlots = res.data.slots || [];
        
        // Sort in frontend to support all criteria dynamically
        fetchedSlots.sort((a, b) => {
          let fieldA = a[sortBy] || '';
          let fieldB = b[sortBy] || '';
          if (sortOrder === 'ASC') {
            return fieldA.localeCompare(fieldB);
          } else {
            return fieldB.localeCompare(fieldA);
          }
        });

        setSlots(fetchedSlots);
        setStats(res.data.stats || {
          totalSlots: 0,
          activeSlots: 0,
          inactiveSlots: 0
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load time slots.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      slot_name: '',
      start_time: '',
      end_time: '',
      max_bookings: 20,
      status: 'Active',
      description: ''
    });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.slot_name || !form.start_time || !form.end_time) {
      toast.error("All required fields must be completed.");
      return;
    }

    if (form.start_time >= form.end_time) {
      toast.error("End Time must always be greater than Start Time.");
      return;
    }

    setSubmitting(true);
    try {
      if (editId) {
        // Edit Mode
        const res = await api.put(`/time-slots/${editId}`, form);
        if (res.data.success) {
          toast.success("Time slot updated successfully.");
          resetForm();
          fetchTimeSlots();
        }
      } else {
        // Create Mode
        const res = await api.post('/time-slots', form);
        if (res.data.success) {
          toast.success("Time slot created successfully.");
          resetForm();
          fetchTimeSlots();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save time slot.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (slot) => {
    setEditId(slot.id);
    
    // Strip seconds from MySQL TIME formatted string for input type="time"
    const start = slot.start_time.substring(0, 5);
    const end = slot.end_time.substring(0, 5);

    setForm({
      slot_name: slot.slot_name,
      start_time: start,
      end_time: end,
      max_bookings: slot.max_bookings,
      status: slot.status,
      description: slot.description || ''
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/time-slots/${id}/status`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchTimeSlots();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle time slot status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this time slot?")) return;

    try {
      const res = await api.delete(`/time-slots/${id}`);
      if (res.data.success) {
        toast.success("Time slot deleted successfully.");
        fetchTimeSlots();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete time slot.");
    }
  };

  // Helper to calculate duration inside the form
  const getCalculatedDuration = () => {
    if (!form.start_time || !form.end_time) return '';
    const [sh, sm] = form.start_time.split(':').map(Number);
    const [eh, em] = form.end_time.split(':').map(Number);
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff < 0) return '';
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    let res = [];
    if (h > 0) res.push(`${h} hr${h > 1 ? 's' : ''}`);
    if (m > 0) res.push(`${m} min${m > 1 ? 's' : ''}`);
    return res.join(' ') || '0 mins';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Time Slot Management</h1>
        <p className="text-sm font-semibold text-slate-500 mt-1">Create and manage waste collection time slots.</p>
      </div>

      {/* Dashboard Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Time Slots */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Total Slots</span>
            <span className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5 block">{stats.totalSlots}</span>
          </div>
        </div>

        {/* Active Slots */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Active Slots</span>
            <span className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5 block">{stats.activeSlots}</span>
          </div>
        </div>

        {/* Inactive Slots */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Inactive Slots</span>
            <span className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5 block">{stats.inactiveSlots}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form on left, List on right */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Form Card */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Plus className="w-5 h-5 text-violet-500" /> {editId ? 'Edit Time Slot' : 'Create Time Slot'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Slot Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Slot Name *</label>
                <input
                  type="text"
                  name="slot_name"
                  required
                  value={form.slot_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Morning Collection"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-semibold text-slate-700"
                />
              </div>

              {/* Times Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Start Time */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time *</label>
                  <input
                    type="time"
                    name="start_time"
                    required
                    value={form.start_time}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-semibold text-slate-700"
                  />
                </div>

                {/* End Time */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">End Time *</label>
                  <input
                    type="time"
                    name="end_time"
                    required
                    value={form.end_time}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-semibold text-slate-700"
                  />
                </div>
              </div>

              {/* Dynamic Duration Alert */}
              {form.start_time && form.end_time && (
                <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 flex items-center gap-2.5 text-xs text-violet-700 font-semibold">
                  <Info className="w-4 h-4 shrink-0 text-violet-600" />
                  <span>Calculated Slot Duration: <span className="font-bold">{getCalculatedDuration() || 'Invalid Range'}</span></span>
                </div>
              )}

              {/* Status Selector */}

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                <div className="flex gap-2">
                  {['Active', 'Inactive'].map((statusOption) => (
                    <button
                      key={statusOption}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, status: statusOption }))}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                        form.status === statusOption
                          ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50/50'
                      }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Description / Notes</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Optional description of this time slot..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-semibold text-slate-700 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all active:scale-95 shadow-sm disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : editId ? 'Update Slot' : 'Save Slot'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-5 rounded-xl text-sm transition-all active:scale-95"
                >
                  Reset
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Right Column: Table & Filters */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Filtering Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search slots..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-semibold text-slate-700"
                />
              </div>

              {/* Right Filter Actions */}
              <div className="flex flex-wrap gap-3 items-center w-full md:w-auto justify-end">

                {/* Status Dropdown */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-600 cursor-pointer outline-none focus:border-violet-400"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                {/* Sort Field */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-600 cursor-pointer outline-none focus:border-violet-400"
                >
                  <option value="start_time">Sort by Start Time</option>
                  <option value="end_time">Sort by End Time</option>
                </select>

                {/* Sort Order Button */}
                <button
                  type="button"
                  onClick={() => setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC')}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-500 hover:text-slate-800 transition-colors shrink-0"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

          {/* Time Slots Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="text-center py-20 text-slate-400 text-sm">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-violet-500" />
                Loading time slots list...
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-20 text-slate-400 text-sm">
                <Clock className="w-10 h-10 opacity-30 mx-auto mb-4 text-slate-400" />
                No time slots found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-12">#</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Slot Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Timing</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {slots.map((slot, index) => {
                      const isFullyBooked = slot.remaining_capacity <= 0;
                      return (
                        <tr key={slot.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-400 font-semibold">{index + 1}</td>
                          <td className="px-6 py-4">
                            <span className="font-extrabold text-slate-800 text-sm block">{slot.slot_name}</span>
                            {slot.description && (
                              <span className="text-xs text-slate-400 truncate max-w-xs block mt-0.5 font-medium">{slot.description}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-slate-700">
                              {slot.start_time_formatted} - {slot.end_time_formatted}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200/50 text-slate-600 text-xs font-bold">
                              {slot.duration_string}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(slot.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                                slot.status === 'Active'
                                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100/50'
                                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200/50'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${slot.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                              {slot.status}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => handleEdit(slot)}
                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(slot.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default TimeSlots;
