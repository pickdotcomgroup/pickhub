"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Briefcase,
  CheckCircle,
  FileText,
  Archive,
  Filter,
  Search,
  Pencil,
  Users,
  ChevronLeft,
  ChevronRight,
  Trash2,
  XCircle,
} from "lucide-react";
import { api } from "~/trpc/react";

type JobStatus = "active" | "draft" | "closed";
type FilterTab = "all" | "active" | "draft" | "closed";

export default function EmployerJobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch jobs from TRPC
  const {
    data: jobsData,
    isLoading: isJobsLoading,
    refetch,
  } = api.jobs.getEmployerJobs.useQuery(
    {
      status: activeTab === "all" ? undefined : activeTab,
      search: debouncedSearch || undefined,
      limit: 20,
    },
    {
      enabled: !!session && session.user.role === "employer",
    }
  );

  // Mutations
  const publishMutation = api.jobs.publish.useMutation({
    onSuccess: () => refetch(),
  });
  const closeMutation = api.jobs.close.useMutation({
    onSuccess: () => refetch(),
  });
  const deleteMutation = api.jobs.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const jobs = jobsData?.jobs ?? [];
  const stats = jobsData?.stats ?? { total: 0, active: 0, draft: 0, closed: 0 };

  const itemsPerPage = 20;
  const totalItems = stats.total;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Format date helper
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth");
      return;
    }

    if (session.user.role !== "employer") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  // Jobs are already filtered by the API based on status and search
  const filteredJobs = jobs;

  const getStatusBadge = (jobStatus: JobStatus) => {
    switch (jobStatus) {
      case "active":
        return (
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm font-medium text-green-600">Active</span>
          </div>
        );
      case "draft":
        return (
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span className="text-sm font-medium text-yellow-600">Draft</span>
          </div>
        );
      case "closed":
        return (
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            <span className="text-sm font-medium text-gray-500">Closed</span>
          </div>
        );
    }
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map((job) => job.id));
    }
  };

  const handleSelectJob = (jobId: string) => {
    if (selectedJobs.includes(jobId)) {
      setSelectedJobs(selectedJobs.filter((id) => id !== jobId));
    } else {
      setSelectedJobs([...selectedJobs, jobId]);
    }
  };

  if (status === "loading" || isJobsLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
            </div>
            <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 border border-gray-200 h-20 animate-pulse"
              ></div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="bg-white rounded-xl border border-gray-200 h-96 animate-pulse"></div>
        </div>
      </main>
    );
  }

  if (!session || session.user.role !== "employer") {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Posting Management</h1>
            <p className="text-gray-600 mt-1">
              Create, edit, and track your recruitment opportunities.
            </p>
          </div>
          <Link
            href="/employer/post-a-job/create"
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Job Posting</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <Briefcase className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Draft</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Closed</p>
                <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <Archive className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Tabs */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  {(["all", "active", "draft", "closed"] as FilterTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                        activeTab === tab
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {tab === "all" ? "All Jobs" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
                <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by job title, ID or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-72 pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Job Details
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Posted Date
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Applicants
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Views
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Briefcase className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No jobs found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {searchQuery
                            ? "Try adjusting your search criteria"
                            : "Create your first job posting to get started"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job.id)}
                          onChange={() => handleSelectJob(job.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{job.title}</p>
                            <p className="text-sm text-gray-500">
                              {job.workLocationType}
                              {job.location && ` • ${job.location}`} • {job.employmentType}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(job.status as JobStatus)}
                      </td>
                      <td className="px-6 py-4">
                        <p
                          className={`text-sm ${job.status === "draft" ? "italic text-gray-400" : "text-gray-900"}`}
                        >
                          {job.status === "draft" ? "Not Posted" : formatDate(job.createdAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {job.status === "draft" ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {job._count.applications}
                            </p>
                            {job.status === "closed" ? (
                              <p className="text-xs text-gray-500">Finalized</p>
                            ) : (
                              <p className="text-xs text-gray-500">applicants</p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {job.status === "draft" ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <p className="text-sm text-gray-900">
                            {job.viewCount.toLocaleString()}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {job.status === "draft" ? (
                            <>
                              <button
                                onClick={() => publishMutation.mutate({ id: job.id })}
                                disabled={publishMutation.isPending}
                                className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
                              >
                                {publishMutation.isPending ? "Publishing..." : "Publish"}
                              </button>
                              <Link
                                href={`/employer/post-a-job/${job.id}/edit`}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                              >
                                <Pencil className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this job?")) {
                                    deleteMutation.mutate({ id: job.id });
                                  }
                                }}
                                disabled={deleteMutation.isPending}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : job.status === "closed" ? (
                            <>
                              <Link
                                href={`/employer/post-a-job/${job.id}/applicants`}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                title="View applicants"
                              >
                                <Users className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this job?")) {
                                    deleteMutation.mutate({ id: job.id });
                                  }
                                }}
                                disabled={deleteMutation.isPending}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <Link
                                href={`/employer/post-a-job/${job.id}/edit`}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                title="Edit job"
                              >
                                <Pencil className="w-4 h-4" />
                              </Link>
                              <Link
                                href={`/employer/post-a-job/${job.id}/applicants`}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                title="View applicants"
                              >
                                <Users className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => closeMutation.mutate({ id: job.id })}
                                disabled={closeMutation.isPending}
                                className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition disabled:opacity-50"
                                title="Close job posting"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">1-{Math.min(itemsPerPage, totalItems)}</span> of{" "}
              <span className="font-medium">{totalItems}</span> jobs
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
