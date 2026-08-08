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
import EmployeesList from './pages/EmployeesList';
import AddEmployee from './pages/AddEmployee';
import VehiclesList from './pages/VehiclesList';
import AddVehicle from './pages/AddVehicle';
import WasteOrdersList from './pages/WasteOrdersList';
import CustomerComplaint from "./pages/CustomerComplaint";
import ComplaintDetails from "./pages/ComplaintDetails";
import TripPlanner from './pages/TripPlanner';
import VehicleHistory from './pages/VehicleHistory';
import LiveMovement from './pages/LiveMovement';
import TripSummaries from './pages/TripSummaries';

function App() {
  const PrivateRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  const RequirePermission = ({ children, requiredPermission }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const roleName = (user.role?.role_name || user.role_name || '').toLowerCase();
    const isAdmin = roleName === 'admin' || roleName === 'super admin';

    if (isAdmin) {
      return children;
    }

    const rawPerms = Array.isArray(user.permissions)
      ? user.permissions
      : Array.isArray(user.role?.permissions)
      ? user.role.permissions
      : [];

    const userPermissions = rawPerms
      .map((p) => (typeof p === 'string' ? p : p?.permission_name || p?.name || ''))
      .filter(Boolean);

    if (requiredPermission) {
      const permsArray = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
      const hasPerm = permsArray.some((p) => userPermissions.includes(p));
      if (!hasPerm) {
        return <Navigate to="/unauthorized" replace />;
      }
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
            path="live-movement"
            element={
              <RequirePermission requiredPermission="live_movement">
                <LiveMovement />
              </RequirePermission>
            }
          />
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
              <RequirePermission requiredPermission="business_region">
                <BusinessRegions />
              </RequirePermission>
            }
          />
          <Route
            path="bwg/business-sub-region"
            element={
              <RequirePermission requiredPermission="business_region">
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
          <Route
            path="waste-collection-requests"
            element={
              <RequirePermission requiredPermission="waste_collection_requests">
                <WasteCollectionRequests />
              </RequirePermission>
            }
          />
          <Route
            path="waste-requests-list"
            element={
              <RequirePermission requiredPermission="waste_requests_list">
                <WasteCollectionRequestsList />
              </RequirePermission>
            }
          />
          <Route
            path="waste-orders"
            element={
              <RequirePermission requiredPermission="order_management">
                <WasteOrdersList />
              </RequirePermission>
            }
          />
          <Route
            path="trip-planner"
            element={
              <RequirePermission requiredPermission="trip_planner">
                <TripPlanner />
              </RequirePermission>
            }
          />
          <Route
            path="trip-summaries"
            element={
              <RequirePermission requiredPermission="trip_summaries.view">
                <TripSummaries />
              </RequirePermission>
            }
          />
          <Route
            path="admin/trip-summaries"
            element={
              <RequirePermission requiredPermission="trip_summaries.view">
                <TripSummaries />
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
          <Route
            path="aggregator-employees"
            element={
              <RequirePermission requiredPermission="aggregator_employee">
                <EmployeesList />
              </RequirePermission>
            }
          />
          <Route
            path="aggregator-employees/add"
            element={
              <RequirePermission requiredPermission="aggregator_employee">
                <AddEmployee />
              </RequirePermission>
            }
          />
          <Route
            path="aggregator-employees/:id/edit"
            element={
              <RequirePermission requiredPermission="aggregator_employee">
                <AddEmployee />
              </RequirePermission>
            }
          />
          <Route
            path="aggregator-vehicles"
            element={
              <RequirePermission requiredPermission="aggregator_vehicle">
                <VehiclesList />
              </RequirePermission>
            }
          />
          <Route
            path="aggregator-vehicles/add"
            element={
              <RequirePermission requiredPermission="aggregator_vehicle">
                <AddVehicle />
              </RequirePermission>
            }
          />
          <Route
            path="/complaints"
            element={
              <RequirePermission requiredPermission="complaints">
                <CustomerComplaint />
              </RequirePermission>
            }
          />

          <Route
            path="/complaints/:id"
            element={
              <RequirePermission requiredPermission="complaints">
                <ComplaintDetails />
              </RequirePermission>
            }
          />


          <Route
            path="aggregator-vehicles/:id/edit"
            element={
              <RequirePermission requiredPermission="aggregator_vehicle">
                <AddVehicle />
              </RequirePermission>
            }
          />
          <Route
            path="vehicle-history"
            element={
              <RequirePermission requiredPermission="aggregator_vehicle">
                <VehicleHistory />
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
