"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface VerificationStatus {
  verificationStatus: string;
  platformAccess: boolean;
  statusInfo: {
    label: string;
    color: string;
    description: string;
  };
  progress: {
    portfolioReviewed: boolean;
    codeSampleReviewed: boolean;
    skillTestsTaken: boolean;
    linkedInVerified: boolean;
    identityVerified: boolean;
    completionPercentage: number;
  };
  checklist: Array<{
    id: string;
    label: string;
    required: boolean;
  }>;
  verification: {
    portfolioScore?: number;
    codeSampleScore?: number;
    skillTestsScore?: number;
    overallScore?: number;
    verificationDecision: string;
    rejectionReason?: string;
    reviewedAt?: string;
  } | null;
}

export default function VerificationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    portfolioUrl: "",
    githubUsername: "",
    gitlabUsername: "",
    codeRepositoryUrl: "",
    linkedInUrl: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    void fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch("/api/verification/status");
      if (response.ok) {
        const data = await response.json() as VerificationStatus;
        setStatus(data);
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);
    setSuccessMessage("");

    try {
      const response = await fetch("/api/verification/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json() as {
        message?: string;
        errors?: string[];
        error?: string;
      };

      if (response.ok) {
        setSuccessMessage(data.message ?? "Verification submitted successfully");
        void fetchVerificationStatus();
        setFormData({
          portfolioUrl: "",
          githubUsername: "",
          gitlabUsername: "",
          codeRepositoryUrl: "",
          linkedInUrl: "",
        });
      } else {
        setErrors(data.errors ?? [data.error ?? "An error occurred"]);
      }
    } catch {
      setErrors(["Failed to submit verification. Please try again."]);
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <button
            onClick={() => router.push("/auth")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const getStatusColor = (color: string) => {
    switch (color) {
      case "green":
        return "bg-green-100 text-green-800 border-green-300";
      case "blue":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "yellow":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "red":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Developer Verification
          </h1>
          <p className="text-gray-300">
            Complete your verification to access the platform
          </p>
        </div>

        {/* Status Card */}
        {status && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                Verification Status
              </h2>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                  status.statusInfo.color
                )}`}
              >
                {status.statusInfo.label}
              </span>
            </div>
            <p className="text-gray-300 mb-4">{status.statusInfo.description}</p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>Completion Progress</span>
                <span>{status.progress.completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${status.progress.completionPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Scores (if available) */}
            {status.verification?.overallScore && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {status.verification.portfolioScore && (
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">
                      {status.verification.portfolioScore}
                    </div>
                    <div className="text-xs text-gray-400">Portfolio</div>
                  </div>
                )}
                {status.verification.codeSampleScore && (
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">
                      {status.verification.codeSampleScore}
                    </div>
                    <div className="text-xs text-gray-400">Code Sample</div>
                  </div>
                )}
                {status.verification.skillTestsScore && (
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">
                      {status.verification.skillTestsScore}
                    </div>
                    <div className="text-xs text-gray-400">Skill Tests</div>
                  </div>
                )}
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {status.verification.overallScore}
                  </div>
                  <div className="text-xs text-gray-400">Overall</div>
                </div>
              </div>
            )}

            {/* Rejection Reason */}
            {status.verification?.rejectionReason && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                <h3 className="text-red-400 font-semibold mb-2">
                  Feedback from Review Team:
                </h3>
                <p className="text-gray-300 text-sm">
                  {status.verification.rejectionReason}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Verification Checklist */}
        {status && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">
              Verification Requirements
            </h2>
            <div className="space-y-3">
              {status.checklist.map((item) => {
                const isCompleted =
                  (item.id === "portfolio" && status.progress.portfolioReviewed) ||
                  (item.id === "code_repository" &&
                    status.progress.codeSampleReviewed) ||
                  (item.id === "skill_tests" && status.progress.skillTestsTaken) ||
                  (item.id === "linkedin" && status.progress.linkedInVerified) ||
                  (item.id === "identity" && status.progress.identityVerified);

                return (
                  <div
                    key={item.id}
                    className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-green-500"
                          : "bg-gray-600 border-2 border-gray-500"
                      }`}
                    >
                      {isCompleted && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-white">{item.label}</span>
                      {item.required && (
                        <span className="ml-2 text-xs text-red-400">
                          (Required)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Submission Form */}
        {status?.verificationStatus !== "verified" && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">
              Submit Verification Information
            </h2>

            {errors.length > 0 && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                <ul className="list-disc list-inside text-red-400 text-sm">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                <p className="text-green-400 text-sm">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, portfolioUrl: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://yourportfolio.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  GitHub Username
                </label>
                <input
                  type="text"
                  value={formData.githubUsername}
                  onChange={(e) =>
                    setFormData({ ...formData, githubUsername: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="yourusername"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  GitLab Username (Optional)
                </label>
                <input
                  type="text"
                  value={formData.gitlabUsername}
                  onChange={(e) =>
                    setFormData({ ...formData, gitlabUsername: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="yourusername"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Code Repository URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.codeRepositoryUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      codeRepositoryUrl: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={formData.linkedInUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedInUrl: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit for Review"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Platform Access Notice */}
        {status?.platformAccess && (
          <div className="mt-6 p-4 bg-green-900/20 border border-green-500/50 rounded-lg text-center">
            <p className="text-green-400 font-semibold">
              ✓ You have full platform access! You can now browse and pick projects.
            </p>
            <button
              onClick={() => router.push("/talent/browse")}
              className="mt-3 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              Browse Projects
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
