"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Pointer } from "lucide-react";
import { toast } from 'react-toastify';

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
    image: string | null;
  };
}

export default function AgencyBrowseClientsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [pickingProjectId, setPickingProjectId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/projects");
      const data = await response.json() as { error?: string; projects: Project[] };

      if (!response.ok) {
        setError(data.error ?? "Failed to fetch projects");
        return;
      }

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

    if (session.user.role !== "agency") {
      router.push("/dashboard");
      return;
    }

    void fetchProjects();
  }, [session, status, router, fetchProjects]);

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

  if (!session || session.user.role !== "agency") {
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

  const handlePickProject = async (projectId: string) => {
    setPickingProjectId(projectId);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: projectId,
        }),
      });

      const data = await response.json() as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Failed to pick project");
        return;
      }

      // Save to localStorage
      const pickedIds = JSON.parse(localStorage.getItem("pickedProjects") ?? "[]") as string[];
      if (!pickedIds.includes(projectId)) {
        pickedIds.push(projectId);
        localStorage.setItem("pickedProjects", JSON.stringify(pickedIds));
      }

      setError("");
      toast.success('Project picked successfully!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Navigate to picked clients page
      router.push("/agency/picked-clients");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setPickingProjectId(null);
    }
  };

  return (
    <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Client Projects</h1>
            <p className="text-gray-600">Find and pick projects from clients looking for agency services</p>
          </div>

          {/* Two Column Layout: Filters Left, Projects Right */}
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 sticky top-24">
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
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all flex flex-col shadow-sm"
                    >
                      <div className="flex flex-col flex-1">
                        <div className="mb-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 flex-1">{project.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full border capitalize ${getTierBadgeColor(project.minimumTier)}`}>
                              {project.minimumTier}
                            </span>
                          </div>
                          {/* Client Avatar and Name */}
                          <div className="flex items-center gap-2 mb-2">
                            {project.client.image ? (
                              <Image
                                src={project.client.image}
                                alt={project.client.name ?? "Client"}
                                width={24}
                                height={24}
                                className="w-6 h-6 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-xs font-semibold text-blue-600">
                                  {(project.client.name ?? project.client.email ?? "A").charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="text-sm text-gray-600">
                              <span className="font-medium text-gray-900">{project.client.name ?? project.client.email ?? "Anonymous"}</span>
                            </span>
                          </div>
                          <span className="font-bold text-gray-500 text-xs mr-1">Description:</span>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{project.description}</p>
                          <div className="flex items-center flex-wrap gap-3 text-xs text-gray-500 mb-3">
                            <span className="flex items-center space-x-1 text-black-700">
                              <span className="font-bold text-xs mr-1">Category:</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <span>{project.category}</span>
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
                              <span className="font-bold text-xs mr-0">Deadline:</span>
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

                        {/* Action Buttons */}
                        <div className="mt-auto flex justify-end">
                          <button
                            onClick={() => handlePickProject(project.id)}
                            disabled={pickingProjectId !== null}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Pointer className="w-4 h-4" />
                            {pickingProjectId === project.id ? "Picking..." : "Pick"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
  );
}
