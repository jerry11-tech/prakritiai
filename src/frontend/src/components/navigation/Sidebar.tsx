import React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/AuthContext";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileCheck,
  BarChart3,
  History,
  Settings,
  LogOut,
  Leaf,
  Home,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Sidebar({ currentTab, onTabChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const role = user?.role || "USER";

  const adminLinks = [
    { id: "experts", label: "Practitioners", icon: ShieldCheck },
    { id: "users", label: "User Accounts", icon: Users },
    { id: "results", label: "System Results", icon: FileCheck },
    { id: "audit", label: "Audit Logs", icon: History },
    { id: "settings", label: "Security Settings", icon: Settings },
  ];

  const expertLinks = [
    { path: "/expert/dashboard", label: "Assigned Work", icon: LayoutDashboard },
    { path: "/expert/verified-data", label: "Verified Dataset", icon: FileCheck },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border/60 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-border/40 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-base shadow-xs group-hover:bg-primary/90 transition-colors">
              🌿
            </div>
            <div>
              <span className="font-display font-bold text-base text-foreground block leading-tight">
                Prakriti <span className="text-primary font-extrabold">AI</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium block">
                Understand. Balance. Thrive.
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-6">
          {/* Main Links */}
          <div>
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase px-3 mb-2 block">
              MAIN MENU
            </span>
            <div className="space-y-1">
              <Link
                to="/"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  pathname === "/" ? "bg-secondary text-primary font-bold" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Home className="h-4 w-4" /> Home Overview
              </Link>

              {role === "USER" && (
                <Link
                  to="/analysis"
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    pathname === "/analysis" ? "bg-secondary text-primary font-bold" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" /> Start Prakriti Assessment
                </Link>
              )}
            </div>
          </div>

          {/* Role-Specific Admin Tab System */}
          {role === "ADMIN" && (
            <div>
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase px-3 mb-2 block">
                ADMIN CONSOLE
              </span>
              <div className="space-y-1">
                {adminLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id || (pathname === "/admin" && currentTab === item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange && onTabChange(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${
                        isActive ? "bg-secondary text-primary font-bold" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expert Navigation */}
          {role === "EXPERT" && (
            <div>
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase px-3 mb-2 block">
                PRACTITIONER WORKSPACE
              </span>
              <div className="space-y-1">
                {expertLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        isActive ? "bg-secondary text-primary font-bold" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-border/40 space-y-2">
        {user ? (
          <div className="p-2.5 bg-muted/20 border border-border/40 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0)}
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-foreground block truncate">{user.name}</span>
                <span className="text-[10px] text-muted-foreground block truncate">{user.role} {user.specialization ? `· ${user.specialization}` : ""}</span>
              </div>
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={logout} title="Sign Out">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Link to="/login" className="block">
              <Button size="sm" variant="outline" className="w-full text-xs font-semibold">User Sign In</Button>
            </Link>
            <Link to="/expert/login" className="block">
              <Button size="sm" className="w-full text-xs font-semibold bg-primary text-primary-foreground">Expert Login</Button>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
