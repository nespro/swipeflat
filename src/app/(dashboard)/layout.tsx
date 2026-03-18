"use client";

import { AppNav } from "@/components/layout/app-nav";
import { AuthGate } from "@/components/auth/auth-gate";

/**
 * Dashboard layout — auth-gated, renders navigation and main content area.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <div className="flex min-h-screen">
        <AppNav />
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
    </AuthGate>
  );
}
