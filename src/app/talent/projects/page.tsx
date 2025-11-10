"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Application {
  id: string;
  status: string;
  isPicked: boolean;
  pickedAt: string | null;
  createdAt: string;
  project: {
    id: string;
    title: string;
    description: string;
    budget: number;
    deadline: string;
    category: string;
    skills: string[];
    projectType: string;
    status: string;
    client: {
      id: string;
      name: string | null;
      email: string | null;
    };
  };
}

export default function TalentProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchApplications = useCallback(async () => {
    if (!session?.user.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/applications?talentId=${session.user.id}`);
      const data = await response.json() as { error?: string; applications: Application[] };

      if (!response.ok) {
        setError(data.error ?? "Failed to fetch applications");
        return;
      }

      setApplications(data.applications);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user.id]);

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

    void fetchApplications();
  }, [session, status, router, fetchApplications]);

  if (status === "loading" || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <div className="text-lg text-white">Loading projects...</div>
        </div>
      </main>
    );
  }

  if (!session || session.user.role !== "talent") {
    return null;
  }

  const filteredApplications = filter === "all"
    ? applications
    : applications.filter(app => app.status === filter);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "accepted": return "bg-green-500/20 text-green-300 border-green-500/50";
      case "rejected": return "bg-red-500/20 text-red-300 border-red-500/50";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/50";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Projects</h1>
            <p className="text-gray-400">Track your applications and active projects</p>
          </div>
          <Link
            href="/talent/browse"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Browse Projects</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
            >
              All ({applications.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === "pending"
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
            >
              Pending ({applications.filter(a => a.status === "pending").length})
            </button>
            <button
              onClick={() => setFilter("accepted")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === "accepted"
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
            >
              Accepted ({applications.filter(a => a.status === "accepted").length})
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === "rejected"
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
            >
              Rejected ({applications.filter(a => a.status === "rejected").length})
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={() => setError("")}
                className="text-red-400 hover:text-red-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-400">{successMessage}</p>
              <button
                onClick={() => setSuccessMessage("")}
                className="text-green-400 hover:text-green-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">
              {filter === "all"
                ? "You haven't applied to any projects yet. Start browsing available opportunities!"
                : `No ${filter} applications found.`}
            </p>
            {filter === "all" && (
              <Link
                href="/talent/browse"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Pick Projects</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{application.project.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                        {application.status.toUpperCase()}
                      </span>
                      {application.isPicked && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-500/20 text-blue-300 border-blue-500/50">
                          PICKED
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{application.project.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span>{application.project.category}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Deadline: {formatDate(application.project.deadline)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>${application.project.budget.toLocaleString()}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Client: {application.project.client.name ?? "Anonymous"}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Applied: {formatDate(application.createdAt)}</span>
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition border border-white/10">
                    View Details
                  </button>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                  {application.project.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
