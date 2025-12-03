"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Shield,
  BarChart3,
  Settings,
  FileText,
  HeadphonesIcon,
  ChevronLeft,
  ChevronRight,
  Mail,
  Plug,
  Lock,
  TrendingUp,
  Activity,
  DollarSign,
  UserCheck,
  Database,
  Zap,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  roles?: string[]; // Roles that can see this item
}

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Event Verification",
    href: "/admin/events",
    icon: Calendar,
    badge: 12,
    roles: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
  },
  {
    title: "Analytics & Reports",
    href: "/admin/analytics",
    icon: BarChart3,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Revenue",
    href: "/admin/analytics/revenue",
    icon: DollarSign,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "User Growth",
    href: "/admin/analytics/users",
    icon: TrendingUp,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Event Metrics",
    href: "/admin/analytics/events",
    icon: Activity,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "System Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Platform Config",
    href: "/admin/settings/platform",
    icon: Shield,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Email Templates",
    href: "/admin/settings/email",
    icon: Mail,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "API Integrations",
    href: "/admin/settings/integrations",
    icon: Plug,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Security",
    href: "/admin/settings/security",
    icon: Lock,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Audit Logs",
    href: "/admin/audit",
    icon: FileText,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Bulk Operations",
    href: "/admin/tools",
    icon: Zap,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "System Health",
    href: "/admin/system-health",
    icon: Database,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Support Center",
    href: "/admin/support",
    icon: HeadphonesIcon,
    roles: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string>("ADMIN");

  useEffect(() => {
    // TODO: Fetch real user role from API
    setUserRole("ADMIN");
  }, []);

  const filteredNav = navigationItems.filter((item) => !item.roles || item.roles.includes(userRole));

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:border-r lg:border-border lg:bg-card lg:transition-all lg:duration-300 lg:mt-16",
          isCollapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Collapse Toggle */}
          <div className="flex items-center justify-end p-4 border-b border-border">
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8">
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="flex flex-col gap-1">
              {filteredNav.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      isCollapsed && "justify-center"
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge !== undefined && (
                          <Badge variant={isActive ? "secondary" : "default"} className="h-5 min-w-5 px-1 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          {!isCollapsed && (
            <div className="border-t border-border p-4">
              <div className="text-xs text-muted-foreground">
                <div className="font-medium">EventFlow Admin</div>
                <div>Version 1.0.0</div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar - Simplified */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card z-50">
        <div className="flex items-center justify-around p-2">
          <Link
            href="/admin"
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs",
              pathname === "/admin" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/users"
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs",
              pathname.startsWith("/admin/users") ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Users className="h-5 w-5" />
            <span>Users</span>
          </Link>
          <Link
            href="/admin/events"
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs relative",
              pathname.startsWith("/admin/events") ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Calendar className="h-5 w-5" />
            <span>Events</span>
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center">
              12
            </Badge>
          </Link>
          <Link
            href="/admin/analytics"
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs",
              pathname.startsWith("/admin/analytics") ? "text-primary" : "text-muted-foreground"
            )}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Analytics</span>
          </Link>
        </div>
      </div>
    </>
  );
}
