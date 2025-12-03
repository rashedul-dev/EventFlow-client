import type React from "react";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64 mt-16">{children}</main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
