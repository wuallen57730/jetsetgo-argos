// 檔案名稱: frontend/src/App.jsx (還原)

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import Dashboard from "@/components/Dashboard";
import InventoryManagement from "@/pages/InventoryManagement";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";
import MaterialIcon from "@/components/MaterialIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import "./index.css";

const THEME_STORAGE_KEY = "argos-theme";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "inventory", label: "Inventory", icon: "inventory_2" },
  { id: "reports", label: "Reports", icon: "assessment" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [activePage, setActivePage] = useState("dashboard");
  const [authToken, setAuthToken] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const getCookieValue = (name) => {
    if (typeof document === "undefined") return null;
    const value = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`));
    return value ? decodeURIComponent(value.split("=")[1]) : null;
  };

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken =
      window.localStorage.getItem("argos-token") ||
      window.sessionStorage.getItem("argos-token");
    const cookieToken = getCookieValue("argos-token");
    const token = storedToken || cookieToken;
    if (token) {
      setAuthToken(token);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  const handleLoginSuccess = (token) => {
    setAuthToken(token);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("argos-token");
      window.sessionStorage.removeItem("argos-token");
      document.cookie =
        "argos-token=; Max-Age=0; path=/; samesite=lax; secure=false;";
    }
    setAuthToken(null);
    setActivePage("dashboard");
  };

  const renderPage = () => {
    switch (activePage) {
      case "inventory":
        return <InventoryManagement />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      case "dashboard":
      default:
        return <Dashboard />;
    }
  };

  if (!authToken) {
    return <LoginPage onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-background-light text-gray-800 transition-colors dark:bg-background-dark dark:text-gray-200">
      <aside
        className={cn(
          "hidden h-screen flex-col border-r border-[#10211d] bg-[#1a312f] text-white transition-all duration-300 md:sticky md:top-0 md:flex",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          <div
            className={cn(
              "sticky top-0 z-10 flex items-center justify-between border-b border-white/10 px-3 py-4",
              isSidebarCollapsed ? "px-2" : "px-3"
            )}
          >
            <div className="flex items-center gap-3">
              <img
                src="/argos_logo.png"
                alt="Argos logo"
                className={cn(
                  "rounded-full object-cover transition-all",
                  isSidebarCollapsed ? "size-10" : "size-12"
                )}
              />
              {!isSidebarCollapsed && (
                <div className="flex flex-col">
                  <h1 className="text-base font-semibold leading-tight">
                    Cargo Management
                  </h1>
                  <p className="text-sm leading-tight text-white/70">
                    Global Operations
                  </p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="rounded-lg border border-white/20 p-1 text-white transition hover:bg-white/10"
              aria-label="Toggle sidebar"
            >
              <MaterialIcon
                name={isSidebarCollapsed ? "chevron_right" : "chevron_left"}
              />
            </button>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
            <nav className="flex flex-1 flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = item.id === activePage;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActivePage(item.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                      isSidebarCollapsed
                        ? "justify-center px-2"
                        : "justify-start",
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-white/70 hover:bg-white/10"
                    )}
                  >
                    <MaterialIcon name={item.icon} className="text-xl" />
                    {!isSidebarCollapsed && item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="px-3 pb-4">
            <button
              type="button"
              onClick={handleLogout}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white transition",
                "bg-accent-red hover:bg-accent-red/90",
                isSidebarCollapsed ? "justify-center px-2" : "justify-start"
              )}
            >
              <MaterialIcon name="logout" className="text-xl" />
              {!isSidebarCollapsed && "Logout"}
            </button>
          </div>
        </div>
      </aside>
      <main className="flex flex-1 flex-col">
        <div className="flex justify-end gap-2 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "切換為淺色模式" : "切換為深色模式"}
            className="border border-jade/30 bg-jade text-white hover:bg-teal hover:text-white dark:border-teal"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-8 md:px-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
