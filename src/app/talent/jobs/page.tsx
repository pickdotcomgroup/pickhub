"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  Bookmark,
  Calendar,
  Building2,
  Clock,
  Home,
  Briefcase,
  ChevronDown,
  DollarSign,
  Loader2,
} from "lucide-react";
import { api } from "~/trpc/react";

const sortOptions = [
  { value: "newest", label: "Most Recent" },
  { value: "salary_high", label: "Salary (High to Low)" },
  { value: "salary_low", label: "Salary (Low to High)" },
];

export default function TalentJobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  // Filter states
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<string[]>([]);
  const [selectedSalaryRange, setSelectedSalaryRange] = useState<string>("");

  // Sort state
  const [sortBy, setSortBy] = useState<"newest" | "salary_high" | "salary_low">("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Bookmarked jobs
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([]);

  // Fetch jobs from tRPC
  const { data: jobsData, isLoading: isJobsLoading } = api.jobs.getAll.useQuery({
    search: searchQuery || undefined,
    location: locationQuery || undefined,
    employmentType: selectedJobTypes.length === 1 ? selectedJobTypes[0] : undefined,
    experienceLevel: selectedExperienceLevels.length === 1 ? selectedExperienceLevels[0] : undefined,
    salaryMin: selectedSalaryRange === "100k-150k" ? 100000 : selectedSalaryRange === "150k-200k" ? 150000 : selectedSalaryRange === "200k+" ? 200000 : undefined,
    salaryMax: selectedSalaryRange === "100k-150k" ? 150000 : selectedSalaryRange === "150k-200k" ? 200000 : undefined,
    sortBy,
    limit: 50,
  });

  // Fetch filter data
  const { data: filtersData } = api.jobs.getFilters.useQuery();

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
        setIsPageLoading(false);
      }
    };

    void checkVerification();
  }, [session, status, router]);

  const handleJobTypeChange = (value: string) => {
    setSelectedJobTypes((prev) =>
      prev.includes(value)
        ? prev.filter((t) => t !== value)
        : [...prev, value]
    );
  };

  const handleExperienceLevelChange = (value: string) => {
    setSelectedExperienceLevels((prev) =>
      prev.includes(value)
        ? prev.filter((l) => l !== value)
        : [...prev, value]
    );
  };

  const handleClearAllFilters = () => {
    setSelectedJobTypes([]);
    setSelectedExperienceLevels([]);
    setSelectedSalaryRange("");
    setSearchQuery("");
    setLocationQuery("");
  };

  const toggleBookmark = (jobId: string) => {
    setBookmarkedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  const getWorkTypeIcon = (workType: string) => {
    switch (workType) {
      case "Hybrid":
        return <Home className="w-3.5 h-3.5" />;
      case "Remote":
        return <Home className="w-3.5 h-3.5" />;
      case "On-site":
        return <Building2 className="w-3.5 h-3.5" />;
      default:
        return <Building2 className="w-3.5 h-3.5" />;
    }
  };

  const formatSalary = (min?: number | null, max?: number | null, period?: string | null) => {
    if (!min && !max) return "Salary not specified";
    const formatNum = (n: number) => {
      if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
      return `$${n}`;
    };
    if (min && max) {
      return `${formatNum(min)} - ${formatNum(max)}${period ? ` ${period}` : ""}`;
    }
    if (min) return `${formatNum(min)}+${period ? ` ${period}` : ""}`;
    if (max) return `Up to ${formatNum(max)}${period ? ` ${period}` : ""}`;
    return "Salary not specified";
  };

  const formatPostedAt = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
  };

  const jobs = jobsData?.jobs ?? [];

  // Static filter options
  const jobTypeFilters = [
    { value: "Full-time", label: "Full-time" },
    { value: "Part-time", label: "Part-time" },
    { value: "Contract", label: "Contract" },
    { value: "Freelance", label: "Freelance" },
    { value: "Internship", label: "Internship" },
  ];

  const experienceLevelFilters = [
    { value: "Entry Level", label: "Entry Level" },
    { value: "Mid Level", label: "Mid Level" },
    { value: "Senior Level", label: "Senior Level" },
    { value: "Lead", label: "Lead" },
    { value: "Executive", label: "Executive" },
  ];

  const salaryRangeFilters = [
    { value: "100k-150k", label: "$100k - $150k" },
    { value: "150k-200k", label: "$150k - $200k" },
    { value: "200k+", label: "$200k+" },
  ];

  if (status === "loading" || isPageLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
            <div className="h-16 bg-gray-200 rounded-xl"></div>
            <div className="flex gap-6">
              <div className="w-64 h-96 bg-gray-200 rounded-xl"></div>
              <div className="flex-1 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Find Your Next Role
          </h1>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Job title, company, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="City, state, or remote"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition whitespace-nowrap">
              Search Jobs
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={handleClearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all
                </button>
              </div>

              {/* Job Type */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Job Type
                </h3>
                <div className="space-y-2.5">
                  {jobTypeFilters.map((filter) => {
                    const count = filtersData?.employmentTypes.find(
                      (t) => t.value === filter.value
                    )?.count ?? 0;
                    return (
                      <label
                        key={filter.value}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedJobTypes.includes(filter.value)}
                            onChange={() => handleJobTypeChange(filter.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2.5 text-sm text-gray-700">
                            {filter.label}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">{count}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Experience Level */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Experience Level
                </h3>
                <div className="space-y-2.5">
                  {experienceLevelFilters.map((filter) => {
                    const count = filtersData?.experienceLevels.find(
                      (l) => l.value === filter.value
                    )?.count ?? 0;
                    return (
                      <label
                        key={filter.value}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedExperienceLevels.includes(filter.value)}
                            onChange={() => handleExperienceLevelChange(filter.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2.5 text-sm text-gray-700">
                            {filter.label}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">{count}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Salary Range
                </h3>
                <div className="space-y-2.5">
                  {salaryRangeFilters.map((filter) => (
                    <label
                      key={filter.value}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="salaryRange"
                        value={filter.value}
                        checked={selectedSalaryRange === filter.value}
                        onChange={() => setSelectedSalaryRange(filter.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2.5 text-sm text-gray-700">
                        {filter.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {jobs.length}
                </span>{" "}
                job{jobs.length !== 1 ? "s" : ""}
              </p>
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <span>Sort by:</span>
                  <span className="font-medium text-gray-900">
                    {sortOptions.find((o) => o.value === sortBy)?.label}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value as "newest" | "salary_high" | "salary_low");
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
            </div>

            {/* Loading State */}
            {isJobsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}

            {/* Job Cards */}
            {!isJobsLoading && (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition cursor-pointer"
                    onClick={() => router.push(`/talent/jobs/${job.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Company Logo */}
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {job.employer.image ? (
                            <img
                              src={job.employer.image}
                              alt={job.employer.employerProfile?.companyName ?? "Company"}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Briefcase className="w-6 h-6 text-gray-400" />
                          )}
                        </div>

                        {/* Job Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {job.employer.employerProfile?.companyName ?? job.employer.name ?? "Company"}
                            {job.location && ` • ${job.location}`}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                              {getWorkTypeIcon(job.workLocationType)}
                              {job.workLocationType}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                              <Clock className="w-3.5 h-3.5" />
                              {job.employmentType}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
                              <DollarSign className="w-3.5 h-3.5" />
                              {formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod)}
                            </span>
                          </div>

                          {/* Skills */}
                          {job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {job.skills.slice(0, 4).map((skill) => (
                                <span
                                  key={skill}
                                  className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                                >
                                  {skill}
                                </span>
                              ))}
                              {job.skills.length > 4 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                  +{job.skills.length - 4} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Description */}
                          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                            {job.description}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1.5" />
                              Posted {formatPostedAt(job.createdAt)}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/talent/jobs/${job.id}/apply`);
                              }}
                              className="px-5 py-2 border border-blue-600 text-blue-600 font-medium text-sm rounded-lg hover:bg-blue-50 transition"
                            >
                              Apply Now
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Bookmark */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(job.id);
                        }}
                        className="ml-4 flex-shrink-0"
                      >
                        <Bookmark
                          className={`w-5 h-5 ${
                            bookmarkedJobs.includes(job.id)
                              ? "fill-blue-600 text-blue-600"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}

                {jobs.length === 0 && !isJobsLoading && (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No jobs found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your filters or search terms to find more
                      opportunities.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
