import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, LogOut, Settings, User } from "lucide-react";
import {
  LayoutDashboard,
  Activity,
  TrendingUp,
  AlertTriangle,
  FileText,
  Cog} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/", badge: null },
  { label: "Live Monitoring", icon: Activity, href: "/monitoring", badge: "Real-time" },
  { label: "Predictions", icon: TrendingUp, href: "/predictions", badge: null },
  { label: "Alerts", icon: AlertTriangle, href: "/alerts", badge: "1 Critical" },
  { label: "Reports", icon: FileText, href: "/reports", badge: null },
  { label: "Settings", icon: Cog, href: "/settings", badge: null },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (href) => location.pathname === href;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar transition-all duration-300 flex flex-col border-r border-sidebar-border/50 shadow-lg",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border/40 bg-gradient-to-r from-sidebar/50 to-sidebar">
          <div
            className={cn(
              "flex items-center gap-3 transition-all duration-300",
              !sidebarOpen && "justify-center w-12"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-white font-bold" />
            </div>
            {sidebarOpen && (
              <h1 className="text-lg font-bold bg-gradient-to-r from-sidebar-primary to-accent bg-clip-text text-transparent">
                AirQuality
              </h1>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative justify-between",
                  active
                    ? "bg-gradient-to-r from-sidebar-primary/40 to-sidebar-primary/20 text-sidebar-primary font-semibold border border-sidebar-primary/30 shadow-lg"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary"
                )}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-full"></div>
                )}
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", active ? "text-sidebar-primary" : "group-hover:text-sidebar-primary")} />
                  {sidebarOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </div>
                {sidebarOpen && item.badge && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-status-critical/20 text-status-critical whitespace-nowrap">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-sidebar-border/40 p-3 bg-gradient-to-r from-sidebar/50 to-sidebar">
          <button
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-primary/20 hover:border hover:border-sidebar-primary/30 group",
              !sidebarOpen && "justify-center"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sidebar-primary to-accent flex items-center justify-center flex-shrink-0 shadow-md">
              <User className="w-4 h-4 text-white" />
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold">Admin</p>
                  <p className="text-xs text-sidebar-foreground/60 font-medium">Online</p>
                </div>
                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-card border-b border-border/40 flex items-center justify-between px-6 shadow-sm backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground/60">Dashboard</span>
              <span className="text-muted-foreground/40">›</span>
              <span className="text-foreground font-medium">System Overview</span>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden lg:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search alerts, zones, metrics..."
                className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/40 focus:bg-muted transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-status-good/10 text-status-good border border-status-good/20">
                <div className="w-2 h-2 rounded-full bg-status-good animate-pulse"></div>
                <span className="font-medium text-xs">Live</span>
              </div>
            </div>

            <button className="relative p-2 hover:bg-muted rounded-lg transition-all duration-200 group text-muted-foreground hover:text-foreground">
              <div className="relative">
                <AlertTriangle className="w-5 h-5 text-status-high" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-status-high rounded-full animate-pulse"></span>
              </div>
            </button>

            <div className="h-8 w-px bg-border/40"></div>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-muted rounded-lg transition-all duration-200 group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-foreground">Admin</p>
                  <p className="text-xs text-muted-foreground/60">System Owner</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <User className="w-4 h-4 text-white" />
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-card rounded-lg shadow-xl border border-border z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/40 bg-muted/30">
                    <p className="text-sm font-semibold text-foreground">Admin Account</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">admin@aiQuality.system</p>
                  </div>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors font-medium"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    System Settings
                  </Link>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors font-medium border-t border-border/40">
                    <LogOut className="w-4 h-4 text-muted-foreground" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
