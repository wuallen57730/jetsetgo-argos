import { useState } from "react";

import MaterialIcon from "@/components/MaterialIcon";

const INVENTORY_ROWS = [
  {
    id: "AKE12345BA",
    type: "AKE",
    location: "LHR T4",
    status: "Available",
    statusTone: "green",
    condition: "Good",
    updatedAt: "2023-10-27 14:30",
  },
  {
    id: "PMC67890LH",
    type: "PMC",
    location: "FRA T1",
    status: "In Use",
    statusTone: "orange",
    condition: "Fair",
    updatedAt: "2023-10-27 12:15",
  },
  {
    id: "AKE54321AA",
    type: "AKE",
    location: "JFK T8",
    status: "Damaged",
    statusTone: "red",
    condition: "Poor",
    updatedAt: "2023-10-26 09:00",
  },
  {
    id: "PAG98765KL",
    type: "PAG",
    location: "AMS D5",
    status: "In Transit",
    statusTone: "orange",
    condition: "Good",
    updatedAt: "2023-10-27 11:45",
  },
  {
    id: "AMJ24680SQ",
    type: "AMJ",
    location: "SIN T3",
    status: "Available",
    statusTone: "green",
    condition: "Excellent",
    updatedAt: "2023-10-25 18:20",
  },
];

const STATUS_STYLE = {
  green: {
    badge: "bg-jade/20 text-jade",
    dot: "bg-jade",
  },
  orange: {
    badge: "bg-status-orange/10 text-status-orange",
    dot: "bg-status-orange",
  },
  red: {
    badge: "bg-status-red/10 text-status-red",
    dot: "bg-status-red",
  },
};

const HISTORY_LOGS = {
  AKE12345BA: [
    "[2025-11-10 09:15 (TPE)] - Source: Kiosk-TPE-01 (Fixed Scanner) | Status: Serviceable (GREEN).",
    "[2025-11-11 14:30 (SFO)] - Source: Agent Smith (App) | Status: Serviceable (GREEN).",
    "[2025-11-11 14:31 (SFO)] - (!!!) System Alert: Detected scan outside warehouse boundary (External Integration).",
    "[2025-11-12 08:00 (SFO)] - Source: Scan Bay 03 (Automated) | Status: AI Inspection in progress...",
    "[2025-11-12 08:01 (SFO)] - Source: ARGOS AI | Status: Damaged (RED) - Forklift Puncture.",
    "[2025-11-12 09:00 (SFO)] - Status: In Repair (Maintenance).",
  ],
};

export default function InventoryManagement() {
  const [historyModal, setHistoryModal] = useState(null);

  const openHistory = (row) => {
    setHistoryModal({
      uldId: row.id,
      logs: HISTORY_LOGS[row.id] || [
        "[2025-11-10 10:00] - No registered activity in audit log.",
      ],
    });
  };

  const closeHistory = () => setHistoryModal(null);

  return (
    <div className="flex flex-col gap-6 text-[#1a312f] dark:text-white">
      <header className="flex flex-col gap-4 rounded-2xl border border-inventory-border/40 bg-white px-10 py-3 text-[#1a312f] shadow-sm dark:border-inventory-border dark:bg-inventory-header dark:text-white md:flex-row md:items-center md:justify-between">
        <label className="flex min-w-40 max-w-sm flex-col font-display text-sm">
          <div className="flex items-stretch overflow-hidden rounded-lg">
            <div className="flex items-center bg-[#e9f2f0] px-4 text-[#5a6f68] dark:bg-inventory-border dark:text-inventory-text">
              <MaterialIcon name="search" />
            </div>
            <input
              type="text"
              placeholder="Search Cargo IDs or locations..."
              className="form-input flex-1 border border-[#dee7e5] bg-white px-4 py-2 text-base text-[#1a312f] placeholder:text-[#7a8a86] focus:outline-none focus:ring-2 focus:ring-[#b7d5cd] dark:border-none dark:bg-inventory-border dark:text-white dark:placeholder:text-inventory-text"
            />
          </div>
        </label>
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            className="flex h-10 min-w-[84px] items-center justify-center gap-2 rounded-lg bg-jade px-4 text-sm font-bold leading-normal text-white tracking-[0.015em]"
          >
            <MaterialIcon name="add" />
            <span>Add New Cargo</span>
          </button>
          <button
            type="button"
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-inventory-border px-2.5 text-sm font-bold leading-normal tracking-[0.015em] text-white"
          >
            <MaterialIcon name="notifications" />
          </button>
          <div
            className="size-10 rounded-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCUpXaW0kvwoc-86aLJNyvlH-bnoJOT_UabJ2XRTNRwGbBMgnbqp6lewcSMT2AAnJ6n1raC4GwQBIXklXj0DQIAIaFXtlLg8ccBpJzgHhL-_i671uF5HlIQ-aEwaGlJ7aSNhwDo-EcCjnBqe3NzQlP9fxWufu4Sd4g8RasL3WoYKaII_QBcItBbkNSVpUGvzBqeWILu4CclRzdlsZdX12kogyOSCpFoBGxBVNVULR5zXWxE_6uR9Ejz0fhyLefw5uJuX8N4-oENYnY')",
            }}
          />
        </div>
      </header>

      <section className="flex flex-col gap-2">
        <div className="flex min-w-72 flex-col gap-2">
          <p className="text-4xl font-black leading-tight tracking-tight">
            Cargo Inventory
          </p>
          <p className="text-base text-inventory-text">
            View, manage, and track all Cargo units in the system.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-between gap-4 rounded-2xl border border-inventory-border/40 bg-[#f0f5f4] px-4 py-3 text-[#1a312f] shadow-sm dark:border-inventory-border dark:bg-inventory-header dark:text-white">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-[#1a312f] shadow-sm transition hover:bg-[#e4edeb] dark:bg-inventory-border dark:text-white dark:hover:bg-inventory-hover"
          >
            <MaterialIcon name="filter_list" className="text-lg" />
            Filters
          </button>
          <span className="h-6 w-px bg-inventory-hover" />
          <label className="flex items-center gap-2 text-sm">
            Status:
            <select className="form-select rounded-md border-none bg-inventory-border text-sm text-white focus:border-primary focus:ring-primary">
              <option>All</option>
              <option>Available</option>
              <option>In Use</option>
              <option>Damaged</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            Type:
            <select className="form-select rounded-md border-none bg-inventory-border text-sm text-white focus:border-primary focus:ring-primary">
              <option>All Types</option>
              <option>AKE</option>
              <option>PMC</option>
              <option>PAG</option>
              <option>AMJ</option>
            </select>
          </label>
        </div>
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-md border border-white/20 bg-transparent px-4 text-sm font-medium text-white/50"
            disabled
          >
            <MaterialIcon name="layers" className="text-lg" />
            Bulk Actions
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-inventory-border/40 bg-white text-[#1a312f] shadow-sm dark:border-inventory-hover dark:bg-inventory-header dark:text-white">
        <table className="w-full text-sm">
          <thead className="bg-[#f2f5f4] text-left text-sm font-medium text-[#1a312f] dark:bg-[#20292B] dark:text-white">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-2 border-inventory-hover bg-transparent text-primary focus:outline-none focus:ring-0"
                />
              </th>
              <th className="px-4 py-3">UID</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Condition</th>
              <th className="px-4 py-3">Last Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {INVENTORY_ROWS.map((row) => {
              const style = STATUS_STYLE[row.statusTone];
              return (
                <tr
                  key={row.id}
                  className="border-t border-inventory-border/30 text-[#1a312f] dark:border-inventory-hover dark:text-inventory-text"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-2 border-inventory-hover bg-transparent text-primary focus:outline-none focus:ring-0"
                    />
                  </td>
                  <td className="px-4 py-4">{row.id}</td>
                  <td className="px-4 py-4">{row.type}</td>
                  <td className="px-4 py-4">{row.location}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-sm font-medium ${style.badge}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">{row.condition}</td>
                  <td className="px-4 py-4">{row.updatedAt}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-inventory-text">
                      <button
                        type="button"
                        onClick={() => openHistory(row)}
                        className="rounded-md p-2 hover:bg-inventory-border hover:text-white"
                        aria-label={`View history for ${row.id}`}
                      >
                        <MaterialIcon name="history" className="text-xl" />
                      </button>
                      <button
                        type="button"
                        className="rounded-md p-2 hover:bg-inventory-border hover:text-status-red"
                        aria-label={`Delete ${row.id}`}
                      >
                        <MaterialIcon name="delete" className="text-xl" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <footer className="flex items-center justify-between rounded-lg px-4 py-2 text-sm text-[#1a312f] dark:text-inventory-text">
        <span>Showing 1 to 5 of 1,234 Cargo units</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#dfe7e5] text-[#1a312f] hover:bg-[#e5efec] dark:border-inventory-border dark:bg-inventory-border dark:text-white dark:hover:bg-primary"
            aria-label="Go to previous page"
          >
            <MaterialIcon name="chevron_left" className="text-lg" />
          </button>
          <span className="text-sm">Page 1 of 247</span>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#dfe7e5] text-[#1a312f] hover:bg-[#e5efec] dark:border-inventory-border dark:bg-inventory-border dark:text-white dark:hover:bg-primary"
            aria-label="Go to next page"
          >
            <MaterialIcon name="chevron_right" className="text-lg" />
          </button>
        </div>
      </footer>

      {historyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-[#141C1F]">
            <div className="flex items-start justify-between">
              <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Cargo Lifecycle Audit Log
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {historyModal.uldId}
                </p>
              </div>
              <button
                type="button"
                onClick={closeHistory}
                className="rounded-md p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10"
                aria-label="Close history dialog"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-200">
              {historyModal.logs.map((entry, index) => (
                <div
                  key={`${historyModal.uldId}-${index}`}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-[#1F2A31]"
                >
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

