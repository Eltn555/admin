"use client";

import { useAuthStore } from "@/lib/auth-store";

export default function DashboardPage() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-zinc-400">
          <svg
            className="animate-spin h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">Welcome back to your admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Orders", value: "0", icon: "📦", color: "emerald" },
          { label: "Revenue", value: "$0", icon: "💰", color: "blue" },
          { label: "Products", value: "0", icon: "🏷️", color: "purple" },
          { label: "Customers", value: "0", icon: "👥", color: "orange" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-zinc-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border border-emerald-700/30 rounded-2xl p-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome to your E-Commerce Admin Panel
            </h2>
            <p className="text-emerald-200/70 max-w-lg">
              Your admin panel is ready. Start adding products, managing orders, and growing your business.
            </p>
            {user && (
              <p className="mt-4 text-emerald-300 text-sm">
                Logged in as: <span className="font-mono">{user.phone}</span>
              </p>
            )}
          </div>
          <div className="hidden lg:block">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
              <svg
                className="w-10 h-10 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

