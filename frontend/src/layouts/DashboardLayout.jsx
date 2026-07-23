import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import api, { IMAGE_BASE_URL } from '../api';
import { useSettings } from '../context/SettingsContext';
import {
  Users, UserCog, Key,
  Bell, LogOut, Menu,
  LayoutDashboard, UserCircle, Settings, ChevronDown, ChevronRight,
  Image as ImageIcon, Layers, ShoppingBag, SlidersHorizontal,
  Clock, ClipboardList, Code2, Globe, Truck
} from 'lucide-react';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userPermissions = user.permissions || [];
  const { settings, t } = useSettings();

  // Dynamic theme values from settings
  const sidebarBg  = settings?.theme?.sidebar_color || '#1e133c';
  const navbarBg   = settings?.theme?.navbar_color  || '#ffffff';
  const primaryColor = settings?.theme?.primary_color || '#6366f1';
  const appName    = settings?.appName;

  const [currentStatus, setCurrentStatus] = useState(user.profile_status || 'pending');
  const isVendor = user.role?.role_name?.toLowerCase().includes('vendor') || user.role?.role_name?.toLowerCase().includes('seller');
  const isApproved = currentStatus === 'approved';
  const isAdmin = user.role?.role_name?.toLowerCase().includes('admin');

  const [openSections, setOpenSections] = useState({ access: true, master: false, catalog: true, bwg_mapping: false });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [pendingVendors, setPendingVendors] = useState(0);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [settings?.companyLogo]);

  useEffect(() => {
    fetchProfileStatus();
    if (isAdmin) {
      fetchPendingCount();
      const interval = setInterval(fetchPendingCount, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  // Route protection for pending accounts (redirect non-admins to dashboard/profile)
  useEffect(() => {
    if (!isAdmin && !isApproved) {
      const allowedPaths = ['/', '/profile'];
      if (!allowedPaths.includes(location.pathname)) {
        navigate('/', { replace: true });
      }
    }
  }, [location.pathname, isAdmin, isApproved, navigate]);

  const fetchProfileStatus = async () => {
    try {
      const res = await api.get('/profile');
      if (res.data.user) {
        const freshStatus = res.data.user.profile_status;
        setCurrentStatus(freshStatus);

        // Update localStorage if status has changed
        if (freshStatus !== user.profile_status) {
          const updatedUser = { ...user, profile_status: freshStatus };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (err) {
      console.error("Error fetching profile status:", err);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const res = await api.get('/users/pending/count');
      setPendingVendors(res.data.count || 0);
    } catch (err) {
      console.error("Error fetching pending vendors:", err);
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
    { name: 'Order Management', path: '/waste-orders', icon: ClipboardList, isSubMenu: false, req: 'waste_requests_list' },
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
            style={{color: '#ffffff', border: '1px solid #e2e8f0' }}
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
      <div className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: 'var(--content-bg)' }}>

        {/* Top Header - dynamic bg from settings */}
        <header
          className="h-16 flex items-center justify-between px-6 border-b border-slate-200 shrink-0 shadow-sm z-10"
          style={{ backgroundColor: navbarBg }}
        >
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => isAdmin && navigate('/users')}
              className="relative text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {pendingVendors > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                  {pendingVendors}
                </span>
              )}
            </button>

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
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
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
