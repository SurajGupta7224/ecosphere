import React, { useState } from "react";
import {
    FiPlus,
    FiTruck,
    FiGift,
    FiBell,
    FiMapPin,
    FiHelpCircle,
    FiSettings,
    FiArrowRight,
    FiDollarSign,
    FiZap,
} from "react-icons/fi";

const bookingSteps = [
    { id: 1, label: "Address" },
    { id: 2, label: "Category" },
    { id: 3, label: "Weight" },
    { id: 4, label: "Images" },
    { id: 5, label: "Schedule" },
    { id: 6, label: "Payment" },
    { id: 7, label: "Confirmation" },
];

const savedAddresses = [
    { id: "home", label: "Home", detail: "42, Palm Grove Apartments, Andheri West, Mumbai – 400058" },
    { id: "office", label: "Office", detail: "8th Floor, WeWork Chromium, Powai, Mumbai – 400076" },
];

const wasteCategories = [
    { id: "organic", label: "Organic Waste", icon: FiZap },
    { id: "recyclable", label: "Recyclable", icon: FiGift },
    { id: "e-waste", label: "E-Waste", icon: FiSettings },
    { id: "hazardous", label: "Hazardous", icon: FiHelpCircle },
];

export default function BookPickup() {
    const [bookingStep, setBookingStep] = useState(1);
    const [selectedAddress, setSelectedAddress] = useState("home");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [weight, setWeight] = useState("");
    const [scheduleDate, setScheduleDate] = useState("");
    const [scheduleTime, setScheduleTime] = useState("");
    const [paymentMethod, setPaymentMethod] = useState(null);

    const canContinue = () => {
        if (bookingStep === 1) return !!selectedAddress;
        if (bookingStep === 2) return !!selectedCategory;
        if (bookingStep === 3) return !!weight;
        if (bookingStep === 5) return !!scheduleDate && !!scheduleTime;
        if (bookingStep === 6) return !!paymentMethod;
        return true;
    };

    return (
        <div className="flex flex-col gap-4 p-4">

            <div>
                <h1 className="text-2xl font-bold text-gray-800">Book a Pickup</h1>
                <p className="text-sm text-gray-400 mt-1">7 simple steps.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    {bookingSteps.map((step) => {
                        const isActive = bookingStep === step.id;
                        const isDone = bookingStep > step.id;
                        return (
                            <button
                                key={step.id}
                                onClick={() => setBookingStep(step.id)}
                                className={`text-sm font-semibold px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                                    isActive
                                        ? "bg-green-700 text-white"
                                        : isDone
                                        ? "bg-green-50 text-green-700"
                                        : "bg-gray-100 text-gray-400"
                                }`}
                            >
                                {step.id}. {step.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[380px]">

                {/* Step 1: Address */}
                {bookingStep === 1 && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <FiMapPin size={18} className="text-green-700" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">Pickup address</p>
                                <p className="text-sm text-gray-400">Where should we come?</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {savedAddresses.map((addr) => (
                                <button
                                    key={addr.id}
                                    onClick={() => setSelectedAddress(addr.id)}
                                    className={`text-left rounded-xl border-2 p-4 transition-all ${
                                        selectedAddress === addr.id
                                            ? "border-green-600 bg-green-50"
                                            : "border-gray-100 hover:border-gray-200"
                                    }`}
                                >
                                    <p className="font-bold text-gray-800 mb-1">{addr.label}</p>
                                    <p className="text-sm text-gray-500">{addr.detail}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Category */}
                {bookingStep === 2 && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <FiTruck size={18} className="text-green-700" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">Waste Category</p>
                                <p className="text-sm text-gray-400">What are we picking up?</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {wasteCategories.map((cat) => {
                                const Icon = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                                            selectedCategory === cat.id
                                                ? "border-green-600 bg-green-50"
                                                : "border-gray-100 hover:border-gray-200"
                                        }`}
                                    >
                                        <Icon size={20} className="text-green-700" />
                                        <span className="text-sm font-medium text-gray-700 text-center">{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Step 3: Weight */}
                {bookingStep === 3 && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <FiZap size={18} className="text-green-700" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">Estimated weight</p>
                                <p className="text-sm text-gray-400">Roughly how much, in kg?</p>
                            </div>
                        </div>
                        <input
                            type="number"
                            min="0"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="e.g. 5"
                            className="w-full sm:w-64 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500"
                        />
                    </div>
                )}

                {/* Step 4: Images */}
                {bookingStep === 4 && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <FiPlus size={18} className="text-green-700" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">Add photos</p>
                                <p className="text-sm text-gray-400">Optional, but helps our team prepare.</p>
                            </div>
                        </div>
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-12 cursor-pointer hover:border-green-300 transition-colors">
                            <FiPlus size={24} className="text-gray-300 mb-2" />
                            <span className="text-sm text-gray-400">Click to upload images</span>
                            <input type="file" accept="image/*" multiple className="hidden" />
                        </label>
                    </div>
                )}

                {/* Step 5: Schedule */}
                {bookingStep === 5 && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <FiBell size={18} className="text-green-700" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">Schedule pickup</p>
                                <p className="text-sm text-gray-400">Pick a date and time that works.</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="date"
                                value={scheduleDate}
                                onChange={(e) => setScheduleDate(e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500"
                            />
                            <input
                                type="time"
                                value={scheduleTime}
                                onChange={(e) => setScheduleTime(e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500"
                            />
                        </div>
                    </div>
                )}

                {/* Step 6: Payment */}
                {bookingStep === 6 && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <FiDollarSign size={18} className="text-green-700" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">Payment method</p>
                                <p className="text-sm text-gray-400">How would you like to pay?</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {["Wallet", "UPI", "Card", "Cash on Pickup"].map((method) => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`text-left rounded-xl border-2 p-4 font-medium text-sm transition-all ${
                                        paymentMethod === method
                                            ? "border-green-600 bg-green-50 text-green-700"
                                            : "border-gray-100 text-gray-600 hover:border-gray-200"
                                    }`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 7: Confirmation */}
                {bookingStep === 7 && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <FiTruck size={18} className="text-green-700" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">Confirm your pickup</p>
                                <p className="text-sm text-gray-400">Review before you book.</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-gray-400">Address</span>
                                <span className="font-medium text-gray-700">
                                    {savedAddresses.find((a) => a.id === selectedAddress)?.label}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-gray-400">Category</span>
                                <span className="font-medium text-gray-700">
                                    {wasteCategories.find((c) => c.id === selectedCategory)?.label || "—"}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-gray-400">Weight</span>
                                <span className="font-medium text-gray-700">{weight ? `${weight} kg` : "—"}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-gray-400">Schedule</span>
                                <span className="font-medium text-gray-700">
                                    {scheduleDate || "—"} {scheduleTime && `· ${scheduleTime}`}
                                </span>
                            </div>
                            <div className="flex justify-between pb-2">
                                <span className="text-gray-400">Payment</span>
                                <span className="font-medium text-gray-700">{paymentMethod || "—"}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer nav */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setBookingStep((s) => Math.max(1, s - 1))}
                    disabled={bookingStep === 1}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-400 bg-gray-100 px-5 py-2.5 rounded-full disabled:opacity-50 hover:bg-gray-200 transition-all"
                >
                    ← Back
                </button>
                {bookingStep < 7 ? (
                    <button
                        onClick={() => canContinue() && setBookingStep((s) => Math.min(7, s + 1))}
                        disabled={!canContinue()}
                        className="flex items-center gap-2 text-sm font-semibold text-white bg-green-700 hover:bg-green-800 px-5 py-2.5 rounded-full disabled:opacity-50 transition-all"
                    >
                        Continue <FiArrowRight size={14} />
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            // TODO: wire up submit to your booking API
                            setBookingStep(1);
                        }}
                        className="flex items-center gap-2 text-sm font-semibold text-white bg-green-700 hover:bg-green-800 px-5 py-2.5 rounded-full transition-all"
                    >
                        Confirm Booking <FiArrowRight size={14} />
                    </button>
                )}
            </div>

        </div>
    );
}
