import { useEffect, useRef, useState } from "react";

import MaterialIcon from "@/components/MaterialIcon";

const DEFAULT_PROFILE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA1L7rM2zcncRnXLxVvRT4UpegMvQnzzcktxyMyRJxlJm5Lrwo7Vpgf-ubTejaj5D21MCQw46xvqCDN8aJKIjxM63DErtRIUgTtrHEpoNGg4AED3gNMDMeFynos7aNajADeuJhyHPx4viLOVMK7PLgFxzMI3Ad4EZ1QYBnkljjKWsP7aSQbhlTtvAZq-WYO0vmPuD-dTyc9IcMWwvLiN7rWz3eFK7MAqXBQWSTqRaKnQ9iBYlqyEaF1cJ0uFsiDdjujoTkp4_y1LWE";

const PERSONAL_INFO_STORAGE_KEY = "argos-personal-info";
const PREFERENCES_STORAGE_KEY = "argos-preferences";
const PROFILE_IMAGE_STORAGE_KEY = "argos-profile-image";
const AUTOMATION_STORAGE_KEY = "argos-automation-rules";

const DATE_FORMATS = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];
const LANGUAGE_OPTIONS = [
  { value: "english", label: "English" },
  { value: "traditional-chinese", label: "繁體中文" },
  { value: "german", label: "German" },
  { value: "simplified-chinese", label: "简体中文" },
];

export default function SettingsPage() {
  const fileInputRef = useRef(null);

  const [profileImage, setProfileImage] = useState(DEFAULT_PROFILE_IMAGE);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "John Doe",
    role: "Administrator",
    email: "john.doe@example.com",
    phone: "",
  });
  const [preferences, setPreferences] = useState({
    language: "english",
    timeZone: "(GMT-05:00) Eastern Time",
    dateFormat: "MM/DD/YYYY",
  });
  const [automationRules, setAutomationRules] = useState({
    criticalAlerts: true,
    criticalEmail: "manager@cathay.com",
    imbalanceAlerts: true,
    imbalanceThreshold: "20",
    misuseTracking: true,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedPersonalInfo = window.localStorage.getItem(
      PERSONAL_INFO_STORAGE_KEY
    );
    if (storedPersonalInfo) {
      try {
        setPersonalInfo(JSON.parse(storedPersonalInfo));
      } catch {
        /* ignore invalid data */
      }
    }

    const storedPreferences = window.localStorage.getItem(
      PREFERENCES_STORAGE_KEY
    );
    if (storedPreferences) {
      try {
        setPreferences(JSON.parse(storedPreferences));
      } catch {
        /* ignore invalid data */
      }
    }

    const storedImage = window.localStorage.getItem(PROFILE_IMAGE_STORAGE_KEY);
    if (storedImage) {
      setProfileImage(storedImage);
    }

    const storedAutomation = window.localStorage.getItem(
      AUTOMATION_STORAGE_KEY
    );
    if (storedAutomation) {
      try {
        setAutomationRules(JSON.parse(storedAutomation));
      } catch {
        /* ignore invalid data */
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      AUTOMATION_STORAGE_KEY,
      JSON.stringify(automationRules)
    );
  }, [automationRules]);

  const handlePersonalInfoChange = (field) => (event) => {
    const { value } = event.target;
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreferencesChange = (field) => (event) => {
    const value = event.target.value;
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAutomationRule = (field) => () => {
    setAutomationRules((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleAutomationInputChange = (field) => (event) => {
    setAutomationRules((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handlePasswordInputChange = (field) => (event) => {
    const { value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordStatus(null);
  };

  const savePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordStatus({ type: "error", message: "Please fill all fields." });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: "error", message: "New passwords do not match." });
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          old_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail.detail || "Failed to update password.");
      }

      setPasswordStatus({ type: "success", message: "Password updated successfully." });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordStatus({
        type: "error",
        message: error.message || "Unable to update password.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const savePersonalInfo = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      PERSONAL_INFO_STORAGE_KEY,
      JSON.stringify(personalInfo)
    );
    window.alert("Personal information saved.");
  };

  const savePreferences = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences)
    );
    window.alert("Preferences saved.");
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setProfileImage(result);
        window.localStorage.setItem(PROFILE_IMAGE_STORAGE_KEY, result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = () => {
    setProfileImage(DEFAULT_PROFILE_IMAGE);
    window.localStorage.removeItem(PROFILE_IMAGE_STORAGE_KEY);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 pb-16 text-gray-800 dark:text-gray-200">
      <header>
        <h1 className="text-4xl font-black leading-tight tracking-tight text-gray-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          Manage your personal information, password, and preferences.
        </p>
      </header>

      <section className="rounded-xl border border-[#1a312f] bg-[#1a312f] p-6 shadow-sm text-white">
        <div className="flex flex-col gap-6 @[520px]:flex-row @[520px]:items-center @[520px]:justify-between">
          <div className="flex items-center gap-5">
            <img
              src={profileImage}
              alt="Profile"
              className="h-24 w-24 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <p className="text-xl font-bold leading-tight text-white">
                {personalInfo.fullName}
              </p>
              <p className="text-base text-white/80">
                {personalInfo.email}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 @[480px]:flex-row">
            <button
              type="button"
              onClick={handleDeletePhoto}
              className="flex h-11 min-w-[84px] items-center justify-center rounded-lg border border-white/60 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Delete Picture
            </button>
            <button
              type="button"
              onClick={triggerPhotoUpload}
               className="flex h-11 min-w-[84px] items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold text-[#006462] transition hover:bg-opacity-90"
            >
              Upload new picture
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#1a312f] bg-[#1a312f] p-6 text-white shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Automation & Alert Rules
            </h2>
            <p className="text-sm text-white/80">
              Configure proactive alerts for mission-critical events.
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-6">
          <div className="rounded-lg border border-white/25 px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <MaterialIcon name="mail" className="text-[#005A9C]" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Email - Critical Alerts
                  </p>
                  <p className="text-xs text-white/70">
                    Notify managers immediately when a Cargo turns RED.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={automationRules.criticalAlerts}
                onClick={toggleAutomationRule("criticalAlerts")}
                className={`inline-flex h-6 w-11 items-center rounded-full transition ${
                  automationRules.criticalAlerts
                    ? "bg-[#005A9C]"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full bg-white shadow transition ${
                    automationRules.criticalAlerts ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-white">
                Email Recipient
              </label>
              <input
                type="email"
                value={automationRules.criticalEmail}
                onChange={handleAutomationInputChange("criticalEmail")}
                className="mt-1 w-full rounded-lg border border-[#DDE1E6] bg-[#F2F4F7] px-3 py-2 text-sm text-gray-900 focus:border-[#005A9C] focus:outline-none focus:ring-[#005A9C]/40 dark:border-[#344054] dark:bg-[#101828] dark:text-gray-200"
              />
            </div>
          </div>

          <div className="rounded-lg border border-white/25 px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <MaterialIcon name="local_shipping" className="text-[#005A9C]" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Truck - Imbalance Alerts
                  </p>
                  <p className="text-xs text-white/70">
                    Trigger relocation workflow when SFO AKE supply dips below target.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={automationRules.imbalanceAlerts}
                onClick={toggleAutomationRule("imbalanceAlerts")}
                className={`inline-flex h-6 w-11 items-center rounded-full transition ${
                  automationRules.imbalanceAlerts
                    ? "bg-[#005A9C]"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full bg-white shadow transition ${
                    automationRules.imbalanceAlerts ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Threshold (units)
              </label>
              <input
                type="number"
                min="0"
                value={automationRules.imbalanceThreshold}
                onChange={handleAutomationInputChange("imbalanceThreshold")}
                className="mt-1 w-full rounded-lg border border-[#DDE1E6] bg-[#F2F4F7] px-3 py-2 text-sm text-gray-900 focus:border-[#005A9C] focus:outline-none focus:ring-[#005A9C]/40 dark:border-[#344054] dark:bg-[#101828] dark:text-gray-200"
              />
            </div>
          </div>

          <div className="rounded-lg border border-white/25 px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <MaterialIcon name="build" className="text-[#005A9C]" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Wrench - Misuse Tracking
                  </p>
                  <p className="text-xs text-white/70">
                    Auto-flag scans that occur outside approved facilities and log to audit history.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={automationRules.misuseTracking}
                onClick={toggleAutomationRule("misuseTracking")}
                className={`inline-flex h-6 w-11 items-center rounded-full transition ${
                  automationRules.misuseTracking
                    ? "bg-[#005A9C]"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full bg-white shadow transition ${
                    automationRules.misuseTracking ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#1a312f] bg-[#1a312f] text-white">
        <header className="border-b border-white/20 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Personal Information</h2>
          <p className="text-sm text-white/80">
            Update your personal details here.
          </p>
        </header>
        <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-white">
              Full Name
            </span>
            <input
              type="text"
              value={personalInfo.fullName}
              onChange={handlePersonalInfoChange("fullName")}
              className="h-11 rounded-lg border border-[#DDE1E6] bg-[#F2F4F7] px-3 text-base text-gray-900 focus:border-[#005A9C] focus:outline-none focus:ring-[#005A9C]/50 dark:border-[#344054] dark:bg-[#101828] dark:text-gray-200"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-white">
              Role
            </span>
            <input
              type="text"
              disabled
              value={personalInfo.role}
              className="h-11 cursor-not-allowed rounded-lg border border-[#DDE1E6] bg-gray-100 px-3 text-base text-gray-500 dark:border-[#344054] dark:bg-gray-800 dark:text-gray-400"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-white">
              Email Address
            </span>
            <input
              type="email"
              value={personalInfo.email}
              onChange={handlePersonalInfoChange("email")}
              className="h-11 rounded-lg border border-[#DDE1E6] bg-[#F2F4F7] px-3 text-base text-gray-900 focus:border-[#005A9C] focus:outline-none focus:ring-[#005A9C]/50 dark:border-[#344054] dark:bg-[#101828] dark:text-gray-200"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-white">
              Phone Number
            </span>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={personalInfo.phone}
              onChange={handlePersonalInfoChange("phone")}
              className="h-11 rounded-lg border border-[#DDE1E6] bg-[#F2F4F7] px-3 text-base text-gray-900 focus:border-[#005A9C] focus:outline-none focus:ring-[#005A9C]/50 dark:border-[#344054] dark:bg-[#101828] dark:text-gray-200"
            />
          </label>
        </div>
        <div className="border-t border-[#DDE1E6] px-6 py-6 dark:border-[#344054]">
          <div className="rounded-lg border border-[#DDE1E6] p-4 dark:border-[#344054] dark:bg-[#101828]">
            <h3 className="text-base font-semibold text-white">
              Change Password
            </h3>
            <p className="text-sm text-white/70">
              Update your password regularly to keep your account secure.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-1.5 text-sm md:col-span-1">
                <span className="font-medium text-white">
                  Current Password
                </span>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordInputChange("currentPassword")}
                  className="h-10 rounded-lg border border-[#DDE1E6] bg-[#F2F4F7] px-3 text-sm text-gray-900 focus:border-[#005A9C] focus:outline-none focus:ring-[#005A9C]/40 dark:border-[#344054] dark:bg-[#1F2939] dark:text-gray-200"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm md:col-span-1">
                <span className="font-medium text-white">
                  New Password
                </span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInputChange("newPassword")}
                  className="h-10 rounded-lg border border-[#DDE1E6] bg-[#F2F4F7] px-3 text-sm text-gray-900 focus:border-[#005A9C] focus:outline-none focus:ring-[#005A9C]/40 dark:border-[#344054] dark:bg-[#1F2939] dark:text-gray-200"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm md:col-span-1">
                <span className="font-medium text-white">
                  Confirm New Password
                </span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordInputChange("confirmPassword")}
                  className="h-10 rounded-lg border border-[#DDE1E6] bg-[#F2F4F7] px-3 text-sm text-gray-900 focus:border-[#005A9C] focus:outline-none focus:ring-[#005A9C]/40 dark:border-[#344054] dark:bg-[#1F2939] dark:text-gray-200"
                />
              </label>
            </div>
            {passwordStatus && (
              <p
                className={`mt-3 text-sm ${
                  passwordStatus.type === "success"
                    ? "text-jade"
                    : "text-accent-red"
                }`}
              >
                {passwordStatus.message}
              </p>
            )}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={savePassword}
                disabled={passwordLoading}
                className="flex h-10 items-center justify-center rounded-lg bg-[#005A9C] px-4 text-sm font-semibold text-white transition hover:bg-[#0a66a8] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {passwordLoading ? "Saving..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
        <footer className="flex justify-end border-t border-[#DDE1E6] px-6 py-4 dark:border-[#344054]">
          <button
            type="button"
            onClick={savePersonalInfo}
            className="flex h-11 items-center justify-center rounded-lg bg-[#005A9C] px-5 text-sm font-semibold text-white hover:bg-[#0a66a8]"
          >
            Save Changes
          </button>
        </footer>
      </section>

      <section className="rounded-xl border border-[#1a312f] bg-[#1a312f] text-white">
        <header className="border-b border-white/20 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Preferences</h2>
          <p className="text-sm text-white/80">
            Adjust your language, time zone, and date format settings.
          </p>
        </header>
        <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-white">
              Language
            </span>
            <select
              className="h-11 rounded-lg border border-[#DDE1E6] bg-[#F2F4F7] px-3 text-base text-gray-900 focus:border-[#005A9C] focus:outline-none focus:ring-[#005A9C]/50 dark:border-[#344054] dark:bg-[#101828] dark:text-gray-200"
              value={preferences.language}
              onChange={handlePreferencesChange("language")}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-white">
              Time Zone
            </span>
            <select
              className="h-11 rounded-lg border border-[#DDE1E6] bg-[#F2F4F7] px-3 text-base text-gray-900 focus:border-[#005A9C] focus:outline-none focus:ring-[#005A9C]/50 dark:border-[#344054] dark:bg-[#101828] dark:text-gray-200"
              value={preferences.timeZone}
              onChange={handlePreferencesChange("timeZone")}
            >
              <option>(GMT-05:00) Eastern Time</option>
              <option>(GMT-08:00) Pacific Time</option>
              <option>(GMT+00:00) Greenwich Mean Time</option>
              <option>(GMT+08:00) Taipei Standard Time</option>
            </select>
          </label>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-white">
              Date Format
            </p>
            <div className="mt-2 flex flex-wrap gap-4">
              {DATE_FORMATS.map((format) => (
                <label
                  key={format}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <input
                    type="radio"
                    name="date-format"
                    value={format}
                    checked={preferences.dateFormat === format}
                    onChange={handlePreferencesChange("dateFormat")}
                    className="text-[#005A9C] focus:ring-[#005A9C]/50"
                  />
                  {format}
                </label>
              ))}
            </div>
          </div>
        </div>
        <footer className="flex justify-end border-t border-[#DDE1E6] px-6 py-4 dark:border-[#344054]">
          <button
            type="button"
            onClick={savePreferences}
            className="flex h-11 items-center justify-center rounded-lg bg-[#005A9C] px-5 text-sm font-semibold text-white hover:bg-[#0a66a8]"
          >
            Save Preferences
          </button>
        </footer>
      </section>
    </div>
  );
}

