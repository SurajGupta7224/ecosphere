// ---------------------------------------------------------
// Shared pickup helpers
// Import these wherever pickup data needs to be read or
// formatted, instead of re-defining them per component.
// ---------------------------------------------------------

export const statusColor = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "booked":
      return "bg-blue-50 text-blue-700";

    case "approved":
      return "bg-emerald-50 text-emerald-700";

    case "rejected":
      return "bg-red-50 text-red-700";

    case "cancelled":
      return "bg-gray-100 text-gray-500";

    case "completed":
      return "bg-green-50 text-green-700";

    case "in progress":
    case "in-progress":
      return "bg-amber-50 text-amber-700";

    default:
      return "bg-amber-50 text-amber-700";
  }
};

export const isCompletedStatus = (pickup) => {
  const status = String(pickup?.status || "").toLowerCase();
  return status === "completed" || status === "approved";
};

export const isMissedPickup = (pickup) => {
  if (!pickup?.pickup_date) return false;

  const pickupDate = new Date(pickup.pickup_date);

  if (Number.isNaN(pickupDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pickupDay = new Date(pickupDate);
  pickupDay.setHours(0, 0, 0, 0);

  // Only pickups dated before today can be "missed" — today's
  // pickup just hasn't happened yet, that's not a miss.
  if (pickupDay >= today) return false;

  const status = String(pickup.status || "").toLowerCase();

  // Completed / approved were fulfilled. Cancelled was
  // intentional, not a miss.
  if (status === "completed" || status === "approved" || status === "cancelled") {
    return false;
  }

  return true;
};

export const isSameDay = (dateStr, reference) => {
  if (!dateStr) return false;

  const parsed = new Date(dateStr);

  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return (
    parsed.getFullYear() === reference.getFullYear() &&
    parsed.getMonth() === reference.getMonth() &&
    parsed.getDate() === reference.getDate()
  );
};

export const isToday = (dateStr) => isSameDay(dateStr, new Date());

export const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (pickup) => {
  const date = pickup?.pickup_date;
  const time = pickup?.pickup_time;

  if (!date && !time) return "—";

  if (date && time) {
    return `${formatDate(date)}, ${time}`;
  }

  return formatDate(date) || time;
};

export const getVehicleNumber = (pickup) =>
  pickup?.vehicle_no ||
  pickup?.vehicle_number ||
  pickup?.vehicleNumber ||
  pickup?.vehicle?.vehicle_no ||
  "—";

export const getDriverName = (pickup) =>
  pickup?.driver_name ||
  pickup?.driver ||
  pickup?.driverName ||
  pickup?.assigned_driver ||
  "—";

export const getDriverMobile = (pickup, fallback) =>
  pickup?.driver_mobile ||
  pickup?.driver_phone ||
  pickup?.driverMobile ||
  pickup?.mobile ||
  fallback ||
  "—";

export const getSiteName = (pickup, fallback) =>
  pickup?.waste_generator_name ||
  pickup?.site_name ||
  pickup?.siteName ||
  fallback ||
  "—";

export const getWetWeight = (pickup) =>
  Number(
    pickup?.wet_kg ||
      pickup?.wet ||
      pickup?.wet_weight ||
      pickup?.wetWaste ||
      0
  );

export const getDryWeight = (pickup) =>
  Number(
    pickup?.dry_kg ||
      pickup?.dry ||
      pickup?.dry_weight ||
      pickup?.dryWaste ||
      0
  );

export const getSanitaryWeight = (pickup) =>
  Number(
    pickup?.sanitary_kg ||
      pickup?.sanitary ||
      pickup?.sanitary_weight ||
      pickup?.sanitaryWaste ||
      0
  );

export const getSpecialCareWeight = (pickup) =>
  Number(
    pickup?.special_care_kg ||
      pickup?.special_care ||
      pickup?.specialCare ||
      pickup?.special_care_weight ||
      0
  );

export const getTotalWeight = (pickup) => {
  const backendTotal =
    pickup?.total_kg ||
    pickup?.total_weight ||
    pickup?.totalWeight ||
    pickup?.total;

  if (backendTotal !== undefined && backendTotal !== null) {
    return Number(backendTotal);
  }

  return (
    getWetWeight(pickup) +
    getDryWeight(pickup) +
    getSanitaryWeight(pickup) +
    getSpecialCareWeight(pickup)
  );
};
