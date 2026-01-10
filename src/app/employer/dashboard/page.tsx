"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Briefcase,
  Users,
  Star,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Code,
  Wrench,
  BarChart3,
  MessageSquare,
  FileText,
  CheckCircle,
  GraduationCap,
} from "lucide-react";

interface JobPosting {
  id: string;
  title: string;
  type: string;
  location: string;
  status: "active" | "draft" | "closed";
  applicants: number;
  newApplicants: number;
  icon: React.ReactNode;
}

interface Interview {
  id: string;
  time: string;
  date: string;
  candidateName: string;
  role: string;
  type: "upcoming" | "review";
}

interface TalentMatch {
  id: string;
  name: string;
  role: string;
  matchScore: number;
  skills: string[];
  avatar?: string;
}

interface Activity {
  id: string;
  type: "message" | "resume" | "shortlist";
  description: string;
  time: string;
  link?: string;
  linkText?: string;
}

export default function EmployerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate] = useState(new Date());

  // Mock data - in real app, fetch from API
  const [stats] = useState({
    activeJobs: 4,
    newApplications: 128,
    shortlisted: 15,
    pendingInterviews: 2,
    activeJobsChange: "+1 new",
    newApplicationsChange: "+12 today",
    shortlistedChange: "0 change",
    pendingInterviewsChange: "+2 today",
  });

  const [jobPostings] = useState<JobPosting[]>([
    {
      id: "1",
      title: "Senior Frontend Developer",
      type: "Full-time",
      location: "Remote",
      status: "active",
      applicants: 42,
      newApplicants: 5,
      icon: <Code className="w-5 h-5 text-blue-600" />,
    },
    {
      id: "2",
      title: "Product Designer",
      type: "Contract",
      location: "Hybrid",
      status: "active",
      applicants: 18,
      newApplicants: 0,
      icon: <Wrench className="w-5 h-5 text-purple-600" />,
    },
    {
      id: "3",
      title: "Data Analyst",
      type: "Full-time",
      location: "On-site",
      status: "draft",
      applicants: 0,
      newApplicants: 0,
      icon: <BarChart3 className="w-5 h-5 text-green-600" />,
    },
  ]);

  const [interviews] = useState<Interview[]>([
    {
      id: "1",
      time: "10:30 AM",
      date: "Today",
      candidateName: "Mark T.",
      role: "Frontend Developer Role",
      type: "upcoming",
    },
    {
      id: "2",
      time: "02:00 PM",
      date: "Today",
      candidateName: "Design Candidates",
      role: "Team Sync",
      type: "review",
    },
    {
      id: "3",
      time: "09:00 AM",
      date: "Tomorrow",
      candidateName: "Lisa K.",
      role: "Product Designer Role",
      type: "upcoming",
    },
  ]);

  const [talentMatches] = useState<TalentMatch[]>([
    {
      id: "1",
      name: "Sarah Jenkins",
      role: "React Specialist",
      matchScore: 98,
      skills: ["React", "TypeScript", "Node.js"],
    },
    {
      id: "2",
      name: "David Chen",
      role: "Full Stack Dev",
      matchScore: 92,
      skills: ["Vue.js", "Python", "AWS"],
    },
    {
      id: "3",
      name: "Elena Rodriguez",
      role: "Frontend Arch.",
      matchScore: 88,
      skills: ["Angular", "RxJS", "Figma"],
    },
  ]);

  const [recentActivity] = useState<Activity[]>([
    {
      id: "1",
      type: "message",
      description: "John Doe sent a message about the",
      time: "2 min ago",
      link: "/employer/jobs/3",
      linkText: "Data Analyst",
    },
    {
      id: "2",
      type: "resume",
      description: "New resume uploaded by Alice Smith.",
      time: "1 hour ago",
    },
    {
      id: "3",
      type: "shortlist",
      description: "You shortlisted Michael B. for Senior Frontend Developer",
      time: "3 hours ago",
    },
  ]);

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

    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [session, status, router]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            Active
          </span>
        );
      case "draft":
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
            Draft
          </span>
        );
      case "closed":
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "message":
        return (
          <div className="p-2 bg-purple-100 rounded-lg">
            <MessageSquare className="w-4 h-4 text-purple-600" />
          </div>
        );
      case "resume":
        return (
          <div className="p-2 bg-gray-100 rounded-lg">
            <FileText className="w-4 h-4 text-gray-600" />
          </div>
        );
      case "shortlist":
        return (
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
        );
      default:
        return null;
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section Skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <div className="h-9 bg-gray-200 rounded-lg w-64 mb-3 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
              </div>
              <div className="hidden md:block">
                <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Stats Overview Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded-lg w-16 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm h-80 animate-pulse"></div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm h-48 animate-pulse"></div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm h-64 animate-pulse"></div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm h-48 animate-pulse"></div>
            </div>
          </div>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {session.user.name?.split(" ")[0] ?? "TechCorp"}
              </h1>
              <p className="text-gray-600">
                Here is what is happening with your recruitment pipeline today.
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{formatDate(currentDate)}</span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Jobs */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {stats.activeJobsChange}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Active Jobs</p>
            <h3 className="text-3xl font-bold text-gray-900">{stats.activeJobs}</h3>
          </div>

          {/* New Applications */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {stats.newApplicationsChange}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">New Applications</p>
            <h3 className="text-3xl font-bold text-gray-900">{stats.newApplications}</h3>
          </div>

          {/* Shortlisted */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <Star className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {stats.shortlistedChange}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Shortlisted</p>
            <h3 className="text-3xl font-bold text-gray-900">{stats.shortlisted}</h3>
          </div>

          {/* Pending Interviews */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {stats.pendingInterviewsChange}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Pending Interviews</p>
            <h3 className="text-3xl font-bold text-gray-900">{stats.pendingInterviews}</h3>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Job Postings & Talent Matches */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Job Postings */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Active Job Postings</h2>
                <Link
                  href="/employer/jobs"
                  className="text-sm text-blue-600 hover:text-blue-700 transition"
                >
                  View All
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                        Role
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                        Applicants
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {jobPostings.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 rounded-lg">{job.icon}</div>
                            <div>
                              <p className="font-medium text-gray-900">{job.title}</p>
                              <p className="text-sm text-gray-500">
                                {job.location} &bull; {job.type}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(job.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {job.applicants > 0 ? job.applicants : "-"}
                            </span>
                            {job.newApplicants > 0 && (
                              <span className="text-xs text-green-600">
                                +{job.newApplicants} new
                              </span>
                            )}
                            {job.applicants > 0 && job.newApplicants === 0 && (
                              <span className="text-xs text-gray-500">No new</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {job.status === "draft" ? (
                            <Link
                              href={`/employer/jobs/${job.id}/edit`}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Publish
                            </Link>
                          ) : (
                            <Link
                              href={`/employer/jobs/${job.id}`}
                              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                            >
                              Manage
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-100">
                <Link
                  href="/employer/jobs"
                  className="flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <span>View all {stats.activeJobs} jobs</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Top Talent Matches */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Top Talent Matches</h2>
                  <p className="text-sm text-gray-500">
                    Candidates matching your &quot;Senior Frontend Developer&quot; role
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {talentMatches.map((talent) => (
                  <div
                    key={talent.id}
                    className="p-4 border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {talent.avatar ? (
                          <Image
                            src={talent.avatar}
                            alt={talent.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {getInitials(talent.name)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{talent.name}</p>
                          <p className="text-sm text-gray-500">{talent.role}</p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          talent.matchScore >= 95
                            ? "bg-green-100 text-green-700"
                            : talent.matchScore >= 90
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {talent.matchScore}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {talent.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upskill Promotion */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-100 mb-1">UPSKILL</p>
                  <p className="text-white mb-4">
                    Sponsor courses for your talent pipeline to close skill gaps.
                  </p>
                  <Link
                    href="/employer/upskill"
                    className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
                  >
                    Explore Courses
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Interviews & Activity */}
          <div className="space-y-6">
            {/* Upcoming Interviews */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h2>
              </div>
              <div className="space-y-4">
                {interviews.map((interview, index) => (
                  <div key={interview.id} className="flex items-start space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        index === 0 ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {interview.time} &bull; {interview.date}
                      </p>
                      <p className="text-sm text-gray-700">
                        {interview.type === "review"
                          ? `Review: ${interview.candidateName}`
                          : `Interview with ${interview.candidateName}`}
                      </p>
                      <p className="text-xs text-gray-500">{interview.role}</p>
                      {index === 0 && (
                        <div className="flex items-center space-x-2 mt-2">
                          <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                            Join
                          </button>
                          <button className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition">
                            Reschedule
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600">
                        {activity.description}
                        {activity.link && (
                          <Link
                            href={activity.link}
                            className="text-blue-600 hover:text-blue-700 ml-1"
                          >
                            {activity.linkText}
                          </Link>
                        )}
                        {activity.link && " role."}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
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
