"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { MessageSquare, Calendar, X, Briefcase } from "lucide-react";

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

export default function AgencyPickedClientsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pickedProjects, setPickedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPickedProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get picked project IDs from localStorage
      const pickedIds = JSON.parse(localStorage.getItem("pickedProjects") ?? "[]") as string[];

      if (pickedIds.length === 0) {
        setPickedProjects([]);
        setLoading(false);
        return;
      }

      // Fetch all projects
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json() as { projects: Project[] };
      
      // Filter to only picked projects
      const picked = data.projects.filter(project => pickedIds.includes(project.id));
      setPickedProjects(picked);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching picked projects:", err);
    } finally {
      setLoading(false);
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

    void fetchPickedProjects();
  }, [session, status, router, fetchPickedProjects]);

  if (status === "loading" || loading) {
    return (
      <>
        <div className="flex items-center justify-center gap-3 m-10">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <div className="text-gray-500 text-md">Loading picked projects...</div>
        </div>
      </>
    );
  }

  if (!session || session.user.role !== "agency") {
    return null;
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "silver":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "bronze":
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleStartConversation = async (clientId: string) => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: clientId }),
      });

      if (response.ok) {
        router.push("/agency/messages");
      } else {
        console.error("Failed to create conversation");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const handleScheduleConsultation = async (clientId: string) => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: clientId }),
      });

      if (response.ok) {
        router.push("/agency/messages");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleStartProject = (_projectId: string) => {
    alert("Start project functionality will be implemented soon!");
  };

  const handleRemovePick = (projectId: string) => {
    const pickedIds = JSON.parse(localStorage.getItem("pickedProjects") ?? "[]") as string[];
    const updatedIds = pickedIds.filter(id => id !== projectId);
    localStorage.setItem("pickedProjects", JSON.stringify(updatedIds));
    setPickedProjects(prev => prev.filter(project => project.id !== projectId));
  };

  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Picked Client Projects</h1>
            <p className="text-gray-600">
              Manage your picked projects - message clients, schedule consultations, and start work
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-6 mb-8">
              <p className="text-red-700">Error: {error}</p>
            </div>
          )}

          {pickedProjects.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-12 border border-gray-200 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No picked projects yet</h3>
              <p className="text-gray-600 mb-6">
                Browse client projects and pick the ones you want to work on
              </p>
              <button
                onClick={() => router.push("/agency/browse-clients")}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                Browse Client Projects
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pickedProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl p-6 border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all relative flex flex-col">
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemovePick(project.id)}
                    className="absolute top-4 right-4 p-1.5 hover:bg-red-50 rounded-lg transition group"
                    title="Remove from picked"
                  >
                    <X className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
                  </button>

                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-3 pr-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">{project.title}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border capitalize ${getTierBadgeColor(project.minimumTier)}`}>
                        {project.minimumTier}
                      </span>
                    </div>

                    {/* Client Info */}
                    <div className="flex items-center gap-2 mb-3">
                      {project.client.image ? (
                        <Image
                          src={project.client.image}
                          alt={project.client.name ?? "Client"}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            {(project.client.name ?? project.client.email ?? "C").charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {project.client.name ?? project.client.email ?? "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-500">{project.category}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>

                    {/* Project Details */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Budget</p>
                        <p className="text-sm text-gray-900 font-semibold">${project.budget.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Type</p>
                        <p className="text-sm text-gray-900 font-semibold capitalize">{project.projectType}</p>
                      </div>
                    </div>

                    {project.projectType === "hourly" && project.hourlyRate && (
                      <div className="bg-green-50 rounded-lg p-3 mb-4">
                        <p className="text-xs text-green-600 mb-1">Hourly Rate</p>
                        <p className="text-lg font-bold text-green-900">${project.hourlyRate.toFixed(2)}/hr</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Deadline: {formatDate(project.deadline)}</span>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                      {project.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{project.skills.length - 3} more
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 mt-auto pt-4">
                    <button
                      onClick={() => handleStartConversation(project.client.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message Client
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStartProject(project.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                      >
                        <Briefcase className="w-4 h-4" />
                        Start
                      </button>
                      <button
                        onClick={() => handleScheduleConsultation(project.client.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition"
                      >
                        <Calendar className="w-4 h-4" />
                        Consult
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pickedProjects.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {pickedProjects.length} project{pickedProjects.length !== 1 ? "s" : ""} picked
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
