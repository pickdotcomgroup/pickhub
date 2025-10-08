"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getRoleDisplayName, hasPermission } from "~/lib/user-roles";

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
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </main>
    );
  }

  if (!session || session.user.role !== "client") {
    return null;
  }

  const canPostProjects = hasPermission(session.user.permissions, "post_projects");
  const canHireTalent = hasPermission(session.user.permissions, "hire_talent");
  const canManageProjects = hasPermission(session.user.permissions, "manage_projects");
  const canMakePayments = hasPermission(session.user.permissions, "make_payments");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-2xl font-bold text-white">
                <span className="text-blue-400">Pick</span>Hub
              </Link>
              <div className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                {getRoleDisplayName(session.user.role)}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {session.user?.name}</span>
              <Link
                href="/dashboard?stay=true"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Client Workspace 🏢
          </h1>
          <p className="text-xl text-gray-300">
            Manage your projects, hire talent, and grow your business
          </p>
        </div>

        {/* Session Data Display */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-4">Session Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-blue-300 mb-2">User Details</h3>
              <div className="space-y-2 text-gray-300">
                <p><span className="font-medium">ID:</span> {session.user.id}</p>
                <p><span className="font-medium">Name:</span> {session.user.name}</p>
                <p><span className="font-medium">Email:</span> {session.user.email}</p>
                <p><span className="font-medium">Role:</span> {getRoleDisplayName(session.user.role)}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-blue-300 mb-2">Permissions</h3>
              <div className="flex flex-wrap gap-2">
                {session.user.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-sm"
                  >
                    {permission.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Client-Specific Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Post Project */}
          {canPostProjects && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-2">Post New Project</h3>
              <p className="text-gray-300 mb-4">
                Create a new project and get proposals from talented freelancers.
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition">
                Create Project
              </button>
            </div>
          )}

          {/* Manage Projects */}
          {canManageProjects && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">My Projects</h3>
              <p className="text-gray-300 mb-4">
                Track progress, manage timelines, and collaborate with your team.
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition">
                View Projects
              </button>
            </div>
          )}

          {/* Find Talent */}
          {canHireTalent && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-white mb-2">Find Talent</h3>
              <p className="text-gray-300 mb-4">
                Browse and hire skilled freelancers for your projects.
              </p>
              <Link
                href="/browse?category=talents"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition block text-center"
              >
                Browse Talent
              </Link>
            </div>
          )}

          {/* Payments */}
          {canMakePayments && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all">
              <div className="text-3xl mb-4">💳</div>
              <h3 className="text-xl font-semibold text-white mb-2">Payments</h3>
              <p className="text-gray-300 mb-4">
                Manage payments, invoices, and financial transactions.
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition">
                View Payments
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-white mb-2">Messages</h3>
            <p className="text-gray-300 mb-4">
              Communicate with freelancers and manage conversations.
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition">
              Open Messages
            </button>
          </div>

          {/* Profile Settings */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all">
            <div className="text-3xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Profile Settings</h3>
            <p className="text-gray-300 mb-4">
              Update your company information and preferences.
            </p>
            <Link
              href="/profile-setup"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition block text-center"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <div className="text-2xl">🏢</div>
              <div>
                <p className="text-white font-medium">Welcome to Client Workspace!</p>
                <p className="text-gray-400 text-sm">You have access to all client features</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <div className="text-2xl">✅</div>
              <div>
                <p className="text-white font-medium">Profile Verified</p>
                <p className="text-gray-400 text-sm">Your client profile is active and verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">0</div>
            <div className="text-blue-100">Active Projects</div>
          </div>
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">0</div>
            <div className="text-green-100">Completed Projects</div>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">0</div>
            <div className="text-purple-100">Hired Freelancers</div>
          </div>
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">$0</div>
            <div className="text-orange-100">Total Spent</div>
          </div>
        </div>
      </div>
    </main>
  );
}
