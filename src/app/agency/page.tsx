"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getRoleDisplayName, hasPermission } from "~/lib/user-roles";

export default function AgencyFolderPage() {
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
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </main>
    );
  }

  if (!session || session.user.role !== "agency") {
    return null;
  }

  const canPostProjects = hasPermission(session.user.permissions, "post_projects");
  const canHireTalent = hasPermission(session.user.permissions, "hire_talent");
  const canManageTeam = hasPermission(session.user.permissions, "manage_team");
  const canManageMultipleProjects = hasPermission(session.user.permissions, "manage_multiple_projects");
  const canMakePayments = hasPermission(session.user.permissions, "make_payments");
  const canReceivePayments = hasPermission(session.user.permissions, "receive_payments");
  const canTeamCollaboration = hasPermission(session.user.permissions, "team_collaboration");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-2xl font-bold text-white">
                <span className="text-indigo-400">Pick</span>Hub
              </Link>
              <div className="bg-indigo-600/20 text-indigo-300 px-3 py-1 rounded-full text-sm font-medium">
                {getRoleDisplayName(session.user.role)}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {session.user?.name}</span>
              <Link
                href="/dashboard?stay=true"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
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
            Agency Workspace 🏛️
          </h1>
          <p className="text-xl text-gray-300">
            Scale your business, manage teams, and deliver exceptional results
          </p>
        </div>

        {/* Session Data Display */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-4">Session Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-indigo-300 mb-2">User Details</h3>
              <div className="space-y-2 text-gray-300">
                <p><span className="font-medium">ID:</span> {session.user.id}</p>
                <p><span className="font-medium">Name:</span> {session.user.name}</p>
                <p><span className="font-medium">Email:</span> {session.user.email}</p>
                <p><span className="font-medium">Role:</span> {getRoleDisplayName(session.user.role)}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-indigo-300 mb-2">Permissions</h3>
              <div className="flex flex-wrap gap-2">
                {session.user.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="px-3 py-1 bg-indigo-600/30 text-indigo-300 rounded-full text-sm"
                  >
                    {permission.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Agency-Specific Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Project Management */}
          {canManageMultipleProjects && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-indigo-400/50 transition-all">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">Project Portfolio</h3>
              <p className="text-gray-300 mb-4">
                Manage multiple client projects and track progress across your agency.
              </p>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition">
                View Projects
              </button>
            </div>
          )}

          {/* Team Management */}
          {canManageTeam && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-indigo-400/50 transition-all">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-white mb-2">Team Management</h3>
              <p className="text-gray-300 mb-4">
                Manage your team members, assign roles, and track performance.
              </p>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition">
                Manage Team
              </button>
            </div>
          )}

          {/* Client Acquisition */}
          {canPostProjects && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-indigo-400/50 transition-all">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">Client Acquisition</h3>
              <p className="text-gray-300 mb-4">
                Find new clients and showcase your agency&apos;s capabilities.
              </p>
              <Link
                href="/browse?category=projects"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition block text-center"
              >
                Find Clients
              </Link>
            </div>
          )}

          {/* Talent Recruitment */}
          {canHireTalent && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-indigo-400/50 transition-all">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">Talent Recruitment</h3>
              <p className="text-gray-300 mb-4">
                Recruit skilled freelancers to expand your agency&apos;s capabilities.
              </p>
              <Link
                href="/browse?category=talents"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition block text-center"
              >
                Find Talent
              </Link>
            </div>
          )}

          {/* Financial Management */}
          {(canMakePayments || canReceivePayments) && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-indigo-400/50 transition-all">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-white mb-2">Financial Hub</h3>
              <p className="text-gray-300 mb-4">
                Manage invoices, payments, and financial reporting for your agency.
              </p>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition">
                View Finances
              </button>
            </div>
          )}

          {/* Team Collaboration */}
          {canTeamCollaboration && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-indigo-400/50 transition-all">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-white mb-2">Collaboration Hub</h3>
              <p className="text-gray-300 mb-4">
                Facilitate team communication and project collaboration.
              </p>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition">
                Open Hub
              </button>
            </div>
          )}

          {/* Client Communications */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-indigo-400/50 transition-all">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-white mb-2">Client Communications</h3>
            <p className="text-gray-300 mb-4">
              Manage all client communications and project discussions.
            </p>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition">
              View Messages
            </button>
          </div>

          {/* Agency Profile */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-indigo-400/50 transition-all">
            <div className="text-3xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Agency Profile</h3>
            <p className="text-gray-300 mb-4">
              Update your agency information, services, and portfolio.
            </p>
            <Link
              href="/profile-setup"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition block text-center"
            >
              Edit Profile
            </Link>
          </div>

          {/* Analytics & Reports */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-indigo-400/50 transition-all">
            <div className="text-3xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-white mb-2">Analytics & Reports</h3>
            <p className="text-gray-300 mb-4">
              Track performance metrics and generate business reports.
            </p>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition">
              View Analytics
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <div className="text-2xl">🏛️</div>
              <div>
                <p className="text-white font-medium">Welcome to Agency Workspace!</p>
                <p className="text-gray-400 text-sm">You have access to all agency management features</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <div className="text-2xl">✅</div>
              <div>
                <p className="text-white font-medium">Agency Profile Active</p>
                <p className="text-gray-400 text-sm">Your agency is ready to take on new projects</p>
              </div>
            </div>
          </div>
        </div>

        {/* Agency Performance Dashboard */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">0</div>
            <div className="text-indigo-100">Active Projects</div>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">0</div>
            <div className="text-blue-100">Team Members</div>
          </div>
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">0</div>
            <div className="text-green-100">Completed Projects</div>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">$0</div>
            <div className="text-purple-100">Monthly Revenue</div>
          </div>
        </div>

        {/* Agency Growth Section */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl p-8 border border-indigo-400/30">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-4">
              Scale Your Agency 🚀
            </h2>
            <p className="text-xl text-gray-300">
              Tools and resources to help your agency grow and succeed
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-lg font-semibold text-white mb-2">Project Templates</h3>
              <p className="text-gray-300 text-sm mb-4">
                Streamline your workflow with proven project templates
              </p>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition">
                Browse Templates
              </button>
            </div>

            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="text-lg font-semibold text-white mb-2">Team Training</h3>
              <p className="text-gray-300 text-sm mb-4">
                Upskill your team with professional development resources
              </p>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition">
                Start Training
              </button>
            </div>

            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🌐</div>
              <h3 className="text-lg font-semibold text-white mb-2">Market Expansion</h3>
              <p className="text-gray-300 text-sm mb-4">
                Explore new markets and expand your service offerings
              </p>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition">
                Explore Markets
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
