import React, { useState, useEffect } from "react";
import {
  Trash2,
  Bug,
  Repeat,
  Package,
  Truck,
  Workflow,
  Scale,
  Target,
  Shield,
  Users,
  Thermometer,
  Droplets,
  TrendingUp,
  Clock,
  Minimize,
  Beef,
  Sprout,
  Award,
  Network,
  Leaf,
  RefreshCw,
  Zap,
  Activity,
  TrendingDown,
  CheckCircle2,
  Settings,
  FileText,
  PackageCheck,
} from "lucide-react";
import ComparisonTool from "../ComparisonTool";

const ICONS = {
  Trash2,
  Bug,
  Repeat,
  Package,
  Truck,
  Workflow,
  Scale,
  Target,
  Shield,
  Users,
  Thermometer,
  Droplets,
  TrendingUp,
  Clock,
  Minimize,
  Beef,
  Sprout,
  Award,
  Network,
  Leaf,
  RefreshCw,
  Zap,
  Activity,
  TrendingDown,
  CheckCircle2,
  Settings,
  FileText,
  PackageCheck,
};

const LucideIcon = ({ name, size = 24, color, className = "" }) => {
  const C = ICONS[name] || CheckCircle2;
  return <C size={size} color={color} className={className} />;
};

const EcoSphereTechnology = () => {
  const [activeStep, setActiveStep] = useState(0);

  const processSteps = [
    {
      id: 0,
      title: "Waste Collection & Sorting",
      description:
        "Organic waste is collected and sorted with automated contamination detection and intelligent separation.",
      icon: "Trash2",
      metrics: [
        { label: "Processing Capacity", value: "1000+ tons/day", icon: "Scale" },
        { label: "Sorting Accuracy", value: "99.2%", icon: "Target" },
        { label: "Contamination Rate", value: "<0.5%", icon: "Shield" },
      ],
    },
    {
      id: 1,
      title: "BSF Larvae Introduction",
      description:
        "Black Soldier Fly larvae are introduced in controlled chambers for optimal bioconversion.",
      icon: "Bug",
      metrics: [
        { label: "Larvae Population", value: "2.5M", icon: "Users" },
        { label: "Temperature", value: "27°C", icon: "Thermometer" },
        { label: "Humidity", value: "70%", icon: "Droplets" },
      ],
    },
    {
      id: 2,
      title: "Bioconversion Process",
      description:
        "Larvae convert waste into protein biomass and nutrient-rich frass at high efficiency.",
      icon: "Repeat",
      metrics: [
        { label: "Conversion Rate", value: "95%", icon: "TrendingUp" },
        { label: "Processing Time", value: "14–21 days", icon: "Clock" },
        { label: "Waste Reduction", value: "80%", icon: "Minimize" },
      ],
    },
    {
      id: 3,
      title: "Resource Harvesting",
      description:
        "Automated systems harvest larvae and frass efficiently with minimal manual intervention.",
      icon: "Package",
      metrics: [
        { label: "Protein Yield", value: "42%", icon: "Beef" },
        { label: "Fertilizer Output", value: "15 tons/day", icon: "Sprout" },
        { label: "Quality Grade", value: "A+", icon: "Award" },
      ],
    },
    {
      id: 4,
      title: "Product Distribution",
      description:
        "Products are processed, packaged, and distributed to partners — completing a zero-waste circular loop.",
      icon: "Truck",
      metrics: [
        { label: "Partners", value: "150+", icon: "Network" },
        { label: "CO₂ Saved", value: "-85%", icon: "Leaf" },
        { label: "Circularity", value: "100%", icon: "RefreshCw" },
      ],
    },
  ];

  const [metrics, setMetrics] = useState({
    wasteProcessed: 2847,
    larvaeActive: 2500000,
    temperature: 27.2,
    proteinYield: 1194,
    co2Saved: 8541,
    efficiency: 94.8,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        wasteProcessed: prev.wasteProcessed + Math.random() * 2,
        larvaeActive: prev.larvaeActive + Math.random() * 900,
        temperature: 27 + (Math.random() * 0.5 - 0.25),
        proteinYield: prev.proteinYield + Math.random() * 1,
        co2Saved: prev.co2Saved + Math.random() * 3,
        efficiency: 94 + Math.random() * 1.5,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const liveMetricsData = [
    {
      label: "Waste Processed Today",
      value: `${metrics.wasteProcessed.toFixed(0)} kg`,
      icon: "Scale",
      color: "#059669",
      trendUp: true,
      trend: "+12.3%",
    },
    {
      label: "Active Larvae",
      value: `${(metrics.larvaeActive / 1000000).toFixed(2)}M`,
      icon: "Bug",
      color: "#2563eb",
      trendUp: true,
      trend: "+5.7%",
    },
    {
      label: "Chamber Temperature",
      value: `${metrics.temperature.toFixed(1)}°C`,
      icon: "Thermometer",
      color: "#d97706",
      trendUp: true,
      trend: "Optimal",
    },
    {
      label: "Protein Yield Today",
      value: `${metrics.proteinYield.toFixed(0)} kg`,
      icon: "Beef",
      color: "#16a34a",
      trendUp: true,
      trend: "+8.9%",
    },
    {
      label: "CO₂ Emissions Saved",
      value: `${metrics.co2Saved.toFixed(0)} kg`,
      icon: "Leaf",
      color: "#15803d",
      trendUp: true,
      trend: "+15.2%",
    },
    {
      label: "System Efficiency",
      value: `${metrics.efficiency.toFixed(1)}%`,
      icon: "Zap",
      color: "#eab308",
      trendUp: true,
      trend: "+2.1%",
    },
  ];

  const [activeTab, setActiveTab] = useState("system");

  const technicalTabs = [
    { id: "system", label: "System Specs", icon: "Settings" },
    { id: "environmental", label: "Environmental", icon: "Leaf" },
    { id: "biological", label: "Biological", icon: "Bug" },
    { id: "output", label: "Output Products", icon: "PackageCheck" },
  ];

  const technicalSpecs = {
    system: [
      { label: "Processing Capacity", value: "1000+ tons/day", unit: "Scalable to 200 tons/day" },
      { label: "Footprint", value: "2,500 m²", unit: "Modular design" },
      { label: "Power Consumption", value: "85 kW", unit: "100% renewable energy" },
      { label: "Water Usage", value: "12 m³/day", unit: "95% recycled" },
      { label: "Automation Level", value: "Level 4", unit: "High automation" },
      { label: "Monitoring Systems", value: "24/7 IoT", unit: "Real-time analytics" },
    ],
    environmental: [
      { label: "Waste Reduction", value: "95%", unit: "Volume reduction" },
      { label: "CO₂ Emissions Saved", value: "3,120 tons/year", unit: "vs traditional" },
      { label: "Landfill Diversion", value: "100%", unit: "Zero waste" },
      { label: "Energy Efficiency", value: "92%", unit: "Heat recovery" },
      { label: "Water Conservation", value: "88%", unit: "Closed-loop systems" },
      { label: "Circular Economy", value: "100%", unit: "Complete recovery" },
    ],
    biological: [
      { label: "BSF Species", value: "H. illucens", unit: "Black Soldier Fly" },
      { label: "Larvae Density", value: "2.5M/chamber", unit: "Optimal" },
      { label: "Temperature Range", value: "25–30°C", unit: "Controlled" },
      { label: "Humidity Range", value: "65–70%", unit: "Automated" },
      { label: "Conversion Cycle", value: "14–21 days", unit: "Egg → Harvest" },
      { label: "Protein Content", value: "42%", unit: "Dry weight" },
    ],
    output: [
      { label: "Protein Biomass", value: "21 tons/day", unit: "Feed grade" },
      { label: "Organic Fertilizer", value: "15 tons/day", unit: "Premium frass" },
      { label: "Chitin Extract", value: "2.5 tons/day", unit: "Industrial use" },
      { label: "Protein Quality", value: "Grade A+", unit: "Certified" },
      { label: "NPK Ratio", value: "4-3-2", unit: "Balanced" },
      { label: "Moisture Content", value: "8–12%", unit: "Stable" },
    ],
  };

  return (
    <>
      {/* SECTION 1 — PROCESS WORKFLOW */}
      <section className="py-14 sm:py-20 bg-white -mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16 mt-5">
            <h2 className="text-2xl lg:text-5xl font-bold text-slate-800 mb-3">
              Our Bioconversion Process
            </h2>
            <p className="text-sm sm:text-lg text-slate-500 max-w-3xl mx-auto">
              A clean, efficient, and sustainable scientific workflow transforming organic waste into high-value products.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
            {/* LEFT PROCESS LIST */}
            {/* ✅ Mobile becomes horizontal swipe cards, desktop stays same */}
            <div
              className="
                flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory
                lg:block lg:space-y-5 lg:overflow-visible lg:pb-0
                scrollbar-hide
              "
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {processSteps.map((step, index) => (
                <div
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`
                    snap-start
                    min-w-[88%] xs:min-w-[82%] sm:min-w-[70%]
                    lg:min-w-0
                    p-4 md:p-6 rounded-2xl border cursor-pointer transition-all duration-300
                    ${activeStep === index
                      ? "bg-emerald-50 border-emerald-500 shadow-md scale-[1.01]"
                      : "bg-white border-slate-200 hover:border-emerald-300 hover:shadow"
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center
                      ${activeStep === index
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600"
                        }`}
                    >
                      <LucideIcon name={step.icon} size={30} />
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm md:text-base">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT — STICKY PANEL (desktop untouched) */}
            <div className="lg:sticky lg:top-24 self-start mt-2 sm:mt-6 lg:mt-0">
              <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl border shadow-xl">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                  <LucideIcon
                    name={processSteps[activeStep].icon}
                    size={48}
                    color="#059669"
                  />
                </div>

                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-2">
                  {processSteps[activeStep].title}
                </h3>

                <p className="text-center text-slate-500 mb-6 text-xs sm:text-sm md:text-base">
                  {processSteps[activeStep].description}
                </p>

                {/* ✅ Mobile stacks, desktop stays 3 cols */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {processSteps[activeStep].metrics.map((m, i) => (
                    <div
                      key={i}
                      className="p-3 md:p-4 bg-slate-50 border rounded-xl text-center"
                    >
                      <LucideIcon
                        name={m.icon}
                        size={22}
                        color="#059669"
                        className="mx-auto mb-1"
                      />
                      <p className="text-base md:text-lg font-bold text-slate-800">
                        {m.value}
                      </p>
                      <p className="text-[11px] md:text-xs text-slate-500">
                        {m.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — LIVE METRICS */}
      <section className="py-14 sm:py-10 bg-white hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12 -mt-10 sm:-mt-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full border mb-6">
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-semibold text-emerald-700">
                Live IoT Tracking
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Real-Time Performance Metrics
            </h2>
            <p className="text-slate-500 max-w-3xl mx-auto text-xs sm:text-sm md:text-base">
              IoT-powered analytics give you instant visibility into the performance and sustainability of our facility.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {liveMetricsData.map((m, i) => (
              <div
                key={i}
                className="bg-white p-5 sm:p-6 rounded-2xl border shadow hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-slate-100 flex items-center justify-center">
                    <LucideIcon name={m.icon} size={26} color={m.color} />
                  </div>

                  <div
                    className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-semibold flex items-center gap-1 ${m.trendUp
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    <LucideIcon
                      name={m.trendUp ? "TrendingUp" : "TrendingDown"}
                      size={12}
                    />
                    {m.trend}
                  </div>
                </div>

                <p className="text-2xl md:text-3xl font-bold text-slate-800">
                  {m.value}
                </p>
                <p className="text-slate-500 text-sm">{m.label}</p>

                <div className="border-t pt-4 mt-4 text-xs flex items-center gap-2 text-slate-500">
                  <LucideIcon name="Clock" size={12} />
                  Updated 3 seconds ago
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 sm:mt-12 bg-white rounded-2xl border p-5 sm:p-6 md:p-8 shadow">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <LucideIcon name="Activity" size={28} color="#059669" />
                </div>

                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800">
                    System Status: Optimal
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm md:text-base">
                    All systems functioning normally
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 border rounded-lg bg-emerald-100 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-emerald-700">
                    Online
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-xs md:text-sm text-slate-500">Uptime</p>
                  <p className="text-lg md:text-xl font-bold text-slate-800">
                    99.97%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — TECHNICAL SPECIFICATIONS */}
      <section className="py-10 sm:py-28 bg-white hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16 -mt-10 sm:-mt-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full border mb-6">
              <LucideIcon name="FileText" size={18} color="#059669" />
              <span className="text-xs sm:text-sm font-semibold text-emerald-700">
                Technical Documentation
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Detailed Technical Specifications
            </h2>

            <p className="text-xs sm:text-sm md:text-lg text-slate-500 max-w-3xl mx-auto">
              Comprehensive technical data and performance metrics for our advanced
              bioconversion technology platform.
            </p>
          </div>

          <div className="flex overflow-x-auto no-scrollbar justify-start md:justify-center gap-3 md:gap-4 mb-10 sm:mb-12 py-2">
            {technicalTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold whitespace-nowrap transition-all border
                  ${activeTab === tab.id
                    ? "bg-emerald-600 text-white border-emerald-600 shadow"
                    : "bg-white text-slate-800 border-slate-300 hover:border-emerald-400"
                  }`}
              >
                <LucideIcon name={tab.icon} size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border p-5 sm:p-6 md:p-10 shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {technicalSpecs[activeTab].map((spec, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 md:p-6 bg-slate-50 rounded-xl border flex gap-4"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white border rounded-lg flex items-center justify-center shadow-sm">
                    <LucideIcon name="CheckCircle2" size={20} color="#059669" />
                  </div>

                  <div>
                    <p className="text-slate-500 text-[11px] sm:text-xs md:text-sm">
                      {spec.label}
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
                      {spec.value}
                    </p>
                    <p className="text-slate-500 text-[11px] sm:text-xs md:text-sm">
                      {spec.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
            <div className="bg-white border p-5 sm:p-6 rounded-xl text-center shadow-sm">
              <LucideIcon name="Award" size={32} color="#059669" className="mx-auto mb-4" />
              <h4 className="text-base sm:text-lg font-bold mb-1">Patent Portfolio</h4>
              <p className="text-3xl font-bold text-emerald-600 mb-1">12+</p>
              <p className="text-sm text-slate-500">Granted patents worldwide</p>
            </div>

            <div className="bg-white border p-5 sm:p-6 rounded-xl text-center shadow-sm">
              <LucideIcon name="Users" size={32} color="#2563eb" className="mx-auto mb-4" />
              <h4 className="text-base sm:text-lg font-bold mb-1">Research Partners</h4>
              <p className="text-3xl font-bold text-blue-600 mb-1">8</p>
              <p className="text-sm text-slate-500">Leading institutions</p>
            </div>

            <div className="bg-white border p-5 sm:p-6 rounded-xl text-center shadow-sm">
              <LucideIcon name="FileText" size={32} color="#16a34a" className="mx-auto mb-4" />
              <h4 className="text-base sm:text-lg font-bold mb-1">Publications</h4>
              <p className="text-3xl font-bold text-green-600 mb-1">25+</p>
              <p className="text-sm text-slate-500">Peer-reviewed papers</p>
            </div>
          </div>
        </div>
      </section>

      <ComparisonTool />
    </>
  );
};

export default EcoSphereTechnology;
