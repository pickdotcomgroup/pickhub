"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getRoleDisplayName, hasPermission } from "~/lib/user-roles";

export default function TalentFolderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth");
      return;
    }

    if (session.user.role !== "talent") {
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

  if (!session || session.user.role !== "talent") {
    return null;
  }

  const canApplyToProjects = hasPermission(session.user.permissions, "apply_to_projects");
  const canCreatePortfolio = hasPermission(session.user.permissions, "create_portfolio");
  const canReceivePayments = hasPermission(session.user.permissions, "receive_payments");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-2xl font-bold text-white">
                <span className="text-green-400">Pick</span>Hub
              </Link>
              <div className="bg-green-600/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                {getRoleDisplayName(session.user.role)}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {session.user?.name}</span>
              <Link
                href="/dashboard?stay=true"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
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
            Talent Developer Workspace 👨‍💻
          </h1>
          <p className="text-xl text-gray-300">
            Showcase your skills, find projects, and build your freelance career
          </p>
        </div>

        {/* Session Data Display */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-4">Session Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-green-300 mb-2">User Details</h3>
              <div className="space-y-2 text-gray-300">
                <p><span className="font-medium">ID:</span> {session.user.id}</p>
                <p><span className="font-medium">Name:</span> {session.user.name}</p>
                <p><span className="font-medium">Email:</span> {session.user.email}</p>
                <p><span className="font-medium">Role:</span> {getRoleDisplayName(session.user.role)}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-green-300 mb-2">Permissions</h3>
              <div className="flex flex-wrap gap-2">
                {session.user.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="px-3 py-1 bg-green-600/30 text-green-300 rounded-full text-sm"
                  >
                    {permission.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Talent-Specific Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Find Projects */}
          {canApplyToProjects && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">Find Projects</h3>
              <p className="text-gray-300 mb-4">
                Browse available projects and submit proposals to potential clients.
              </p>
              <Link
                href="/browse?category=projects"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition block text-center"
              >
                Browse Projects
              </Link>
            </div>
          )}

          {/* My Applications */}
          {canApplyToProjects && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all">
              <div className="text-3xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-white mb-2">My Applications</h3>
              <p className="text-gray-300 mb-4">
                Track your project applications and proposal status.
              </p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition">
                View Applications
              </button>
            </div>
          )}

          {/* Portfolio */}
          {canCreatePortfolio && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all">
              <div className="text-3xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-white mb-2">My Portfolio</h3>
              <p className="text-gray-300 mb-4">
                Showcase your work, skills, and experience to attract clients.
              </p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition">
                Manage Portfolio
              </button>
            </div>
          )}

          {/* Active Projects */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-white mb-2">Active Projects</h3>
            <p className="text-gray-300 mb-4">
              Manage your ongoing projects and deliverables.
            </p>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition">
              View Projects
            </button>
          </div>

          {/* Earnings */}
          {canReceivePayments && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-white mb-2">Earnings</h3>
              <p className="text-gray-300 mb-4">
                Track your income, payments, and financial performance.
              </p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition">
                View Earnings
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-white mb-2">Messages</h3>
            <p className="text-gray-300 mb-4">
              Communicate with clients and manage project discussions.
            </p>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition">
              Open Messages
            </button>
          </div>

          {/* Profile Settings */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all">
            <div className="text-3xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Profile Settings</h3>
            <p className="text-gray-300 mb-4">
              Update your skills, rates, and professional information.
            </p>
            <Link
              href="/profile-setup"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition block text-center"
            >
              Edit Profile
            </Link>
          </div>

          {/* Skills Assessment */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">Skills Assessment</h3>
            <p className="text-gray-300 mb-4">
              Take skill tests to verify your expertise and boost credibility.
            </p>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition">
              Take Tests
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <div className="text-2xl">👨‍💻</div>
              <div>
                <p className="text-white font-medium">Welcome to Talent Workspace!</p>
                <p className="text-gray-400 text-sm">You have access to all talent developer features</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <div className="text-2xl">✅</div>
              <div>
                <p className="text-white font-medium">Profile Ready</p>
                <p className="text-gray-400 text-sm">Your talent profile is active and ready for projects</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">0</div>
            <div className="text-green-100">Active Proposals</div>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">0</div>
            <div className="text-blue-100">Completed Projects</div>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">0.0</div>
            <div className="text-purple-100">Average Rating</div>
          </div>
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">$0</div>
            <div className="text-orange-100">Total Earned</div>
          </div>
        </div>

        {/* Skill Development Section */}
        <div className="mt-12 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-2xl p-8 border border-green-400/30">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-4">
              Boost Your Career 🚀
            </h2>
            <p className="text-xl text-gray-300">
              Take advantage of these resources to enhance your skills and increase your earning potential
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-lg font-semibold text-white mb-2">Learning Resources</h3>
              <p className="text-gray-300 text-sm mb-4">
                Access courses and tutorials to expand your skill set
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                Explore
              </button>
            </div>

            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-lg font-semibold text-white mb-2">Certifications</h3>
              <p className="text-gray-300 text-sm mb-4">
                Earn industry-recognized certifications to stand out
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                Get Certified
              </button>
            </div>

            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="text-lg font-semibold text-white mb-2">Networking</h3>
              <p className="text-gray-300 text-sm mb-4">
                Connect with other professionals and potential mentors
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                Network
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
