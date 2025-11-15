import { useEffect, useState } from "react";

const COOKIE_PREF_KEY = "argos-cookie-preferences";

export default function LoginPage({ onSuccess }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cookiePrefs, setCookiePrefs] = useState({
    analytics: false,
    marketing: false,
    decision: null,
  });
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(true);
  const [isCookieBannerVisible, setIsCookieBannerVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(COOKIE_PREF_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCookiePrefs({
          analytics: Boolean(parsed.analytics),
          marketing: Boolean(parsed.marketing),
          decision: parsed.decision || "custom",
        });
        setIsCookieBannerVisible(false);
        setIsCookieModalOpen(false);
      } catch {
        window.localStorage.removeItem(COOKIE_PREF_KEY);
      }
    }
  }, []);

  const handleChange = (field) => (event) => {
    const value =
      field === "remember" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const persistCookiePrefs = (prefs) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      COOKIE_PREF_KEY,
      JSON.stringify({
        necessary: true,
        analytics: prefs.analytics,
        marketing: prefs.marketing,
        decision: prefs.decision,
        updatedAt: new Date().toISOString(),
      })
    );
  };

  const handleCookieAcceptAll = () => {
    const updated = { analytics: true, marketing: true, decision: "accept_all" };
    setCookiePrefs(updated);
    persistCookiePrefs(updated);
    setIsCookieBannerVisible(false);
    setIsCookieModalOpen(false);
  };

  const handleCookieRejectAll = () => {
    const updated = {
      analytics: false,
      marketing: false,
      decision: "reject_all",
    };
    setCookiePrefs(updated);
    persistCookiePrefs(updated);
    setIsCookieBannerVisible(false);
    setIsCookieModalOpen(false);
  };

  const handleCookieSave = () => {
    const updated = { ...cookiePrefs, decision: "custom" };
    setCookiePrefs(updated);
    persistCookiePrefs(updated);
    setIsCookieBannerVisible(false);
    setIsCookieModalOpen(false);
  };

  const handleCookieToggle = (field) => (event) => {
    const { checked } = event.target;
    setCookiePrefs((prev) => ({ ...prev, [field]: checked }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          remember_me: form.remember,
        }),
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail.detail || "Invalid credentials");
      }
      const data = await response.json();
      window.localStorage.removeItem("argos-token");
      window.sessionStorage.removeItem("argos-token");
      if (form.remember) {
        window.localStorage.setItem("argos-token", data.token);
      } else {
        window.sessionStorage.setItem("argos-token", data.token);
      }
      const cookieAttributes = [
        `argos-token=${data.token}`,
        "Path=/",
        "SameSite=Lax",
      ];
      if (form.remember) {
        cookieAttributes.push(`Max-Age=${60 * 60 * 24 * 7}`);
      }
      document.cookie = cookieAttributes.join("; ");
      onSuccess(data.token);
    } catch (err) {
      setError(err.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background-light px-4 py-10 font-display text-gray-800 transition dark:bg-background-dark dark:text-gray-200">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6">
        <div className="text-center">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvdteXrBkfczdm_pngjJkL8QytMvQ1E4MhpXpolfI6PNh4p54rUzmvPEA32oENdpZTpZ-SLdoflm1VPfAELXd758eZb9d5rr3TiN0P9qrCJRPkUL76XFrnaEhRs7QqiPVQXNkUpAlbFVPxFPNylGXUaAXitC9FGC2vgk_jtLQt5VBdqVqkefa_jPx_4HMm1tF8ajZ8vH1DIiiMxWtbR-2pvUZOEPkh0bBdAcGLoXxtROFMCk_SHKBhV1p7l8Lrmc2cmJy5rl9XGxY"
            alt="Cathay Cargo Logo"
            className="mx-auto mb-4 h-12 w-auto"
          />
                  <p className="text-xl text-slate-600 dark:text-slate-300">
                    Cargo Management System
          </p>
        </div>

        <div className="w-full rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            Login to your account.
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  person
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange("username")}
                  className="block w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  lock
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange("password")}
                  className="block w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="mt-2 text-right">
                <a
                  href="#"
                  className="text-sm font-medium text-[#00645A] hover:text-green-800 dark:hover:text-green-400"
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={handleChange("remember")}
                  className="h-4 w-4 rounded border-gray-300 text-[#00645A] focus:ring-[#00645A] dark:border-gray-600 dark:bg-gray-700"
                />
                Remember me
              </label>
            </div>

            {error && (
              <p className="text-sm font-medium text-accent-red">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#00645A] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-[#00645A] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </div>

      {isCookieBannerVisible && isCookieModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 px-4 py-6">
          <div className="mx-auto flex h-full max-w-2xl items-center">
            <div className="flex w-full flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-800">
              <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Manage Your Cookie Preferences
                </h2>
                <button
                  type="button"
                  className="text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-200"
                  onClick={() => setIsCookieModalOpen(false)}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="max-h-[60vh] space-y-6 overflow-y-auto p-6">
                <p className="text-gray-600 dark:text-gray-300">
                  You have control over your information. We use cookies to
                  improve your experience and for marketing purposes. You can
                  choose which types of cookies to allow below. For more
                  details, please see our{" "}
                  <a
                    className="text-[#006460] underline-offset-2 hover:underline"
                    href="#"
                  >
                    Cookie Policy
                  </a>
                  .
                </p>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                        Strictly Necessary Cookies
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        These cookies are essential for the website to function
                        and cannot be switched off.
                      </p>
                    </div>
                    <div className="relative inline-flex h-6 cursor-not-allowed items-center">
                      <input
                        id="necessary-cookies"
                        type="checkbox"
                        checked
                        disabled
                        className="toggle-checkbox sr-only"
                      />
                      <div className="toggle-label h-6 w-11 rounded-full border border-gray-200 bg-gray-200 transition-colors dark:border-gray-700 dark:bg-gray-700" />
                      <div className="absolute left-1 top-1 h-4 w-4 translate-x-5 rounded-full bg-white transition-transform" />
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                        Performance &amp; Analytics Cookies
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        These cookies allow us to count visits and traffic
                        sources so we can measure performance.
                      </p>
                    </div>
                    <label
                      className="relative inline-flex h-6 cursor-pointer items-center"
                      htmlFor="analytics-cookies"
                    >
                      <input
                        id="analytics-cookies"
                        type="checkbox"
                        className="toggle-checkbox peer sr-only"
                        checked={cookiePrefs.analytics}
                        onChange={handleCookieToggle("analytics")}
                      />
                      <div className="toggle-label h-6 w-11 rounded-full border border-gray-200 bg-gray-200 transition-colors duration-200 peer-checked:bg-[#006460] dark:border-gray-700 dark:bg-gray-700" />
                      <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 peer-checked:translate-x-5" />
                    </label>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                        Marketing Cookies
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        These cookies may be set by advertising partners to
                        build a profile of your interests.
                      </p>
                    </div>
                    <label
                      className="relative inline-flex h-6 cursor-pointer items-center"
                      htmlFor="marketing-cookies"
                    >
                      <input
                        id="marketing-cookies"
                        type="checkbox"
                        className="toggle-checkbox peer sr-only"
                        checked={cookiePrefs.marketing}
                        onChange={handleCookieToggle("marketing")}
                      />
                      <div className="toggle-label h-6 w-11 rounded-full border border-gray-200 bg-gray-200 transition-colors duration-200 peer-checked:bg-[#006460] dark:border-gray-700 dark:bg-gray-700" />
                      <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 peer-checked:translate-x-5" />
                    </label>
                  </div>
                </div>
              </div>
              <div className="rounded-b-xl border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
                <div className="flex flex-col gap-3 sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleCookieSave}
                    className="flex h-10 w-full items-center justify-center rounded-lg bg-[#006460] px-4 text-sm font-bold text-white transition hover:bg-[#00514d] sm:w-auto"
                  >
                    Save My Preferences
                  </button>
                  <button
                    type="button"
                    onClick={handleCookieAcceptAll}
                    className="flex h-10 w-full items-center justify-center rounded-lg bg-gray-100 px-4 text-sm font-bold text-gray-800 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 sm:w-auto"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCookieBannerVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-background-light py-4 text-gray-900 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] dark:bg-background-dark dark:text-gray-100 dark:shadow-[0_-2px_15px_rgba(0,0,0,0.3)]">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
            <div className="text-center md:text-left">
              <p className="text-base font-semibold">This website uses cookies</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                We use cookies to improve your experience, analyze traffic, and
                for marketing purposes.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsCookieModalOpen(true)}
                className="flex h-10 min-w-[84px] items-center justify-center rounded-lg px-4 text-sm font-bold text-[#006460] transition hover:bg-[#006460]/10"
              >
                Customize Preferences
              </button>
              <button
                type="button"
                onClick={handleCookieRejectAll}
                className="flex h-10 min-w-[84px] items-center justify-center rounded-lg bg-gray-200 px-4 text-sm font-bold text-gray-800 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Reject All
              </button>
              <button
                type="button"
                onClick={handleCookieAcceptAll}
                className="flex h-10 min-w-[84px] items-center justify-center rounded-lg bg-[#006460] px-4 text-sm font-bold text-white transition hover:bg-[#00514d]"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

