import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Permissions from './pages/Permissions';
import Profile from './pages/Profile';
import Unauthorized from './pages/Unauthorized';
import Locations from './pages/Locations';
import Categories from './pages/Categories';
import SubCategories from './pages/SubCategories';
import Settings from './pages/Settings';
import Corporations from './pages/Corporations';
import Zones from './pages/Zones';
import Wards from './pages/Wards';
import BusinessRegions from './pages/BusinessRegions';
import BusinessSubRegions from './pages/BusinessSubRegions';
import CollectionEvents from './pages/CollectionEvents';
import WasteCollectionRequests from './pages/WasteCollectionRequests';
import WasteCollectionRequestsList from './pages/WasteCollectionRequestsList';
import TimeSlots from './pages/TimeSlots';
import { SettingsProvider } from './context/SettingsContext';
import ModuleCreation from './pages/ModuleCreation';
import Customers from './pages/Customers';



function App() {
  const PrivateRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  const RequirePermission = ({ children, requiredPermission }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const permissions = user.permissions || [];

    if (requiredPermission && !permissions.includes(requiredPermission)) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  };

  return (
    <SettingsProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes inside Layout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route
            path="users"
            element={
              <RequirePermission requiredPermission="user_management">
                <Users />
              </RequirePermission>
            }
          />
          <Route
            path="customers"
            element={
              <RequirePermission requiredPermission="user_management">
                <Customers />
              </RequirePermission>
            }
          />
          <Route
            path="roles"
            element={
              <RequirePermission requiredPermission="role_management">
                <Roles />
              </RequirePermission>
            }
          />
          <Route
            path="permissions"
            element={
              <RequirePermission requiredPermission="permission">
                <Permissions />
              </RequirePermission>
            }
          />
          <Route
            path="profile"
            element={
              <RequirePermission requiredPermission="profile">
                <Profile />
              </RequirePermission>
            }
          />
          <Route
            path="categories"
            element={
              <RequirePermission requiredPermission="category_management">
                <Categories />
              </RequirePermission>
            }
          />
          <Route
            path="sub-categories"
            element={
              <RequirePermission requiredPermission="sub_category_management">
                <SubCategories />
              </RequirePermission>
            }
          />
          <Route
            path="locations"
            element={
              <RequirePermission requiredPermission="locations">
                <Locations />
              </RequirePermission>
            }
          />
          <Route
            path="bwg/corporation"
            element={
              <RequirePermission requiredPermission="bwg_mapping">
                <Corporations />
              </RequirePermission>
            }
          />
          <Route
            path="bwg/zone"
            element={
              <RequirePermission requiredPermission="bwg_mapping">
                <Zones />
              </RequirePermission>
            }
          />
          <Route
            path="bwg/ward"
            element={
              <RequirePermission requiredPermission="bwg_mapping">
                <Wards />
              </RequirePermission>
            }
          />
          <Route
            path="bwg/business-region"
            element={
              <RequirePermission requiredPermission="bwg_mapping">
                <BusinessRegions />
              </RequirePermission>
            }
          />
          <Route
            path="bwg/business-sub-region"
            element={
              <RequirePermission requiredPermission="bwg_mapping">
                <BusinessSubRegions />
              </RequirePermission>
            }
          />
          <Route
            path="bwg/collection-event"
            element={
              <RequirePermission requiredPermission="bwg_mapping">
                <CollectionEvents />
              </RequirePermission>
            }
          />
          <Route
            path="settings"
            element={
              <RequirePermission requiredPermission="settings_management">
                <Settings />
              </RequirePermission>
            }
          />
          <Route path="waste-collection-requests" element={<WasteCollectionRequests />} />
          <Route
            path="waste-requests-list"
            element={
              <RequirePermission requiredPermission="waste_requests_list">
                <WasteCollectionRequestsList />
              </RequirePermission>
            }
          />
          <Route
            path="developer/module-creation"
            element={
              <RequirePermission requiredPermission="module_creation">
                <ModuleCreation />
              </RequirePermission>
            }
          />
          <Route
            path="time-slots"
            element={
              <RequirePermission requiredPermission="time_slot_management">
                <TimeSlots />
              </RequirePermission>
            }
          />
</Route>

        {/* Full Screen Unauthorized Error Page */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </SettingsProvider>
  );
}

export default App;
