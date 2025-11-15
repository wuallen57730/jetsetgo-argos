import { useEffect, useMemo, useState } from "react";

import MaterialIcon from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STATUS_CONFIG = {
  green: {
    label: "Good",
    wrapper:
      "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
    dot: "bg-green-500",
  },
  yellow: {
    label: "Warning",
    wrapper:
      "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300",
    dot: "bg-yellow-500",
  },
  red: {
    label: "Damaged",
    wrapper: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300",
    dot: "bg-red-500",
  },
};

const STATUS_DISPLAY = [
  { key: "green", label: "Good", color: "#006462" },
  { key: "yellow", label: "Warning", color: "#facc15" },
  { key: "red", label: "Damaged", color: "#fa5538" },
];

const PIE_COLORS = {
  green: "#006462",
  yellow: "#facc15",
  red: "#fa5538",
};

const DAMAGE_PIE_COLORS = ["#fa5538", "#006462", "#facc15", "#0088FE"];
const FLEET_DAMAGE_DATA = [
  { type: "Perishables", rate: 15 },
  { type: "Pharma", rate: 6 },
  { type: "High-Value", rate: 9 },
  { type: "Oversized", rate: 3 },
];

const MOCKED_FORECAST_DATA = [
  { day: "Today", "On-Hand": 120, Required: 100, Shortfall: 0 },
  { day: "Day+1", "On-Hand": 110, Required: 105, Shortfall: 0 },
  { day: "Day+2", "On-Hand": 95, Required: 110, Shortfall: 15 },
  { day: "Day+3", "On-Hand": 80, Required: 115, Shortfall: 35 },
  { day: "Day+4", "On-Hand": 100, Required: 100, Shortfall: 0 },
  { day: "Day+5", "On-Hand": 90, Required: 110, Shortfall: 20 },
  { day: "Day+6", "On-Hand": 75, Required: 120, Shortfall: 45 },
];

const valueFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

export default function Dashboard() {
  const [ulds, setUlds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    try {
      if (ulds.length === 0) setLoading(true);
      const response = await fetch("/api/ulds");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setUlds(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch Cargo:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { totals, overviewPieData, damagePieData, filteredUlds } = useMemo(() => {
    const total = ulds.length;
    const green = ulds.filter((item) => item.status === "green").length;
    const yellow = ulds.filter((item) => item.status === "yellow").length;
    const red = ulds.filter((item) => item.status === "red").length;
    const damagedCount = yellow + red;
    const damageRate = total === 0 ? 0 : (damagedCount / total) * 100;
    const valueAtRisk = red * 50000;
    const avoidableSavings = (yellow + red) * 15000;

    const overviewPieData = [
      { name: "Green", value: green },
      { name: "Yellow", value: yellow },
      { name: "Red", value: red },
    ];

    const damageMap = new Map();
    ulds.forEach((uld) => {
      if (uld.status === "red" || uld.status === "yellow") {
        const category = uld.damage_category || "Unknown";
        damageMap.set(category, (damageMap.get(category) || 0) + 1);
      }
    });
    const damagePieData = Array.from(damageMap.entries()).map(
      ([name, value]) => ({ name, value })
    );

    const filtered = ulds
      .filter((uld) => {
        const matchesSearch = uld.uld_id
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || uld.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const aTime = new Date(a.last_seen).getTime();
        const bTime = new Date(b.last_seen).getTime();
        return bTime - aTime;
      });

    return {
      totals: {
        total,
        damageRate: Number.isFinite(damageRate)
          ? damageRate.toFixed(1)
          : "0.0",
        valueAtRisk,
        damagedCount,
        avoidableSavings,
        green,
        yellow,
        red,
      },
      overviewPieData,
      damagePieData:
        damagePieData.length > 0
          ? damagePieData
          : [{ name: "No Damage", value: 1 }],
      filteredUlds: filtered,
    };
  }, [searchTerm, ulds]);

  const renderStatusPill = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.green;
    let bgColor = "";
    let textColor = "";
    let dotColor = "";

    if (status === "green") {
      bgColor = "rgba(0, 100, 98, 0.1)";
      textColor = "#006462";
      dotColor = "#006462";
    } else if (status === "yellow") {
      bgColor = "rgba(250, 204, 21, 0.1)";
      textColor = "#facc15";
      dotColor = "#facc15";
    } else if (status === "red") {
      bgColor = "rgba(250, 85, 56, 0.1)";
      textColor = "#fa5538";
      dotColor = "#fa5538";
    }

    return (
      <span
        className="inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-semibold"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        {config.label}
      </span>
    );
  };

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-8 pb-8">
      <div>
        <h1 className="text-4xl font-black leading-tight tracking-tight text-gray-900 dark:text-white">
          Global Overview
        </h1>
        <p className="mt-2 text-base text-jade">
          Real-time insights into Cargo network health and performance.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <article className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-6 dark:border-jade/30 dark:bg-transparent">
          <p className="text-base font-medium text-gray-600 dark:text-white">
            Total Cargo Scanned
          </p>
          <p className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">
            {totals.total.toLocaleString()}
          </p>
          <p className="flex items-center gap-1 text-base font-medium text-jade">
            <MaterialIcon name="arrow_upward" className="text-lg" />
            +0%
          </p>
        </article>
        <article className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-6 dark:border-jade/30 dark:bg-transparent">
          <p className="text-base font-medium text-gray-600 dark:text-white">
            Current Damage Rate
          </p>
          <p className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">
            {totals.damageRate}%
          </p>
          <p className="flex items-center gap-1 text-base font-medium text-[#fa5538]">
            <MaterialIcon name="arrow_downward" className="text-lg" />
            0%
          </p>
        </article>
        <article className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-6 dark:border-jade/30 dark:bg-transparent">
          <p className="text-base font-medium text-gray-600 dark:text-white">
            Est. Value at Risk
          </p>
          <p className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">
            {valueFormatter.format(totals.valueAtRisk)}
          </p>
          <p className="flex items-center gap-1 text-base font-medium text-jade">
            <MaterialIcon name="arrow_upward" className="text-lg" />
            +0%
          </p>
        </article>
        <article className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-6 dark:border-jade/30 dark:bg-transparent">
          <p className="text-base font-medium text-gray-600 dark:text-white">
            Avoidable Costs Saved (Est.)
          </p>
          <p className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">
            {valueFormatter.format(totals.avoidableSavings)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Estimated savings by identifying damage (Yellow/Red) before flight.
          </p>
        </article>
      </section>

      <section>
        <h2 className="mb-4 text-[22px] font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
          Forecasting Modules
        </h2>
        <div className="grid gap-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <article className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-jade/30 dark:bg-transparent">
              <p className="text-base font-medium text-gray-600 dark:text-white">
                Global Cargo Status
              </p>
              <div className="flex h-48 items-center justify-center">
                <div className="relative h-40 w-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overviewPieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="60%"
                        outerRadius="80%"
                        stroke="none"
                      >
                        {overviewPieData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={PIE_COLORS[entry.name.toLowerCase()]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {totals.total.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-[#92c9ab]">
                      Total
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-around text-sm">
                {STATUS_DISPLAY.map((item) => (
                  <div key={item.key} className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-600 dark:text-gray-300">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-jade/30 dark:bg-transparent">
              <p className="text-base font-medium text-gray-600 dark:text-white">
                Damage Breakdown
              </p>
              <div className="flex h-48 items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={damagePieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius="80%"
                      stroke="none"
                      label
                    >
                      {damagePieData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={DAMAGE_PIE_COLORS[index % DAMAGE_PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <article className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-6 dark:border-jade/30 dark:bg-transparent">
              <p className="text-base font-medium text-gray-600 dark:text-white">
                Inventory Imbalance Forecast
              </p>
              <p className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">
                Next 7 Days
              </p>
              <div className="flex gap-1">
                <p className="text-sm text-gray-500 dark:text-light-teal/80">
                  This Week
                </p>
                <p className="text-sm font-medium text-jade">+3%</p>
              </div>
              <div className="flex flex-1 flex-col justify-end pt-4">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={MOCKED_FORECAST_DATA}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" stroke="#92c9ab" />
                    <YAxis stroke="#92c9ab" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="On-Hand"
                      stroke={PIE_COLORS.green}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Required"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Shortfall"
                      stroke={PIE_COLORS.red}
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-6 dark:border-jade/30 dark:bg-transparent">
              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-gray-600 dark:text-white">
                  Damage Rate by Cargo Fleet
                </p>
                <span className="rounded-full bg-jade/10 px-3 py-1 text-xs font-semibold text-jade dark:bg-jade/20">
                  80% avoidable (Yellow)
                </span>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={FLEET_DAMAGE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="type" stroke="#94a3b8" />
                    <YAxis
                      stroke="#94a3b8"
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                      {FLEET_DAMAGE_DATA.map((entry) => (
                        <Cell
                          key={entry.type}
                          fill={entry.type === "Perishables" ? "#fa5538" : "#006462"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-jade/30 dark:bg-transparent">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Live Inventory Log
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {loading ? "Loading..." : "Just now"}
            </p>
          </div>

                  <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
                    <div className="flex w-full flex-col gap-2 sm:w-64">
                      <div className="relative w-full">
                        <MaterialIcon
                          name="search"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(event) => setSearchTerm(event.target.value)}
                          placeholder="Search Cargo ID..."
                          className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-700 focus:border-[#13ec75]/50 focus:outline-none focus:ring-2 focus:ring-[#13ec75]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="w-full sm:w-48">
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Status Filter
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-jade focus:outline-none focus:ring-2 focus:ring-jade/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="all">All</option>
                        <option value="green">Good</option>
                        <option value="yellow">Warning</option>
                        <option value="red">Damaged</option>
                      </select>
                    </div>
            <button
              type="button"
              className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-jade/80 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-jade dark:bg-jade/90 dark:hover:bg-teal"
            >
              <MaterialIcon name="download" className="text-lg" />
              Download PDF Report
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-500">Error: {error}</p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Cargo ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Damage Category</th>
                <th className="px-4 py-3">Shipping Location</th>
                <th className="px-4 py-3">Last Scan Time (Asia/Taipei)</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-gray-500"
                    colSpan={6}
                  >
                    Loading data...
                  </td>
                </tr>
              )}
              {!loading && filteredUlds.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-gray-500"
                    colSpan={6}
                  >
                    No records found.
                  </td>
                </tr>
              )}
              {!loading &&
                filteredUlds.map((uld) => (
                  <tr
                    key={uld.id}
                    className="border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {uld.uld_id}
                    </td>
                    <td className="px-4 py-3">
                      {renderStatusPill(uld.status)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {uld.location || uld.station || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {uld.damage_category || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {uld.shipping_location ||
                        uld.destination ||
                        uld.location ||
                        "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                      {uld.last_seen
                        ? timeFormatter.format(new Date(uld.last_seen))
                        : "N/A"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
