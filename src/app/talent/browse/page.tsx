"use client";

import { Pointer } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  category: string;
  skills: string[];
  projectType: string;
  status: string;
  minimumTier: string;
  estimatedDuration: number | null;
  hourlyRate: number | null;
  createdAt: string;
  client: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface TalentProfile {
  tier: string;
  activePicks: number;
  completedProjects: number;
  successRate: number;
}

export default function TalentBrowsePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [talentProfile, setTalentProfile] = useState<TalentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [applyingProjectId, setApplyingProjectId] = useState<string | null>(null);

  const fetchTalentProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/talents");
      const data = await response.json() as { error?: string; profile?: TalentProfile };

      if (response.ok && data.profile) {
        setTalentProfile(data.profile);
      }
    } catch (error) {
      console.error("Failed to fetch talent profile:", error);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/projects");
      const data = await response.json() as { error?: string; projects: Project[] };

      if (!response.ok) {
        setError(data.error ?? "Failed to fetch projects");
        return;
      }

      // Filter only open projects
      setProjects(data.projects.filter((p: Project) => p.status === "open"));
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

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

    // Check verification status before allowing access
    const checkVerification = async () => {
      try {
        const response = await fetch("/api/verification/status");
        if (response.ok) {
          const data = await response.json() as {
            platformAccess?: boolean;
          };

          // Redirect to verification page if not verified
          if (!data.platformAccess) {
            router.push("/talent/verification");
            return;
          }

          // Only fetch data if verified
          void fetchTalentProfile();
          void fetchProjects();
        }
      } catch (error) {
        console.error("Error checking verification:", error);
      }
    };

    void checkVerification();
  }, [session, status, router, fetchProjects, fetchTalentProfile]);

  if (status === "loading" || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <div className="text-lg text-gray-900">Loading projects...</div>
        </div>
      </main>
    );
  }

  if (!session || session.user.role !== "talent") {
    return null;
  }

  const skills = [
    "React",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "Laravel",
    "Machine Learning",
    "Data Science",
    "PHP",
    "Angular",
    "Docker",
    "AWS"
  ];
  const categories = [
    "Web Development",
    "Mobile App Development",
    "UI/UX Design",
    "Backend Development",
    "Full Stack Development",
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "gold":
        return "text-yellow-400";
      case "silver":
        return "text-gray-300";
      case "bronze":
      default:
        return "text-orange-400";
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "gold":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "silver":
        return "bg-gray-400/20 text-gray-300 border-gray-400/30";
      case "bronze":
      default:
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
    }
  };

  const canAccessProject = (projectMinTier: string) => {
    if (!talentProfile) return false;
    const tierOrder = ["bronze", "silver", "gold"];
    const talentTierIndex = tierOrder.indexOf(talentProfile.tier);
    const projectTierIndex = tierOrder.indexOf(projectMinTier);
    return talentTierIndex >= projectTierIndex;
  };

  const getMaxPicks = (tier: string) => {
    switch (tier) {
      case "gold":
        return 5;
      case "silver":
        return 4;
      case "bronze":
      default:
        return 3;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || project.category === selectedCategory;
    const matchesSkills = selectedSkills.length === 0 ||
      selectedSkills.some(skill => project.skills.includes(skill));

    return matchesSearch && matchesCategory && matchesSkills;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleApply = async (project: Project) => {
    if (!talentProfile) return;

    // Check tier access
    if (!canAccessProject(project.minimumTier)) {
      setError(`This project requires ${project.minimumTier} tier or higher`);
      return;
    }

    // Check concurrent picks limit
    const maxPicks = getMaxPicks(talentProfile.tier);
    if (talentProfile.activePicks >= maxPicks) {
      setError(`You have reached your maximum concurrent picks (${maxPicks}) for ${talentProfile.tier} tier`);
      return;
    }

    setApplyingProjectId(project.id);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project.id,
        }),
      });

      const data = await response.json() as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Failed to apply to project");
        return;
      }

      // Success - redirect to My Projects
      router.push("/talent/projects");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setApplyingProjectId(null);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Tier Info */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pick Projects</h1>
              <p className="text-gray-600">Find and apply to projects that match your skills</p>
            </div>
            {talentProfile && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Your Tier</div>
                    <div className={`text-lg font-bold capitalize ${getTierColor(talentProfile.tier)}`}>
                      {talentProfile.tier}
                    </div>
                  </div>
                  <div className="h-10 w-px bg-gray-300"></div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Active Picks</div>
                    <div className="text-lg font-bold text-gray-900">
                      {talentProfile.activePicks} / {getMaxPicks(talentProfile.tier)}
                    </div>
                  </div>
                  <div className="h-10 w-px bg-gray-300"></div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Completed</div>
                    <div className="text-lg font-bold text-gray-900">
                      {talentProfile.completedProjects}
                    </div>
                  </div>
                  <div className="h-10 w-px bg-gray-300"></div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Success Rate</div>
                    <div className="text-lg font-bold text-green-600">
                      {talentProfile.successRate?.toFixed(0) ?? 0}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Two Column Layout: Filters Left, Projects Right */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects..."
                    className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="" className="bg-white">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-white">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Skills Filter */}
              <div>
                <label className="block text-xl font-semibold text-gray-900 mb-4">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${selectedSkills.includes(skill)
                        ? "bg-blue-600 text-white ring-2 ring-blue-400"
                        : "bg-blue-600/80 text-white hover:bg-blue-600"
                        }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(searchQuery || selectedCategory || selectedSkills.length > 0) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                    setSelectedSkills([]);
                  }}
                  className="w-full mt-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Right Content - Projects */}
          <div className="lg:col-span-3">
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

            {/* Projects List */}
            {filteredProjects.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-12 border border-gray-200 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters or check back later for new opportunities
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredProjects.map((project) => {
                  const hasAccess = canAccessProject(project.minimumTier);

                  return (
                    <div
                      key={project.id}
                      className={`bg-white rounded-xl p-6 border transition-all flex flex-col shadow-sm ${hasAccess
                        ? "border-gray-200 hover:border-blue-500 hover:shadow-md"
                        : "border-red-300 opacity-75"
                        }`}
                    >
                      <div className="flex flex-col flex-1">
                        <div className="mb-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 flex-1">{project.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full border capitalize ${getTierBadgeColor(project.minimumTier)}`}>
                              {project.minimumTier}
                            </span>
                          </div>
                          <span className="font-bold text-gray-500 text-xs mr-1">Description:</span>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{project.description}</p>
                          <div className="flex items-center flex-wrap gap-3 text-xs text-gray-500 mb-3">
                            {/* Category Header */}
                            <span className="flex items-center space-x-1 text-black-700">
                              <span className="font-bold text-xs mr-1">Category:</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <span>
                                {project.category}
                              </span>
                            </span>
                            <span className="font-bold text-xs mr-0">Budget:</span>
                            <span className="flex items-center space-x-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>${project.budget.toLocaleString()}</span>
                            </span>
                            <span className="font-bold text-xs mr-0">Project type:</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {project.projectType === "fixed" ? "Fixed" : "Hourly"}
                            </span>
                            {project.projectType === "hourly" && project.hourlyRate && (
                              <>
                                <span className="font-bold text-xs mr-0">Hourly Rate:</span>
                                <span className="flex items-center space-x-1 text-green-600 font-semibold">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>${project.hourlyRate.toFixed(2)}/hr</span>
                                </span>
                              </>
                            )}
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <span className="font-bold text-xs mr-0">Target completion Date:</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{formatDate(project.deadline)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {project.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{project.skills.length - 3} more
                            </span>
                          )}
                        </div>

                        {!hasAccess && (
                          <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-xs text-red-400 text-center">
                              Requires {project.minimumTier} tier or higher
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() => handleApply(project)}
                          disabled={applyingProjectId !== null || !hasAccess}
                          className="w-full flex justify-center gap-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                        >
                          <Pointer className="w-5 h-5" />
                          {applyingProjectId === project.id ? "Picking..." : "Pick Project"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
