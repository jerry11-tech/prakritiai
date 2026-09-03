import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/AuthContext";
import { PrakritiBadge } from "@/components/prakriti/PrakritiBadge";
import { HotkeyModal } from "@/components/prakriti/HotkeyModal";
import { Button } from "@/components/ui/button";
import { Search, Bell, LogOut, Sun, Moon, Keyboard } from "lucide-react";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  actions?: React.ReactNode;
}

export function AppHeader({ title, subtitle, searchValue, onSearchChange, actions }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHotkeyModal, setShowHotkeyModal] = useState(false);

  const toggleTheme = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("prakriti_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("prakriti_theme", "light");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("prakriti_theme");
    if (saved === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Global hotkey handler for '?'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "?") {
        e.preventDefault();
        setShowHotkeyModal((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 w-full bg-card/95 backdrop-blur-md border-b border-border/50 px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div>
          {title && <h1 className="font-display font-extrabold text-xl text-foreground leading-tight">{title}</h1>}
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        {/* Center Search Bar */}
        {onSearchChange !== undefined && (
          <div className="relative max-w-md w-full hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search records, users, or tests..."
              className="w-full pl-9 pr-4 py-1.5 bg-background border border-border/60 rounded-lg text-xs text-foreground placeholder-muted-foreground/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        )}

        {/* Right User, Theme, & Notifications Controls */}
        <div className="flex items-center gap-2">
          {actions}

          {/* Theme Toggle Button */}
          <Button size="icon" variant="ghost" onClick={toggleTheme} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Toggle Light/Dark Theme">
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Hotkey Helper Trigger */}
          <Button size="icon" variant="ghost" onClick={() => setShowHotkeyModal(true)} className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex" title="Keyboard Shortcuts (?)">
            <Keyboard className="h-4 w-4" />
          </Button>

          {/* Notification Bell */}
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowNotifications(!showNotifications)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground relative"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {user?.role === "EXPERT" && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-ping" />}
            </Button>

            {/* Notification Dropdown Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-card border border-border/60 rounded-2xl shadow-card p-4 space-y-3 z-30 animate-fadeUp">
                <div className="flex justify-between items-center border-b border-border/40 pb-2">
                  <span className="font-bold text-xs text-foreground">Practitioner Notifications</span>
                  <span className="text-[10px] text-primary font-bold">Active</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-muted/20 rounded-xl border border-border/30">
                    <span className="font-semibold block text-foreground">Clinical Cases Active</span>
                    <p className="text-[11px] text-muted-foreground">Cases assigned matching your {user?.specialization || "Ayurvedic"} specialization.</p>
                  </div>
                  <div className="p-2 bg-muted/20 rounded-xl border border-border/30">
                    <span className="font-semibold block text-foreground">Excel Dataset Auto-Sync</span>
                    <p className="text-[11px] text-muted-foreground">5-Sheet sync active with SQLite ground-truth database.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-border/40">
              {user.role === "ADMIN" && <PrakritiBadge type="APPROVED" label="ADMIN" size="sm" />}
              {user.role === "EXPERT" && <PrakritiBadge type={user.specialization || "EXPERT"} label={`${user.specialization || "EXPERT"}`} size="sm" />}

              <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0)}
              </div>
              <Button size="sm" variant="ghost" onClick={logout} className="text-xs text-muted-foreground hover:text-foreground h-7 px-2">
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button size="sm" variant="outline" className="text-xs">Sign In</Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hotkey Modal */}
      <HotkeyModal isOpen={showHotkeyModal} onClose={() => setShowHotkeyModal(false)} />
    </>
  );
}
