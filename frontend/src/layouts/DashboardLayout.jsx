import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import api, { IMAGE_BASE_URL } from '../api';
import { useSettings } from '../context/SettingsContext';
import {
  Users, UserCog, Key,
  Bell, LogOut, Menu,
  LayoutDashboard, UserCircle, Settings, ChevronDown, ChevronRight,
  Image as ImageIcon, Layers, ShoppingBag, SlidersHorizontal,
  Clock, ClipboardList, Code2, Globe, Truck, Check, X, CheckCircle, XCircle, UserCheck ,  MessageSquare
} from 'lucide-react';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userPermissions = user.permissions || [];
  const { settings, t } = useSettings();

  // Dynamic theme values from settings
  const sidebarBg = settings?.theme?.sidebar_color || '#1e133c';
  const navbarBg = settings?.theme?.navbar_color || '#ffffff';
  const primaryColor = settings?.theme?.primary_color || '#6366f1';
  const appName = settings?.appName;

  const [currentStatus, setCurrentStatus] = useState(user.profile_status || 'pending');
  const isVendor = user.role?.role_name?.toLowerCase().includes('vendor') || user.role?.role_name?.toLowerCase().includes('seller');
  const isApproved = currentStatus === 'approved';
  const isAdmin = user.role?.role_name?.toLowerCase().includes('admin');

  const [openSections, setOpenSections] = useState({ access: true, master: false, catalog: true, bwg_mapping: false });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState('all');
  const [pendingVendors, setPendingVendors] = useState(0);
  const [pendingEmployeesCount, setPendingEmployeesCount] = useState(0);
  const [pendingVehiclesCount, setPendingVehiclesCount] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  const [logoError, setLogoError] = useState(false);

  const notifDropdownRef = useRef(null);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setLogoError(false);
  }, [settings?.companyLogo]);

  useEffect(() => {
    fetchProfileStatus();
  }, [isAdmin]);

  // Route protection for pending accounts (redirect non-admins to dashboard/profile)
  useEffect(() => {
    if (!isAdmin && !isApproved) {
      const allowedPaths = ['/', '/profile'];
      if (!allowedPaths.includes(location.pathname)) {
        navigate('/');
      }
    }
  }, [isApproved, isAdmin, location.pathname, navigate]);

  const fetchProfileStatus = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.user?.profile_status) {
        const freshStatus = res.data.user.profile_status;
        setCurrentStatus(freshStatus);
        if (user.profile_status !== freshStatus) {
          const updatedUser = { ...user, profile_status: freshStatus };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (err) {
      console.error("Error fetching profile status:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setTotalPending(res.data.totalPending || 0);
      setPendingEmployeesCount(res.data.pendingEmployeesCount || 0);
      setPendingVehiclesCount(res.data.pendingVehiclesCount || 0);
      setPendingVendors(res.data.pendingVendorsCount || 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const handleApprove = async (type, refId, notifId) => {
    const key = notifId || `${type}-${refId}`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      if (type === 'employee' || type === 'employee_registration') {
        await api.patch(`/aggregator-employees/${refId}/approve`);
      } else if (type === 'vehicle' || type === 'vehicle_registration') {
        await api.patch(`/aggregator-vehicles/${refId}/approve`);
      }
      if (notifId) {
        await api.patch(`/notifications/${notifId}/read`);
      }
      // Optimistically update local item state instantly
      setNotifications(prev => prev.map(item => {
        if (item.id === notifId || (item.reference_id === refId && (item.reference_type === type || item.type === type))) {
          return { ...item, approval_status: 'approved', is_read: true };
        }
        return item;
      }));
      setTotalPending(prev => Math.max(0, prev - 1));
      fetchNotifications();
    } catch (err) {
      console.error("Failed to approve item:", err);
      alert(err.response?.data?.message || "Failed to approve item");
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleReject = async (type, refId, notifId) => {
    const key = notifId || `${type}-${refId}`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      if (type === 'employee' || type === 'employee_registration') {
        await api.patch(`/aggregator-employees/${refId}/reject`);
      } else if (type === 'vehicle' || type === 'vehicle_registration') {
        await api.patch(`/aggregator-vehicles/${refId}/reject`);
      }
      if (notifId) {
        await api.patch(`/notifications/${notifId}/read`);
      }
      // Optimistically update local item state instantly
      setNotifications(prev => prev.map(item => {
        if (item.id === notifId || (item.reference_id === refId && (item.reference_type === type || item.type === type))) {
          return { ...item, approval_status: 'rejected', is_read: true };
        }
        return item;
      }));
      setTotalPending(prev => Math.max(0, prev - 1));
      fetchNotifications();
    } catch (err) {
      console.error("Failed to reject item:", err);
      alert(err.response?.data?.message || "Failed to reject item");
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/all/read');
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const hasAccess = (requiredPermissionString) => {
    if (!requiredPermissionString) return true;
    return userPermissions.includes(requiredPermissionString);
  };

  // Redefined menu to match Airowin style structure
  const sidebarItems = [
    { name: t('dashboard'), path: '/', icon: LayoutDashboard, isSubMenu: false },
    { name: t('profile'), path: '/profile', icon: UserCircle, isSubMenu: false, req: 'profile' },
    {
      id: 'catalog',
      title: t('catalog'),
      icon: ImageIcon,
      isSubMenu: true,
      hidden: isVendor && !isApproved,
      items: [
        { name: t('categories'), path: '/categories', req: 'category_management' },
        { name: t('sub_categories'), path: '/sub-categories', req: 'sub_category_management' },
      ]
    },
    {
      id: 'master',
      title: t('general_master'),
      icon: Settings,
      isSubMenu: true,
      hidden: isVendor && !isApproved,
      items: [
        { name: t('users'), path: '/users', req: 'user_management' },
        { name: t('roles'), path: '/roles', req: 'role_management' },
        { name: t('permissions'), path: '/permissions', req: 'permission' },
        { name: t('locations'), path: '/locations', req: 'locations' }
      ]
    },
    {
      id: 'bwg_mapping',
      title: t('bwg_mapping'),
      icon: Layers,
      isSubMenu: true,
      hidden: isVendor && !isApproved,
      items: [
        { name: t('corporation'), path: '/bwg/corporation', req: 'bwg_mapping' },
        { name: t('zone'), path: '/bwg/zone', req: 'bwg_mapping' },
        { name: t('ward'), path: '/bwg/ward', req: 'bwg_mapping' },
        { name: t('collection_event'), path: '/bwg/collection-event', req: 'bwg_mapping' }
      ]
    },
    {
      id: 'business_regions_dropdown',
      title: 'Business Region',
      icon: Globe,
      isSubMenu: true,
      hidden: isVendor && !isApproved,
      items: [
        { name: 'Business Region', path: '/bwg/business-region', req: 'business_region' },
        { name: 'Business Sub Region', path: '/bwg/business-sub-region', req: 'business_region' }
      ]
    },
    { name: t('waste_collection_requests'), path: '/waste-collection-requests', icon: ShoppingBag, isSubMenu: false, req: 'waste_collection_requests' },
    { name: 'Waste Requests List', path: '/waste-requests-list', icon: ClipboardList, isSubMenu: false, req: 'waste_requests_list' },
    { name: 'Order Management', path: '/waste-orders', icon: ClipboardList, isSubMenu: false, req: 'order_management' },
    {
  name: "Complaint Management",
  path: "/complaints",
  icon: MessageSquare,
  isSubMenu: false,
},
   
    {
      id: 'aggregator_employees_group',
      title: 'Aggregator Employees',
      icon: Users,
      isSubMenu: true,
      hidden: isVendor && !isApproved,
      items: [
        { name: 'Add Employee', path: '/aggregator-employees/add', req: 'aggregator_employee' },
        { name: 'Employee List', path: '/aggregator-employees', req: 'aggregator_employee' }
      ]
    },
    {
      id: 'aggregator_vehicles_group',
      title: 'Aggregator Vehicles',
      icon: Truck,
      isSubMenu: true,
      hidden: isVendor && !isApproved,
      items: [
        { name: 'Register Vehicle', path: '/aggregator-vehicles/add', req: 'aggregator_vehicle' },
        { name: 'Vehicles List', path: '/aggregator-vehicles', req: 'aggregator_vehicle' }
      ]
    },

    { name: t('time_slot_management'), path: '/time-slots', icon: Clock, isSubMenu: false, req: 'time_slot_management' },

    {
      id: 'developer',
      title: 'Developer',
      icon: Code2,
      isSubMenu: true,
      hidden: !isAdmin && !user.role?.role_name?.toLowerCase().includes('developer'),
      items: [
        { name: 'Module Creation', path: '/developer/module-creation', req: 'module_creation' }
      ]
    },
    { name: t('settings'), path: '/settings', icon: SlidersHorizontal, isSubMenu: false, req: 'settings_management' }
  ];

  // Filter sidebar items for pending non-admin accounts
  const allowedSidebarItems = sidebarItems.map(item => {
    if (!isAdmin && !isApproved) {
      if (item.path !== '/' && item.path !== '/profile') {
        return { ...item, hidden: true };
      }
    }
    return item;
  });

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ backgroundColor: 'var(--app-bg)' }}>
      {/* Sidebar - dynamic bg from settings */}
      <div
        className={`text-white flex flex-col flex-shrink-0 shadow-xl z-20 transition-all duration-300 relative ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}
        style={{ backgroundColor: sidebarBg }}
      >

        {/* Logo Area */}
        <div className="h-24 flex items-center justify-center border-b border-white/5 shrink-0 px-6">
          <Link to="/" className="flex items-center justify-center w-full h-full cursor-pointer">
            {settings?.companyLogo && !logoError ? (
              <img
                src={`${IMAGE_BASE_URL}/${settings.companyLogo}`}
                alt={appName}
                className="max-h-[84px] max-w-[307px] object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight text-white mb-0">{appName}</h1>
                <p className="text-[9px] uppercase tracking-widest text-blue-300 mt-0">{t('admin_panel')}</p>
              </div>
            )}
          </Link>
        </div>

        {/* Current Role Pill */}
        <div className="px-6 py-4">
          <div
            className="font-normal text-xs uppercase py-2 rounded-full tracking-[2px] text-center flex justify-center items-center"
            style={{ color: '#ffffff', border: '1px solid #e2e8f0' }}
          >
            <Users className="w-4 h-4 mr-4" /> {user.role?.role_name || 'ADMIN'}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar px-3 space-y-1 pb-4">
          {allowedSidebarItems.map((item) => {
            if (item.hidden) return null;
            if (!item.isSubMenu) {
              if (item.req && !hasAccess(item.req)) return null;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm transition-all duration-200 ${isActive ? 'font-medium' : 'hover:bg-white/5'}`}
                  style={isActive
                    ? { backgroundColor: 'var(--color-sidebar-active-bg)', color: 'var(--color-sidebar-active-text)' }
                    : { color: 'var(--color-sidebar-text)' }
                  }
                >
                  <item.icon className={`w-4 h-4 mr-3 flex-shrink-0 opacity-80`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            } else {
              // Expandable section
              const filteredItems = item.items.filter(sub => hasAccess(sub.req));
              if (filteredItems.length === 0) return null;

              return (
                <div key={item.id} className="pt-2">
                  <button
                    onClick={() => toggleSection(item.id)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm hover:bg-white/5 transition-colors"
                    style={{ color: 'var(--color-sidebar-text)' }}
                  >
                    <div className="flex items-center min-w-0">
                      <item.icon className="w-4 h-4 mr-3 opacity-80 flex-shrink-0" />
                      <span className="truncate pr-2">{item.title}</span>
                    </div>

                    {openSections[item.id] ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
                  </button>

                  {openSections[item.id] && (
                    <ul className="mt-1 space-y-1 px-4">
                      {filteredItems.map((sub) => {
                        const isActive = location.pathname === sub.path;
                        return (
                          <li key={sub.name}>
                            <Link
                              to={sub.path}
                              className={`flex items-center pl-7 py-2.5 rounded-lg text-sm transition-all duration-200 ${isActive ? 'font-medium' : 'hover:bg-white/5'}`}
                              style={isActive
                                ? { backgroundColor: 'var(--color-sidebar-active-bg)', color: 'var(--color-sidebar-active-text)' }
                                : { color: 'var(--color-sidebar-text)' }
                              }
                            >
                              <span className="w-1.5 h-1.5 rounded-full mr-3 bg-current opacity-50"></span>
                              <span className="truncate">{sub.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            }
          })}
        </nav>

        {/* Bottom Banner Image */}
        <div className="w-full h-24 overflow-hidden select-none pointer-events-none shrink-0 relative">
          <img
            src="/leftnavbarimgbottom.webp"
            alt="Sidebar Bottom Banner"
            className="w-full h-auto object-contain object-bottom absolute bottom-0"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-0" style={{ backgroundColor: 'var(--content-bg)' }}>

        {/* Top Header - dynamic bg from settings */}
        <header
          className="h-16 flex items-center justify-between px-6 border-b border-slate-200 shrink-0 shadow-sm relative z-50"
          style={{ backgroundColor: navbarBg }}
        >
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => {
                  if (isAdmin) {
                    setIsNotifDropdownOpen(!isNotifDropdownOpen);
                    setIsProfileDropdownOpen(false);
                  }
                }}
                className="relative text-slate-500 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                title="Notifications & Alerts"
              >
                <Bell className="w-5 h-5" />
                {totalPending > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white px-1 shadow-sm animate-pulse">
                    {totalPending}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {isNotifDropdownOpen && (
                <div className="absolute right-0 mt-3 w-[460px] md:w-[480px] bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-5 pb-3 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-600" /> Notifications & Alerts
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {totalPending > 0 ? `${totalPending} unread notification${totalPending > 1 ? 's' : ''}` : 'No unread notifications'}
                      </p>
                    </div>
                    {/* {notifications.length > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg transition hover:bg-emerald-100"
                      >
                        Mark All Read
                      </button>
                    )} */}
                  </div>

                  {/* Interactive Filter Tabs */}
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-hide text-xs">
                    <button
                      onClick={() => setActiveNotifTab('all')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${activeNotifTab === 'all'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      onClick={() => setActiveNotifTab('orders')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${activeNotifTab === 'orders'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Orders
                    </button>
                    <button
                      onClick={() => setActiveNotifTab('vehicles')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${activeNotifTab === 'vehicles'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      <Truck className="w-3.5 h-3.5" /> Vehicles
                    </button>
                    <button
                      onClick={() => setActiveNotifTab('staff')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${activeNotifTab === 'staff'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      <Users className="w-3.5 h-3.5" /> Staff
                    </button>
                    <button
                      onClick={() => setActiveNotifTab('vendors')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${activeNotifTab === 'vendors'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Vendors
                    </button>
                  </div>

                  {/* Notification List */}
                  <div className="max-h-84 overflow-y-auto divide-y divide-slate-100">
                    {(() => {
                      const filteredNotifs = notifications.filter(notif => {
                        if (activeNotifTab === 'orders') return notif.type === 'order_booked' || notif.reference_type === 'order';
                        if (activeNotifTab === 'vehicles') return notif.type === 'vehicle_registration' || notif.reference_type === 'vehicle';
                        if (activeNotifTab === 'staff') return notif.type === 'employee_registration' || notif.reference_type === 'employee';
                        if (activeNotifTab === 'vendors') return notif.type === 'vendor_approval' || notif.reference_type === 'vendor';
                        return true;
                      });

                      if (filteredNotifs.length === 0) {
                        return (
                          <div className="px-4 py-10 text-center text-slate-400">
                            <Bell className="w-9 h-9 mx-auto mb-2 opacity-30 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-500">No notifications found</p>
                            <p className="text-xs text-slate-400 mt-1">Notifications will appear here automatically</p>
                          </div>
                        );
                      }

                      return filteredNotifs.map(notif => {
                        const isLoading = actionLoading[notif.id || `${notif.reference_type}-${notif.reference_id}`];
                        const isVehicle = notif.type === 'vehicle_registration' || notif.reference_type === 'vehicle';
                        const isEmployee = notif.type === 'employee_registration' || notif.reference_type === 'employee';
                        const isOrder = notif.type === 'order_booked' || notif.reference_type === 'order';
                        const isVendorNotif = notif.type === 'vendor_approval' || notif.reference_type === 'vendor';
                        const approvalStatus = notif.approval_status || 'pending';

                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              if (isOrder) {
                                setIsNotifDropdownOpen(false);
                                navigate('/waste-orders');
                              }
                            }}
                            className={`p-4 transition hover:bg-slate-50 ${isOrder ? 'cursor-pointer' : ''} ${!notif.is_read ? 'bg-amber-50/20' : ''}`}
                          >
                            <div className="flex items-start gap-3.5">
                              <div className={`p-2.5 rounded-2xl shrink-0 mt-0.5 shadow-sm ${isOrder ? 'bg-blue-100 text-blue-600' :
                                isVehicle ? 'bg-amber-100 text-amber-600' :
                                  isEmployee ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'
                                }`}>
                                {isOrder ? <ShoppingBag className="w-5 h-5" /> :
                                  isVehicle ? <Truck className="w-5 h-5" /> :
                                    isEmployee ? <UserCircle className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-bold text-slate-900 truncate">{notif.title}</p>
                                  <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                                    {new Date(notif.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                                {/* Action / Status Display */}
                                {(isVehicle || isEmployee) && (
                                  <div className="mt-3">
                                    {approvalStatus === 'approved' ? (
                                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-lg">
                                        <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                                        Approved
                                      </span>
                                    ) : approvalStatus === 'rejected' ? (
                                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200/80 rounded-lg">
                                        <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                                        Rejected
                                      </span>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <button
                                          disabled={isLoading}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleApprove(notif.reference_type || (isVehicle ? 'vehicle' : 'employee'), notif.reference_id, notif.id);
                                          }}
                                          className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
                                        >
                                          <Check className="w-3.5 h-3.5 mr-1.5" />
                                          Approve
                                        </button>
                                        <button
                                          disabled={isLoading}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleReject(notif.reference_type || (isVehicle ? 'vehicle' : 'employee'), notif.reference_id, notif.id);
                                          }}
                                          className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition active:scale-95 disabled:opacity-50 border border-slate-200/60"
                                        >
                                          <X className="w-3.5 h-3.5 mr-1.5" />
                                          Reject
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {isVendorNotif && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsNotifDropdownOpen(false);
                                      navigate('/users');
                                    }}
                                    className="mt-2.5 text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline inline-flex items-center gap-1"
                                  >
                                    View Pending Vendor &rarr;
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <div
                className="flex items-center pl-6 border-l border-slate-200 cursor-pointer group"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                {user.profile_photo ? (
                  <img src={`${IMAGE_BASE_URL}/Profile_Photo/${user.profile_photo}`} alt="Profile" className="w-8 h-8 rounded-full object-cover shadow-sm border border-slate-200" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="ml-3 hidden sm:block">
                  <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-purple-700 flex items-center transition-colors">
                    {user.name} <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                  </p>
                </div>
              </div>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-[9999]">
                  <div className="px-4 py-2 border-b border-slate-50 mb-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  {hasAccess('profile') && (
                    <Link to="/profile" className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                      <UserCircle className="w-4 h-4 mr-2 text-slate-400" /> {t('profile')}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> {t('sign_out')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Canvas */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 relative z-0">
          {isVendor && !isApproved && (
            <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm animate-pulse">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bell className="h-5 w-5 text-amber-500" />
                </div>
                <div className="ml-3 flex-1 md:flex md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-amber-700 font-bold">
                      Profile Pending Approval
                    </p>
                    <p className="text-xs text-amber-600">
                      Your account is currently under review. Please complete your profile details and wait for admin approval to access all features.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6">
                    <Link
                      to="/profile"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-lg shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all active:scale-95"
                    >
                      <UserCircle className="w-4 h-4 mr-2" />
                      Update Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
