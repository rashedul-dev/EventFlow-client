import type React from "react"
import { Header } from "@/components/layout/header"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <DashboardSidebar />
          <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64">{children}</main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
