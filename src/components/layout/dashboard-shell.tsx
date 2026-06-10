"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-zinc-900 border-b border-zinc-800 flex items-center gap-3 px-4">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white font-semibold truncate">Admin Panel</span>
        </div>
      </header>

      {isSidebarOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pt-14 lg:pt-0 lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
