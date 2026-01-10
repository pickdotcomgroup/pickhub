"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { api } from "~/trpc/react";

interface TalentProfile {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  skills: string[];
  experience: string;
  phone?: string;
  resumeUrl?: string;
  resumeName?: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export default function JobApplicationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  // Resume states
  const [resumeOption, setResumeOption] = useState<"profile" | "upload">("profile");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  // const [_isUploading, _setIsUploading] = useState(false);

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

  // Apply mutation
  const applyMutation = api.jobs.applyToJob.useMutation({
    onSuccess: () => {
      setSubmitSuccess(true);
      setTimeout(() => {
        router.push("/talent/jobs");
      }, 2000);
    },
    onError: (error) => {
      setSubmitError(error.message);
      setIsSubmitting(false);
    },
  });

  // Fetch talent profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/talent/profile");
        if (response.ok) {
          const data = (await response.json()) as { profile: TalentProfile };
          setProfile(data.profile);
          // Auto-fill form fields
          setFirstName(data.profile.firstName);
          setLastName(data.profile.lastName);
          setEmail(data.profile.user.email ?? "");
          setPhone(data.profile.phone ?? "");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (session?.user.role === "talent") {
      void fetchProfile();
    }
  }, [session]);

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

  // Calculate profile match
  const calculateProfileMatch = () => {
    if (!profile || !job) return { percentage: 0, matching: [], missing: [] };

    const jobSkills = job.skills.map((s) => s.toLowerCase());
    const userSkills = profile.skills.map((s) => s.toLowerCase());

    const matching = profile.skills.filter((skill) =>
      jobSkills.includes(skill.toLowerCase())
    );
    const missing = job.skills.filter(
      (skill) => !userSkills.includes(skill.toLowerCase())
    );

    const percentage =
      jobSkills.length > 0
        ? Math.round((matching.length / jobSkills.length) * 100)
        : 0;

    return { percentage, matching, missing };
  };

  const profileMatch = calculateProfileMatch();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      setSubmitError("Please upload a PDF or Word document");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("File size must be less than 5MB");
      return;
    }

    setUploadedFile(file);
    setResumeOption("upload");
    setSubmitError(null);

    // In a real implementation, you would upload to a storage service here
    // For now, we'll create a local URL for preview
    const localUrl = URL.createObjectURL(file);
    setUploadedFileUrl(localUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    // Determine resume URL
    let resumeUrl: string | undefined;
    if (resumeOption === "profile" && profile?.resumeUrl) {
      resumeUrl = profile.resumeUrl;
    } else if (resumeOption === "upload" && uploadedFileUrl) {
      // In production, this would be the uploaded file's URL from storage
      resumeUrl = uploadedFileUrl;
    }

    applyMutation.mutate({
      jobId,
      coverLetter: coverLetter || undefined,
      resumeUrl,
    });
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return "Salary not specified";
    const formatNum = (n: number) => `$${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${formatNum(min)} - ${formatNum(max)}`;
    if (min) return `${formatNum(min)}+`;
    if (max) return `Up to ${formatNum(max)}`;
    return "Salary not specified";
  };

  if (status === "loading" || isPageLoading || isJobLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <div className="h-64 bg-gray-200 rounded-xl"></div>
                <div className="h-48 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
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

  if (applicationStatus?.applied) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Already Applied
            </h3>
            <p className="text-gray-600 mb-4">
              You have already submitted an application for this position.
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

  if (submitSuccess) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Application Submitted!
            </h3>
            <p className="text-gray-600 mb-4">
              Your application has been sent to {job.employer.employerProfile?.companyName ?? job.employer.name}.
              Redirecting you back to jobs...
            </p>
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/talent/jobs")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job Listings</span>
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                {job.employer.image ? (
                  <img
                    src={job.employer.image}
                    alt={job.employer.employerProfile?.companyName ?? "Company"}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-amber-600" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {job.employer.employerProfile?.companyName ?? job.employer.name}
                  </span>
                  {job.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {job.location} ({job.workLocationType})
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-green-600 font-medium">
                    <DollarSign className="w-4 h-4" />
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push(`/talent/jobs/${jobId}`)}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
            >
              View Full Job Description
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit}>
              {/* Contact Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  1. Contact Information
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Your details are pre-filled from your profile.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Resume / CV */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  2. Resume / CV
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Upload a new resume or select from your profile.
                </p>

                {/* Use Profile Resume Option */}
                <div
                  className={`border-2 rounded-xl p-4 mb-4 cursor-pointer transition ${
                    resumeOption === "profile"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setResumeOption("profile")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="resumeOption"
                        checked={resumeOption === "profile"}
                        onChange={() => setResumeOption("profile")}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="font-medium text-gray-900">
                        Use Profile Resume
                      </span>
                    </div>
                    {profile?.resumeUrl && (
                      <span className="text-sm text-blue-600 font-medium">
                        Recommended
                      </span>
                    )}
                  </div>
                  {profile?.resumeUrl ? (
                    <div className="mt-3 ml-7 flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {profile.resumeName ?? "Resume.pdf"}
                        </p>
                        <p className="text-xs text-gray-500">From your profile</p>
                      </div>
                      <a
                        href={profile.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View
                      </a>
                    </div>
                  ) : (
                    <p className="mt-2 ml-7 text-sm text-gray-500">
                      No resume uploaded to your profile yet
                    </p>
                  )}
                </div>

                {/* Upload New Resume Option */}
                <div
                  className={`border-2 rounded-xl p-4 cursor-pointer transition ${
                    resumeOption === "upload"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setResumeOption("upload")}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="resumeOption"
                      checked={resumeOption === "upload"}
                      onChange={() => setResumeOption("upload")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="font-medium text-gray-900">
                      Upload New Resume
                    </span>
                  </div>

                  {uploadedFile ? (
                    <div className="mt-3 ml-7 flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                          setUploadedFileUrl(null);
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      className="mt-3 ml-7 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        <span className="text-blue-600 font-medium">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF or Word (max 5MB)
                      </p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Cover Letter (Optional) */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  3. Cover Letter{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Tell the employer why you&apos;re a great fit for this role.
                </p>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Write your cover letter here..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Error submitting application
                    </p>
                    <p className="text-sm text-red-600">{submitError}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            </form>
          </div>

          {/* Profile Match Sidebar */}
          <div className="space-y-6">
            {/* Profile Match Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Profile Match
                </h3>
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
                      stroke="#22c55e"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(profileMatch.percentage / 100) * 352} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">
                      {profileMatch.percentage}%
                    </span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Match
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-gray-600 mb-6">
                Your profile is a{" "}
                {profileMatch.percentage >= 80
                  ? "strong"
                  : profileMatch.percentage >= 50
                  ? "good"
                  : "partial"}{" "}
                match for this {job.title} role!
              </p>

              {/* Matching Skills */}
              {profileMatch.matching.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Matching Skills
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileMatch.matching.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {profileMatch.missing.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-gray-900">
                      Missing Skills
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileMatch.missing.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-amber-50 text-amber-700 text-sm rounded-full border border-amber-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Consider adding projects with these skills to your portfolio
                    to increase your chances.
                  </p>
                </div>
              )}
            </div>

            {/* Boost Application Card */}
            {profileMatch.missing.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">
                    Boost your application
                  </h3>
                </div>
                <p className="text-sm text-blue-800 mb-4">
                  Take a short assessment in{" "}
                  <span className="font-medium">
                    {profileMatch.missing[0]}
                  </span>{" "}
                  to prove your knowledge.
                </p>
                <button
                  onClick={() => router.push("/talent/upskilling")}
                  className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  Start Assessment
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
