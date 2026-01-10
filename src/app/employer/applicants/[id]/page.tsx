"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Briefcase,
  Clock,
  DollarSign,
  Award,
  MessageSquare,
  UserCheck,
  XCircle,
  Building2,
} from "lucide-react";
import { api } from "~/trpc/react";

type ApplicationStatus = "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";

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

const tierConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  bronze: { label: "Bronze", color: "text-amber-700", bgColor: "bg-amber-100" },
  silver: { label: "Silver", color: "text-gray-600", bgColor: "bg-gray-200" },
  gold: { label: "Gold", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  platinum: { label: "Platinum", color: "text-blue-700", bgColor: "bg-blue-100" },
};

export default function ApplicationDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;

  const [isPageLoading, setIsPageLoading] = useState(true);

  // Fetch application details
  const {
    data: application,
    isLoading: isAppLoading,
    refetch,
  } = api.jobs.getApplicationById.useQuery(
    { applicationId },
    { enabled: !!applicationId }
  );

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

  const handleStatusChange = (newStatus: ApplicationStatus) => {
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

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffDays < 30)
      return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return "Not specified";
    const formatNum = (n: number) => `$${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${formatNum(min)} - ${formatNum(max)}`;
    if (min) return `${formatNum(min)}+`;
    if (max) return `Up to ${formatNum(max)}`;
    return "Not specified";
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
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-gray-600";
  };

  if (status === "loading" || isPageLoading || isAppLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <div className="h-64 bg-gray-200 rounded-xl"></div>
                <div className="h-48 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-gray-200 rounded-xl"></div>
                <div className="h-32 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!application) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Application not found
            </h3>
            <p className="text-gray-600 mb-4">
              This application may have been removed or you don&apos;t have access to view it.
            </p>
            <button
              onClick={() => router.push("/employer/applicants")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Back to Applicants
            </button>
          </div>
        </div>
      </main>
    );
  }

  const talentName =
    application.talent.talentProfile?.firstName &&
    application.talent.talentProfile?.lastName
      ? `${application.talent.talentProfile.firstName} ${application.talent.talentProfile.lastName}`
      : application.talent.name ?? "Unknown Applicant";

  const initials = getInitials(
    application.talent.name,
    application.talent.talentProfile?.firstName,
    application.talent.talentProfile?.lastName
  );

  const currentStatus = application.status as ApplicationStatus;
  const tier = application.talent.talentProfile?.tier ?? "bronze";

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/employer/applicants")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applicants</span>
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="relative">
                {application.talent.image ? (
                  <img
                    src={application.talent.image}
                    alt={talentName}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-white">{initials}</span>
                  </div>
                )}
                {/* Tier Badge */}
                <div
                  className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs font-medium ${tierConfig[tier]?.bgColor ?? "bg-gray-100"} ${tierConfig[tier]?.color ?? "text-gray-600"}`}
                >
                  {tierConfig[tier]?.label ?? "Bronze"}
                </div>
              </div>

              {/* Info */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{talentName}</h1>
                <p className="text-gray-600 mb-3">
                  {application.talent.talentProfile?.title ?? "Professional"}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {application.talent.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      {application.talent.email}
                    </span>
                  )}
                  {application.talent.talentProfile?.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4" />
                      {application.talent.talentProfile.phone}
                    </span>
                  )}
                  {application.job.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {application.job.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status and Actions */}
            <div className="flex flex-col items-end gap-3">
              <span
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border ${statusConfig[currentStatus].bgColor} ${statusConfig[currentStatus].color}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${statusConfig[currentStatus].dotColor}`}
                />
                {statusConfig[currentStatus].label}
              </span>
              <p className="text-sm text-gray-500">
                Applied {formatTimeAgo(application.createdAt)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
            {currentStatus === "pending" && (
              <>
                <button
                  onClick={() => handleStatusChange("reviewed")}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Mark as Reviewed
                </button>
                <button
                  onClick={() => handleStatusChange("shortlisted")}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Move to Interview
                </button>
                <button
                  onClick={() => handleStatusChange("rejected")}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
            {currentStatus === "reviewed" && (
              <>
                <button
                  onClick={() => handleStatusChange("shortlisted")}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Move to Interview
                </button>
                <button
                  onClick={() => handleStatusChange("rejected")}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
            {currentStatus === "shortlisted" && (
              <>
                <button
                  onClick={() => handleStatusChange("hired")}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  Mark as Hired
                </button>
                <button
                  onClick={() => handleStatusChange("rejected")}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
            {currentStatus === "rejected" && (
              <button
                onClick={() => handleStatusChange("pending")}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Reconsider Application
              </button>
            )}
            {currentStatus === "hired" && (
              <button
                onClick={() => router.push("/employer/messages")}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Send Message
              </button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Applied Position Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Applied Position
              </h2>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{application.job.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {application.job.employer.employerProfile?.companyName ??
                      application.job.employer.name}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {application.job.location ?? "Remote"} ({application.job.workLocationType})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {application.job.employmentType}
                    </span>
                    <span className="flex items-center gap-1 text-green-600">
                      <DollarSign className="w-4 h-4" />
                      {formatSalary(application.job.salaryMin, application.job.salaryMax)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/employer/post-a-job/${application.job.id}`)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  View Job
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cover Letter */}
            {application.coverLetter && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {application.coverLetter}
                  </p>
                </div>
              </div>
            )}

            {/* Resume */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume / CV</h2>
              {application.resumeUrl || application.talent.talentProfile?.resumeUrl ? (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {application.talent.talentProfile?.resumeName ?? "Resume.pdf"}
                    </p>
                    <p className="text-sm text-gray-500">Uploaded with application</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={application.resumeUrl ?? application.talent.talentProfile?.resumeUrl ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
                    </a>
                    <a
                      href={application.resumeUrl ?? application.talent.talentProfile?.resumeUrl ?? "#"}
                      download
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                  No resume uploaded with this application
                </div>
              )}
            </div>

            {/* Experience & Bio */}
            {application.talent.talentProfile?.bio && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-600">{application.talent.talentProfile.bio}</p>
              </div>
            )}

            {/* Skills */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
              {application.talent.talentProfile?.skills &&
              application.talent.talentProfile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {application.talent.talentProfile.skills.map((skill) => {
                    const isMatching = application.matchingSkills.includes(skill);
                    return (
                      <span
                        key={skill}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          isMatching
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {isMatching && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                        {skill}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No skills listed</p>
              )}
            </div>

            {/* Certifications */}
            {application.talent.talentProfile?.certifications &&
              application.talent.talentProfile.certifications.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h2>
                  <div className="space-y-3">
                    {application.talent.talentProfile.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span className="text-gray-700">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Profile Match Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">AI Match Score</h3>
              </div>

              {/* Match Percentage Circle */}
              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={
                        application.matchScore >= 80
                          ? "#22c55e"
                          : application.matchScore >= 60
                          ? "#3b82f6"
                          : application.matchScore >= 40
                          ? "#f59e0b"
                          : "#9ca3af"
                      }
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(application.matchScore / 100) * 352} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold ${getMatchColor(application.matchScore)}`}>
                      {application.matchScore}%
                    </span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Match</span>
                  </div>
                </div>
              </div>

              {/* Matching Skills */}
              {application.matchingSkills.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Matching Skills ({application.matchingSkills.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {application.matchingSkills.slice(0, 6).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {application.matchingSkills.length > 6 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{application.matchingSkills.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {application.missingSkills.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-gray-900">
                      Missing Skills ({application.missingSkills.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {application.missingSkills.slice(0, 6).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {application.missingSkills.length > 6 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{application.missingSkills.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Applicant Stats Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Applicant Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed Projects</span>
                  <span className="font-medium text-gray-900">
                    {application.talent.talentProfile?.completedProjects ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-medium text-gray-900">
                    {application.talent.talentProfile?.successRate
                      ? `${application.talent.talentProfile.successRate.toFixed(0)}%`
                      : "N/A"}
                  </span>
                </div>
                {application.talent.talentProfile?.hourlyRate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Hourly Rate</span>
                    <span className="font-medium text-gray-900">
                      ${application.talent.talentProfile.hourlyRate}/hr
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="font-medium text-gray-900">
                    {new Date(application.talent.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Portfolio Links */}
            {(application.talent.talentProfile?.portfolioUrl ??
              application.talent.talentProfile?.portfolio) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
                <div className="space-y-3">
                  {application.talent.talentProfile?.portfolioUrl && (
                    <a
                      href={application.talent.talentProfile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-blue-600 hover:text-blue-700"
                    >
                      <Globe className="w-5 h-5" />
                      <span className="text-sm">Portfolio Website</span>
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </a>
                  )}
                  {application.talent.talentProfile?.portfolio && (
                    <a
                      href={application.talent.talentProfile.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-blue-600 hover:text-blue-700"
                    >
                      <Building2 className="w-5 h-5" />
                      <span className="text-sm">Additional Portfolio</span>
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push("/employer/messages")}
                  className="w-full py-2.5 bg-white text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-50 transition border border-blue-200 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </button>
                <button
                  onClick={() => router.push(`/employer/post-a-job/${application.job.id}`)}
                  className="w-full py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition border border-gray-200 flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  View Job Posting
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
