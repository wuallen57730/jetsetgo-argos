import { useEffect, useState } from "react";

const COOKIE_PREF_STORAGE_KEY = "argos-cookie-preferences";

const DEFAULT_COOKIE_PREFS = {
  necessary: true,
  performance: true,
  functional: false,
  targeting: false,
};

const CookieRow = ({
  icon,
  title,
  description,
  value,
  disabled,
  onToggle,
}) => {
  return (
    <div className="flex items-center gap-4 rounded-lg p-4 min-h-[72px] justify-between transition-colors hover:bg-gray-50 dark:hover:bg-black/20">
      <div className="flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-[#00645A] dark:bg-[#102220] dark:text-[#13ecda]">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-base font-medium leading-normal text-[#1A312F] dark:text-white">
            {title}
          </p>
          <p className="text-sm font-normal leading-normal text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
      <div className="shrink-0">
        <label
          className={`relative flex h-[31px] w-[51px] items-center rounded-full border-none p-0.5 transition-colors ${
            disabled
              ? "cursor-not-allowed bg-gray-300 dark:bg-black/20 justify-end"
              : value
                ? "cursor-pointer justify-end bg-[#00645A] dark:bg-[#13ecda]"
                : "cursor-pointer justify-start bg-gray-300 dark:bg-black/20"
          }`}
        >
          <div
            className="h-full w-[27px] rounded-full bg-white transition-transform dark:bg-gray-500"
            style={{
              boxShadow:
                "rgba(0, 0, 0, 0.15) 0px 3px 8px, rgba(0, 0, 0, 0.06) 0px 3px 1px",
              transform: value ? "translateX(0)" : "translateX(0)",
            }}
          />
          <input
            type="checkbox"
            className="invisible absolute"
            checked={value}
            disabled={disabled}
            onChange={() => onToggle(!value)}
          />
        </label>
      </div>
    </div>
  );
};

export default function CookiePreferences() {
  const [preferences, setPreferences] = useState(DEFAULT_COOKIE_PREFS);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(COOKIE_PREF_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_COOKIE_PREFS, ...parsed });
      } catch {
        /* ignore invalid data */
      }
    }
  }, []);

  const persistPreferences = (prefs) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(COOKIE_PREF_STORAGE_KEY, JSON.stringify(prefs));
    document.cookie = `argos-cookie-pref=${encodeURIComponent(
      JSON.stringify(prefs)
    )}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  };

  const handleToggle = (key) => (value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setStatus(null);
  };

  const handleSave = () => {
    persistPreferences(preferences);
    setStatus("saved");
  };

  const handleAcceptAll = () => {
    const updated = {
      necessary: true,
      performance: true,
      functional: true,
      targeting: true,
    };
    setPreferences(updated);
    persistPreferences(updated);
    setStatus("accepted");
  };

  return (
    <div className="bg-background-light px-4 py-10 font-display text-gray-800 transition dark:bg-background-dark dark:text-gray-200">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center">
        <div className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#1A312F] dark:shadow-black/50">
          <header className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-white/10">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-[#1A312F] dark:text-white">
                Manage Your Cookie Preferences
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                We use cookies to enhance your experience on our website. You
                can customize your settings below. For more details, please see
                our{" "}
                <a
                  href="#"
                  className="text-[#00645A] hover:underline dark:text-[#13ecda]"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
            <span className="material-symbols-outlined text-3xl text-gray-500 dark:text-gray-300">
              lock
            </span>
          </header>

          <div className="space-y-2 p-4">
            <CookieRow
              icon="lock"
              title="Strictly Necessary Cookies"
              description="Essential for security, network management, and accessibility. These cannot be disabled."
              value={true}
              disabled
              onToggle={() => {}}
            />
            <CookieRow
              icon="analytics"
              title="Performance Cookies"
              description="Help us understand how you use the site so we can improve performance."
              value={preferences.performance}
              onToggle={handleToggle("performance")}
            />
            <CookieRow
              icon="tune"
              title="Functional Cookies"
              description="Remember your preferences (language, region) to enhance experience."
              value={preferences.functional}
              onToggle={handleToggle("functional")}
            />
            <CookieRow
              icon="ads_click"
              title="Targeting Cookies"
              description="Used to show you relevant ads across other websites."
              value={preferences.targeting}
              onToggle={handleToggle("targeting")}
            />
          </div>

          <footer className="flex flex-col items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6 dark:border-white/10 dark:bg-black/20 sm:flex-row">
            {status && (
              <p
                className={`text-sm ${
                  status === "accepted" ? "text-[#13ecda]" : "text-[#00645A]"
                }`}
              >
                {status === "accepted"
                  ? "All cookies accepted."
                  : "Preferences saved."}
              </p>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="w-full rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-[#1A312F] transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-white/10 sm:w-auto"
            >
              Save My Preferences
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="w-full rounded-lg bg-[#00645A] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-opacity-90 dark:bg-[#13ecda] dark:text-[#1A312F] dark:hover:bg-opacity-90 sm:w-auto"
            >
              Accept All Cookies
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}

