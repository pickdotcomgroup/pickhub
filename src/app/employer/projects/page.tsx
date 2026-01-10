"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  FolderKanban,
  Clock,
  CalendarClock,
  CheckCircle2,
  Search,
  ShoppingCart,
  Smartphone,
  ClipboardList,
  Database,
  Palette,
  Users,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Archive,
  Trash2,
  Code,
  Globe,
  Cpu,
  Gamepad2,
  Cloud,
  Layers,
} from "lucide-react";
import { api } from "~/trpc/react";

type ProjectStatus = "open" | "in_progress" | "planning" | "completed" | "cancelled";
type FilterTab = "all" | "open" | "in_progress" | "planning" | "completed";

const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    "Web Development": <Globe className="w-5 h-5 text-blue-600" />,
    "Mobile App Development": <Smartphone className="w-5 h-5 text-purple-600" />,
    "E-Commerce": <ShoppingCart className="w-5 h-5 text-teal-600" />,
    "UI/UX Design": <Palette className="w-5 h-5 text-pink-600" />,
    "Data Science": <Database className="w-5 h-5 text-green-600" />,
    "Machine Learning": <Cpu className="w-5 h-5 text-orange-600" />,
    "DevOps": <Layers className="w-5 h-5 text-yellow-600" />,
    "Cloud Services": <Cloud className="w-5 h-5 text-cyan-600" />,
    "Blockchain": <Code className="w-5 h-5 text-indigo-600" />,
    "Game Development": <Gamepad2 className="w-5 h-5 text-red-600" />,
    "Desktop Application": <ClipboardList className="w-5 h-5 text-gray-600" />,
    "API Development": <Code className="w-5 h-5 text-violet-600" />,
  };
  return icons[category] ?? <FolderKanban className="w-5 h-5 text-gray-600" />;
};

const getCategoryBg = (category: string) => {
  const bgs: Record<string, string> = {
    "Web Development": "bg-blue-100",
    "Mobile App Development": "bg-purple-100",
    "E-Commerce": "bg-teal-100",
    "UI/UX Design": "bg-pink-100",
    "Data Science": "bg-green-100",
    "Machine Learning": "bg-orange-100",
    "DevOps": "bg-yellow-100",
    "Cloud Services": "bg-cyan-100",
    "Blockchain": "bg-indigo-100",
    "Game Development": "bg-red-100",
    "Desktop Application": "bg-gray-100",
    "API Development": "bg-violet-100",
  };
  return bgs[category] ?? "bg-gray-100";
};

export default function EmployerProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const { data: projectsData, isLoading: isProjectsLoading, refetch } = api.projects.getEmployerProjects.useQuery(
    {
      status: activeTab === "all" ? undefined : activeTab,
      search: searchQuery || undefined,
    },
    {
      enabled: !!session && session.user.role === "employer",
    }
  );

  const deleteProjectMutation = api.projects.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  // const _updateStatusMutation = api.projects.updateStatus.useMutation({
  //   onSuccess: () => {
  //     void refetch();
  //   },
  // });

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

  const projects = projectsData?.projects ?? [];
  const stats = projectsData?.stats ?? {
    total: 0,
    open: 0,
    inProgress: 0,
    planning: 0,
    completed: 0,
  };

  const getStatusBadge = (projectStatus: ProjectStatus) => {
    switch (projectStatus) {
      case "in_progress":
        return (
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm font-medium text-green-600">In Progress</span>
          </div>
        );
      case "planning":
        return (
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span className="text-sm font-medium text-yellow-600">Planning</span>
          </div>
        );
      case "open":
        return (
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span className="text-sm font-medium text-blue-600">Open</span>
          </div>
        );
      case "completed":
        return (
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            <span className="text-sm font-medium text-gray-500">Completed</span>
          </div>
        );
      case "cancelled":
        return (
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
            <span className="text-sm font-medium text-red-500">Cancelled</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getDeadlineStatus = (deadline: Date) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: "Overdue", color: "text-red-600" };
    } else if (diffDays <= 7) {
      return { text: "Due soon", color: "text-orange-600" };
    } else if (diffDays <= 30) {
      return { text: "On track", color: "text-green-600" };
    } else {
      return { text: `${diffDays} days left`, color: "text-gray-500" };
    }
  };

  const handleSelectAll = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map((project) => project.id));
    }
  };

  const handleSelectProject = (projectId: string) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter((id) => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProjectMutation.mutate({ id: projectId });
    }
  };

  const tabLabels: Record<FilterTab, string> = {
    all: "All Projects",
    open: "Open",
    in_progress: "In Progress",
    planning: "Planning",
    completed: "Completed",
  };

  if (status === "loading" || isProjectsLoading) {
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
            <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
            <p className="text-gray-600 mt-1">
              Oversee your projects, track progress, and onboard talent.
            </p>
          </div>
          <Link
            href="/employer/projects/create"
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Total Projects
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <FolderKanban className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">In Progress</p>
                <p className="text-2xl font-bold text-green-600">{stats.inProgress}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Open</p>
                <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarClock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-gray-600" />
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
                  {(["all", "open", "in_progress", "planning", "completed"] as FilterTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                        activeTab === tab
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {tabLabels[tab]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by project name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-80 pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {projects.length === 0 ? (
              <div className="p-12 text-center">
                <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-500 mb-6">
                  Get started by creating your first project to find talented developers.
                </p>
                <Link
                  href="/employer/projects/create"
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Project</span>
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedProjects.length === projects.length &&
                          projects.length > 0
                        }
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Project Details
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Timeline
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Budget
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Applications
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.map((project) => {
                    const deadlineStatus = getDeadlineStatus(project.deadline);
                    return (
                      <tr key={project.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProjects.includes(project.id)}
                            onChange={() => handleSelectProject(project.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 ${getCategoryBg(project.category)} rounded-lg`}>
                              {getCategoryIcon(project.category)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{project.title}</p>
                              <p className="text-sm text-gray-500">
                                {project.category} &bull;{" "}
                                <span className="text-gray-400">#{project.projectKey}</span>
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(project.status as ProjectStatus)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {new Date(project.deadline).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p className={`text-xs ${deadlineStatus.color}`}>
                            {deadlineStatus.text}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            ${project.budget.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {project.projectType}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {project._count.applications}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            {project.status === "completed" ? (
                              <>
                                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                                  <Archive className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProject(project.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <Link
                                  href={`/employer/projects/${project.id}`}
                                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                  <Users className="w-4 h-4" />
                                </Link>
                                <Link
                                  href={`/employer/projects/${project.id}/edit`}
                                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => handleDeleteProject(project.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {projects.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{projects.length}</span> of{" "}
                <span className="font-medium">{stats.total}</span> projects
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
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!projectsData?.nextCursor}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
