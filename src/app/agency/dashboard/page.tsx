"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Users, Briefcase, TrendingUp } from "lucide-react";

export default function AgencyDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth");
      return;
    }

    if (session.user.role !== "agency") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center gap-3 m-10">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <div className="text-gray-500 text-md">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "agency") {
    return null;
  }

  return (
    <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {session.user.name}!
            </h1>
            <p className="text-gray-600">
              Manage your agency operations from your dashboard
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">0</span>
              </div>
              <p className="text-blue-100">Active Clients</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Briefcase className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">0</span>
              </div>
              <p className="text-green-100">Active Projects</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">0</span>
              </div>
              <p className="text-purple-100">Team Members</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">$0</span>
              </div>
              <p className="text-orange-100">Monthly Revenue</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link
                href="/agency/browse-clients"
                className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-xl p-6 transition-all group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition">
                    <Briefcase className="w-6 h-6 text-blue-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Browse Clients</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Find new client projects and opportunities
                </p>
              </Link>

              <Link
                href="/agency/browse-developers"
                className="bg-white border-2 border-gray-200 hover:border-green-500 rounded-xl p-6 transition-all group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-500 transition">
                    <Users className="w-6 h-6 text-green-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Browse Developers</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Discover talented developers for your team
                </p>
              </Link>

              <Link
                href="/agency/picked-developers"
                className="bg-white border-2 border-gray-200 hover:border-purple-500 rounded-xl p-6 transition-all group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-500 transition">
                    <Users className="w-6 h-6 text-purple-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Picked Developers</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Manage your selected developers
                </p>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Welcome to Agency Dashboard</p>
                  <p className="text-xs text-gray-500">Start by browsing clients or developers</p>
                </div>
                <span className="text-xs text-gray-400">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
