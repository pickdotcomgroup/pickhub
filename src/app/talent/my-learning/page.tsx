"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Play,
  CheckCircle2,
  Trophy,
  Award,
  History,
  Sparkles,
  MoreVertical,
  Star,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  category: string;
  provider: string;
  progress: number;
  timeLeft: string;
  image?: string;
  icon?: React.ReactNode;
}

interface RecommendedCourse {
  id: string;
  title: string;
  provider: string;
  duration: string;
  description: string;
  rating: number;
  badge?: "Popular" | "New";
  iconColor: string;
  icon: React.ReactNode;
}

interface Achievement {
  id: string;
  title: string;
  completedDate: string;
  iconColor: string;
  icon: React.ReactNode;
}

const activeCourses: Course[] = [
  {
    id: "1",
    title: "Azure Fundamentals AZ-900",
    category: "Cloud Computing",
    provider: "Microsoft Learn",
    progress: 75,
    timeLeft: "3h 15m left",
    image: "/course-azure.jpg",
  },
  {
    id: "2",
    title: "Advanced React Patterns",
    category: "Development",
    provider: "CodeMaster Pro",
    progress: 32,
    timeLeft: "8h 45m left",
  },
];

const recommendedCourses: RecommendedCourse[] = [
  {
    id: "1",
    title: "Data Science Methodology",
    provider: "DataWizards",
    duration: "4.5h",
    description: "Learn the steps involved in a data science project, from problem definition to deployment.",
    rating: 4.8,
    badge: "Popular",
    iconColor: "bg-blue-100",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#3b82f6" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: "2",
    title: "UI Design Systems",
    provider: "Design Academy",
    duration: "6h",
    description: "Master the art of creating scalable and consistent design systems using Figma.",
    rating: 4.9,
    badge: "New",
    iconColor: "bg-pink-100",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#ec4899" strokeWidth="2">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
  },
];

const achievements: Achievement[] = [
  {
    id: "1",
    title: "Certified Cloud Practitioner",
    completedDate: "Oct 24, 2023",
    iconColor: "bg-orange-100",
    icon: <Trophy className="w-5 h-5 text-orange-500" />,
  },
  {
    id: "2",
    title: "Python for Data Analysis",
    completedDate: "Sep 15, 2023",
    iconColor: "bg-green-100",
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  },
  {
    id: "3",
    title: "Git & GitHub Essentials",
    completedDate: "Aug 02, 2023",
    iconColor: "bg-blue-100",
    icon: <Award className="w-5 h-5 text-blue-500" />,
  },
];

export default function MyLearningPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

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

    const checkVerification = async () => {
      try {
        const response = await fetch("/api/verification/status");
        if (response.ok) {
          const data = (await response.json()) as { platformAccess?: boolean };
          if (!data.platformAccess) {
            router.push("/talent/verification");
            return;
          }
        }
      } catch (error) {
        console.error("Error checking verification:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void checkVerification();
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Learning</h1>
            <p className="text-gray-600">
              Track your progress, manage your certifications, and continue learning.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
              <History className="w-4 h-4" />
              History
            </button>
            <Link
              href="/talent/upskilling"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              <Sparkles className="w-4 h-4" />
              Explore New Courses
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-blue-600 fill-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-500 uppercase tracking-wide">In Progress</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Completed</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">45h</p>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Hours Spent</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">4</p>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Certificates</p>
            </div>
          </div>
        </div>

        {/* Continue Learning Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Continue Learning</h2>
            <Link
              href="/talent/my-learning/active"
              className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
            >
              View all active
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {activeCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden flex"
              >
                {/* Course Image or Icon */}
                <div className="w-40 bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center flex-shrink-0">
                  {course.image ? (
                    <div className="w-full h-full flex items-center justify-center p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 bg-amber-200/50 rounded-lg flex items-center justify-center">
                          <Trophy className="w-8 h-8 text-amber-600" />
                        </div>
                        <p className="text-xs text-amber-700 font-medium">COMPANY</p>
                        <p className="text-[10px] text-amber-600">SOME MEMORIAL</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-12 h-12"
                        fill="none"
                        stroke="#6b7280"
                        strokeWidth="2"
                      >
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Course Details */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                      {course.category}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{course.provider}</p>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">{course.progress}% Complete</span>
                    <span className="text-gray-500">{course.timeLeft}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                    Resume Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-3 gap-6">
          {/* Recommended for You */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {recommendedCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl border border-gray-200 p-5"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-10 h-10 ${course.iconColor} rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      {course.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-500">
                        {course.provider} &bull; {course.duration}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium text-gray-700">{course.rating}</span>
                    </div>
                    {course.badge && (
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          course.badge === "Popular"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {course.badge}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Achievements</h2>
              <Link
                href="/talent/my-learning/achievements"
                className="text-gray-500 text-sm font-medium hover:text-gray-700"
              >
                View All
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="p-4 flex items-start gap-3">
                  <div
                    className={`w-10 h-10 ${achievement.iconColor} rounded-full flex items-center justify-center flex-shrink-0`}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm">{achievement.title}</h4>
                    <p className="text-xs text-gray-500">Completed on {achievement.completedDate}</p>
                    <button className="text-blue-600 text-xs font-medium hover:text-blue-700 mt-1 flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      Download Certificate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
