import { useState, useEffect, useMemo } from 'react';
import {
  Search, Truck, RefreshCw, Filter, Car, User, Calendar
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

      // Filter vendors to ONLY include actual Vendor/Aggregator users (EXCLUDE Sales users, Admins, etc.)
      const filteredVendors = allUsers.filter((u) => {
        const roleName = (u.role?.role_name || u.role_name || '').toLowerCase();
        return roleName === 'vendor' || roleName === 'aggregator';
      });

      // Also ensure any vendor currently assigned in waste-orders is included
      orderData.forEach((o) => {
        if (o.vendor && !filteredVendors.some((v) => String(v.id) === String(o.vendor.id))) {
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

  const [expandedLeads, setExpandedLeads] = useState({});
  const toggleExpand = (leadId) => {
    setExpandedLeads((prev) => ({ ...prev, [leadId]: !prev[leadId] }));
  };

  // Group orders by lead_id (similar to Order Management UI)
  const groupedOrders = useMemo(() => {
    const map = {};
    filteredOrders.forEach(o => {
      const key = o.lead_id || o.order_id || o.id;
      if (!map[key]) map[key] = [];
      map[key].push(o);
    });

    return Object.entries(map).map(([lead_id, items]) => {
      const first = items[0];
      return {
        lead_id,
        items,
        first
      };
    });
  }, [filteredOrders]);

  // Stats
  const stats = useMemo(() => ({
    total: groupedOrders.length,
    withVendor: filteredOrders.filter(o => o.vendor_id || o.vendor?.id).length,
    withVehicle: filteredOrders.filter(o => o.vehicle_id || o.vehicle?.id).length,
    withDriver: filteredOrders.filter(o => o.vehicle?.driver_id || o.vehicle?.driver?.id || o.driver_id || o.driverEmployee?.id).length,
    pending: filteredOrders.filter(o => o.status === 'Booked').length,
  }), [filteredOrders, groupedOrders]);

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
          { label: 'Total Orders / Leads', value: stats.total, color: 'text-slate-800' },
          { label: 'Booked / Active', value: stats.pending, color: 'text-emerald-700' },
          { label: 'Aggregators Assigned', value: stats.withVendor, color: 'text-blue-700' },
          { label: 'Vehicles Assigned', value: stats.withVehicle, color: 'text-amber-700' },
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
        ) : groupedOrders.length === 0 ? (
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
                  <th className="py-3 px-4 min-w-[150px]">Waste Generator</th>
                  <th className="py-3 px-3 whitespace-nowrap">Schedule</th>
                  <th className="py-3 px-3 min-w-[110px]">Corporation</th>
                  <th className="py-3 px-3 min-w-[100px]">Zone</th>
                  <th className="py-3 px-3 min-w-[120px]">Ward</th>
                  <th className="py-3 px-4 min-w-[640px]">Waste Logistics & Vehicle Assignments</th>
                  <th className="py-3 px-4 whitespace-nowrap text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {groupedOrders.map(({ lead_id, items, first }) => {
                  const bwgName = first.waste_generator_name || first.customer_legal_name || first.contact_person || first.customer?.name || '—';
                  const corpName = first.corporation?.corporation_name || '—';
                  const zoneName = first.zone?.zone_name || '—';
                  const wardName = first.ward?.ward_name || '—';
                  const refCode = first.order_id ? `Ref: ${first.order_id}` : '';

                  return (
                    <tr key={lead_id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Waste Generator */}
                      <td className="py-3 px-4 align-top">
                        <p className="font-bold text-slate-900 text-xs tracking-tight">{bwgName}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px] rounded-md border border-emerald-200">
                          {lead_id}
                        </span>
                        {refCode && (
                          <p className="text-[10px] text-slate-400 font-semibold mt-1">{refCode}</p>
                        )}
                        <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                          {items.length} {items.length === 1 ? 'Category Item' : 'Category Items'}
                        </p>
                      </td>

                      {/* Schedule */}
                      <td className="py-3 px-3 whitespace-nowrap align-top">
                        <span className="font-bold text-slate-700 text-xs flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600 inline" />
                          {first.pickup_date || '—'}
                        </span>
                        {first.pickup_time && (
                          <span className="block text-[10px] text-slate-500 font-medium mt-0.5">
                            {first.pickup_time}
                          </span>
                        )}
                      </td>

                      {/* Corporation */}
                      <td className="py-3 px-3 font-semibold text-slate-700 text-xs align-top">{corpName}</td>

                      {/* Zone */}
                      <td className="py-3 px-3 font-semibold text-slate-700 text-xs align-top">{zoneName}</td>

                      {/* Ward */}
                      <td className="py-3 px-3 font-semibold text-slate-700 text-xs align-top">{wardName}</td>

                      {/* Direct Compact Waste Logistics & Vehicle Assignments Cell - Single Horizontal Line */}
                      <td className="py-2.5 px-3 min-w-[640px] space-y-1.5 align-top">
                        {items.map((item) => {
                          const currentVendorId = String(item.vendor_id || item.vendor?.id || '');
                          const currentVehicleId = String(item.vehicle_id || item.vehicle?.id || '');

                          const availableVehicles = vehicles.filter((v) => {
                            if (!currentVendorId) return true;
                            return String(v.user_id) === currentVendorId;
                          });

                          const selectedVehObj = vehicles.find((v) => String(v.id) === currentVehicleId) || item.vehicle;
                          const assignedDriverName = selectedVehObj?.driver?.name || item.driverEmployee?.name;
                          const isUpdating = updatingId === item.id;

                          return (
                            <div
                              key={item.id}
                              className="flex flex-nowrap items-center gap-2 bg-slate-50/90 border border-slate-200/90 p-1.5 px-2.5 rounded-xl text-xs shadow-2xs hover:bg-white hover:border-emerald-300 transition-all whitespace-nowrap overflow-x-auto"
                            >
                              {/* Category Pill Badge */}
                              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[10px] font-black tracking-tight shrink-0 min-w-[85px] text-center shadow-xs truncate max-w-[120px]" title={item.subCategory?.name || item.sub_category_name || item.category?.name || item.category_name || 'Waste Item'}>
                                {item.subCategory?.name || item.sub_category_name || item.category?.name || item.category_name || 'Waste Item'}
                              </span>

                              {/* Vendor Select */}
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[10px] font-bold text-slate-400">Vendor:</span>
                                <div className="relative flex items-center">
                                  <select
                                    value={currentVendorId}
                                    disabled={isUpdating}
                                    onChange={(e) => {
                                      const newVendorId = e.target.value;
                                      handleReassign(item.id, { vendor_id: newVendorId, vehicle_id: '' });
                                    }}
                                    className={`bg-white border border-slate-300 hover:border-emerald-500 rounded-lg py-1 pl-2 pr-6 text-[11px] font-bold text-slate-800 outline-none cursor-pointer focus:ring-1 focus:ring-emerald-500 shadow-2xs transition-all max-w-[150px] truncate ${
                                      isUpdating ? 'opacity-50 cursor-wait' : ''
                                    }`}
                                  >
                                    <option value="">Select Vendor...</option>
                                    {vendors.map((v) => (
                                      <option key={v.id} value={v.id}>
                                        {v.name || v.email}
                                      </option>
                                    ))}
                                  </select>
                                  {isUpdating && (
                                    <RefreshCw className="w-3 h-3 animate-spin text-emerald-600 absolute right-1.5 pointer-events-none" />
                                  )}
                                </div>
                              </div>

                              {/* Vehicle Select */}
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[10px] font-bold text-slate-400">Vehicle:</span>
                                <div className="relative flex items-center">
                                  <select
                                    value={currentVehicleId}
                                    disabled={isUpdating}
                                    onChange={(e) => {
                                      const selectedVehId = e.target.value;
                                      const vehObj = vehicles.find((v) => String(v.id) === selectedVehId);
                                      const autoVendorId = vehObj?.user_id ? String(vehObj.user_id) : currentVendorId;
                                      handleReassign(item.id, {
                                        vendor_id: autoVendorId,
                                        vehicle_id: selectedVehId
                                      });
                                    }}
                                    className={`bg-white border border-slate-300 hover:border-emerald-500 rounded-lg py-1 pl-2 pr-6 text-[11px] font-bold text-slate-800 outline-none cursor-pointer focus:ring-1 focus:ring-emerald-500 shadow-2xs transition-all max-w-[210px] truncate ${
                                      isUpdating ? 'opacity-50 cursor-wait' : ''
                                    }`}
                                  >
                                    <option value="">Select Vehicle...</option>
                                    {availableVehicles.length === 0 ? (
                                      <option value="" disabled>No vehicles for vendor</option>
                                    ) : (
                                      availableVehicles.map((v) => (
                                        <option key={v.id} value={v.id}>
                                          {v.registration_number} {v.driver?.name ? `(Driver: ${v.driver.name})` : ' (No driver)'}
                                        </option>
                                      ))
                                    )}
                                  </select>
                                  {isUpdating && (
                                    <RefreshCw className="w-3 h-3 animate-spin text-emerald-600 absolute right-1.5 pointer-events-none" />
                                  )}
                                </div>
                              </div>

                              {/* Driver Info Display & Loading Feedback */}
                              <div className="ml-auto flex items-center gap-1.5 shrink-0">
                                {isUpdating ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 animate-pulse">
                                    <RefreshCw className="w-3 h-3 animate-spin text-sky-600" /> Saving...
                                  </span>
                                ) : assignedDriverName ? (
                                  <span className="text-emerald-700 font-extrabold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                                    Driver: {assignedDriverName}
                                  </span>
                                ) : selectedVehObj?.registration_number ? (
                                  <span className="text-amber-700 font-extrabold text-[10px] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shrink-0">
                                    No driver assigned
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap align-top text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${first.status === 'Booked'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : first.status === 'Completed'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                          {first.status}
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
