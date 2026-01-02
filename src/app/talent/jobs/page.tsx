"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
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
  Bot,
  Cpu,
  Database,
  Brain,
  Sparkles,
  Settings,
  Zap,
} from "lucide-react";
import {
  aiJobsData,
  jobTypeFilters,
  experienceLevelFilters,
  salaryRangeFilters,
  sortOptions,
} from "./ai-jobs-data";

const companyIcons: Record<string, React.ReactNode> = {
  microsoft: <Cpu className="w-6 h-6 text-blue-600" />,
  netflix: <Database className="w-6 h-6 text-red-600" />,
  stripe: <Settings className="w-6 h-6 text-purple-600" />,
  openai: <Brain className="w-6 h-6 text-green-600" />,
  tesla: <Zap className="w-6 h-6 text-red-500" />,
  google: <Sparkles className="w-6 h-6 text-blue-500" />,
  databricks: <Database className="w-6 h-6 text-orange-500" />,
  meta: <Bot className="w-6 h-6 text-blue-600" />,
  spotify: <Sparkles className="w-6 h-6 text-green-500" />,
  anthropic: <Brain className="w-6 h-6 text-orange-600" />,
  "boston-dynamics": <Bot className="w-6 h-6 text-yellow-600" />,
  ibm: <Cpu className="w-6 h-6 text-blue-700" />,
  amazon: <Database className="w-6 h-6 text-orange-500" />,
  deepmind: <Brain className="w-6 h-6 text-blue-500" />,
  adobe: <Sparkles className="w-6 h-6 text-red-600" />,
  waymo: <Bot className="w-6 h-6 text-teal-600" />,
  tempus: <Database className="w-6 h-6 text-blue-600" />,
  nvidia: <Cpu className="w-6 h-6 text-green-600" />,
};

export default function TalentJobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  // Filter states
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<string[]>([
    "Mid Level",
    "Senior Level",
  ]);
  const [selectedSalaryRange, setSelectedSalaryRange] = useState<string>("200k+");

  // Sort state
  const [sortBy, setSortBy] = useState("most-relevant");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Bookmarked jobs
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([]);

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

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let jobs = [...aiJobsData];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      jobs = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query)
      );
    }

    // Filter by location
    if (locationQuery) {
      const query = locationQuery.toLowerCase();
      jobs = jobs.filter((job) => job.location.toLowerCase().includes(query));
    }

    // Filter by job type
    if (selectedJobTypes.length > 0) {
      jobs = jobs.filter(
        (job) =>
          selectedJobTypes.includes(job.jobType) ||
          (selectedJobTypes.includes("Remote") && job.workType === "Remote")
      );
    }

    // Filter by experience level
    if (selectedExperienceLevels.length > 0) {
      jobs = jobs.filter((job) =>
        selectedExperienceLevels.includes(job.experienceLevel)
      );
    }

    // Filter by salary range
    if (selectedSalaryRange) {
      jobs = jobs.filter((job) => {
        const salaryStr = job.salaryRange;
        const match = /\$(\d+)k/.exec(salaryStr);
        if (!match?.[1]) return true;
        const salary = parseInt(match[1]) * 1000;
        switch (selectedSalaryRange) {
          case "100k-150k":
            return salary >= 100000 && salary <= 150000;
          case "150k-200k":
            return salary >= 150000 && salary <= 200000;
          case "200k+":
            return salary >= 200000;
          default:
            return true;
        }
      });
    }

    // Sort jobs
    switch (sortBy) {
      case "newest":
        jobs.sort((a, b) => {
          const getHours = (posted: string) => {
            if (posted.includes("hour")) return parseInt(posted);
            if (posted.includes("day"))
              return parseInt(posted) * 24;
            if (posted.includes("week"))
              return parseInt(posted) * 24 * 7;
            return 0;
          };
          return getHours(a.postedAt) - getHours(b.postedAt);
        });
        break;
      case "salary-high":
        jobs.sort((a, b) => {
          const getSalary = (range: string) => {
            const match = /\$(\d+)k/.exec(range);
            return match?.[1] ? parseInt(match[1]) : 0;
          };
          return getSalary(b.salaryRange) - getSalary(a.salaryRange);
        });
        break;
      case "salary-low":
        jobs.sort((a, b) => {
          const getSalary = (range: string) => {
            const match = /\$(\d+)k/.exec(range);
            return match?.[1] ? parseInt(match[1]) : 0;
          };
          return getSalary(a.salaryRange) - getSalary(b.salaryRange);
        });
        break;
      default:
        break;
    }

    return jobs;
  }, [
    searchQuery,
    locationQuery,
    selectedJobTypes,
    selectedExperienceLevels,
    selectedSalaryRange,
    sortBy,
  ]);

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

  if (status === "loading" || isLoading) {
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
            Find Your Next AI Role
          </h1>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="AI Researcher, ML Engineer, Data Scientist..."
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
              Search AI Jobs
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
                  {jobTypeFilters.map((filter) => (
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
                      <span className="text-sm text-gray-400">
                        {filter.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Experience Level
                </h3>
                <div className="space-y-2.5">
                  {experienceLevelFilters.map((filter) => (
                    <label
                      key={filter.value}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedExperienceLevels.includes(filter.value)}
                        onChange={() =>
                          handleExperienceLevelChange(filter.value)
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2.5 text-sm text-gray-700">
                        {filter.label}
                      </span>
                    </label>
                  ))}
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
                  {filteredJobs.length}
                </span>{" "}
                <span className="text-blue-600 font-medium">
                  AI & ML results
                </span>
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
                          setSortBy(option.value);
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

            {/* Job Cards */}
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Company Logo */}
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {job.logoIcon && companyIcons[job.logoIcon] ? (
                          companyIcons[job.logoIcon]
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
                          {job.company} • {job.location}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                            {getWorkTypeIcon(job.workType)}
                            {job.workType}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                            <Clock className="w-3.5 h-3.5" />
                            {job.jobType}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
                            {job.salaryRange}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {job.description}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1.5" />
                            Posted {job.postedAt}
                          </div>
                          <button className="px-5 py-2 border border-blue-600 text-blue-600 font-medium text-sm rounded-lg hover:bg-blue-50 transition">
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

              {filteredJobs.length === 0 && (
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
          </div>
        </div>
      </div>
    </main>
  );
}
