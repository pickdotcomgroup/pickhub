"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientFolderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth");
      return;
    }

    if (session.user.role !== "client") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <div className="text-lg text-white">Loading projects...</div>
        </div>
      </main>
    );
  }

  if (!session || session.user.role !== "client") {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {session.user.name?.split(' ')[0] ?? 'User'}
              </h1>
              <p className="text-gray-400">
                Here&apos;s what&apos;s happening with your projects today
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition border border-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">+0%</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">0</h3>
            <p className="text-sm text-gray-400">Active Projects</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-green-400 bg-green-500/20 px-2 py-1 rounded-full">+0%</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">0</h3>
            <p className="text-sm text-gray-400">Completed</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">+0%</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">0</h3>
            <p className="text-sm text-gray-400">Team Members</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-orange-400 bg-orange-500/20 px-2 py-1 rounded-full">+0%</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">$0</h3>
            <p className="text-sm text-gray-400">Total Spent</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            <button className="text-sm text-blue-400 hover:text-blue-300 transition">View All</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium mb-1">Welcome to TechPickHub!</p>
                <p className="text-sm text-gray-400">Your client account has been successfully created and verified</p>
                <p className="text-xs text-gray-500 mt-2">Just now</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium mb-1">Profile Setup Complete</p>
                <p className="text-sm text-gray-400">You can now start posting projects and hiring talent</p>
                <p className="text-xs text-gray-500 mt-2">Just now</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
