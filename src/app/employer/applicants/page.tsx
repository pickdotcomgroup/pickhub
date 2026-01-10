"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  Sparkles,
  MapPin,
  Loader2,
  UserCheck,
  Filter,
  GraduationCap,
} from "lucide-react";
import { api } from "~/trpc/react";

type ApplicationStatus = "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";
type SortOption = "newest" | "oldest" | "match_high" | "match_low";

const statusConfig: Record<
  ApplicationStatus,
  { label: string; color: string; bgColor: string; dotColor: string }
> = {
  pending: {
    label: "New",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    dotColor: "bg-blue-500",
  },
  reviewed: {
    label: "Reviewed",
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
    dotColor: "bg-amber-500",
  },
  shortlisted: {
    label: "Interviewing",
    color: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
    dotColor: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
    dotColor: "bg-red-500",
  },
  hired: {
    label: "Hired",
    color: "text-purple-700",
    bgColor: "bg-purple-50 border-purple-200",
    dotColor: "bg-purple-500",
  },
};

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "match_high", label: "Match Score (High to Low)" },
  { value: "match_low", label: "Match Score (Low to High)" },
];

export default function ApplicantsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | "">("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Dropdown states
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Fetch applications
  const { data: applicationsData, isLoading: isAppsLoading, refetch } =
    api.jobs.getAllEmployerApplications.useQuery({
      jobId: selectedJob || undefined,
      status: selectedStatus || undefined,
      search: searchQuery || undefined,
      sortBy,
      limit: 50,
    });

  // Fetch jobs for filter
  const { data: jobsForFilter } = api.jobs.getEmployerJobsForFilter.useQuery();

  // Update status mutation
  const updateStatusMutation = api.jobs.updateApplicationStatus.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  // Auth check
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

    setIsPageLoading(false);
  }, [session, status, router]);

  const handleStatusChange = (applicationId: string, newStatus: ApplicationStatus) => {
    updateStatusMutation.mutate({
      applicationId,
      status: newStatus,
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
  };

  const getInitials = (name: string | null, firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (name) {
      const parts = name.split(" ");
      if (parts.length >= 2) {
        return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return "??";
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 40) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  const applications = applicationsData?.applications ?? [];
  const stats = applicationsData?.stats ?? { pendingReview: 0, totalActive: 0 };

  if (status === "loading" || isPageLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-64"></div>
            <div className="h-16 bg-gray-200 rounded-xl"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
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
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Applicants Management
            </h1>
            <p className="text-gray-600 mt-1">
              Review, track, and manage incoming applications for your open roles.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {stats.pendingReview}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Pending Review
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalActive}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Total Active
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search applicants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Job Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowJobDropdown(!showJobDropdown);
                  setShowStatusDropdown(false);
                  setShowSortDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition min-w-[140px]"
              >
                <span className="text-sm text-gray-700">
                  {selectedJob
                    ? jobsForFilter?.find((j) => j.id === selectedJob)?.title ?? "All Jobs"
                    : "All Jobs"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showJobDropdown && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-20 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedJob("");
                      setShowJobDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      !selectedJob ? "text-blue-600 font-medium" : "text-gray-700"
                    }`}
                  >
                    All Jobs
                  </button>
                  {jobsForFilter?.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => {
                        setSelectedJob(job.id);
                        setShowJobDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                        selectedJob === job.id
                          ? "text-blue-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <span className="truncate">{job.title}</span>
                      <span className="text-gray-400 text-xs ml-2">
                        {job._count.applications}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowJobDropdown(false);
                  setShowSortDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition min-w-[120px]"
              >
                <span className="text-sm text-gray-700">
                  {selectedStatus
                    ? statusConfig[selectedStatus].label
                    : "Status"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
                  <button
                    onClick={() => {
                      setSelectedStatus("");
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      !selectedStatus ? "text-blue-600 font-medium" : "text-gray-700"
                    }`}
                  >
                    All Statuses
                  </button>
                  {(Object.keys(statusConfig) as ApplicationStatus[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedStatus(key);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                        selectedStatus === key
                          ? "text-blue-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${statusConfig[key].dotColor}`}
                      />
                      {statusConfig[key].label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown);
                  setShowJobDropdown(false);
                  setShowStatusDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition min-w-[140px]"
              >
                <span className="text-sm text-gray-700">
                  {sortOptions.find((o) => o.value === sortBy)?.label ?? "Match Score"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showSortDropdown && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value as SortOption);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        sortBy === option.value
                          ? "text-blue-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Icon */}
            <button className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <Filter className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Applications List */}
        {isAppsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No applications found
            </h3>
            <p className="text-gray-600">
              {searchQuery || selectedJob || selectedStatus
                ? "Try adjusting your filters to see more applications."
                : "When candidates apply to your jobs, they'll appear here."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {applications.map((application, index) => {
              const talentName =
                application.talent.talentProfile?.firstName && application.talent.talentProfile?.lastName
                  ? `${application.talent.talentProfile.firstName} ${application.talent.talentProfile.lastName}`
                  : application.talent.name ?? "Unknown";
              const initials = getInitials(
                application.talent.name,
                application.talent.talentProfile?.firstName,
                application.talent.talentProfile?.lastName
              );
              const isNew = application.status === "pending";
              const currentStatus = application.status as ApplicationStatus;

              return (
                <div
                  key={application.id}
                  className={`flex items-center justify-between p-5 ${
                    index !== applications.length - 1 ? "border-b border-gray-100" : ""
                  } hover:bg-gray-50 transition`}
                >
                  {/* Left: Avatar and Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {application.talent.image ? (
                        <img
                          src={application.talent.image}
                          alt={talentName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {initials}
                          </span>
                        </div>
                      )}
                      {/* Online indicator for new applications */}
                      {isNew && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Name and Job Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {talentName}
                        </h3>
                        {isNew && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        Applied for{" "}
                        <span className="font-medium text-gray-900">
                          {application.job.title}
                        </span>
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        {application.job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {application.job.location}
                          </span>
                        )}
                        {application.talent.talentProfile?.experience && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            {application.talent.talentProfile.experience.length > 20
                              ? `${application.talent.talentProfile.experience.slice(0, 20)}...`
                              : application.talent.talentProfile.experience}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Match Score */}
                  <div className="flex flex-col items-center px-4">
                    <span className="text-xs text-gray-500 mb-1">AI Match</span>
                    <span
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getMatchColor(
                        application.matchScore
                      )}`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {application.matchScore}%
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col items-center px-4 min-w-[100px]">
                    <span className="text-xs text-gray-500 mb-1">Status</span>
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig[currentStatus].bgColor} ${statusConfig[currentStatus].color}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusConfig[currentStatus].dotColor}`}
                      />
                      {statusConfig[currentStatus].label}
                    </span>
                  </div>

                  {/* Applied Time */}
                  <div className="flex flex-col items-center px-4 min-w-[100px]">
                    <span className="text-xs text-gray-500 mb-1">Applied</span>
                    <span className="text-sm text-gray-700">
                      {formatTimeAgo(application.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pl-4">
                    {currentStatus === "pending" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(application.id, "rejected")}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleStatusChange(application.id, "shortlisted")}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                        >
                          Move to Interview
                        </button>
                      </>
                    )}
                    {currentStatus === "reviewed" && (
                      <>
                        <button
                          onClick={() =>
                            router.push(`/employer/applicants/${application.id}`)
                          }
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                        >
                          View Application
                        </button>
                        <button
                          onClick={() => handleStatusChange(application.id, "shortlisted")}
                          className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-lg transition"
                        >
                          Manage
                        </button>
                      </>
                    )}
                    {currentStatus === "shortlisted" && (
                      <>
                        <button
                          onClick={() =>
                            router.push(`/employer/applicants/${application.id}`)
                          }
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                        >
                          View Application
                        </button>
                        <button
                          onClick={() => handleStatusChange(application.id, "hired")}
                          className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-lg transition"
                        >
                          Manage
                        </button>
                      </>
                    )}
                    {currentStatus === "rejected" && (
                      <button
                        onClick={() => handleStatusChange(application.id, "pending")}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                      >
                        Reconsider
                      </button>
                    )}
                    {currentStatus === "hired" && (
                      <button
                        onClick={() =>
                          router.push(`/employer/applicants/${application.id}`)
                        }
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upskill CTA Card 
        <div className="mt-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 font-semibold text-sm uppercase tracking-wide">
              Upskill
            </span>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            Sponsor courses for your talent pipeline to close skill gaps.
          </p>
          <button
            onClick={() => router.push("/employer/upskilling")}
            className="w-full sm:w-auto px-6 py-2.5 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition"
          >
            Explore Courses
          </button>
        </div>*/}
      </div>
    </main>
  );
}
