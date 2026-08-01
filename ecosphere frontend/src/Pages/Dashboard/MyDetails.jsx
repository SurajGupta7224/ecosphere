import React from "react";
import {
  FiUser,
  FiMapPin,
  FiFileText,
  FiTruck,
  FiCreditCard,
} from "react-icons/fi";

export default function MyDetails({ customer }) {
  const getValue = (...values) => {
    return values.find(
      (value) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    ) || "—";
  };

  const propertyName = getValue(
    customer?.property_name,
    customer?.propertyName,
    customer?.customer_name
  );

  const authorizedPerson = getValue(
    customer?.authorized_person_name,
    customer?.authorizedPersonName,
    customer?.customer_name
  );

  const email = getValue(customer?.email);

  const mobile = getValue(
    customer?.phone,
    customer?.mobile
  );

  const address = getValue(
    customer?.address,
    customer?.property_address,
    customer?.location
  );

  const area = getValue(
    customer?.area,
    customer?.area_sqm,
    customer?.property_area
  );

  const corporation = getValue(
    customer?.corporation,
    customer?.corporation_name
  );

  const ward = getValue(
    customer?.ward,
    customer?.ward_name
  );

  const license = getValue(
    customer?.property_license,
    customer?.license,
    customer?.rwa_pid
  );

  const gst = getValue(
    customer?.gst_number,
    customer?.gstNumber,
    customer?.gst
  );

  const pickupSchedule = getValue(
    customer?.pickup_schedule,
    customer?.pickupSchedule
  );

  const wet = Number(
    customer?.wet_waste ||
    customer?.wet_kg ||
    customer?.wetWaste ||
    0
  );

  const dry = Number(
    customer?.dry_waste ||
    customer?.dry_kg ||
    customer?.dryWaste ||
    0
  );

  const sanitary = Number(
    customer?.sanitary_waste ||
    customer?.sanitary_kg ||
    customer?.sanitaryWaste ||
    0
  );

  const special = Number(
    customer?.special_care ||
    customer?.special_care_kg ||
    customer?.specialCare ||
    0
  );

  const other = Number(
    customer?.other_waste ||
    customer?.other_kg ||
    customer?.otherWaste ||
    0
  );

  const backendTotal =
    customer?.total_waste ??
    customer?.total_kg ??
    customer?.totalWaste;

  const total =
    backendTotal !== undefined
      ? Number(backendTotal)
      : wet + dry + sanitary + special + other;

  const monthlyPrice = Number(
    customer?.fixed_monthly_price ||
    customer?.monthly_price ||
    customer?.pricing_plan ||
    0
  );

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">

        <div className="flex items-center gap-4">

          <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
            <FiUser
              size={19}
              className="text-green-700"
            />
          </div>

          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
              Customer Profile
            </p>

            <h2 className="text-xl font-bold text-gray-800 mt-1">
              My Details
            </h2>
          </div>

        </div>

      </div>

      {/* Basic + Property */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <DetailsCard
          title="Basic Details"
          icon={FiUser}
          items={[
            ["Property Name", propertyName],
            ["Authorized Person Name", authorizedPerson],
            ["Email", email],
            ["Mobile", mobile],
          ]}
        />

        <DetailsCard
          title="Property Details"
          icon={FiMapPin}
          items={[
            ["Address", address],
            ["Area (in sqm)", area],
            ["Corporation", corporation],
            ["Ward", ward],
          ]}
        />

      </div>

      {/* License + Waste */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <DetailsCard
          title="License & Schedule"
          icon={FiFileText}
          items={[
            ["Property License (RWA/PID)", license],
            ["GST Number", gst],
            ["Pickup Schedule", pickupSchedule],
          ]}
        />

        {/* Waste */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">

          <h3 className="text-lg font-bold text-green-800 mb-5">
            Waste Generation (Registered)
          </h3>

          <div className="grid grid-cols-2 gap-5">

            <WasteItem
              label="Wet Waste"
              value={wet}
            />

            <WasteItem
              label="Dry Waste"
              value={dry}
            />

            <WasteItem
              label="Sanitary Waste"
              value={sanitary}
            />

            <WasteItem
              label="Special Care"
              value={special}
            />

            <WasteItem
              label="Other Waste"
              value={other}
            />

            <WasteItem
              label="Total Waste"
              value={total}
              highlight
            />

          </div>

        </div>

      </div>

      {/* Pricing */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">

        <h3 className="text-lg font-bold text-green-800 mb-5">
          Pricing Plan
        </h3>

        <p className="text-xs text-gray-400 mb-1">
          Fixed Monthly Price
        </p>

        <p className="text-xl font-bold text-green-700">
          ₹
          {monthlyPrice.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>

      </div>

    </div>
  );
}


/* =====================================================
   REUSABLE DETAILS CARD
===================================================== */

function DetailsCard({ title, icon: Icon, items }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">

      <div className="flex items-center gap-3 mb-5">

        <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
          <Icon
            size={16}
            className="text-green-700"
          />
        </div>

        <h3 className="text-lg font-bold text-green-800">
          {title}
        </h3>

      </div>

      <div className="space-y-4">

        {items.map(([label, value]) => (
          <div key={label}>

            <p className="text-xs text-gray-400 mb-1">
              {label}
            </p>

            <p className="text-sm font-medium text-gray-700 leading-6 break-words">
              {value}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}


/* =====================================================
   WASTE ITEM
===================================================== */

function WasteItem({ label, value, highlight }) {
  return (
    <div>

      <p className="text-xs text-gray-400 mb-1">
        {label} (kg)
      </p>

      <p
        className={`text-sm font-semibold ${
          highlight
            ? "text-green-700"
            : "text-gray-700"
        }`}
      >
        {Number(value).toFixed(2)}
      </p>

    </div>
  );
}