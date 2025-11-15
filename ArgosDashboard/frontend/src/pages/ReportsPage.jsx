import { useState } from "react";
import { jsPDF } from "jspdf";

import MaterialIcon from "@/components/MaterialIcon";

const REPORT_ROWS = [
  {
    id: "AKE12345DL",
    uldType: "AKE",
    damageDate: "2023-11-05",
    location: "JFK",
    damageType: "Forklift Puncture",
    status: "Damaged",
    statusTone: "red",
    repairCost: "$450.00",
  },
  {
    id: "PMC67890AA",
    uldType: "PMC",
    damageDate: "2023-11-03",
    location: "LAX",
    damageType: "Corner Cap Bent",
    status: "Repair Pending",
    statusTone: "yellow",
    repairCost: "$120.00",
  },
  {
    id: "PAG54321UA",
    uldType: "PAG",
    damageDate: "2023-10-28",
    location: "ORD",
    damageType: "Door Latch Broken",
    status: "Repaired",
    statusTone: "green",
    repairCost: "$275.50",
  },
  {
    id: "AKE98765SW",
    uldType: "AKE",
    damageDate: "2023-10-25",
    location: "JFK",
    damageType: "Panel Dent",
    status: "Damaged",
    statusTone: "red",
    repairCost: "$85.00",
  },
  {
    id: "AKE11223BA",
    uldType: "AKE",
    damageDate: "2023-10-22",
    location: "LAX",
    damageType: "Tear in Cover",
    status: "Repaired",
    statusTone: "green",
    repairCost: "$150.00",
  },
];

const STATUS_BADGES = {
  red: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
  yellow:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  green: "bg-[#dff7ea] text-[#0f7b58] dark:bg-jade/20 dark:text-jade",
};

const TYPE_OPTIONS = ["all", "AKE", "PMC", "PAG"];
const LOCATION_OPTIONS = ["all", "JFK", "LAX", "ORD", "SFO"];

export default function ReportsPage() {
  const [filters, setFilters] = useState({
    dateFrom: "Oct 05, 2023",
    dateTo: "Nov 07, 2023",
    type: "all",
    location: "all",
  });
  const [results, setResults] = useState(REPORT_ROWS);
  const [reportMeta, setReportMeta] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("results");

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleGenerateReport = () => {
    const nextResults = REPORT_ROWS.filter((row) => {
      const matchesType =
        filters.type === "all" || row.uldType === filters.type;
      const matchesLocation =
        filters.location === "all" || row.location === filters.location;
      return matchesType && matchesLocation;
    });

    const meta = {
      id: `RPT-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      parameters: {
        type: filters.type,
        location: filters.location,
      },
      total: nextResults.length,
    };

    setResults(nextResults);
    setReportMeta(meta);
    setReportHistory((prev) => [meta, ...prev].slice(0, 20));
    setActiveTab("results");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Cargo Damage Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(
      `Filters - Type: ${
        filters.type === "all" ? "All" : filters.type
      }, Location: ${filters.location === "all" ? "All" : filters.location}`,
      14,
      38
    );

    let y = 48;
    results.slice(0, 12).forEach((row, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(
        `${index + 1}. ${row.id} | ${row.damageDate} | ${row.location} | ${
          row.damageType
        } | ${row.status}`,
        14,
        y
      );
      y += 8;
    });

    doc.save(`Cargo-report-${Date.now()}.pdf`);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 pb-8 text-gray-800 dark:text-gray-200">
      <nav className="flex flex-wrap gap-2 text-sm font-medium text-[#1a312f] dark:text-white">
        <a
          href="#"
          className="text-[#1a312f] hover:text-jade dark:text-white dark:hover:text-white"
        >
          Dashboard
        </a>
        <span className="text-[#1a312f] dark:text-white">/</span>
        <a
          href="#"
          className="text-[#1a312f] hover:text-jade dark:text-white dark:hover:text-white"
        >
          Reports
        </a>
        <span className="text-[#1a312f] dark:text-white">/</span>
        <span className="text-[#1a312f] dark:text-white">Damage Overview</span>
      </nav>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-72 flex-col gap-2">
          <p className="text-4xl font-black leading-tight tracking-tight text-[#1a312f] dark:text-white">
            Cargo Damage Reports
          </p>
          <p className="text-base text-[#1a312f] dark:text-[#92a4c9]">
            Generate and view reports related to Cargo damage.
          </p>
        </div>
      </header>

      <section className="rounded-xl border border-[#1a312f] bg-[#1a312f] p-6 text-white shadow-sm">
        <h2 className="text-xl font-bold leading-tight tracking-tight text-white">
          Filters
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-100">
              Date Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={filters.dateFrom}
                onChange={handleFilterChange("dateFrom")}
                className="w-full rounded-lg border border-white/40 bg-white px-3 py-2 text-sm text-gray-900 focus:border-white focus:outline-none focus:ring-white/50"
              />
              <span className="text-gray-100">-</span>
              <input
                type="text"
                value={filters.dateTo}
                onChange={handleFilterChange("dateTo")}
                className="w-full rounded-lg border border-white/40 bg-white px-3 py-2 text-sm text-gray-900 focus:border-white focus:outline-none focus:ring-white/50"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-100">
              Cargo Type
            </label>
            <select
              className="w-full rounded-lg border border-white/40 bg-white px-3 py-2 text-sm text-gray-900 focus:border-white focus:outline-none focus:ring-white/40"
              value={filters.type}
              onChange={handleFilterChange("type")}
            >
              <option value="all">All Types</option>
              {TYPE_OPTIONS.filter((option) => option !== "all").map(
                (option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-100">
              Location
            </label>
            <select
              className="w-full rounded-lg border border-white/40 bg-white px-3 py-2 text-sm text-gray-900 focus:border-white focus:outline-none focus:ring-white/40"
              value={filters.location}
              onChange={handleFilterChange("location")}
            >
              <option value="all">All Locations</option>
              {LOCATION_OPTIONS.filter((option) => option !== "all").map(
                (option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleGenerateReport}
            className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-[#006462] transition hover:bg-white/90"
          >
            <MaterialIcon name="search" className="text-[20px]" />
            Generate Report
          </button>
        </div>
      </section>

      <section className="mt-4 space-y-4">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex gap-6 text-sm font-medium">
            {[
              { id: "results", label: "Report Results" },
              { id: "history", label: "Report History" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 py-4 transition ${
                  activeTab === tab.id
                    ? "border-jade text-jade"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          {reportMeta && (
            <div className="rounded-lg border border-[#1a312f] bg-[#1a312f] px-4 py-3 text-sm text-white">
              Showing <strong>{results.length}</strong> result
              {results.length === 1 ? "" : "s"} for{" "}
              {reportMeta.parameters.type === "all"
                ? "all Cargo types"
                : reportMeta.parameters.type}{" "}
              in{" "}
              {reportMeta.parameters.location === "all"
                ? "all locations"
                : reportMeta.parameters.location}
              . Generated at{" "}
              {new Date(reportMeta.generatedAt).toLocaleString("en-US")}
            </div>
          )}
          <div className="flex justify-end gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-[#1a2231] dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <MaterialIcon name="print" className="text-[20px]" />
            Print
          </button>
            <button
              type="button"
              onClick={handleExportPDF}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-[#1a2231] dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <MaterialIcon name="download" className="text-[20px]" />
              Export PDF
              <MaterialIcon name="expand_more" className="text-[16px]" />
            </button>
          </div>
        </div>

        {activeTab === "results" ? (
          <div className="overflow-x-auto rounded-xl border border-[#1a312f] bg-[#1a312f] text-white">
            <table className="w-full text-left text-sm text-white">
              <thead className="text-xs uppercase text-white/80">
                <tr>
                  <th className="px-6 py-3 font-semibold">Cargo ID</th>
                  <th className="px-6 py-3 font-semibold">Damage Date</th>
                  <th className="px-6 py-3 font-semibold">Location</th>
                  <th className="px-6 py-3 font-semibold">Damage Type</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 text-right font-semibold">
                    Repair Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                    className="px-6 py-6 text-center text-sm text-white/80"
                    >
                      No results found. Try adjusting your filters.
                    </td>
                  </tr>
                ) : (
                results.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/15 transition-colors hover:bg-white/5"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-white">
                        {row.id}
                      </td>
                    <td className="px-6 py-4">{row.damageDate}</td>
                    <td className="px-6 py-4">{row.location}</td>
                    <td className="px-6 py-4">{row.damageType}</td>
                    <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGES[row.statusTone]}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    <td className="px-6 py-4 text-right">{row.repairCost}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-4 rounded-xl border border-[#1a312f] bg-[#1a312f] p-4 text-sm text-white">
            {reportHistory.length === 0 ? (
              <p className="text-white/80">
                No report history yet. Generate a report to populate history.
              </p>
            ) : (
              reportHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg border border-white/25 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-white">{entry.id}</div>
                    <div className="text-xs text-white/70">
                      {new Date(entry.generatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-white/80">
                    Type:{" "}
                    <span className="font-semibold">
                      {entry.parameters.type === "all"
                        ? "All"
                        : entry.parameters.type}
                    </span>{" "}
                    | Location:{" "}
                    <span className="font-semibold">
                      {entry.parameters.location === "all"
                        ? "All"
                        : entry.parameters.location}
                    </span>{" "}
                    | Records:{" "}
                    <span className="font-semibold">{entry.total}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}

