"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface TrainerProfile {
  id: string;
  firstName: string;
  lastName: string;
  title: string | null;
  specialization: string | null;
  bio: string | null;
  skills: string[];
  experience: string | null;
  certifications: string[];
  hourlyRate: string | null;
  website: string | null;
  location: string | null;
  createdAt: string;
}

interface DashboardStats {
  profileViews: number;
  messagesReceived: number;
  profileCompletion: number;
  memberSince: string;
}

export default function TrainerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    profileViews: 0,
    messagesReceived: 0,
    profileCompletion: 0,
    memberSince: "",
  });

  const calculateProfileCompletion = useCallback((profile: TrainerProfile): number => {
    const fields = [
      profile.firstName,
      profile.lastName,
      profile.title,
      profile.specialization,
      profile.bio,
      profile.skills?.length > 0,
      profile.experience,
      profile.certifications?.length > 0,
      profile.hourlyRate,
      profile.location,
    ];
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch("/api/trainer/profile");
      if (response.ok) {
        const data = await response.json() as TrainerProfile;
        setProfile(data);

        const completion = calculateProfileCompletion(data);
        const memberDate = new Date(data.createdAt);
        const formattedDate = memberDate.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });

        setStats({
          profileViews: 0,
          messagesReceived: 0,
          profileCompletion: completion,
          memberSince: formattedDate,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [calculateProfileCompletion]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth");
      return;
    }

    if (session.user.role !== "trainer") {
      router.push("/dashboard");
      return;
    }

    void fetchDashboardData();
  }, [session, status, router, fetchDashboardData]);

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section Skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <div className="h-9 bg-gray-200 rounded-lg w-64 mb-3 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
              </div>
              <div className="hidden md:block">
                <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Stats Overview Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded-lg w-16 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Recent Activity Skeleton */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="h-7 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!session || session.user.role !== "trainer") {
    return null;
  }

  const firstName = profile?.firstName ?? session.user.name?.split(" ")[0] ?? "Trainer";

  return (
    <main className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {firstName}
              </h1>
              <p className="text-gray-600">
                Here&apos;s your trainer dashboard overview
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/trainer/messages"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition border border-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Profile Views */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-blue-700 bg-blue-200 px-2 py-1 rounded-full">New</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.profileViews}</h3>
            <p className="text-sm text-gray-600">Profile Views</p>
          </div>

          {/* Messages Received */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-green-700 bg-green-200 px-2 py-1 rounded-full">0 new</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.messagesReceived}</h3>
            <p className="text-sm text-gray-600">Messages</p>
          </div>

          {/* Profile Completion */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              {stats.profileCompletion < 100 && (
                <Link
                  href="/trainer/account"
                  className="text-xs font-medium text-purple-700 bg-purple-200 px-2 py-1 rounded-full hover:bg-purple-300 transition"
                >
                  Complete
                </Link>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.profileCompletion}%</h3>
            <p className="text-sm text-gray-600">Profile Complete</p>
          </div>

          {/* Member Since */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-orange-700 bg-orange-200 px-2 py-1 rounded-full">Active</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.memberSince || "New"}</h3>
            <p className="text-sm text-gray-600">Member Since</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/trainer/account"
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300 transition group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition">Edit Profile</h3>
                <p className="text-sm text-gray-500">Update your trainer profile</p>
              </div>
            </div>
          </Link>

          <Link
            href="/trainer/messages"
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-green-300 transition group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition">Messages</h3>
                <p className="text-sm text-gray-500">View your conversations</p>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm opacity-60">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Courses</h3>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium mb-1">Welcome to TechPickHub!</p>
                <p className="text-sm text-gray-600">Your trainer account has been successfully created</p>
                <p className="text-xs text-gray-500 mt-2">Just now</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium mb-1">Complete Your Profile</p>
                <p className="text-sm text-gray-600">Add your specialization, skills, and bio to help students find you</p>
                <p className="text-xs text-gray-500 mt-2">Tip</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
