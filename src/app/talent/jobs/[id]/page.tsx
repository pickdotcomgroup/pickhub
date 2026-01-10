"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  Globe,
  Users,
  Calendar,
  Bookmark,
  Share2,
  Home,
} from "lucide-react";
import { api } from "~/trpc/react";

export default function JobDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fetch job details
  const { data: job, isLoading: isJobLoading } = api.jobs.getById.useQuery(
    { id: jobId },
    { enabled: !!jobId }
  );

  // Check if already applied
  const { data: applicationStatus } = api.jobs.hasApplied.useQuery(
    { jobId },
    { enabled: !!jobId && !!session }
  );

  // Auth and verification check
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

  const getWorkTypeIcon = (workType: string) => {
    switch (workType) {
      case "Hybrid":
        return <Home className="w-4 h-4" />;
      case "Remote":
        return <Globe className="w-4 h-4" />;
      case "On-site":
        return <Building2 className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const formatSalary = (min?: number | null, max?: number | null, period?: string | null) => {
    if (!min && !max) return "Salary not specified";
    const formatNum = (n: number) => `$${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${formatNum(min)} - ${formatNum(max)}${period ? ` ${period}` : ""}`;
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

  if (status === "loading" || isPageLoading || isJobLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-48 bg-gray-200 rounded-xl"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Job not found
            </h3>
            <p className="text-gray-600 mb-4">
              This job posting may have been removed or is no longer available.
            </p>
            <button
              onClick={() => router.push("/talent/jobs")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/talent/jobs")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job Listings</span>
        </button>

        {/* Job Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                {job.employer.image ? (
                  <img
                    src={job.employer.image}
                    alt={job.employer.employerProfile?.companyName ?? "Company"}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <Briefcase className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h1>
                <p className="text-lg text-gray-600 mb-3">
                  {job.employer.employerProfile?.companyName ?? job.employer.name}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {job.location && (
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {getWorkTypeIcon(job.workLocationType)}
                    {job.workLocationType}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    <Clock className="w-4 h-4" />
                    {job.employmentType}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-lg border transition ${
                  isBookmarked
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : "border-gray-200 text-gray-400 hover:text-gray-600"
                }`}
              >
                <Bookmark
                  className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`}
                />
              </button>
              <button className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 transition">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Salary and Info Row */}
          <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
              <DollarSign className="w-5 h-5" />
              <span className="font-semibold">
                {formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <GraduationCap className="w-5 h-5" />
              <span>{job.experienceLevel}</span>
            </div>
            {job.education && job.education !== "No Requirement" && (
              <div className="flex items-center gap-2 text-gray-600">
                <GraduationCap className="w-5 h-5" />
                <span>{job.education}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Posted {formatPostedAt(job.createdAt)}</span>
            </div>
          </div>

          {/* Apply Button */}
          <div className="pt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {job._count.applications} application{job._count.applications !== 1 ? "s" : ""} received
            </p>
            {applicationStatus?.applied ? (
              <div className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 font-medium rounded-lg border border-green-200">
                <CheckCircle2 className="w-5 h-5" />
                Applied
              </div>
            ) : (
              <button
                onClick={() => router.push(`/talent/jobs/${jobId}/apply`)}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About the Role */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                About the Role
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Responsibilities
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {job.responsibilities}
                  </p>
                </div>
              </div>
            )}

            {/* Qualifications */}
            {job.qualifications && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Qualifications
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {job.qualifications}
                  </p>
                </div>
              </div>
            )}

            {/* Skills */}
            {job.skills.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Benefits & Perks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {job.benefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                  {job.equity && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>Equity: {job.equity}</span>
                    </div>
                  )}
                  {job.signingBonus && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>Signing Bonus: ${job.signingBonus.toLocaleString()}</span>
                    </div>
                  )}
                  {job.relocationAssistance && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>Relocation Assistance</span>
                    </div>
                  )}
                  {job.visaSponsorship && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>Visa Sponsorship</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Company Info */}
          <div className="space-y-6">
            {/* Company Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                About the Company
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                  {job.employer.image ? (
                    <img
                      src={job.employer.image}
                      alt={job.employer.employerProfile?.companyName ?? "Company"}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Building2 className="w-7 h-7 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {job.employer.employerProfile?.companyName ?? job.employer.name}
                  </h3>
                  {job.employer.employerProfile?.industry && (
                    <p className="text-sm text-gray-500">
                      {job.employer.employerProfile.industry}
                    </p>
                  )}
                </div>
              </div>

              {job.employer.employerProfile?.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {job.employer.employerProfile.description}
                </p>
              )}

              <div className="space-y-3">
                {job.employer.employerProfile?.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{job.employer.employerProfile.location}</span>
                  </div>
                )}
                {job.employer.employerProfile?.companySize && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{job.employer.employerProfile.companySize} employees</span>
                  </div>
                )}
                {job.employer.employerProfile?.website && (
                  <a
                    href={job.employer.employerProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Visit Website</span>
                  </a>
                )}
              </div>
            </div>

            {/* Apply CTA Card */}
            {!applicationStatus?.applied && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Ready to apply?
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  Your profile will be shared with {job.employer.employerProfile?.companyName ?? job.employer.name}.
                </p>
                <button
                  onClick={() => router.push(`/talent/jobs/${jobId}/apply`)}
                  className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Apply Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
