"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TalentProfileData {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  title: string;
  skills: string[];
  experience: string;
  hourlyRate: string | null;
  portfolio: string | null;
  tier: string;
  activePicks: number;
  completedProjects: number;
  successRate: number;
  totalEarnings: number;
  portfolioUrl: string | null;
  portfolioProjects: unknown;
  certifications: string[];
  bio: string | null;
  verificationStatus: string;
  platformAccess: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: string;
  };
  verification: unknown;
}

export default function TalentAccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<TalentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    // Fetch talent profile
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/talent/profile");
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await response.json() as { profile: TalentProfileData };
        setProfile(data.profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <div className="text-lg text-white">Loading profile...</div>
        </div>
      </main>
    );
  }

  if (!session || session.user.role !== "talent") {
    return null;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-300 text-lg">Error: {error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6 text-center">
            <p className="text-yellow-300 text-lg">Profile not found</p>
          </div>
        </div>
      </main>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "gold":
        return "from-yellow-600/20 to-yellow-700/20 border-yellow-500/30 text-yellow-300";
      case "silver":
        return "from-gray-400/20 to-gray-500/20 border-gray-400/30 text-gray-300";
      default:
        return "from-orange-600/20 to-orange-700/20 border-orange-500/30 text-orange-300";
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
        return "bg-green-500/20 text-green-300 border-green-500/50";
      case "in_review":
        return "bg-blue-500/20 text-blue-300 border-blue-500/50";
      case "rejected":
        return "bg-red-500/20 text-red-300 border-red-500/50";
      default:
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Overview */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {profile.user.image ? (
                <img
                  src={profile.user.image}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-20 h-20 rounded-full border-2 border-purple-500"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {profile.firstName[0]}{profile.lastName[0]}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-lg text-purple-300">{profile.title}</p>
                <p className="text-sm text-gray-400">{profile.user.email}</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg border ${getVerificationStatusColor(profile.verificationStatus)}`}>
              <p className="text-sm font-medium capitalize">
                {profile.verificationStatus.replace("_", " ")}
              </p>
            </div>
          </div>

          {profile.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-purple-300 mb-2">Bio</h3>
              <p className="text-gray-300">{profile.bio}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-purple-300 mb-3">
                Professional Details
              </h3>
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Experience Level</p>
                  <p className="text-white capitalize">{profile.experience}</p>
                </div>
                {profile.hourlyRate && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Hourly Rate</p>
                    <p className="text-white">${profile.hourlyRate}/hr</p>
                  </div>
                )}
                {profile.portfolioUrl && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Portfolio</p>
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      View Portfolio
                    </a>
                  </div>
                )}
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Platform Access</p>
                  <p className={`font-medium ${profile.platformAccess ? "text-green-400" : "text-red-400"}`}>
                    {profile.platformAccess ? "Granted" : "Pending"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-purple-300 mb-3">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 rounded-full text-sm text-purple-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {profile.certifications.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-purple-300 mb-3">
                    Certifications
                  </h3>
                  <div className="space-y-2">
                    {profile.certifications.map((cert, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-2">
                        <p className="text-sm text-gray-300">{cert}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tier & Performance Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className={`bg-gradient-to-br ${getTierColor(profile.tier)} border rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Current Tier</h3>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold capitalize">{profile.tier}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-blue-300 font-medium">Active Picks</h3>
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{profile.activePicks}</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-green-300 font-medium">Completed</h3>
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{profile.completedProjects}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-purple-300 font-medium">Success Rate</h3>
              <svg
                className="w-6 h-6 text-purple-400"
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
            <p className="text-3xl font-bold text-white">{profile.successRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Earnings & Account Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Earnings
            </h3>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Total Earnings</p>
              <p className="text-4xl font-bold text-white">
                ${profile.totalEarnings.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Account Info
            </h3>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">User ID</p>
                <p className="text-white font-mono text-sm">{profile.userId}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Member Since</p>
                <p className="text-white">
                  {new Date(profile.user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
