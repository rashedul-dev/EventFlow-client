"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Ticket,
  Calendar,
  Heart,
  Settings,
  CreditCard,
  Bell,
  Plus,
  BarChart3,
  Users,
} from "lucide-react"

const userLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/tickets", label: "My Tickets", icon: Ticket },
  { href: "/dashboard/upcoming", label: "Upcoming Events", icon: Calendar },
  { href: "/dashboard/favorites", label: "Favorites", icon: Heart },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/payments", label: "Payment History", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

const organizerLinks = [
  { href: "/dashboard/organizer", label: "Organizer Dashboard", icon: BarChart3 },
  { href: "/dashboard/organizer/events", label: "My Events", icon: Calendar },
  { href: "/dashboard/organizer/create", label: "Create Event", icon: Plus },
  { href: "/dashboard/organizer/attendees", label: "Attendees", icon: Users },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      <div className="lg:hidden fixed inset-0 bg-black/50 z-40 hidden" id="sidebar-overlay" />

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-secondary/30 border-r border-foreground/10 overflow-y-auto hidden lg:block z-40">
        <div className="p-4 space-y-6">
          {/* User Section */}
          <div>
            <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3 px-3">Attendee</h3>
            <nav className="space-y-1">
              {userLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Organizer Section */}
          <div>
            <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3 px-3">Organizer</h3>
            <nav className="space-y-1">
              {organizerLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  )
}
