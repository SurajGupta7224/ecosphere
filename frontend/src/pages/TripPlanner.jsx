import { useState, useEffect, useMemo } from 'react';
import {
  Search, Truck, RefreshCw, Filter, Car, User
} from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function TripPlanner() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [corporations, setCorporations] = useState([]);
  const [wards, setWards] = useState([]);

  // Filters
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCorp, setSelectedCorp] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedAggregator, setSelectedAggregator] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, vendorRes, empRes, vehRes, corpRes, wardRes] = await Promise.all([
        api.get('/waste-orders', { params: { limit: 500 } }),
        api.get('/users', { params: { limit: 500 } }).catch(() => ({ data: { users: [] } })),
        api.get('/aggregator-employees', { params: { limit: 500 } }).catch(() => ({ data: { employees: [] } })),
        api.get('/aggregator-vehicles', { params: { limit: 500 } }).catch(() => ({ data: { vehicles: [] } })),
        api.get('/corporations').catch(() => ({ data: { corporations: [] } })),
        api.get('/wards').catch(() => ({ data: { wards: [] } }))
      ]);

      const orderData = ordersRes.data?.orders || ordersRes.data?.rows || ordersRes.data || [];
      setOrders(orderData);

      const allUsers = vendorRes.data?.users || [];
      const vehList = vehRes.data?.vehicles || vehRes.data?.data || [];
      const eList = empRes.data?.employees || empRes.data?.data || [];

      // Filter vendors to ONLY include actual Vendor/Aggregator users (exclude Admins/Regular users)
      const filteredVendors = allUsers.filter(u => {
        const roleName = u.role?.role_name?.toLowerCase() || '';
        return roleName.includes('vendor') || roleName.includes('aggregator') || roleName.includes('seller') || u.company_type;
      });

      // Also ensure any vendor currently assigned in waste-orders is included
      orderData.forEach(o => {
        if (o.vendor && !filteredVendors.some(v => String(v.id) === String(o.vendor.id))) {
          filteredVendors.push(o.vendor);
        }
      });

      setVendors(filteredVendors);
      setEmployees(eList);
      setVehicles(vehList);
      setCorporations(corpRes.data?.corporations || []);
      setWards(wardRes.data?.wards || []);

    } catch (err) {
      console.error('Trip Planner fetch error:', err);
      toast.error('Failed to load pickup schedules.');
    } finally {
      setLoading(false);
    }
  };

  // Reassign vendor, vehicle, or driver inline
  const handleReassign = async (orderId, payload) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/waste-orders/${orderId}/reassign`, payload);
      toast.success('Assignment updated successfully!');

      setOrders(prev =>
        prev.map(o => {
          if (o.id === orderId) {
            const updated = { ...o, ...payload };
            if (payload.vendor_id) {
              const v = vendors.find(v => String(v.id) === String(payload.vendor_id));
              if (v) updated.vendor = v;
            }
            if (payload.driver_id !== undefined) {
              const e = employees.find(e => String(e.id) === String(payload.driver_id));
              updated.driverEmployee = e || null;
              updated.driver_id = payload.driver_id || null;
            }
            return updated;
          }
          return o;
        })
      );
    } catch (err) {
      console.error('Reassign error:', err);
      toast.error('Failed to update assignment.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (selectedDate) {
        const d = o.pickup_date || o.contract_start_date || o.created_at;
        const dateStr = d ? new Date(d).toISOString().split('T')[0] : '';
        if (dateStr && dateStr !== selectedDate) return false;
      }
      if (selectedCorp && String(o.corporation_id || o.corporation?.id) !== String(selectedCorp)) return false;
      if (selectedWard && String(o.ward_id || o.ward?.id) !== String(selectedWard)) return false;
      if (selectedAggregator && String(o.vendor_id || o.vendor?.id) !== String(selectedAggregator)) return false;
      if (searchTerm.trim()) {
        const t = searchTerm.toLowerCase();
        return (
          (o.waste_generator_name || '').toLowerCase().includes(t) ||
          (o.lead_id || '').toLowerCase().includes(t) ||
          (o.order_id || '').toLowerCase().includes(t) ||
          (o.contact_person || '').toLowerCase().includes(t) ||
          (o.mobile_number || '').toLowerCase().includes(t) ||
          (o.corporation?.corporation_name || '').toLowerCase().includes(t) ||
          (o.ward?.ward_name || '').toLowerCase().includes(t) ||
          (o.vendor?.name || '').toLowerCase().includes(t) ||
          (o.driverEmployee?.name || '').toLowerCase().includes(t)
        );
      }
      return true;
    });
  }, [orders, selectedDate, selectedCorp, selectedWard, selectedAggregator, searchTerm]);

  // Stats
  const stats = useMemo(() => ({
    total: filteredOrders.length,
    withVendor: filteredOrders.filter(o => o.vendor_id || o.vendor?.id).length,
    withDriver: filteredOrders.filter(o => o.driver_id || o.driverEmployee?.id).length,
    pending: filteredOrders.filter(o => o.status === 'Booked').length,
  }), [filteredOrders]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Pickup & Trip Planner</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Manage waste collection schedules, assign aggregators, vehicles, and drivers.
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Schedule
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, color: 'text-slate-800' },
          { label: 'Booked / Active', value: stats.pending, color: 'text-emerald-700' },
          { label: 'Aggregators Assigned', value: stats.withVendor, color: 'text-blue-700' },
          { label: 'Drivers Assigned', value: stats.withDriver, color: 'text-amber-700' },
        ].map(s => (
          <div key={s.label} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">{s.label}</span>
            <span className={`text-2xl font-extrabold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filter Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Filter className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-800">Filter Schedules</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Pickup Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Corporation</label>
            <select
              value={selectedCorp}
              onChange={e => setSelectedCorp(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="">All Corporations</option>
              {corporations.map(c => (
                <option key={c.id} value={c.id}>{c.corporation_name || c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Ward</label>
            <select
              value={selectedWard}
              onChange={e => setSelectedWard(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="">All Wards</option>
              {wards.map(w => (
                <option key={w.id} value={w.id}>
                  {w.ward_number ? `${w.ward_number} - ${w.ward_name}` : w.ward_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Aggregator</label>
            <select
              value={selectedAggregator}
              onChange={e => setSelectedAggregator(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="">All Aggregators</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name || v.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Lead ID, name, mobile..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-3 pr-8 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
            <p>Loading scheduled pickup routes...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Truck className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-base font-bold text-slate-700">No scheduled pickups found</p>
            <p className="text-xs text-slate-500">Try adjusting your filters or ensure orders have been booked.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4 min-w-[160px]">Waste Generator</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Schedule</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Corporation</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Zone</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Ward</th>
                  <th className="py-3.5 px-4 min-w-[190px]">Aggregator / Agency</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Agency Contact</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Driver & Vehicle</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredOrders.map(o => {
                  const bwgName = o.waste_generator_name || o.customer_legal_name || o.contact_person || o.customer?.name || '—';
                  const corpName = o.corporation?.corporation_name || '—';
                  const zoneName = o.zone?.zone_name || '—';
                  const wardName = o.ward?.ward_number
                    ? `${o.ward.ward_number} - ${o.ward.ward_name}`
                    : (o.ward?.ward_name || '—');

                  const currentVendorId = String(o.vendor_id || o.vendor?.id || '');
                  const currentDriverId = String(o.driver_id || o.driverEmployee?.id || '');

                  // Find vehicle for this order (from driverVehicles or matching driver_id)
                  const driverVehicle = o.driverEmployee?.driverVehicles?.[0];
                  const matchedVeh = vehicles.find(v => 
                    (currentDriverId && String(v.driver_id) === currentDriverId) ||
                    (driverVehicle && String(v.id) === String(driverVehicle.id))
                  );
                  const currentVehicleId = matchedVeh ? String(matchedVeh.id) : (driverVehicle ? String(driverVehicle.id) : '');

                  // Vehicles strictly filtered by selected Aggregator
                  const rowVehicles = vehicles.filter(v => {
                    if (!currentVendorId) return true;
                    return String(v.user_id) === currentVendorId;
                  });

                  // Employees strictly filtered by selected Aggregator AND staff_type === 'driver' (EXCLUDE HELPERS)
                  const rowDrivers = employees.filter(e => {
                    const isDriver = (e.staff_type?.toLowerCase() === 'driver') || (e.staff_role?.toLowerCase() === 'driver');
                    if (!isDriver) return false;
                    if (!currentVendorId) return true;
                    return String(e.user_id) === currentVendorId;
                  });

                  const vendorObj = vendors.find(v => String(v.id) === currentVendorId) || o.vendor;
                  const vendorPhone = vendorObj?.phone || o.mobile_number || '—';

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">

                      {/* Waste Generator */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs">{bwgName}</div>
                        {o.lead_id && (
                          <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5">
                            {o.lead_id}
                          </span>
                        )}
                        {o.order_id && (
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{o.order_id}</div>
                        )}
                      </td>

                      {/* Schedule */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200">
                          {o.collectionEvent?.event_name || o.variation?.variation_name || 'Daily'}
                        </span>
                      </td>

                      {/* Corporation */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700 text-xs">{corpName}</td>

                      {/* Zone */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700 text-xs">{zoneName}</td>

                      {/* Ward */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700 text-xs">{wardName}</td>

                      {/* Aggregator / Agency Dropdown (Vendors Only) */}
                      <td className="py-3.5 px-4">
                        <select
                          value={currentVendorId}
                          disabled={updatingId === o.id}
                          onChange={e => {
                            const newVendorId = e.target.value;
                            const driverBelongs = rowDrivers.some(emp => String(emp.id) === currentDriverId && String(emp.user_id) === newVendorId);
                            handleReassign(o.id, {
                              vendor_id: newVendorId,
                              driver_id: driverBelongs ? currentDriverId : ''
                            });
                          }}
                          className="w-full bg-white border border-slate-300 hover:border-emerald-500 rounded-xl py-2 px-3 text-[11px] font-bold text-slate-800 outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all"
                        >
                          <option value="">Select Aggregator...</option>
                          {vendors.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.name || v.email}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Agency Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 text-xs">{vendorPhone}</div>
                      </td>

                      {/* Combined Driver & Vehicle Column */}
                      <td className="py-3.5 px-4 min-w-[240px]">
                        <div className="space-y-1.5">
                          {/* Vehicle Select */}
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                              <Car className="w-3 h-3 text-emerald-600" /> Vehicle
                            </div>
                            <select
                              value={currentVehicleId}
                              disabled={updatingId === o.id}
                              onChange={e => {
                                const selectedVehId = e.target.value;
                                const veh = vehicles.find(v => String(v.id) === selectedVehId);
                                const autoDriverId = veh?.driver_id || veh?.driver?.id || currentDriverId;
                                const autoVendorId = veh?.user_id ? String(veh.user_id) : currentVendorId;

                                handleReassign(o.id, {
                                  vendor_id: autoVendorId,
                                  driver_id: autoDriverId ? String(autoDriverId) : ''
                                });
                              }}
                              className="w-full bg-white border border-slate-300 hover:border-emerald-500 rounded-xl py-1.5 px-2.5 text-[11px] font-bold text-slate-800 outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all"
                            >
                              <option value="">Select Vehicle...</option>
                              {rowVehicles.length === 0 ? (
                                <option value="" disabled>No vehicles registered for vendor</option>
                              ) : (
                                rowVehicles.map(v => (
                                  <option key={v.id} value={v.id}>
                                    {v.registration_number} {v.brand || v.vehicle_type ? `(${v.brand || v.vehicle_type})` : ''}
                                  </option>
                                ))
                              )}
                            </select>
                          </div>

                          {/* Driver Select (DRIVERS ONLY - NO HELPERS) */}
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                              <User className="w-3 h-3 text-emerald-600" /> Driver
                            </div>
                            <select
                              value={currentDriverId}
                              disabled={updatingId === o.id}
                              onChange={e => {
                                const selectedDriverId = e.target.value;
                                const driverObj = employees.find(emp => String(emp.id) === selectedDriverId);
                                const autoVendorId = driverObj?.user_id ? String(driverObj.user_id) : currentVendorId;

                                handleReassign(o.id, {
                                  vendor_id: autoVendorId,
                                  driver_id: selectedDriverId
                                });
                              }}
                              className="w-full bg-white border border-slate-300 hover:border-emerald-500 rounded-xl py-1.5 px-2.5 text-[11px] font-bold text-slate-800 outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all"
                            >
                              <option value="">Select Driver...</option>
                              {rowDrivers.length === 0 ? (
                                <option value="" disabled>No drivers registered for vendor</option>
                              ) : (
                                rowDrivers.map(e => (
                                  <option key={e.id} value={e.id}>
                                    {e.name} {e.mobile_number ? `(${e.mobile_number})` : ''}
                                  </option>
                                ))
                              )}
                            </select>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                          o.status === 'Booked'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : o.status === 'Completed'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {o.status}
                        </span>
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
  );
}
