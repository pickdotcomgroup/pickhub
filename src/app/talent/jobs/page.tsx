"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DollarSign, Clock, Search, Filter, Briefcase } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  skills: string[];
  matchPercentage: number;
  postedAt: string;
  logo?: string;
}

export default function TalentJobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Sample jobs data - replace with actual API call
  const jobs: Job[] = [
    {
      id: "1",
      title: "Senior Frontend Developer",
      company: "Microsoft",
      location: "Redmond, WA (Remote)",
      type: "Full-time",
      salary: "$140k - $180k/yr",
      skills: ["React", "TypeScript", "Azure"],
      matchPercentage: 98,
      postedAt: "2d ago",
    },
    {
      id: "2",
      title: "Full Stack Engineer",
      company: "Netflix",
      location: "Los Gatos, CA",
      type: "Full-time",
      salary: "$160k - $210k/yr",
      skills: ["Node.js", "GraphQL", "AWS"],
      matchPercentage: 92,
      postedAt: "5h ago",
    },
    {
      id: "3",
      title: "React Developer",
      company: "Spotify",
      location: "New York, NY (Hybrid)",
      type: "Full-time",
      salary: "$130k - $170k/yr",
      skills: ["React", "Redux", "Node.js"],
      matchPercentage: 89,
      postedAt: "1d ago",
    },
    {
      id: "4",
      title: "Backend Engineer",
      company: "Stripe",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$150k - $200k/yr",
      skills: ["Python", "Go", "PostgreSQL"],
      matchPercentage: 85,
      postedAt: "3d ago",
    },
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
            <div className="h-10 bg-gray-200 rounded-lg w-48"></div>
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const getMatchBadgeColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-100 text-green-700";
    if (percentage >= 80) return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Find Jobs</h1>
          <p className="text-gray-600">Discover opportunities matched to your skills and preferences</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, companies, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 font-medium">Filters</span>
            </button>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Matched Jobs</h2>
            <span className="text-sm text-gray-500">{jobs.length} jobs found</span>
          </div>

          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-gray-400" />
                  </div>

                  {/* Job Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                    <p className="text-gray-600 mb-3">
                      {job.company} • {job.location}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Salary */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Posted {job.postedAt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Match Percentage */}
                <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${getMatchBadgeColor(job.matchPercentage)}`}>
                  {job.matchPercentage}% Match
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
