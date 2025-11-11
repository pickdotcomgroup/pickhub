"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface TalentProfile {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  skills: string[];
  experience: string;
  hourlyRate: string | null;
  portfolio: string | null;
}

interface Application {
  id: string;
  status: string;
  coverLetter: string | null;
  proposedRate: number | null;
  createdAt: string;
  talent: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    talentProfile: TalentProfile | null;
  };
}

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
  createdAt: string;
  applications?: Application[];
}

export default function MyProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedProjectApplications, setSelectedProjectApplications] = useState<{
    project: Project;
    applications: Application[];
  } | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Application | null>(null);
  const [loadingAccept, setLoadingAccept] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!session?.user.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects?clientId=${session.user.id}`);
      const data = await response.json() as { error?: string; projects: Project[] };

      if (!response.ok) {
        setError(data.error ?? "Failed to fetch projects");
        return;
      }

      // Fetch applications for each project
      const projectsWithApplications = await Promise.all(
        data.projects.map(async (project) => {
          try {
            const appResponse = await fetch(`/api/applications?projectId=${project.id}`);
            const appData = await appResponse.json() as { applications: Application[] };
            return { ...project, applications: appData.applications ?? [] };
          } catch {
            return { ...project, applications: [] };
          }
        })
      );

      setProjects(projectsWithApplications);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user.id]);

  const handleMessageDeveloper = async (talentId: string, projectId: string) => {
    setLoadingMessage(talentId);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: talentId, projectId }),
      });

      if (response.ok) {
        router.push("/client/messages");
      } else {
        setError("Failed to start conversation");
      }
    } catch {
      setError("Failed to start conversation");
    } finally {
      setLoadingMessage(null);
    }
  };

  const openApplicationsModal = (project: Project) => {
    setSelectedProjectApplications({
      project,
      applications: project.applications ?? [],
    });
  };

  const handleAcceptApplication = async (applicationId: string) => {
    setLoadingAccept(applicationId);
    try {
      const response = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status: "accepted" }),
      });

      if (response.ok) {
        // Refresh projects to show updated status
        await fetchProjects();
        // Close modal if open
        if (selectedDeveloper?.id === applicationId) {
          setSelectedDeveloper(null);
        }
      } else {
        const data = await response.json() as { error?: string };
        setError(data.error ?? "Failed to accept application");
      }
    } catch {
      setError("Failed to accept application");
    } finally {
      setLoadingAccept(null);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth");
      return;
    }

    if (session.user.role !== "client") {
      router.push("/client/dashboard");
      return;
    }

    void fetchProjects();
  }, [session, status, router, fetchProjects]);

  if (status === "loading" || isLoading) {
     return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <div className="text-lg text-gray-900">Loading projects...</div>
        </div>
      </main>
    );
  }

  if (!session || session.user.role !== "client") {
    return null;
  }

  const filteredProjects = filter === "all" 
    ? projects 
    : projects.filter(p => p.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-100 text-green-700 border-green-300";
      case "in_progress": return "bg-blue-100 text-blue-700 border-blue-300";
      case "completed": return "bg-purple-100 text-purple-700 border-purple-300";
      case "cancelled": return "bg-red-100 text-red-700 border-red-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Projects</h1>
            <p className="text-gray-600">Manage and track all your posted projects</p>
          </div>
          <Link
            href="/client/projects/new"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Post New Project</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setFilter("open")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "open"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Open ({projects.filter(p => p.status === "open").length})
            </button>
            <button
              onClick={() => setFilter("in_progress")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "in_progress"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              In Progress ({projects.filter(p => p.status === "in_progress").length})
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "completed"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Completed ({projects.filter(p => p.status === "completed").length})
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Projects List */}
        {filteredProjects.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-12 border border-gray-200 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-6">
              {filter === "all" 
                ? "You haven't posted any projects yet. Start by creating your first project!"
                : `No ${filter.replace("_", " ")} projects found.`}
            </p>
            {filter === "all" && (
              <Link
                href="/client/projects/new"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Post Your First Project</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {project.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span>{project.category}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Deadline: {formatDate(project.deadline)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>${project.budget.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition border border-gray-300">
                    Manage Project
                  </button>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 mb-4">
                  {project.skills.slice(0, 5).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {project.skills.length > 5 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{project.skills.length - 5} more
                    </span>
                  )}
                </div>

                {/* Applications Section */}
                {project.applications && project.applications.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => openApplicationsModal(project)}
                      className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-medium">
                        {project.applications.length} Developer{project.applications.length !== 1 ? 's' : ''} Applied
                      </span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Applications Modal */}
      {selectedProjectApplications && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProjectApplications(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Applications</h2>
                  <p className="text-gray-600">{selectedProjectApplications.project.title}</p>
                </div>
                <button
                  onClick={() => setSelectedProjectApplications(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {selectedProjectApplications.applications.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-600">No applications yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedProjectApplications.applications.map((application) => (
                    <div
                      key={application.id}
                      className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-purple-500 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Developer Avatar */}
                          <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {application.talent.image ? (
                              <Image
                                src={application.talent.image}
                                alt={application.talent.name ?? 'Developer'}
                                width={56}
                                height={56}
                                className="w-14 h-14 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg">
                                {application.talent.talentProfile
                                  ? `${application.talent.talentProfile.firstName[0]}${application.talent.talentProfile.lastName[0]}`
                                  : application.talent.name?.[0] ?? 'D'}
                              </span>
                            )}
                          </div>

                          {/* Developer Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {application.talent.talentProfile
                                  ? `${application.talent.talentProfile.firstName} ${application.talent.talentProfile.lastName}`
                                  : application.talent.name ?? 'Developer'}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                application.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : application.status === 'accepted'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {application.status.toUpperCase()}
                              </span>
                            </div>
                            
                            {application.talent.talentProfile && (
                              <>
                                <p className="text-gray-600 text-sm mb-3">
                                  {application.talent.talentProfile.title}
                                </p>
                                
                                {/* Skills */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {application.talent.talentProfile.skills.slice(0, 5).map((skill, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {application.talent.talentProfile.skills.length > 5 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                      +{application.talent.talentProfile.skills.length - 5}
                                    </span>
                                  )}
                                </div>

                                {/* Experience and Rate */}
                                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                                  <span className="capitalize">
                                    {application.talent.talentProfile.experience} Level
                                  </span>
                                  {application.talent.talentProfile.hourlyRate && (
                                    <span>${application.talent.talentProfile.hourlyRate}/hr</span>
                                  )}
                                  {application.proposedRate && (
                                    <span className="text-purple-600 font-medium">
                                      Proposed: ${application.proposedRate.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}

                            {/* Cover Letter Preview */}
                            {application.coverLetter && (
                              <div className="mt-3 p-3 bg-white rounded border border-gray-200 text-sm text-gray-700">
                                <p className="line-clamp-2">{application.coverLetter}</p>
                              </div>
                            )}

                            {/* Applied Date */}
                            <p className="text-xs text-gray-400 mt-3">
                              Applied {formatDate(application.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col space-y-2 ml-4">
                          <button
                            onClick={() => setSelectedDeveloper(application)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition whitespace-nowrap"
                          >
                            View Profile
                          </button>
                          {application.status === 'pending' && (
                            <button
                              onClick={() => handleAcceptApplication(application.id)}
                              disabled={loadingAccept === application.id}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white text-sm rounded-lg transition flex items-center justify-center space-x-1"
                            >
                              {loadingAccept === application.id ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>...</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Accept</span>
                                </>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleMessageDeveloper(application.talent.id, selectedProjectApplications.project.id)}
                            disabled={loadingMessage === application.talent.id}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-900 text-sm rounded-lg transition border border-gray-300"
                          >
                            {loadingMessage === application.talent.id ? (
                              <svg className="animate-spin h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              'Message'
                            )}
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
      )}

      {/* Developer Profile Modal */}
      {selectedDeveloper && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDeveloper(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Developer Profile</h2>
              <button
                onClick={() => setSelectedDeveloper(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Developer Header */}
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0">
                  {selectedDeveloper.talent.image ? (
                    <Image
                      src={selectedDeveloper.talent.image}
                      alt={selectedDeveloper.talent.name ?? 'Developer'}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <span>
                      {selectedDeveloper.talent.talentProfile
                        ? `${selectedDeveloper.talent.talentProfile.firstName[0]}${selectedDeveloper.talent.talentProfile.lastName[0]}`
                        : selectedDeveloper.talent.name?.[0] ?? 'D'}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedDeveloper.talent.talentProfile
                      ? `${selectedDeveloper.talent.talentProfile.firstName} ${selectedDeveloper.talent.talentProfile.lastName}`
                      : selectedDeveloper.talent.name ?? 'Developer'}
                  </h3>
                  {selectedDeveloper.talent.talentProfile && (
                    <>
                      <p className="text-purple-600 text-lg mb-2">
                        {selectedDeveloper.talent.talentProfile.title}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1 capitalize">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                          <span>{selectedDeveloper.talent.talentProfile.experience} Level</span>
                        </span>
                        {selectedDeveloper.talent.talentProfile.hourlyRate && (
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>${selectedDeveloper.talent.talentProfile.hourlyRate}/hr</span>
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Application Status */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Application Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedDeveloper.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : selectedDeveloper.status === 'accepted'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedDeveloper.status.toUpperCase()}
                    </span>
                  </div>
                  {selectedDeveloper.proposedRate && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Proposed Rate</p>
                      <p className="text-xl font-bold text-purple-600">
                        ${selectedDeveloper.proposedRate.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills Section */}
              {selectedDeveloper.talent.talentProfile && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>Skills & Expertise</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDeveloper.talent.talentProfile.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-purple-100 text-purple-700 text-sm rounded-lg border border-purple-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cover Letter */}
              {selectedDeveloper.coverLetter && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Cover Letter</span>
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedDeveloper.coverLetter}</p>
                  </div>
                </div>
              )}

              {/* Portfolio Link */}
              {selectedDeveloper.talent.talentProfile?.portfolio && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span>Portfolio</span>
                  </h4>
                  <a
                    href={selectedDeveloper.talent.talentProfile.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition"
                  >
                    <span>{selectedDeveloper.talent.talentProfile.portfolio}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Contact</span>
                </h4>
                <p className="text-gray-700">{selectedDeveloper.talent.email}</p>
              </div>

              {/* Application Date */}
              <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
                Applied on {formatDate(selectedDeveloper.createdAt)}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-6 flex space-x-3">
              {selectedDeveloper.status === 'pending' && (
                <button
                  onClick={() => handleAcceptApplication(selectedDeveloper.id)}
                  disabled={loadingAccept === selectedDeveloper.id}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-semibold rounded-lg transition flex items-center justify-center space-x-2"
                >
                  {loadingAccept === selectedDeveloper.id ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Accepting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Accept Application</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedDeveloper(null);
                  void handleMessageDeveloper(selectedDeveloper.talent.id, '');
                }}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Send Message</span>
              </button>
              <button
                onClick={() => setSelectedDeveloper(null)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition border border-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
