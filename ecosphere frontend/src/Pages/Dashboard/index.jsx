import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiPlus,
  FiTruck,
  FiCreditCard,
  FiGift,
  FiBell,
  FiMapPin,
  FiHelpCircle,
  FiSettings,
  FiBox,
  FiFeather,
  FiArrowRight,
  FiLogOut,
  FiDollarSign,
  FiCheckCircle
} from "react-icons/fi";
import { customerFetch } from "../../api";

export default function CustomerDashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("customer_token");
  const localUser = localStorage.getItem("customer_user");

  // Strict check: if no token, immediately redirect to login and render nothing
  if (!token) {
    window.location.href = "/login";
    return null;
  }

  const [customer, setCustomer] = useState(() => {
    try {
      return localUser ? JSON.parse(localUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState("account"); // "account" | "pickups" | "wallet" etc.

  useEffect(() => {
    // Fetch fresh profile data
    customerFetch("/customer/profile")
      .then((data) => {
        if (data.customer) {
          setCustomer(data.customer);
          localStorage.setItem("customer_user", JSON.stringify(data.customer));
        }
      })
      .catch((err) => {
        console.error("Dashboard profile fetch error:", err);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_user");
    window.location.href = "/login";
  };

  const customerName = customer?.customer_name || "Aarav Mehta";
  const customerEmail = customer?.email || "demo@ecowaste.com";
  const customerMobile = customer?.mobile || "+91 98765 12345";

  const sidebarNavItems = [
    { id: "account", label: "My Account", icon: FiUser },
    { id: "pickups", label: "My Pickups", icon: FiTruck },
    { id: "wallet", label: "Wallet", icon: FiCreditCard },
    { id: "rewards", label: "Rewards", icon: FiGift },
    { id: "payments", label: "Payments", icon: FiDollarSign },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "addresses", label: "Addresses", icon: FiMapPin },
    { id: "support", label: "Support", icon: FiHelpCircle },
    { id: "settings", label: "Settings", icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f6] pt-48 sm:pt-52 lg:pt-56 pb-20 px-4 sm:px-6 lg:px-10">

    </div>
  );
}
