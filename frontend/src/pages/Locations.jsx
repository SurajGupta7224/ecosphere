import { useState, useEffect, useRef } from 'react';
import { Search, RotateCcw, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Advanced Filters State
  const [filters, setFilters] = useState({
    pincode: '',
    area: '',
    city: '',
    region: '',
    district: '',
    state: ''
  });

  // For debouncing searches
  const debounceTimer = useRef(null);

  useEffect(() => {
    // Clear any active timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set a debounce delay before fetching data
    debounceTimer.current = setTimeout(() => {
      fetchLocations();
    }, 350);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [filters, page]);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/locations/pincodes', {
        params: {
          page,
          limit,
          pincode: filters.pincode,
          area: filters.area,
          city: filters.city,
          region: filters.region,
          district: filters.district,
          state: filters.state
        }
      });
      setLocations(res.data.pincodes || []);
      setTotalPages(res.data.pages || 1);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      console.error("Failed to load locations:", err);
      toast.error(err.response?.data?.message || "Failed to load locations");
      setLocations([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset page to 1 on filter change
  };

  const handleResetFilters = () => {
    setFilters({
      pincode: '',
      area: '',
      city: '',
      region: '',
      district: '',
      state: ''
    });
    setPage(1);
    toast.success("Filters reset successfully");
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Location Management</h1>
          <p className="text-slate-500 mt-1 text-sm">View and manage system pincodes, states, cities, and regions.</p>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">2. ADVANCED FILTERS</h3>
          <button 
            onClick={handleResetFilters}
            className="flex items-center text-xs font-bold text-[#7c3aed] hover:text-purple-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Pincode */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pincode</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="pincode"
                value={filters.pincode}
                onChange={handleFilterChange}
                placeholder="Search..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all text-sm placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Area */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Area</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="area"
                value={filters.area}
                onChange={handleFilterChange}
                placeholder="Search..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all text-sm placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">City</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="Search..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all text-sm placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Region</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="region"
                value={filters.region}
                onChange={handleFilterChange}
                placeholder="Search..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all text-sm placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* District */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">District</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="district"
                value={filters.district}
                onChange={handleFilterChange}
                placeholder="Search..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all text-sm placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* State */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">State</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="state"
                value={filters.state}
                onChange={handleFilterChange}
                placeholder="Search..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all text-sm placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Locations Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                <th className="p-4 pl-6">Pincode</th>
                <th className="p-4">Area</th>
                <th className="p-4">City</th>
                <th className="p-4">Region</th>
                <th className="p-4">District</th>
                <th className="p-4">State</th>
                <th className="p-4 pr-6">Country</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-20 text-center">
                    <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm font-medium text-slate-400">Loading locations...</p>
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-20 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <MapPin className="w-6 h-6 opacity-40" />
                    </div>
                    <p className="text-slate-600 font-bold">No Locations Found</p>
                    <p className="text-sm text-slate-400 mt-1">Try adjusting your advanced filter fields.</p>
                  </td>
                </tr>
              ) : (
                locations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6 text-sm font-black text-slate-800 font-mono">{item.pincode}</td>
                    <td className="p-4 text-sm text-slate-600 font-medium">{item.city?.area || '—'}</td>
                    <td className="p-4 text-sm text-slate-600 font-medium">{item.city?.city_name || '—'}</td>
                    <td className="p-4 text-sm text-slate-600 font-medium">{item.city?.region || '—'}</td>
                    <td className="p-4 text-sm text-slate-600 font-medium">{item.city?.district || '—'}</td>
                    <td className="p-4 text-sm text-slate-600 font-medium">{item.state?.state_name || '—'}</td>
                    <td className="p-4 pr-6 text-sm text-slate-500 font-semibold">{item.country?.country_name || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-bold text-slate-400">
              Showing {locations.length} of {totalItems} locations
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex space-x-1">
                {/* Render visible page numbers around current page */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = idx + 1;
                  } else if (page <= 3) {
                    pageNum = idx + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + idx;
                  } else {
                    pageNum = page - 2 + idx;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        page === pageNum 
                          ? 'bg-[#7c3aed] text-white shadow-md shadow-purple-100' 
                          : 'text-slate-400 hover:bg-white border border-transparent hover:border-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Locations;
