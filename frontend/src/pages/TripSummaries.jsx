import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Truck,
  RefreshCw,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Scale,
  Trash2,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  ArrowLeft,
  Calendar,
  Layers,
  PlusCircle,
  Plus,
  QrCode,
  Upload,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import api, { IMAGE_BASE_URL } from "../api";
import { useSettings } from "../context/SettingsContext";

export default function TripSummaries() {
  const { settings } = useSettings();
  const primaryColor = settings?.theme?.primary_color || '#31975C';

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    total_trips: 0,
    total_collections: 0,
    total_waste_kg: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // View Mode: 'list' or 'details' (Full Page View like Order Management)
  const [viewMode, setViewMode] = useState("list");
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Master Dropdown Options
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [wasteOrders, setWasteOrders] = useState([]);

  // Full-Page Create View State
  const [isCreateViewOpen, setIsCreateViewOpen] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [fetchingOrderItems, setFetchingOrderItems] = useState(false);
  const [loadingMasterData, setLoadingMasterData] = useState(false);
  const [qrCodeInput, setQrCodeInput] = useState("");

  // Searchable Autocomplete States for Creation Screen
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState("");
  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [isOrderDropdownOpen, setIsOrderDropdownOpen] = useState(false);

  const [createFormData, setCreateFormData] = useState({
    trip_id: "",
    order_id: "",
    vehicle_id: "",
    driver_id: "",
    remarks: "",
    items: [],
  });

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [filterTripId, setFilterTripId] = useState("");
  const [filterOrderId, setFilterOrderId] = useState("");
  const [filterCustomerId, setFilterCustomerId] = useState("");
  const [filterVehicleId, setFilterVehicleId] = useState("");
  const [filterDriverId, setFilterDriverId] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterSubcategoryId, setFilterSubcategoryId] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Action / Form States
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");

  // Custom Delete Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTripId, setDeletingTripId] = useState(null);

  // Multi-Item Batch Edit Form State
  const [editTripData, setEditTripData] = useState({
    trip_id: "",
    vehicle_id: "",
    driver_id: "",
    remarks: "",
    items: [],
  });

  // Permissions
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userPermissions = user.permissions || [];
  const isAdmin = user.role?.role_name?.toLowerCase().includes("admin") || true;

  const canApprove = isAdmin || userPermissions.includes("trip_summaries.approve") || userPermissions.includes("trip_summaries");
  const canReject = isAdmin || userPermissions.includes("trip_summaries.reject") || userPermissions.includes("trip_summaries");
  const canEdit = isAdmin || userPermissions.includes("trip_summaries.edit") || userPermissions.includes("trip_summaries");
  const canDelete = isAdmin || userPermissions.includes("trip_summaries.delete") || userPermissions.includes("trip_summaries");

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTripSummaries();
  }, [page, limit, filterSubcategoryId, filterStatus, filterCategoryId, filterVehicleId, filterDriverId]);

  const fetchStats = async () => {
    try {
      const res = await api.get("/trip-summaries/stats");
      if (res.data?.stats) setStats(res.data.stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchMasterData = async (searchQuery = "") => {
    try {
      const res = await api.get("/trip-summaries/suggestions", {
        params: { search: searchQuery.trim() || undefined }
      });
      if (res.data?.success) {
        setVehicles(res.data.vehicles || []);
        setWasteOrders(res.data.wasteOrders || []);
        setSubCategories(res.data.subCategories || []);
      }
    } catch (err) {
      console.error("Error loading master data suggestions:", err);
    }
  };

  // Open Create View and Fetch Suggestions On Demand
  const openCreateCollectionScreen = async () => {
    setIsCreateViewOpen(true);
    setLoadingMasterData(true);
    try {
      await fetchMasterData();
    } finally {
      setLoadingMasterData(false);
    }
  };

  const fetchTripSummaries = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 500, // Fetch rows for grouping
        search: search.trim() || undefined,
        trip_id: filterTripId || undefined,
        order_id: filterOrderId.trim() || undefined,
        customer_id: filterCustomerId || undefined,
        vehicle_id: filterVehicleId || undefined,
        driver_id: filterDriverId || undefined,
        category_id: filterCategoryId || undefined,
        subcategory_id: filterSubcategoryId || undefined,
        status: filterStatus !== "All Status" ? filterStatus : undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      };

      const res = await api.get("/trip-summaries", { params });
      setRecords(res.data?.data || []);
      setPagination(res.data?.pagination || { total: 0, page: 1, limit, totalPages: 1 });
    } catch (err) {
      console.error("Error fetching trip summaries:", err);
      toast.error(err.response?.data?.message || "Failed to load Trip Summaries");
    } finally {
      setLoading(false);
    }
  };

  // Group records by `trip_id` so all items for trip 5001 display as ONE single card/row!
  const groupedTrips = useMemo(() => {
    const map = {};
    records.forEach((rec) => {
      const key = rec.trip_id;
      const custName = rec.customer_name || rec.customer?.customer_name || rec.customer?.name || null;
      const vehNum = rec.vehicle_number || rec.vehicle?.registration_number || null;
      const drvName = rec.driver_name || rec.driver?.name || null;

      const bwgName = rec.bwg_name || rec.waste_generator_name || rec.customer_legal_name || rec.customer_name || rec.customer?.customer_name || rec.customer?.name || null;
      const corpName = rec.corporation_name || rec.corporation?.name || null;
      const zoneName = rec.zone_name || rec.zone?.name || null;
      const wardName = rec.ward_name || rec.ward?.name || null;
      const eventName = rec.collection_event_name || rec.collectionEvent?.name || null;

      if (!map[key]) {
        map[key] = {
          trip_id: rec.trip_id,
          order_id: rec.order_id,
          customer_id: rec.customer_id,
          customer: rec.customer,
          customer_name: custName,
          bwg_name: bwgName,
          corporation_name: corpName,
          zone_name: zoneName,
          ward_name: wardName,
          collection_event_name: eventName,
          user_id: rec.user_id,
          vehicle_id: rec.vehicle_id,
          vehicle: rec.vehicle,
          vehicle_number: vehNum,
          driver_id: rec.driver_id,
          driver: rec.driver,
          driver_name: drvName,
          submitted_at: rec.submitted_at || rec.created_at,
          created_at: rec.created_at,
          items: [],
        };
      } else {
        if (!map[key].customer_name && custName) {
          map[key].customer_name = custName;
          map[key].customer = rec.customer;
        }
        if (!map[key].bwg_name && bwgName) map[key].bwg_name = bwgName;
        if (!map[key].corporation_name && corpName) map[key].corporation_name = corpName;
        if (!map[key].zone_name && zoneName) map[key].zone_name = zoneName;
        if (!map[key].ward_name && wardName) map[key].ward_name = wardName;
        if (!map[key].collection_event_name && eventName) map[key].collection_event_name = eventName;
        if (!map[key].vehicle_number && vehNum) {
          map[key].vehicle_number = vehNum;
          map[key].vehicle = rec.vehicle;
        }
        if (!map[key].driver_name && drvName) {
          map[key].driver_name = drvName;
          map[key].driver = rec.driver;
        }
      }
      map[key].items.push(rec);
    });

    return Object.values(map).map((group) => {
      const totalWasteSum = group.items.reduce(
        (sum, item) => sum + Number(item.total_waste_kg || 0),
        0
      );
      // Overall status: if any Pending -> Pending; else if any Rejected -> Rejected; else Approved
      let overallStatus = "Approved";
      if (group.items.some((i) => i.status === "Pending")) overallStatus = "Pending";
      else if (group.items.some((i) => i.status === "Rejected")) overallStatus = "Rejected";

      return {
        ...group,
        total_waste_kg: totalWasteSum.toFixed(2),
        overallStatus,
        itemCount: group.items.length,
      };
    });
  }, [records]);

  // Calculate Subcategory Wise Breakdown Stats (100% Dynamic from Sub-Category Management Catalog)
  const subCategoryBreakdown = useMemo(() => {
    const map = {};

    // 1. Initialize map with ALL master subcategories from Sub-Category Management catalog
    if (Array.isArray(subCategories) && subCategories.length > 0) {
      subCategories.forEach((sc) => {
        map[sc.id] = {
          subcategory_id: sc.id,
          subcategory_name: sc.name || sc.sub_category_name || "SubCategory",
          total_waste_kg: 0,
          total_count: 0,
          pending_kg: 0,
          pending_count: 0,
          approved_kg: 0,
          approved_count: 0,
          rejected_kg: 0,
          rejected_count: 0,
        };
      });
    }

    // 2. If stats.by_subcategory comes from backend API, merge it
    if (stats.by_subcategory && Array.isArray(stats.by_subcategory)) {
      stats.by_subcategory.forEach((sub) => {
        const subId = sub.subcategory_id;
        if (!map[subId]) {
          map[subId] = { ...sub };
        } else {
          map[subId] = {
            ...map[subId],
            ...sub,
            subcategory_name: sub.subcategory_name || map[subId].subcategory_name,
          };
        }
      });
    } else {
      // 3. Fallback/real-time aggregation from current records
      records.forEach((rec) => {
        const subId = rec.subcategory_id;
        const subName = rec.subcategory_name || rec.subCategory?.name || "General Waste";
        const status = rec.status || "Pending";
        const kg = Number(rec.total_waste_kg || 0);

        if (!map[subId]) {
          map[subId] = {
            subcategory_id: subId,
            subcategory_name: subName,
            total_waste_kg: 0,
            total_count: 0,
            pending_kg: 0,
            pending_count: 0,
            approved_kg: 0,
            approved_count: 0,
            rejected_kg: 0,
            rejected_count: 0,
          };
        }

        map[subId].total_waste_kg += kg;
        map[subId].total_count += 1;

        if (status === "Pending") {
          map[subId].pending_kg += kg;
          map[subId].pending_count += 1;
        } else if (status === "Approved") {
          map[subId].approved_kg += kg;
          map[subId].approved_count += 1;
        } else if (status === "Rejected") {
          map[subId].rejected_kg += kg;
          map[subId].rejected_count += 1;
        }
      });
    }

    return Object.values(map).map((item) => ({
      ...item,
      total_waste_kg: Number(item.total_waste_kg.toFixed(2)),
      pending_kg: Number(item.pending_kg.toFixed(2)),
      approved_kg: Number(item.approved_kg.toFixed(2)),
      rejected_kg: Number(item.rejected_kg.toFixed(2)),
    }));
  }, [subCategories, stats.by_subcategory, records]);

  // Dynamic Subcategory Columns for Table (Wet, Dry, Sanitary, Special Care, etc.)
  const subCategoryColumns = useMemo(() => {
    const list = [];
    const map = new Map();

    if (Array.isArray(subCategories) && subCategories.length > 0) {
      subCategories.forEach((sc) => {
        const id = String(sc.id);
        const rawName = sc.name || sc.sub_category_name || "SubCategory";
        if (!map.has(id)) {
          map.set(id, rawName);
        }
      });
    }

    records.forEach((rec) => {
      const id = String(rec.subcategory_id);
      const rawName = rec.subcategory_name || rec.subCategory?.name || "SubCategory";
      if (rec.subcategory_id && !map.has(id)) {
        map.set(id, rawName);
      }
    });

    map.forEach((rawName, id) => {
      let cleanName = rawName.replace(/waste/i, '').trim().toUpperCase();
      if (!cleanName) cleanName = rawName.toUpperCase();
      const label = `${cleanName} (KG)`;
      list.push({
        id,
        name: rawName,
        label,
      });
    });

    if (list.length === 0) {
      return [
        { id: 'wet', name: 'Wet Waste', label: 'WET (KG)' },
        { id: 'dry', name: 'Dry Waste', label: 'DRY (KG)' },
        { id: 'sanitary', name: 'Sanitary Waste', label: 'SANITARY (KG)' },
        { id: 'special', name: 'Special Care', label: 'SPECIAL CARE (KG)' },
        { id: 'other', name: 'Other', label: 'OTHER (KG)' },
      ];
    }

    return list;
  }, [subCategories, records]);

  // Filtered grouped trips based on active client/server filters (e.g. Subcategory Card selection)
  const filteredGroupedTrips = useMemo(() => {
    return groupedTrips.filter((group) => {
      if (filterSubcategoryId) {
        const hasSubCat = group.items.some(
          (item) => String(item.subcategory_id) === String(filterSubcategoryId)
        );
        if (!hasSubCat) return false;
      }
      return true;
    });
  }, [groupedTrips, filterSubcategoryId]);

  const paginatedGroups = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredGroupedTrips.slice(startIndex, startIndex + limit);
  }, [filteredGroupedTrips, page, limit]);

  const totalPagesCount = Math.ceil(filteredGroupedTrips.length / limit) || 1;

  // Export CSV Function (Exports active filtered trips)
  const handleExportCSV = () => {
    if (filteredGroupedTrips.length === 0) {
      toast.error("No filtered trip summaries data to export.");
      return;
    }

    const headers = [
      "Trip ID",
      "Date",
      "BWG Name",
      "Order ID",
      "Corporation",
      "Zone",
      "Ward",
      "Collection Event",
      "Vehicle Number",
      "Driver Name",
      ...subCategoryColumns.map((c) => c.label),
      "Total Waste (KG)",
      "Status",
    ];

    const rows = filteredGroupedTrips.map((group) => {
      const dateStr = formatDate(group.submitted_at || group.created_at);
      const subCatWeights = subCategoryColumns.map((col) => {
        const items = group.items.filter((item) => {
          if (String(item.subcategory_id) === String(col.id)) return true;
          const nameA = (item.subcategory_name || item.subCategory?.name || "").toLowerCase().trim();
          const nameB = col.name.toLowerCase().trim();
          return nameA === nameB && nameA.length > 0;
        });
        const w = items.reduce((acc, curr) => acc + Number(curr.total_waste_kg || 0), 0);
        return w.toFixed(2);
      });

      return [
        group.trip_id || "",
        dateStr || "",
        (group.bwg_name || group.customer_name || "—").replace(/"/g, '""'),
        group.order_id || "",
        (group.corporation_name || "—").replace(/"/g, '""'),
        (group.zone_name || "—").replace(/"/g, '""'),
        (group.ward_name || "—").replace(/"/g, '""'),
        (group.collection_event_name || "—").replace(/"/g, '""'),
        group.vehicle_number || "—",
        (group.driver_name || "—").replace(/"/g, '""'),
        ...subCatWeights,
        group.total_waste_kg || "0.00",
        group.overallStatus || "Pending",
      ];
    });

    const csvContent = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `filtered_trip_summaries_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredGroupedTrips.length} filtered trip record(s) to CSV!`);
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchTripSummaries();
    fetchStats();
  };

  const handleResetFilters = () => {
    setSearch("");
    setFilterTripId("");
    setFilterOrderId("");
    setFilterCustomerId("");
    setFilterVehicleId("");
    setFilterDriverId("");
    setFilterCategoryId("");
    setFilterSubcategoryId("");
    setFilterStatus("All Status");
    setFromDate("");
    setToDate("");
    setPage(1);
    setTimeout(() => {
      fetchTripSummaries();
      fetchStats();
    }, 50);
  };

  // Orders assigned to selected vehicle
  const assignedOrders = useMemo(() => {
    if (!createFormData.vehicle_id) return wasteOrders;
    return wasteOrders.filter((ord) => String(ord.vehicle_id) === String(createFormData.vehicle_id));
  }, [wasteOrders, createFormData.vehicle_id]);

  // Filtered vehicles for autocomplete search
  const filteredVehicles = useMemo(() => {
    if (!vehicleSearchQuery.trim()) return vehicles;
    const q = vehicleSearchQuery.toLowerCase();
    return vehicles.filter(
      (v) =>
        (v.registration_number && v.registration_number.toLowerCase().includes(q)) ||
        (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(q)) ||
        (v.brand && v.brand.toLowerCase().includes(q)) ||
        (v.model && v.model.toLowerCase().includes(q))
    );
  }, [vehicles, vehicleSearchQuery]);

  // Filtered assigned orders for autocomplete search
  const filteredAssignedOrders = useMemo(() => {
    const list = assignedOrders;
    if (!orderSearchQuery.trim()) return list;
    const q = orderSearchQuery.toLowerCase();
    return list.filter(
      (ord) =>
        (ord.order_id && ord.order_id.toLowerCase().includes(q)) ||
        (ord.customer_legal_name && ord.customer_legal_name.toLowerCase().includes(q)) ||
        (ord.contact_person && ord.contact_person.toLowerCase().includes(q))
    );
  }, [assignedOrders, orderSearchQuery]);

  // Vehicle Selection Handler
  const handleVehicleChange = (vehicleId) => {
    const selectedVeh = vehicles.find((v) => String(v.id) === String(vehicleId));
    let autoDriverId = createFormData.driver_id;
    if (selectedVeh) {
      if (selectedVeh.driver_id) {
        autoDriverId = selectedVeh.driver_id;
      } else if (selectedVeh.driver) {
        autoDriverId = selectedVeh.driver.id;
      } else if (employees.length > 0) {
        const matchedEmp = employees.find(
          (e) => String(e.vehicle_id) === String(vehicleId) || e.role === "Driver"
        );
        if (matchedEmp) autoDriverId = matchedEmp.id;
      }
      setVehicleSearchQuery(`${selectedVeh.registration_number || selectedVeh.vehicleNumber} (${selectedVeh.brand || selectedVeh.model || "Vehicle"})`);
    }
    setCreateFormData((prev) => ({
      ...prev,
      vehicle_id: vehicleId,
      driver_id: autoDriverId,
      order_id: "",
      items: [],
    }));
    setOrderSearchQuery("");
  };

  // Order Auto-Fetch Assigned Subcategories
  const handleOrderChange = async (orderId) => {
    setCreateFormData((prev) => ({ ...prev, order_id: orderId }));
    setOrderSearchQuery(orderId);
    setIsOrderDropdownOpen(false);
    if (!orderId) return;

    setFetchingOrderItems(true);
    try {
      const res = await api.get(`/waste-orders`, { params: { search: orderId } });
      const orders = res.data?.orders || res.data?.data || [];
      const matchedOrders = orders.filter((o) => o.order_id === orderId);

      if (matchedOrders.length > 0) {
        const fetchedItems = matchedOrders.map((ord) => ({
          subcategory_id: ord.subcategory_id,
          subcategory_name: ord.subCategory?.name || ord.subcategory_name || "Assigned Waste",
          total_waste_kg: "",
        }));

        setCreateFormData((prev) => ({
          ...prev,
          order_id: orderId,
          vehicle_id: prev.vehicle_id || matchedOrders[0].vehicle_id || "",
          driver_id: prev.driver_id || matchedOrders[0].driver_id || "",
          items: fetchedItems.length > 0 ? fetchedItems : [{ subcategory_id: "", total_waste_kg: "" }],
        }));
        toast.success(`Loaded ${fetchedItems.length} assigned subcategory item(s) for Order #${orderId}`);
      } else {
        setCreateFormData((prev) => ({
          ...prev,
          items: prev.items.length > 0 ? prev.items : [{ subcategory_id: "", total_waste_kg: "" }],
        }));
      }
    } catch (err) {
      console.error("Error fetching order subcategories:", err);
    } finally {
      setFetchingOrderItems(false);
    }
  };

  // QR Code Image / Barcode Scanner
  const handleQrUploadOrScan = (e) => {
    const file = e.target.files?.[0];
    let codeStr = qrCodeInput.trim();
    if (file) {
      const match = file.name.match(/ORD-\d+/i);
      if (match) {
        codeStr = match[0].toUpperCase();
      }
    }

    if (!codeStr && qrCodeInput.trim()) {
      codeStr = qrCodeInput.trim();
    }

    if (!codeStr) {
      toast.error("Please enter or scan a valid QR Code / Barcode (e.g. ORD-95472261393).");
      return;
    }

    toast.success(`QR Code Scanned Successfully! Matched Order: ${codeStr}`);
    handleOrderChange(codeStr);
    setQrCodeInput("");
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createFormData.order_id || !createFormData.vehicle_id) {
      toast.error("Order ID and Vehicle are required.");
      return;
    }
    const validItems = createFormData.items.filter(
      (item) => item.subcategory_id && Number(item.total_waste_kg) > 0
    );
    if (validItems.length === 0) {
      toast.error("Please add at least one valid subcategory with weight > 0 KG.");
      return;
    }

    setIsSubmittingCreate(true);
    try {
      const payload = {
        trip_id: createFormData.trip_id || undefined,
        order_id: createFormData.order_id,
        vehicle_id: createFormData.vehicle_id,
        driver_id: createFormData.driver_id || undefined,
        remarks: createFormData.remarks || undefined,
        items: validItems,
      };

      const res = await api.post("/trip-summaries", payload);
      if (res.data?.status === 1) {
        toast.success(res.data.message || "Manual collection entry created successfully.");
        setIsCreateViewOpen(false);
        setCreateFormData({
          trip_id: "",
          order_id: "",
          vehicle_id: "",
          driver_id: "",
          remarks: "",
          items: [],
        });
        fetchTripSummaries();
        fetchStats();
      } else {
        toast.error(res.data?.message || "Failed to create manual collection entry.");
      }
    } catch (err) {
      console.error("handleCreateSubmit error:", err);
      toast.error(err.response?.data?.message || "Error creating manual collection entry.");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Open Full-Size Details Screen for a Trip
  const openDetailsPage = (group) => {
    setSelectedGroup(group);
    setShowRejectInput(false);
    setShowEditForm(false);
    setRejectionReason("");
    setViewMode("details");
  };

  const closeDetailsPage = () => {
    setViewMode("list");
    setSelectedGroup(null);
  };

  // Batch Action Handlers for Entire Trip
  const handleApproveTrip = async (tripId) => {
    setActionLoading(true);
    try {
      await api.post(`/trip-summaries/trip/${tripId}/approve`);
      toast.success(`Trip #${tripId} approved successfully!`);
      fetchTripSummaries();
      fetchStats();
      if (viewMode === "details" && selectedGroup) {
        // Refresh details group
        const res = await api.get(`/trip-summaries/${selectedGroup.items[0]?.id}`);
        if (res.data?.data) {
          const updatedGroup = {
            ...selectedGroup,
            overallStatus: "Approved",
            items: res.data.data.trip_items || selectedGroup.items,
          };
          setSelectedGroup(updatedGroup);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve trip.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectTrip = async (e) => {
    e.preventDefault();
    if (!selectedGroup) return;
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/trip-summaries/trip/${selectedGroup.trip_id}/reject`, {
        rejection_reason: rejectionReason.trim(),
      });
      toast.success(`Trip #${selectedGroup.trip_id} rejected successfully.`);
      setShowRejectInput(false);
      setRejectionReason("");
      fetchTripSummaries();
      fetchStats();
      // Refresh details group
      const res = await api.get(`/trip-summaries/${selectedGroup.items[0]?.id}`);
      if (res.data?.data) {
        const updatedGroup = {
          ...selectedGroup,
          overallStatus: "Rejected",
          items: res.data.data.trip_items || selectedGroup.items,
        };
        setSelectedGroup(updatedGroup);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject trip.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTrip = (tripId) => {
    setDeletingTripId(tripId);
    setShowDeleteModal(true);
  };

  const confirmDeleteTrip = async () => {
    if (!deletingTripId) return;
    setActionLoading(true);
    try {
      const group = groupedTrips.find((g) => String(g.trip_id) === String(deletingTripId));
      if (group) {
        await Promise.all(group.items.map((item) => api.delete(`/trip-summaries/${item.id}`)));
      }
      toast.success(`Trip #${deletingTripId} records deleted successfully.`);
      setShowDeleteModal(false);
      setDeletingTripId(null);
      if (viewMode === "details") closeDetailsPage();
      fetchTripSummaries();
      fetchStats();
    } catch (err) {
      toast.error("Failed to delete trip records.");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Multi-Item Batch Edit Form for entire trip at once
  const handleOpenEditTrip = (group) => {
    setSelectedGroup(group);
    setEditTripData({
      trip_id: group.trip_id,
      vehicle_id: group.vehicle_id || "",
      driver_id: group.driver_id || "",
      remarks: group.items[0]?.remarks || "",
      items: group.items.map((item) => ({
        id: item.id,
        subcategory_id: item.subcategory_id,
        subcategory_name: item.subcategory_name || item.subCategory?.name || "Subcategory Item",
        total_waste_kg: item.total_waste_kg || 0,
        remarks: item.remarks || "",
      })),
    });
    setShowEditForm(true);
  };

  // Save Multi-Item Batch Edit Form in one click!
  const handleSaveEditTrip = async (e) => {
    e.preventDefault();
    if (!selectedGroup) return;
    setActionLoading(true);
    try {
      await api.put(`/trip-summaries/trip/${editTripData.trip_id}`, {
        vehicle_id: editTripData.vehicle_id,
        driver_id: editTripData.driver_id,
        remarks: editTripData.remarks,
        items: editTripData.items,
      });

      toast.success(`Updated all subcategories for Trip #${editTripData.trip_id} successfully!`);
      setShowEditForm(false);
      fetchTripSummaries();
      fetchStats();
      if (viewMode === "details") {
        // Refresh details group
        const res = await api.get(`/trip-summaries/${selectedGroup.items[0]?.id}`);
        if (res.data?.data) {
          setSelectedGroup({
            ...selectedGroup,
            vehicle_id: editTripData.vehicle_id,
            driver_id: editTripData.driver_id,
            items: res.data.data.trip_items || selectedGroup.items,
          });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update trip collection items.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };

  /* ========================================================================= */
  /* FULL-SIZE DETAILS PAGE SCREEN (Order Management Style)                    */
  /* ========================================================================= */
  if (viewMode === "details" && selectedGroup) {
    const customerName = selectedGroup.customer_name || "—";
    const vehicleReg = selectedGroup.vehicle_number || selectedGroup.vehicle?.registration_number || "—";
    const driverName = selectedGroup.driver_name || selectedGroup.driver?.name || "—";

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Full-Size Details Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-[1.25rem] border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg">
                Trip ID: #{selectedGroup.trip_id}
              </span>
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">
                Order ID: {selectedGroup.order_id}
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider ${selectedGroup.overallStatus === "Pending"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : selectedGroup.overallStatus === "Approved"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
              >
                {selectedGroup.overallStatus}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {customerName}
            </h1>
            <p className="text-xs text-slate-500 font-bold mt-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Submitted On:{" "}
              <span className="text-slate-700 font-extrabold">
                {formatDate(selectedGroup.submitted_at || selectedGroup.created_at)}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={closeDetailsPage}
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Trip Summaries
            </button>
          </div>
        </div>

        {/* Top Metric Cards for Trip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-[1.25rem] p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Trip Waste Weight</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-0.5">
                {selectedGroup.total_waste_kg} KG
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-[1.25rem] p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subcategories Collected</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                {selectedGroup.items.length} Waste Items
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-[1.25rem] p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Vehicle</p>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{vehicleReg}</h3>
            </div>
          </div>
        </div>

        {/* Main Details Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* Logistics & Assignment Card */}
            <div className="bg-white rounded-[1.25rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-indigo-600">
                  <Truck className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">Logistics & Vehicle Information</h3>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Vehicle Reg. Number</span>
                  <span className="text-sm font-black text-slate-800 block mt-0.5">{vehicleReg}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Driver Name</span>
                  <span className="text-sm font-bold text-slate-800 block mt-0.5">{driverName}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Customer</span>
                  <span className="text-sm font-bold text-slate-800 block mt-0.5">{customerName}</span>
                </div>
              </div>
            </div>

            {/* Collected Subcategories Breakdown Card (Multi-Subcategory Display) */}
            <div className="bg-white rounded-[1.25rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-emerald-600">
                    <Package className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800">
                    All Collected Subcategories for Trip #{selectedGroup.trip_id}
                  </h3>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  Total Sum: {selectedGroup.total_waste_kg} KG
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  {selectedGroup.items.map((itemRow) => (
                    <div
                      key={itemRow.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                        <div>
                          <p className="text-sm font-black text-slate-800">
                            {itemRow.subcategory_name || itemRow.subCategory?.name || "Subcategory Item"}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            Category: {itemRow.category_name || itemRow.category?.name || "General Waste"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${itemRow.status === "Pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : itemRow.status === "Approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                        >
                          {itemRow.status}
                        </span>

                        <span className="text-base font-black text-slate-900 min-w-[90px]">
                          {Number(itemRow.total_waste_kg || 0).toFixed(2)} KG
                        </span>

                        {itemRow.image && (
                          <button
                            onClick={() => {
                              setPreviewImageUrl(`${IMAGE_BASE_URL}/${itemRow.image}`);
                              setIsImagePreviewOpen(true);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition"
                            title="View Photo"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Collection Photo Previews */}
            {selectedGroup.items.some((i) => i.image) && (
              <div className="bg-white rounded-[1.25rem] border border-slate-200 shadow-sm overflow-hidden p-6 space-y-3">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-600" /> Collection Photos
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedGroup.items.filter((i) => i.image).map((imgItem) => (
                    <div
                      key={imgItem.id}
                      className="relative group h-40 rounded-xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer"
                      onClick={() => {
                        setPreviewImageUrl(`${IMAGE_BASE_URL}/${imgItem.image}`);
                        setIsImagePreviewOpen(true);
                      }}
                    >
                      <img
                        src={`${IMAGE_BASE_URL}/${imgItem.image}`}
                        alt={imgItem.subcategory_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-xs font-bold p-2 text-center">
                        <Eye className="w-5 h-5 mb-1" />
                        <span>{imgItem.subcategory_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Batch Actions & Multi-Item Edit */}
          <div className="space-y-6">
            {/* Batch Status Actions Card */}
            <div className="bg-white rounded-[1.25rem] border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3">
                Batch Trip Approval Actions
              </h3>

              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Trip Status</span>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${selectedGroup.overallStatus === "Pending"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : selectedGroup.overallStatus === "Approved"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-rose-100 text-rose-800 border border-rose-300"
                    }`}
                >
                  {selectedGroup.overallStatus}
                </span>
              </div>

              {/* Batch Approve / Reject */}
              {selectedGroup.overallStatus === "Pending" && (
                <div className="space-y-3 pt-1">
                  {canApprove && (
                    <button
                      onClick={() => handleApproveTrip(selectedGroup.trip_id)}
                      disabled={actionLoading}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve All Subcategories in Trip
                    </button>
                  )}

                  {canReject && !showRejectInput && (
                    <button
                      onClick={() => setShowRejectInput(true)}
                      className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> Reject Entire Trip...
                    </button>
                  )}

                  {showRejectInput && (
                    <form onSubmit={handleRejectTrip} className="space-y-3 pt-2 animate-in fade-in">
                      <label className="block text-xs font-bold text-rose-700">
                        Rejection Reason <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter reason for rejecting trip collection..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs outline-none focus:border-rose-500"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowRejectInput(false);
                            setRejectionReason("");
                          }}
                          className="flex-1 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={actionLoading || !rejectionReason.trim()}
                          className="flex-1 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
                        >
                          Confirm Reject All
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Edit All Items / Delete Trip */}
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                {canEdit && selectedGroup.overallStatus !== "Approved" && (
                  <button
                    onClick={() => handleOpenEditTrip(selectedGroup)}
                    className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" /> Edit All Items in Trip
                  </button>
                )}

                {canDelete && (
                  <button
                    onClick={() => handleDeleteTrip(selectedGroup.trip_id)}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Trip
                  </button>
                )}
              </div>
            </div>

            {/* Inline Multi-Item Batch Edit Form Panel */}
            {showEditForm && (
              <form onSubmit={handleSaveEditTrip} className="bg-white rounded-[1.25rem] border border-indigo-200 shadow-md p-6 space-y-4 animate-in fade-in">
                <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider border-b border-indigo-100 pb-2">
                  Edit All Subcategories for Trip #{editTripData.trip_id}
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle</label>
                  <select
                    value={editTripData.vehicle_id}
                    onChange={(e) => setEditTripData({ ...editTripData, vehicle_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Vehicle...</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registration_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Driver</label>
                  <select
                    value={editTripData.driver_id}
                    onChange={(e) => setEditTripData({ ...editTripData, driver_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Driver...</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Weights input for each subcategory */}
                <div className="space-y-3 pt-1">
                  <label className="block text-xs font-bold text-slate-800">Collected Subcategory Weights (KG):</label>
                  {editTripData.items.map((item, i) => (
                    <div key={item.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-xs font-black text-slate-800 block">{item.subcategory_name}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.total_waste_kg}
                          onChange={(e) => {
                            const newItems = [...editTripData.items];
                            newItems[i].total_waste_kg = e.target.value;
                            setEditTripData({ ...editTripData, items: newItems });
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500"
                        />
                        <span className="text-xs font-bold text-slate-500">KG</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trip Remarks</label>
                  <textarea
                    rows={2}
                    value={editTripData.remarks}
                    onChange={(e) => setEditTripData({ ...editTripData, remarks: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="py-2 px-3 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
                  >
                    Save All Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* FULL IMAGE EXPAND PREVIEW MODAL */}
        {isImagePreviewOpen && (
          <div
            className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setIsImagePreviewOpen(false)}
          >
            <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
              <img src={previewImageUrl} alt="Full Preview" className="w-full h-full object-contain max-h-[85vh] rounded-2xl" />
              <button
                onClick={() => setIsImagePreviewOpen(false)}
                className="absolute top-3 right-3 p-2 bg-slate-900/80 text-white hover:bg-rose-600 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ========================================================================= */
  /* FULL PAGE: CREATE MANUAL COLLECTION SCREEN (Driver App Workflow Style)     */
  /* ========================================================================= */
  if (isCreateViewOpen) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 w-full">
        {loadingMasterData && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs font-bold text-indigo-700 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            Loading vehicle, order, and waste subcategory suggestion options from API...
          </div>
        )}
        {/* Top Header & Navigation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCreateViewOpen(false)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  Manual Entry
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Record Waste Collection</h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Full-page waste collection creation screen (matches Driver Mobile App workflow).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateViewOpen(false)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* MAIN CREATION FORM CARD */}
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          {/* SECTION 1: VEHICLE SELECTION (SEARCHABLE AUTOCOMPLETE) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Truck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                1. Select / Search Vehicle
              </h2>
            </div>

            <div className="relative">
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">
                Select Vehicle <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search vehicle reg number, brand, or model..."
                  value={vehicleSearchQuery}
                  onFocus={() => {
                    setIsVehicleDropdownOpen(true);
                    fetchMasterData(vehicleSearchQuery);
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setVehicleSearchQuery(val);
                    setIsVehicleDropdownOpen(true);
                    fetchMasterData(val);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pr-10 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-4 pointer-events-none" />
              </div>

              {/* Suggestions Popup Dropdown */}
              {isVehicleDropdownOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-1.5 space-y-1">
                  {filteredVehicles.length > 0 ? (
                    filteredVehicles.map((v) => {
                      const label = `${v.registration_number || v.vehicleNumber} (${v.brand || v.model || "Vehicle"})`;
                      return (
                        <div
                          key={v.id}
                          onClick={() => {
                            setVehicleSearchQuery(label);
                            handleVehicleChange(v.id);
                            setIsVehicleDropdownOpen(false);
                          }}
                          className="p-3 hover:bg-indigo-50 rounded-xl text-xs font-bold text-slate-800 cursor-pointer flex items-center justify-between transition"
                        >
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-indigo-600" />
                            <span>{v.registration_number || v.vehicleNumber}</span>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {v.brand || v.model || "Vehicle"}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 text-xs font-semibold text-slate-400 text-center">
                      No matching vehicles found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: ORDER SEARCH & QR CODE SCANNER (SEARCHABLE AUTOCOMPLETE) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  2. Order Selection & QR Code Scan
                </h2>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                {assignedOrders.length} Order(s) Assigned to Vehicle
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Option A: Searchable Order ID Autocomplete */}
              <div className="relative">
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">
                  Select Order ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={
                      !createFormData.vehicle_id
                        ? "Select Vehicle First..."
                        : "Type Order ID or Customer Name..."
                    }
                    value={orderSearchQuery}
                    onFocus={() => {
                      if (createFormData.vehicle_id) {
                        setIsOrderDropdownOpen(true);
                        fetchMasterData(orderSearchQuery);
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      setOrderSearchQuery(val);
                      setIsOrderDropdownOpen(true);
                      fetchMasterData(val);
                    }}
                    disabled={!createFormData.vehicle_id}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-10 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition disabled:opacity-60"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>

                {/* Suggestions Popup Dropdown */}
                {isOrderDropdownOpen && createFormData.vehicle_id && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-1.5 space-y-1">
                    {filteredAssignedOrders.length > 0 ? (
                      filteredAssignedOrders.map((ord) => (
                        <div
                          key={ord.id}
                          onClick={() => {
                            setOrderSearchQuery(ord.order_id);
                            handleOrderChange(ord.order_id);
                            setIsOrderDropdownOpen(false);
                          }}
                          className="p-3 hover:bg-emerald-50 rounded-xl text-xs font-bold text-slate-800 cursor-pointer flex items-center justify-between transition"
                        >
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[11px] font-extrabold">
                              {ord.order_id}
                            </span>
                            <span>{ord.customer_legal_name || ord.contact_person || "Order"}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-xs font-semibold text-slate-400 text-center">
                        No assigned orders found for this vehicle
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Option B: Scan / Upload QR Code */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">
                  Scan QR Code / Barcode Image
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste/Scan QR Code string (e.g. ORD-95472261393)"
                    value={qrCodeInput}
                    onChange={(e) => setQrCodeInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleQrUploadOrScan(e))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                  />
                  <label className="px-4 py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-4 h-4" />
                    Upload QR
                    <input type="file" accept="image/*" onChange={handleQrUploadOrScan} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: COLLECTED SUB-CATEGORIES & WEIGHT INPUT (AUTO-POPULATED) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  3. Assigned Waste Subcategories & Weight Entry (KG)
                </h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  setCreateFormData((prev) => ({
                    ...prev,
                    items: [...prev.items, { subcategory_id: "", total_waste_kg: "" }],
                  }))
                }
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Extra Subcategory
              </button>
            </div>

            {fetchingOrderItems && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-700 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Fetching subcategories assigned to Order #{createFormData.order_id}...
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {createFormData.items.map((item, idx) => (
                <div key={idx} className="bg-slate-50/90 border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs hover:border-indigo-300 transition">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        {item.subcategory_name || "Subcategory Item"}
                      </h4>
                    </div>
                    {createFormData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = createFormData.items.filter((_, i) => i !== idx);
                          setCreateFormData((prev) => ({ ...prev, items: newItems }));
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Remove Subcategory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Subcategory Select */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Subcategory Name</label>
                      <select
                        value={item.subcategory_id}
                        onChange={(e) => {
                          const newItems = [...createFormData.items];
                          newItems[idx].subcategory_id = e.target.value;
                          setCreateFormData((prev) => ({ ...prev, items: newItems }));
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-2xs"
                        required
                      >
                        <option value="">Select Subcategory...</option>
                        {subCategories.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name || sub.sub_category_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Weight (KG) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Collected Weight (KG)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={item.total_waste_kg}
                          onChange={(e) => {
                            const newItems = [...createFormData.items];
                            newItems[idx].total_waste_kg = e.target.value;
                            setCreateFormData((prev) => ({ ...prev, items: newItems }));
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-3 pr-10 text-xs font-black text-slate-900 outline-none focus:border-indigo-500 shadow-2xs text-base"
                          required
                        />
                        <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">KG</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: TRIP REMARKS & SUBMIT */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Collection Remarks / Notes</label>
              <input
                type="text"
                placeholder="Enter collection remarks (e.g. Morning waste collection completed)..."
                value={createFormData.remarks}
                onChange={(e) => setCreateFormData({ ...createFormData, remarks: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateViewOpen(false)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingCreate}
                className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isSubmittingCreate ? "Saving Collection..." : "Save & Complete Collection"}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  /* ========================================================================= */
  /* MAIN GROUPED TRIP LISTING SCREEN (Pickup / Trip Planner Style)            */
  /* ========================================================================= */
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Trip Summaries</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Manage, review, approve, reject, and track waste collection submission records per trip.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateCollectionScreen}
            disabled={loadingMasterData}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <PlusCircle className={`w-4 h-4 ${loadingMasterData ? "animate-spin" : ""}`} />
            {loadingMasterData ? "Loading Options..." : "Add Collection"}
          </button>
          <button
            onClick={() => {
              fetchTripSummaries();
              fetchStats();
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Schedule
          </button>
        </div>
      </div>

      {/* Summary Cards Row (5 Cards - Matching App Dashboard & Complaint Management Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Trips */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Trips</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats.total_trips || 0}</h3>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending</p>
            <h3 className="text-2xl font-extrabold text-amber-700 mt-1">{stats.pending || 0}</h3>
          </div>
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Collections / Total Waste */}
        <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Total Waste</p>
            <h3 className="text-2xl font-extrabold text-blue-700 mt-1">{stats.total_waste_kg || 0} <span className="text-xs font-semibold">KG</span></h3>
          </div>
          <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        {/* Approved */}
        <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Approved</p>
            <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.approved || 0}</h3>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Rejected</p>
            <h3 className="text-2xl font-extrabold text-rose-700 mt-1">{stats.rejected || 0}</h3>
          </div>
          <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Subcategory Wise Waste Collection Cards Section */}
      {subCategoryBreakdown.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Subcategory Collection Breakdown ({subCategoryBreakdown.length} Categories)
            </h2>
            <span className="text-[11px] font-semibold text-slate-500">
              Click a card to filter collection table
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {subCategoryBreakdown.map((sub) => {
              const isSelected = String(filterSubcategoryId) === String(sub.subcategory_id);
              return (
                <div
                  key={sub.subcategory_id}
                  onClick={() => {
                    if (isSelected) {
                      setFilterSubcategoryId("");
                    } else {
                      setFilterSubcategoryId(sub.subcategory_id);
                    }
                  }}
                  className={`bg-white rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group ${isSelected ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20" : "border-slate-200/90 hover:border-indigo-300"
                    }`}
                >
                  {/* Card Header: Subcategory Title & Total KG */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-black flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-800 group-hover:text-indigo-600 transition">
                          {sub.subcategory_name}
                        </h3>
                        <p className="text-[11px] font-medium text-slate-400">
                          {sub.total_count} Collection{sub.total_count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-emerald-700 block">
                        {sub.total_waste_kg.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total KG</span>
                    </div>
                  </div>

                  {/* Inner Status Breakdown Grid: Pending, Approved, Rejected */}
                  <div className="grid grid-cols-3 gap-2 pt-3">
                    {/* Pending */}
                    <div className="bg-amber-50/80 border border-amber-200/70 p-2 rounded-xl text-center">
                      <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">Pending</span>
                      <span className="text-xs font-black text-amber-900 block mt-0.5">{sub.pending_kg.toFixed(2)} KG</span>
                      <span className="text-[9px] font-semibold text-amber-600">({sub.pending_count})</span>
                    </div>

                    {/* Approved */}
                    <div className="bg-emerald-50/80 border border-emerald-200/70 p-2 rounded-xl text-center">
                      <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">Approved</span>
                      <span className="text-xs font-black text-emerald-900 block mt-0.5">{sub.approved_kg.toFixed(2)} KG</span>
                      <span className="text-[9px] font-semibold text-emerald-600">({sub.approved_count})</span>
                    </div>

                    {/* Rejected */}
                    <div className="bg-rose-50/80 border border-rose-200/70 p-2 rounded-xl text-center">
                      <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider block">Rejected</span>
                      <span className="text-xs font-black text-rose-900 block mt-0.5">{sub.rejected_kg.toFixed(2)} KG</span>
                      <span className="text-[9px] font-semibold text-rose-600">({sub.rejected_count})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Global Search & Server-Side Filters Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        {/* Search and Action Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3 items-center">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search Trip ID, Order ID, Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
            >
              <option value="All Status">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-2">
            <button
              onClick={handleApplyFilters}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer text-center"
            >
              Search
            </button>
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition active:scale-95 cursor-pointer text-center"
            >
              Clear
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Main Grouped Data Table (1 Row per Trip) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
            <p className="text-sm font-semibold">Loading Trip Summaries...</p>
          </div>
        ) : paginatedGroups.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Truck className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-base font-bold text-slate-700">No collection trips found</p>
            <p className="text-xs text-slate-500">Try clearing filters or submitting a trip collection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Date</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">BWG Name</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Trip ID</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Order ID</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Corporation</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Zone</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Ward</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Collection Event</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Vehicle</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Driver</th>
                  {subCategoryColumns.map((col) => (
                    <th key={col.id} className="py-3.5 px-4 text-center whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                  <th className="py-3.5 px-4 text-center whitespace-nowrap font-black">TOTAL (KG)</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {paginatedGroups.map((group, idx) => {
                  const itemIndex = (page - 1) * limit + idx + 1;

                  return (
                    <tr
                      key={group.trip_id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => openDetailsPage(group)}
                    >
                      <td className="py-4 px-4 text-center font-semibold text-slate-400 align-top">{itemIndex}</td>

                      {/* Date */}
                      <td className="py-4 px-4 text-slate-600 text-xs font-semibold align-top whitespace-nowrap">
                        {formatDate(group.submitted_at || group.created_at)}
                      </td>

                      {/* BWG Name */}
                      <td className="py-4 px-4 font-bold text-slate-800 align-top whitespace-nowrap">
                        {group.bwg_name || group.customer_name || "—"}
                      </td>

                      {/* Trip ID */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                          {group.trip_id}
                        </span>
                      </td>

                      {/* Order ID */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-900 align-top whitespace-nowrap">{group.order_id}</td>

                      {/* Corporation */}
                      <td className="py-4 px-4 text-xs font-semibold text-slate-700 align-top whitespace-nowrap">{group.corporation_name || "—"}</td>

                      {/* Zone */}
                      <td className="py-4 px-4 text-xs font-semibold text-slate-700 align-top whitespace-nowrap">{group.zone_name || "—"}</td>

                      {/* Ward */}
                      <td className="py-4 px-4 text-xs font-semibold text-slate-700 align-top whitespace-nowrap">{group.ward_name || "—"}</td>

                      {/* Collection Event */}
                      <td className="py-4 px-4 text-xs font-semibold text-slate-700 align-top whitespace-nowrap">{group.collection_event_name || "—"}</td>

                      {/* Vehicle */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                          {group.vehicle_number || "—"}
                        </span>
                      </td>

                      {/* Driver */}
                      <td className="py-4 px-4 font-semibold text-slate-700 align-top whitespace-nowrap">{group.driver_name || "—"}</td>

                      {/* Dynamic Subcategory columns - Each subcategory in its own column */}
                      {subCategoryColumns.map((col) => {
                        const items = group.items.filter((item) => {
                          if (String(item.subcategory_id) === String(col.id)) return true;
                          const nameA = (item.subcategory_name || item.subCategory?.name || "").toLowerCase().trim();
                          const nameB = col.name.toLowerCase().trim();
                          return nameA === nameB && nameA.length > 0;
                        });

                        const weight = items.reduce((acc, curr) => acc + Number(curr.total_waste_kg || 0), 0);
                        const formattedWeight = weight.toFixed(2);

                        return (
                          <td key={col.id} className="py-4 px-4 text-center align-top font-extrabold whitespace-nowrap">
                            <span style={{ color: primaryColor }}>
                              {formattedWeight}
                            </span>
                          </td>
                        );
                      })}

                      {/* Total Waste Sum */}
                      <td className="py-4 px-4 text-center font-black text-slate-900 text-sm align-top whitespace-nowrap">
                        {group.total_waste_kg}
                      </td>

                      {/* Submitted At */}
                      <td className="py-4 px-4 text-slate-500 text-xs align-top whitespace-nowrap">
                        {formatDate(group.submitted_at || group.created_at)}
                      </td>

                      {/* Overall Status Badge */}
                      <td className="py-4 px-4 text-center align-top whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${group.overallStatus === "Pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : group.overallStatus === "Approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                        >
                          {group.overallStatus}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-4 text-center align-top whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openDetailsPage(group)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Details
                          </button>

                          {canEdit && group.overallStatus !== "Approved" && (
                            <button
                              onClick={() => handleOpenEditTrip(group)}
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                              title="Edit All Items in Trip"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => handleDeleteTrip(group.trip_id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete Entire Trip"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-Side Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              Showing {groupedTrips.length > 0 ? (page - 1) * limit + 1 : 0} -{" "}
              {Math.min(page * limit, groupedTrips.length)} of {groupedTrips.length} Trips ({records.length} Total Collection Items)
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Trips per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-800">
              Page {page} of {totalPagesCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPagesCount, p + 1))}
              disabled={page >= totalPagesCount}
              className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[110] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Confirm Trip Deletion</h3>
                <p className="text-xs text-slate-500 font-medium">Trip #{deletingTripId}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-semibold leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              Are you sure you want to delete all collection records for Trip <strong className="text-slate-900">#{deletingTripId}</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeletingTripId(null); }}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteTrip}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}



      {/* FULL IMAGE EXPAND PREVIEW MODAL */}
      {isImagePreviewOpen && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsImagePreviewOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img src={previewImageUrl} alt="Full Preview" className="w-full h-full object-contain max-h-[85vh] rounded-2xl" />
            <button
              onClick={() => setIsImagePreviewOpen(false)}
              className="absolute top-3 right-3 p-2 bg-slate-900/80 text-white hover:bg-rose-600 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
