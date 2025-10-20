"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { getRoleDisplayName } from "~/lib/user-roles";

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth");
      return;
    }

    // Only redirect to role-specific folder if user has a role AND they didn't explicitly request the dashboard
    // Check if they have a 'stay' parameter or if they're coming from a direct navigation
    const stayOnDashboard = searchParams.get('stay') === 'true';
    
    if (session.user.role && !stayOnDashboard) {
      // Check if this is likely a direct navigation to dashboard (not an initial page load)
      const isDirectNavigation = window.location.pathname === '/dashboard' && document.referrer && 
        (document.referrer.includes('/client') || document.referrer.includes('/talent') || document.referrer.includes('/agency'));
      
      if (!isDirectNavigation) {
        switch (session.user.role) {
          case "client":
            router.push("/client");
            break;
          case "talent":
            router.push("/talent");
            break;
          case "agency":
            router.push("/agency");
            break;
        }
      }
    }
  }, [session, status, router, searchParams]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  // If user doesn't have a role yet, show role selection
  if (!session.user.role) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-white">
                  <span className="text-purple-400">TechPick</span>Hub
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-white">Welcome, {session.user?.name}</span>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Choose Your Professional Path
            </h1>
            <p className="text-xl text-gray-300">
              Select your role to access your personalized workspace
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Client Role */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-blue-400/50 transition-all text-center">
              <div className="text-6xl mb-6">🏢</div>
              <h3 className="text-2xl font-bold text-white mb-4">Join as Client</h3>
              <p className="text-gray-300 mb-6">
                Post projects, hire talent, and manage your business needs with our comprehensive client tools.
              </p>
              <ul className="text-sm text-gray-400 space-y-2 mb-8 text-left">
                <li>• Post unlimited projects</li>
                <li>• Access to verified professionals</li>
                <li>• Project management tools</li>
                <li>• Secure payment system</li>
              </ul>
              <Link
                href="/profile-setup?role=client"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition block text-center"
              >
                Get Started as Client
              </Link>
            </div>

            {/* Talent Role */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-green-400/50 transition-all text-center">
              <div className="text-6xl mb-6">👨‍💻</div>
              <h3 className="text-2xl font-bold text-white mb-4">Join as Talent</h3>
              <p className="text-gray-300 mb-6">
                Showcase your skills, find exciting projects, and build your freelance career with our talent platform.
              </p>
              <ul className="text-sm text-gray-400 space-y-2 mb-8 text-left">
                <li>• Create professional profile</li>
                <li>• Bid on quality projects</li>
                <li>• Build your reputation</li>
                <li>• Secure payment guarantee</li>
              </ul>
              <Link
                href="/profile-setup?role=talent"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition block text-center"
              >
                Get Started as Talent
              </Link>
            </div>

            {/* Agency Role */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-indigo-400/50 transition-all text-center">
              <div className="text-6xl mb-6">🏛️</div>
              <h3 className="text-2xl font-bold text-white mb-4">Join as Agency</h3>
              <p className="text-gray-300 mb-6">
                Scale your business, manage teams, and handle multiple client relationships with our agency suite.
              </p>
              <ul className="text-sm text-gray-400 space-y-2 mb-8 text-left">
                <li>• Team collaboration tools</li>
                <li>• Multi-project management</li>
                <li>• Client relationship tools</li>
                <li>• Advanced analytics</li>
              </ul>
              <Link
                href="/profile-setup?role=agency"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition block text-center"
              >
                Get Started as Agency
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 mb-4">
              Not sure which role fits you best?
            </p>
            <Link
              href="/browse"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Browse the platform first to get a feel for what&apos;s available
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">
                <span className="text-purple-400">Pick</span>Hub
              </h1>
              {session.user.role && (
                <div className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                  {getRoleDisplayName(session.user.role)}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {session.user?.name}</span>
              {session.user.role && (
                <Link
                  href={`/${session.user.role}`}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
                >
                  My Workspace
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Welcome to Your Dashboard! 🎉
          </h2>
            <p className="text-xl text-gray-300">
              Your onboarding is complete. Here&apos;s where your freelance journey begins.
            </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Browse Projects */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">Browse Projects</h3>
            <p className="text-gray-300 mb-4">
              Discover exciting projects that match your skills and interests.
            </p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition">
              View Projects
            </button>
          </div>

          {/* Find Talent */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-white mb-2">Find Talent</h3>
            <p className="text-gray-300 mb-4">
              Connect with skilled freelancers ready to bring your ideas to life.
            </p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition">
              Browse Freelancers
            </button>
          </div>

          {/* Post a Project */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-white mb-2">Post a Project</h3>
            <p className="text-gray-300 mb-4">
              Share your project requirements and get proposals from experts.
            </p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition">
              Create Project
            </button>
          </div>

          {/* Manage Projects */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">Project Management</h3>
            <p className="text-gray-300 mb-4">
              Track progress, manage timelines, and collaborate effectively.
            </p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition">
              View Dashboard
            </button>
          </div>

          {/* Messages */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-white mb-2">Messages</h3>
            <p className="text-gray-300 mb-4">
              Communicate with clients and freelancers in real-time.
            </p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition">
              Open Messages
            </button>
          </div>

          {/* Profile */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-3xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Profile Settings</h3>
            <p className="text-gray-300 mb-4">
              Update your profile, skills, and preferences.
            </p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <div className="text-2xl">🎉</div>
              <div>
                <p className="text-white font-medium">Welcome to PickHub!</p>
                <p className="text-gray-400 text-sm">Your account has been successfully created</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <div className="text-2xl">✅</div>
              <div>
                <p className="text-white font-medium">Profile Setup Complete</p>
                <p className="text-gray-400 text-sm">You&apos;ve completed the onboarding process</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Start Your Freelance Journey?
            </h3>
            <p className="text-gray-200 mb-6">
              Join thousands of successful freelancers and clients who trust PickHub for their projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/onboarding"
                className="bg-white text-purple-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition"
              >
                Update Profile
              </Link>
              <button className="bg-purple-800 hover:bg-purple-900 text-white font-semibold py-3 px-6 rounded-lg transition">
                Explore Features
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </main>
    }>
      <DashboardContent />
    </Suspense>
  );
}
