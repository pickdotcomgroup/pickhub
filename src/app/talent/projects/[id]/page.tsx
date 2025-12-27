"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";

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

interface AgencyProfile {
  id: string;
  agencyName: string;
  description: string;
  teamSize: string | null;
  skills: string[];
  website: string | null;
  location: string | null;
  foundedYear: string | null;
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
    agencyProfile: AgencyProfile | null;
  };
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignedTo: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
  projectId: string;
  createdBy: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
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

export default function ManageProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "developers" | "milestones" | "kanban" | "settings">("overview");

  // Task management state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // Milestone management state
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isMilestonesLoading, setIsMilestonesLoading] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [milestoneFormData, setMilestoneFormData] = useState({
    title: "",
    description: "",
    amount: "",
    startDate: "",
    endDate: "",
  });

  // Fetch tasks when Kanban tab is active
  useEffect(() => {
    if (activeTab === "kanban" && project && !isTasksLoading && tasks.length === 0) {
      void fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, project]);

  // Fetch milestones when Milestones tab is active
  useEffect(() => {
    if (activeTab === "milestones" && project && !isMilestonesLoading && milestones.length === 0) {
      void fetchMilestones();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, project]);

  const fetchTasks = async () => {
    try {
      setIsTasksLoading(true);
      const response = await fetch(`/api/tasks?projectId=${projectId}`);
      const data = await response.json() as { tasks: Task[] };
      setTasks(data.tasks ?? []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsTasksLoading(false);
    }
  };

  const fetchMilestones = async () => {
    try {
      setIsMilestonesLoading(true);
      const response = await fetch(`/api/milestones?projectId=${projectId}`);
      const data = await response.json() as { milestones: Milestone[] };
      setMilestones(data.milestones ?? []);
    } catch (error) {
      console.error("Error fetching milestones:", error);
    } finally {
      setIsMilestonesLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskFormData.title.trim()) return;

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: taskFormData.title,
          description: taskFormData.description || null,
          priority: taskFormData.priority,
          dueDate: taskFormData.dueDate || null,
          status: "todo",
        }),
      });

      const data = await response.json() as { task: Task; error?: string };

      if (response.ok) {
        setTasks([...tasks, data.task]);
        setShowTaskModal(false);
        setTaskFormData({ title: "", description: "", priority: "medium", dueDate: "" });
        toast.success("Task created successfully!");
      } else {
        toast.error(`Failed to create task: ${data.error ?? "Unknown error"}`);
      }
    } catch {
      toast.error("Error creating task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      });

      if (response.ok) {
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        ));
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (newStatus: string) => {
    if (!draggedTask) return;

    await handleUpdateTaskStatus(draggedTask, newStatus);
    setDraggedTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      dueDate: task.dueDate ? (new Date(task.dueDate).toISOString().split('T')[0] ?? "") : "",
    });
    setShowTaskModal(true);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !taskFormData.title.trim()) return;

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: editingTask.id,
          title: taskFormData.title,
          description: taskFormData.description || null,
          priority: taskFormData.priority,
          dueDate: taskFormData.dueDate || null,
        }),
      });

      const data = await response.json() as { task: Task; error?: string };

      if (response.ok) {
        setTasks(tasks.map(task =>
          task.id === editingTask.id ? data.task : task
        ));
        setShowTaskModal(false);
        setEditingTask(null);
        setTaskFormData({ title: "", description: "", priority: "medium", dueDate: "" });
        toast.success("Task updated successfully!");
      } else {
        toast.error(`Failed to update task: ${data.error ?? "Unknown error"}`);
      }
    } catch {
      toast.error("Error updating task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks?taskId=${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskId));
        toast.success("Task deleted successfully!");
      } else {
        toast.error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Error deleting task. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
    setTaskFormData({ title: "", description: "", priority: "medium", dueDate: "" });
  };

  // Milestone handlers
  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneFormData.title.trim() || !milestoneFormData.amount || !milestoneFormData.startDate || !milestoneFormData.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: milestoneFormData.title,
          description: milestoneFormData.description || null,
          amount: parseFloat(milestoneFormData.amount),
          startDate: milestoneFormData.startDate,
          endDate: milestoneFormData.endDate,
        }),
      });

      const data = await response.json() as { milestone: Milestone; error?: string };

      if (response.ok) {
        setMilestones([...milestones, data.milestone]);
        setShowMilestoneModal(false);
        setMilestoneFormData({ title: "", description: "", amount: "", startDate: "", endDate: "" });
        toast.success("Milestone created successfully!");
      } else {
        toast.error(`Failed to create milestone: ${data.error ?? "Unknown error"}`);
      }
    } catch {
      toast.error("Error creating milestone. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setMilestoneFormData({
      title: milestone.title,
      description: milestone.description ?? "",
      amount: milestone.amount.toString(),
      startDate: new Date(milestone.startDate).toISOString().split('T')[0] ?? "",
      endDate: new Date(milestone.endDate).toISOString().split('T')[0] ?? "",
    });
    setShowMilestoneModal(true);
  };

  const handleUpdateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone || !milestoneFormData.title.trim()) return;

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/milestones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId: editingMilestone.id,
          title: milestoneFormData.title,
          description: milestoneFormData.description || null,
          amount: parseFloat(milestoneFormData.amount),
          startDate: milestoneFormData.startDate,
          endDate: milestoneFormData.endDate,
        }),
      });

      const data = await response.json() as { milestone: Milestone; error?: string };

      if (response.ok) {
        setMilestones(milestones.map(m =>
          m.id === editingMilestone.id ? data.milestone : m
        ));
        setShowMilestoneModal(false);
        setEditingMilestone(null);
        setMilestoneFormData({ title: "", description: "", amount: "", startDate: "", endDate: "" });
        toast.success("Milestone updated successfully!");
      } else {
        toast.error(`Failed to update milestone: ${data.error ?? "Unknown error"}`);
      }
    } catch {
      toast.error("Error updating milestone. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm("Are you sure you want to delete this milestone?")) return;

    try {
      const response = await fetch(`/api/milestones?milestoneId=${milestoneId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMilestones(milestones.filter(m => m.id !== milestoneId));
        toast.success("Milestone deleted successfully!");
      } else {
        toast.error("Failed to delete milestone");
      }
    } catch (error) {
      console.error("Error deleting milestone:", error);
      toast.error("Error deleting milestone. Please try again.");
    }
  };

  const handleCloseMilestoneModal = () => {
    setShowMilestoneModal(false);
    setEditingMilestone(null);
    setMilestoneFormData({ title: "", description: "", amount: "", startDate: "", endDate: "" });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-300";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "low": return "bg-green-100 text-green-700 border-green-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const todoTasks = tasks.filter(t => t.status === "todo");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");
  const doneTasks = tasks.filter(t => t.status === "done");

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth");
      return;
    }

    if (session.user.role !== "employer" && session.user.role !== "talent") {
      // Redirect based on role
      if (session.user.role === "trainer") {
        router.push("/trainer/dashboard");
      } else {
        router.push("/talent/dashboard");
      }
      return;
    }

    const fetchProject = async () => {
      try {
        setIsLoading(true);

        // For talents, fetch their applications to find the project
        // For clients, fetch their projects directly
        let foundProject: Project | undefined;

        if (session.user.role === "talent") {
          // Fetch talent's applications
          const appResponse = await fetch(`/api/applications?talentId=${session.user.id}`);
          const appData = await appResponse.json() as { applications: Array<{ project: Project }> };

          // Find the project from applications
          const application = appData.applications?.find(app => app.project.id === projectId);
          foundProject = application?.project;
        } else {
          // Fetch client's projects
          const response = await fetch(`/api/projects?clientId=${session.user.id}`);
          const data = await response.json() as { error?: string; projects: Project[] };

          if (!response.ok) {
            setError(data.error ?? "Failed to fetch project");
            return;
          }

          foundProject = data.projects.find(p => p.id === projectId);
        }

        if (!foundProject) {
          setError("Project not found or you don't have access to this project");
          return;
        }

        // Fetch applications for this project
        const appResponse = await fetch(`/api/applications?projectId=${projectId}`);
        const appData = await appResponse.json() as { applications: Application[] };

        setProject({ ...foundProject, applications: appData.applications ?? [] });
      } catch {
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProject();
  }, [session, status, router, projectId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-100 text-green-700 border-green-300";
      case "in_progress": return "bg-blue-100 text-blue-700 border-blue-300";
      case "completed": return "bg-gray-100 text-gray-700 border-gray-300";
      case "cancelled": return "bg-red-100 text-red-700 border-red-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-6">
            {/* Sidebar Skeleton */}
            <aside className="w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-8 animate-pulse">
                {/* Project Header Skeleton */}
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>

                {/* Navigation Skeleton */}
                <div className="h-3 bg-gray-200 rounded w-20 mb-3 mx-3"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content Skeleton */}
            <div className="flex-1 min-w-0">
              <div className="space-y-6 animate-pulse">
                {/* Project Details Card Skeleton */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
                  <div className="space-y-4">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                      <div className="h-4 bg-gray-100 rounded w-3/4 mt-2"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i}>
                          <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                          <div className="h-5 bg-gray-100 rounded w-32"></div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-7 bg-gray-100 rounded-full w-20"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                          <div className="h-8 bg-gray-100 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!session || (session.user.role !== "employer" && session.user.role !== "talent")) {
    return null;
  }

  if (error || !project) {
    const backLink = session.user.role === "talent" ? "/talent/projects" : "/employer/projects";

    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Project</h3>
            <p className="text-red-600 mb-6">{error !== "" ? error : "Project not found"}</p>
            <Link
              href={backLink}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Projects</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content with Sidebar */}
        <div className="flex gap-6">
          {/* Left Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-8">
              {/* Project Header */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h1 className="text-lg font-bold text-gray-900 mb-2 break-words">{project.title}</h1>
                </div>
                <div>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                    {project.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                {/* to slice and id .slice(0, 8)}... ID: cmicn5mu...*/}
                <p className="text-xs text-gray-500 mt-2">ID: {project.id}</p>
              </div>

              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                Navigation
              </h2>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === "overview"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 border border-transparent"
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Overview</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("developers")}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === "developers"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 border border-transparent"
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Developer</span>
                    {project.applications && project.applications.length > 0 && (
                      <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {project.applications.length}
                      </span>
                    )}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("milestones")}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === "milestones"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 border border-transparent"
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span>Milestones</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("kanban")}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === "kanban"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 border border-transparent"
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    <span>Kanban Board</span>
                  </button>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Project Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Project Details</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Description</label>
                      <p className="text-gray-900 mt-1">{project.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Budget</label>
                        <p className="text-gray-900 mt-1 text-lg font-semibold">${project.budget.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Deadline</label>
                        <p className="text-gray-900 mt-1">{formatDate(project.deadline)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Category</label>
                        <p className="text-gray-900 mt-1">{project.category}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Project Type</label>
                        <p className="text-gray-900 mt-1 capitalize">{project.projectType.replace("_", " ")}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Posted On</label>
                        <p className="text-gray-900 mt-1">{formatDate(project.createdAt)}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Required Skills</label>
                      <div className="flex flex-wrap gap-2">
                        {project.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full border border-blue-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Applications</p>
                        <p className="text-2xl font-bold text-gray-900">{project.applications?.length ?? 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Accepted</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {project.applications?.filter(app => app.status === "accepted").length ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pending Review</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {project.applications?.filter(app => app.status === "pending").length ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "developers" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Developers</h2>
                  <div className="text-sm text-gray-600">
                    Manage your project team and onboard developers
                  </div>
                </div>

                {!project.applications || project.applications.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-600">No applications yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {project.applications.map((application) => (
                      <div
                        key={application.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {application.talent.image ? (
                              <Image
                                src={application.talent.image}
                                alt={application.talent.name ?? 'Applicant'}
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <span>
                                {application.talent.talentProfile
                                  ? `${application.talent.talentProfile.firstName[0]}${application.talent.talentProfile.lastName[0]}`
                                  : application.talent.name?.[0] ?? 'A'}
                              </span>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-gray-900">
                                {application.talent.talentProfile
                                  ? `${application.talent.talentProfile.firstName} ${application.talent.talentProfile.lastName}`
                                  : application.talent.name ?? 'Applicant'}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${application.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : application.status === 'accepted'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                                }`}>
                                {application.status.toUpperCase()}
                              </span>
                            </div>

                            {application.talent.talentProfile && (
                              <p className="text-sm text-gray-600 mb-2">{application.talent.talentProfile.title}</p>
                            )}

                            {application.proposedRate && (
                              <p className="text-sm text-blue-600 font-medium mb-2">
                                Proposed Rate: ${application.proposedRate.toLocaleString()}
                              </p>
                            )}

                            <p className="text-xs text-gray-500">Applied {formatDate(application.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "milestones" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Project Milestones Timeline</h2>
                  {session.user.role === "employer" && (
                    <button
                      onClick={() => setShowMilestoneModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Create Milestone</span>
                    </button>
                  )}
                </div>

                {isMilestonesLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : milestones.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <p className="text-gray-600 mb-2">No milestones created yet</p>
                    <p className="text-sm text-gray-500">Create your first milestone to track project progress</p>
                  </div>
                ) : (
                  <div>
                    <div className="overflow-x-auto">
                      {/* Timeline Table */}
                      <div className="min-w-full">
                        {(() => {
                          // Calculate the date range based on all milestones
                          let earliestDate = new Date();
                          let latestDate = new Date();

                          if (milestones.length > 0) {
                            const allDates = milestones.flatMap(m => [
                              new Date(m.startDate),
                              new Date(m.endDate)
                            ]);
                            earliestDate = new Date(Math.min(...allDates.map(d => d.getTime())));
                            latestDate = new Date(Math.max(...allDates.map(d => d.getTime())));
                          }

                          // Add 1 month buffer on each side
                          const startMonth = new Date(earliestDate.getFullYear(), earliestDate.getMonth() - 1, 1);
                          const endMonth = new Date(latestDate.getFullYear(), latestDate.getMonth() + 1, 1);

                          // Calculate total months to display
                          const totalMonths = (endMonth.getFullYear() - startMonth.getFullYear()) * 12 +
                            (endMonth.getMonth() - startMonth.getMonth()) + 1;

                          // Generate month headers
                          const months: Date[] = [];
                          for (let i = 0; i < totalMonths; i++) {
                            const date = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
                            months.push(date);
                          }

                          // Each month column should be at least 80px wide
                          const monthWidth = 80;

                          return (
                            <>
                              {/* Header with columns */}
                              <div className="flex border-b-2 border-gray-300">
                                <div className="w-64 flex-shrink-0 p-3 font-semibold text-gray-700 bg-gray-50 border-r border-gray-200 sticky left-0 z-10">
                                  Milestone Name
                                </div>
                                <div className="w-28 flex-shrink-0 p-3 font-semibold text-gray-700 bg-gray-50 border-r border-gray-200 sticky left-64 z-10">
                                  Amount
                                </div>
                                <div className="flex" style={{ minWidth: `${totalMonths * monthWidth}px` }}>
                                  {months.map((month, idx) => (
                                    <div
                                      key={idx}
                                      className="p-2 text-center text-xs font-semibold text-gray-600 bg-gray-50 border-l border-gray-200"
                                      style={{ width: `${monthWidth}px` }}
                                    >
                                      <div>{month.toLocaleDateString('en-US', { month: 'short' })}</div>
                                      <div className="text-gray-400">{month.getFullYear()}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Milestone rows */}
                              {milestones.map((milestone) => {
                                const milestoneStartDate = new Date(milestone.startDate);
                                const milestoneEndDate = new Date(milestone.endDate);

                                // Calculate positions for start and end dates
                                const startMonthsDiff = (milestoneStartDate.getFullYear() - startMonth.getFullYear()) * 12 +
                                  (milestoneStartDate.getMonth() - startMonth.getMonth());
                                const endMonthsDiff = (milestoneEndDate.getFullYear() - startMonth.getFullYear()) * 12 +
                                  (milestoneEndDate.getMonth() - startMonth.getMonth());
                                const startPosition = Math.max(0, Math.min(totalMonths - 1, startMonthsDiff));
                                const endPosition = Math.max(0, Math.min(totalMonths - 1, endMonthsDiff));

                                return (
                                  <div key={milestone.id} className="flex border-b border-gray-200 hover:bg-gray-50 transition">
                                    {/* Milestone Name Column */}
                                    <div className="w-64 flex-shrink-0 p-3 border-r border-gray-200 sticky left-0 bg-white z-10">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0 pr-2">
                                          <h3 className="font-semibold text-gray-900 text-sm truncate">{milestone.title}</h3>
                                          {milestone.description && (
                                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">{milestone.description}</p>
                                          )}
                                        </div>
                                        {session.user.role === "employer" && (
                                          <div className="flex items-center space-x-1">
                                            <button
                                              onClick={() => handleEditMilestone(milestone)}
                                              className="p-1 text-gray-400 hover:text-blue-600 transition"
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                              </svg>
                                            </button>
                                            <button
                                              onClick={() => handleDeleteMilestone(milestone.id)}
                                              className="p-1 text-gray-400 hover:text-red-600 transition"
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                              </svg>
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Amount Column */}
                                    <div className="w-28 flex-shrink-0 p-3 border-r border-gray-200 flex items-center justify-center sticky left-64 bg-white z-10">
                                      <span className="text-sm text-blue-600 font-semibold">${milestone.amount.toLocaleString()}</span>
                                    </div>

                                    {/* Timeline Columns */}
                                    <div className="flex relative" style={{ minWidth: `${totalMonths * monthWidth}px` }}>
                                      {months.map((_, idx) => {
                                        const isInRange = idx >= startPosition && idx <= endPosition;
                                        const isStart = idx === startPosition;
                                        const isEnd = idx === endPosition;

                                        return (
                                          <div
                                            key={idx}
                                            className="border-l border-gray-200 relative"
                                            style={{ width: `${monthWidth}px` }}
                                          >
                                            {/* Horizontal line spanning from start to end */}
                                            {isInRange && (
                                              <div className="absolute inset-0 flex items-center">
                                                <div className={`h-1 w-full ${milestone.status === 'completed'
                                                    ? 'bg-green-500'
                                                    : milestone.status === 'in_progress'
                                                      ? 'bg-blue-500'
                                                      : 'bg-gray-400'
                                                  }`}></div>
                                              </div>
                                            )}

                                            {/* Start date marker with tooltip */}
                                            {isStart && (
                                              <div className="absolute inset-0 flex items-center justify-start">
                                                <div className="relative group">
                                                  <div className={`w-3 h-3 rounded-full ${milestone.status === 'completed'
                                                      ? 'bg-green-500'
                                                      : milestone.status === 'in_progress'
                                                        ? 'bg-blue-500'
                                                        : 'bg-gray-400'
                                                    } z-10`}></div>
                                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                                                    <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                                      Start: {formatDate(milestone.startDate)}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            {/* End date marker with tooltip */}
                                            {isEnd && (
                                              <div className="absolute inset-0 flex items-center justify-end">
                                                <div className="relative group">
                                                  <div className={`w-3 h-3 rounded-full ${milestone.status === 'completed'
                                                      ? 'bg-green-500'
                                                      : milestone.status === 'in_progress'
                                                        ? 'bg-blue-500'
                                                        : 'bg-gray-400'
                                                    } z-10`}></div>
                                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                                                    <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                                      End: {formatDate(milestone.endDate)}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="h-1 w-8 bg-gray-400"></div>
                        <span className="text-gray-600">Pending</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-1 w-8 bg-blue-500"></div>
                        <span className="text-gray-600">In Progress</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-1 w-8 bg-green-500"></div>
                        <span className="text-gray-600">Completed</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "kanban" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Kanban Board</h2>
                  {session.user.role === "employer" && (
                    <button
                      onClick={() => setShowTaskModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Task</span>
                    </button>
                  )}
                </div>

                {isTasksLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* To Do Column */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                          <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                          <span>To Do</span>
                        </h3>
                        <span className="text-sm text-gray-500">{todoTasks.length}</span>
                      </div>

                      <div
                        className="space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto pr-2"
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop("todo")}
                      >
                        {todoTasks.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 text-sm">No tasks yet</div>
                        ) : (
                          todoTasks.map(task => (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={() => handleDragStart(task.id)}
                              className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-move hover:shadow-md transition"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-gray-500 mb-1">Task Name:</p>
                                  <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                                </div>
                                {session.user.role === "employer" && (
                                  <div className="flex items-center space-x-1">
                                    <button onClick={() => handleEditTask(task)} className="text-gray-400 hover:text-blue-600">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button onClick={() => handleDeleteTask(task.id)} className="text-gray-400 hover:text-red-600">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                              {task.description && (
                                <div className="mb-2">
                                  <p className="text-xs font-semibold text-gray-500 mb-1">Description:</p>
                                  <p className="text-xs text-gray-600">{task.description}</p>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                                <select
                                  value={task.status}
                                  onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                                  className="text-xs border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="todo">To Do</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="done">Done</option>
                                </select>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* In Progress Column */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                          <span>In Progress</span>
                        </h3>
                        <span className="text-sm text-gray-500">{inProgressTasks.length}</span>
                      </div>

                      <div
                        className="space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto pr-2"
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop("in_progress")}
                      >
                        {inProgressTasks.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 text-sm">No tasks yet</div>
                        ) : (
                          inProgressTasks.map(task => (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={() => handleDragStart(task.id)}
                              className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm cursor-move hover:shadow-md transition"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-gray-500 mb-1">Task Name:</p>
                                  <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                                </div>
                                {session.user.role === "employer" && (
                                  <div className="flex items-center space-x-1">
                                    <button onClick={() => handleEditTask(task)} className="text-gray-400 hover:text-blue-600">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button onClick={() => handleDeleteTask(task.id)} className="text-gray-400 hover:text-red-600">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                              {task.description && (
                                <div className="mb-2">
                                  <p className="text-xs font-semibold text-gray-500 mb-1">Description:</p>
                                  <p className="text-xs text-gray-600">{task.description}</p>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                                <select
                                  value={task.status}
                                  onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                                  className="text-xs border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="todo">To Do</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="done">Done</option>
                                </select>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Done Column */}
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                          <span>Done</span>
                        </h3>
                        <span className="text-sm text-gray-500">{doneTasks.length}</span>
                      </div>

                      <div
                        className="space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto pr-2"
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop("done")}
                      >
                        {doneTasks.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 text-sm">No tasks yet</div>
                        ) : (
                          doneTasks.map(task => (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={() => handleDragStart(task.id)}
                              className="bg-white p-3 rounded-lg border border-green-200 shadow-sm cursor-move hover:shadow-md transition"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-gray-500 mb-1">Task Name:</p>
                                  <h4 className="font-medium text-gray-900 text-sm line-through">{task.title}</h4>
                                </div>
                                {session.user.role === "employer" && (
                                  <div className="flex items-center space-x-1">
                                    <button onClick={() => handleEditTask(task)} className="text-gray-400 hover:text-blue-600">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button onClick={() => handleDeleteTask(task.id)} className="text-gray-400 hover:text-red-600">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                              {task.description && (
                                <div className="mb-2">
                                  <p className="text-xs font-semibold text-gray-500 mb-1">Description:</p>
                                  <p className="text-xs text-gray-600">{task.description}</p>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                                <select
                                  value={task.status}
                                  onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                                  className="text-xs border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="todo">To Do</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="done">Done</option>
                                </select>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Milestone Creation/Edit Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black/15 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingMilestone ? "Edit Milestone" : "Create New Milestone"}
              </h3>
              <button
                onClick={handleCloseMilestoneModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={editingMilestone ? handleUpdateMilestone : handleCreateMilestone} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  value={milestoneFormData.title}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, title: e.target.value })}
                  placeholder="e.g., Design Phase Complete"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={milestoneFormData.description}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, description: e.target.value })}
                  placeholder="Describe what needs to be accomplished (optional)"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={milestoneFormData.amount}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={milestoneFormData.startDate}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={milestoneFormData.endDate}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseMilestoneModal}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? (editingMilestone ? "Updating..." : "Creating...")
                    : (editingMilestone ? "Update Milestone" : "Create Milestone")
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Creation/Edit Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/15 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingTask ? "Edit Task" : "Create New Task"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  placeholder="Enter task title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  placeholder="Enter task description (optional)"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={taskFormData.priority}
                  onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskFormData.dueDate}
                  onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? (editingTask ? "Updating..." : "Creating...")
                    : (editingTask ? "Update Task" : "Create Task")
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
