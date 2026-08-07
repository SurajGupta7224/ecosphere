import React from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

import MainHeader from "./components/MainHeader";
import HomeScreen from "./components/HomeScreen";
import ServicesGrid from "./components/ServicesGrid";
import WasteStreams from "./components/WasteStreams";
import Footer from "./components/Footer";
import Advertisement from "./components/Advertisement";
import CaseStudies from "./components/CaseStudies";
import Certifications from "./components/Certifications";
import BannerSlider from "./components/BannerSlider";
import WasteStreamss from "./components/WasteStreamss";
import CircularEconomySection from "./components/CircularEconomySection";
import TestimonialsSection from "./components/TestimonialsSection";
import FaqSection from "./components/FaqSection";
import CertificationsPage from "./Pages/Certifications";
import Technology from "./Pages/Technology";
import BsfInnovation from "./Pages/bsfinnovation";
import GpsSolutions from "./Pages/GpsSolutions";
import LoginPage from "./components/login";
import MobileNavbar from "./components/MobileNavbar";
import PartnerWithUs from "./Pages/partnerwithus";
import OurProductsSection from "./components/ProductsSection";
import Segments from "./Pages/Segments";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import RefundPolicy from "./Pages/RefundPolicy";
import CustomerDashboard from "./Pages/Dashboard";
import WasteCollectionRequests from "./Pages/WasteCollectionRequests";

// Strict route protection helper for Customer Dashboard
function RequireCustomerAuth({ children }) {
  const token = localStorage.getItem("customer_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ⭐ This component handles conditional header/footer
function AppContent() {
  const location = useLocation();

  // Pages where we hide the header + footer + mobile navbar
  const noHeaderRoutes = ["/partnerwithus"];

  const hideHeader = noHeaderRoutes.includes(location.pathname);

  return (
    <>
      {/* SHOW HEADER ONLY ON PAGES EXCEPT partnerwithus */}
      {!hideHeader && <MainHeader />}

      <Routes>
        {/* HOME PAGE */}
        <Route
          path="/"
          element={
            <>
              <HomeScreen />
              <BannerSlider />
              <Advertisement />
              <WasteStreamss />
              <ServicesGrid />
              <WasteStreams />
              <CircularEconomySection />
              <OurProductsSection />
              <CaseStudies />
              <Certifications />
              <TestimonialsSection />
              <FaqSection />
            </>
          }
        />

        <Route path="/technology" element={<Technology />} />
        <Route path="/bsfinnovation" element={<BsfInnovation />} />
        <Route path="/gpssolutions" element={<GpsSolutions />} />
        <Route path="/certifications" element={<CertificationsPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* CUSTOMER DASHBOARD (Requires Login) */}
        <Route
          path="/dashboard"
          element={
            <RequireCustomerAuth>
              <CustomerDashboard />
            </RequireCustomerAuth>
          }
        />

        {/* PARTNER WITH US PAGE (header hidden) */}
        <Route path="/partnerwithus" element={<PartnerWithUs />} />
        <Route path="/segments" element={<Segments />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/waste-collection-requests" element={<WasteCollectionRequests />} />
        <Route path="/waste-collection-request" element={<WasteCollectionRequests />} />
      </Routes>

      {/* SHOW FOOTER + MOBILE NAV ONLY IF HEADER IS SHOWN */}
      {!hideHeader && <MobileNavbar />}
      {!hideHeader && <Footer />}
    </>
  );
}

// ⭐ BrowserRouter wrapping the entire app
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
