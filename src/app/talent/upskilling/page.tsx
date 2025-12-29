"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Play, Award, TrendingUp, Code, Cloud, Database } from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  lessons: number;
  level: string;
  progress?: number;
  currentModule?: number;
  totalModules?: number;
  icon: React.ReactNode;
}

interface SkillGap {
  skill: string;
  current: number;
  marketDemand: number;
  status: "good" | "gap";
}

export default function TalentUpskillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Sample data - replace with actual API calls
  const inProgressCourses: Course[] = [
    {
      id: "1",
      title: "Advanced Cloud Architecture Patterns",
      lessons: 45,
      level: "Advanced",
      progress: 65,
      currentModule: 4,
      totalModules: 6,
      icon: <Cloud className="w-6 h-6 text-blue-500" />,
    },
  ];

  const recommendedCourses: Course[] = [
    {
      id: "2",
      title: "System Design Interview Prep",
      lessons: 45,
      level: "Intermediate",
      icon: <TrendingUp className="w-5 h-5 text-orange-500" />,
    },
    {
      id: "3",
      title: "Kubernetes for Developers",
      lessons: 22,
      level: "Advanced",
      icon: <Database className="w-5 h-5 text-blue-500" />,
    },
    {
      id: "4",
      title: "React Performance Optimization",
      lessons: 18,
      level: "Intermediate",
      icon: <Code className="w-5 h-5 text-cyan-500" />,
    },
  ];

  const skillGaps: SkillGap[] = [
    { skill: "System Design", current: 45, marketDemand: 85, status: "gap" },
    { skill: "React / Next.js", current: 80, marketDemand: 75, status: "good" },
    { skill: "Kubernetes", current: 25, marketDemand: 70, status: "gap" },
  ];

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

    // Check verification status
    const checkVerification = async () => {
      try {
        const response = await fetch("/api/verification/status");
        if (response.ok) {
          const data = await response.json() as { platformAccess?: boolean };
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
            <div className="h-48 bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upskilling Marketplace</h1>
          <p className="text-gray-600">Continue learning and close your skill gaps</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resume Learning */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume Learning</h2>
              {inProgressCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        {course.icon}
                      </div>
                      <div>
                        <span className="text-xs text-blue-400 font-medium uppercase tracking-wider">
                          IN PROGRESS
                        </span>
                        <h3 className="text-xl font-semibold mt-1 mb-3">{course.title}</h3>

                        {/* Progress Bar */}
                        <div className="w-64 mb-2">
                          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-400">
                          <span>Module {course.currentModule} of {course.totalModules}</span>
                          <span>{course.progress}% Complete</span>
                        </div>
                      </div>
                    </div>

                    <button className="px-6 py-2.5 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition">
                      Continue
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommended Courses */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommended for You</h2>
              <div className="space-y-3">
                {recommendedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {course.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-500">
                          {course.lessons} Lessons • {course.level}
                        </p>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition">
                        <Play className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Browse All Courses */}
            <Link
              href="/talent/upskilling/browse"
              className="block w-full py-3 text-center text-blue-600 font-medium hover:text-blue-700 transition"
            >
              Browse All Courses
            </Link>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Strength */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Profile Strength</h3>
                <span className="text-blue-600 font-medium">Intermediate</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className="h-full w-3/4 bg-blue-500 rounded-full" />
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Add a portfolio project to reach 80% completeness.
              </p>
              <button className="w-full py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                Update Profile
              </button>
            </div>

            {/* Skill Gap Analysis */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Skill Gap Analysis</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {skillGaps.map((skill) => (
                  <div key={skill.skill}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-700">{skill.skill}</span>
                      <span className={`text-xs font-medium ${
                        skill.status === "good" ? "text-green-600" : "text-red-500"
                      }`}>
                        {skill.status === "good" ? "Good" : "Gap Found"}
                      </span>
                    </div>
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      {/* Current skill level */}
                      <div
                        className={`absolute h-full rounded-full ${
                          skill.status === "good" ? "bg-green-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${skill.current}%` }}
                      />
                      {/* Market demand indicator */}
                      <div
                        className="absolute top-0 w-0.5 h-full bg-red-500"
                        style={{ left: `${skill.marketDemand}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                      <span>Current</span>
                      <span>Market Demand</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificates */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Certificates Earned</h3>
                <div className="flex items-center gap-1">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-gray-900">3</span>
                  <span className="text-xs text-green-600 font-medium">+1</span>
                </div>
              </div>
              <Link
                href="/talent/profile#certificates"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all certificates
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
