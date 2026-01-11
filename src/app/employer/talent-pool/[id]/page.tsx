"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Award,
  Briefcase,
  DollarSign,
  Mail,
  MessageSquare,
  Globe,
  Github,
  Linkedin,
  CheckCircle,
  Star,
  Code,
  ExternalLink,
  Shield,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface TalentVerification {
  portfolioReviewed: boolean;
  portfolioScore: number | null;
  codeSampleReviewed: boolean;
  codeSampleScore: number | null;
  githubUsername: string | null;
  gitlabUsername: string | null;
  linkedInUrl: string | null;
  linkedInVerified: boolean;
  identityVerified: boolean;
  overallScore: number | null;
  verificationDecision: string | null;
  reviewedAt: string | null;
}

interface TalentProfile {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  skills: string[];
  experience: string;
  hourlyRate: string | null;
  portfolio: string | null;
  portfolioUrl: string | null;
  bio: string | null;
  certifications: string[];
  tier: string;
  completedProjects: number;
  successRate: number;
  verificationStatus: string;
  platformAccess: boolean;
}

interface TalentData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  profile: TalentProfile;
  verification: TalentVerification | null;
}

export default function TalentDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const talentId = params.id as string;

  const [talent, setTalent] = useState<TalentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    const fetchTalent = async () => {
      try {
        const response = await fetch(`/api/talents/${talentId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Talent not found");
          } else if (response.status === 403) {
            setError("This talent is not available");
          } else {
            setError("Failed to load talent details");
          }
          return;
        }
        const data = (await response.json()) as TalentData;
        setTalent(data);
      } catch (err) {
        console.error("Error fetching talent:", err);
        setError("Failed to load talent details");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTalent();
  }, [session, status, router, talentId]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "silver":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "bronze":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "gold":
        return "text-yellow-500";
      case "silver":
        return "text-gray-400";
      case "bronze":
        return "text-orange-500";
      default:
        return "text-gray-400";
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-48 bg-gray-200 rounded-xl"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/employer/talent-pool"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Talent Pool
          </Link>
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
            <p className="text-gray-600 mb-6">
              The talent you&apos;re looking for may not exist or is no longer available.
            </p>
            <Link
              href="/employer/talent-pool"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Browse Talent Pool
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!talent) {
    return null;
  }

  const fullName =
    talent.profile.firstName && talent.profile.lastName
      ? `${talent.profile.firstName} ${talent.profile.lastName}`
      : talent.name ?? "Unknown";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/employer/talent-pool"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Talent Pool
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600" />

          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-12">
              {/* Avatar and Basic Info */}
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 bg-white rounded-xl border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                  {talent.image ? (
                    <Image
                      src={talent.image}
                      alt={fullName}
                      width={96}
                      height={96}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                      {getInitials(fullName)}
                    </div>
                  )}
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                    {talent.profile.verificationStatus === "verified" && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <p className="text-gray-600">{talent.profile.title}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 md:mt-0 flex gap-3">
                <Link
                  href={`/employer/messages?to=${talent.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </Link>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                  <Mail className="w-4 h-4" />
                  Invite to Job
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Tier */}
              <div className="flex items-center gap-2">
                <Award className={`w-5 h-5 ${getTierIcon(talent.profile.tier)}`} />
                <span
                  className={`px-2.5 py-1 text-sm font-medium rounded-full border capitalize ${getTierColor(talent.profile.tier)}`}
                >
                  {talent.profile.tier} Tier
                </span>
              </div>

              {/* Experience */}
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="w-5 h-5" />
                <span>{talent.profile.experience}</span>
              </div>

              {/* Hourly Rate */}
              {talent.profile.hourlyRate && (
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-5 h-5" />
                  <span>{talent.profile.hourlyRate}/hr</span>
                </div>
              )}

              {/* Success Rate */}
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp className="w-5 h-5" />
                <span>{talent.profile.successRate}% Success</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {talent.profile.completedProjects}
            </div>
            <div className="text-sm text-gray-600">Projects Completed</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {talent.profile.successRate}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
          {talent.verification?.overallScore && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {talent.verification.overallScore}/100
              </div>
              <div className="text-sm text-gray-600">Verification Score</div>
            </div>
          )}
        </div>

        {/* About Section */}
        {talent.profile.bio && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
            <p className="text-gray-600 whitespace-pre-line">{talent.profile.bio}</p>
          </div>
        )}

        {/* Skills */}
        {talent.profile.skills && talent.profile.skills.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-gray-400" />
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {talent.profile.skills.map((skill, index) => (
                <span
                  key={skill}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                    index < 3
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio & Links */}
        {(talent.profile.portfolioUrl ?? talent.verification?.githubUsername ?? talent.verification?.linkedInUrl) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-gray-400" />
              Portfolio & Links
            </h2>
            <div className="space-y-3">
              {talent.profile.portfolioUrl && (
                <a
                  href={talent.profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-900">Portfolio Website</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              )}
              {talent.verification?.githubUsername && (
                <a
                  href={`https://github.com/${talent.verification.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <Github className="w-5 h-5 text-gray-900" />
                    <span className="text-gray-900">@{talent.verification.githubUsername}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              )}
              {talent.verification?.linkedInUrl && (
                <a
                  href={talent.verification.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-5 h-5 text-blue-700" />
                    <span className="text-gray-900">LinkedIn Profile</span>
                    {talent.verification.linkedInVerified && (
                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Certifications */}
        {talent.profile.certifications && talent.profile.certifications.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-gray-400" />
              Certifications
            </h2>
            <div className="space-y-3">
              {talent.profile.certifications.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-900">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification Details */}
        {talent.verification && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-gray-400" />
              Verification Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <div
                  className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    talent.verification.identityVerified
                      ? "bg-green-100"
                      : "bg-gray-100"
                  }`}
                >
                  <CheckCircle
                    className={`w-5 h-5 ${
                      talent.verification.identityVerified
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="text-sm text-gray-600">Identity</div>
                <div
                  className={`text-sm font-medium ${
                    talent.verification.identityVerified
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {talent.verification.identityVerified ? "Verified" : "Pending"}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <div
                  className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    talent.verification.portfolioReviewed
                      ? "bg-green-100"
                      : "bg-gray-100"
                  }`}
                >
                  <Globe
                    className={`w-5 h-5 ${
                      talent.verification.portfolioReviewed
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="text-sm text-gray-600">Portfolio</div>
                <div
                  className={`text-sm font-medium ${
                    talent.verification.portfolioReviewed
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {talent.verification.portfolioReviewed
                    ? `${talent.verification.portfolioScore ?? 0}/100`
                    : "Not Reviewed"}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <div
                  className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    talent.verification.codeSampleReviewed
                      ? "bg-green-100"
                      : "bg-gray-100"
                  }`}
                >
                  <Code
                    className={`w-5 h-5 ${
                      talent.verification.codeSampleReviewed
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="text-sm text-gray-600">Code Sample</div>
                <div
                  className={`text-sm font-medium ${
                    talent.verification.codeSampleReviewed
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {talent.verification.codeSampleReviewed
                    ? `${talent.verification.codeSampleScore ?? 0}/100`
                    : "Not Reviewed"}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <div
                  className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    talent.verification.linkedInVerified
                      ? "bg-green-100"
                      : "bg-gray-100"
                  }`}
                >
                  <Linkedin
                    className={`w-5 h-5 ${
                      talent.verification.linkedInVerified
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="text-sm text-gray-600">LinkedIn</div>
                <div
                  className={`text-sm font-medium ${
                    talent.verification.linkedInVerified
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {talent.verification.linkedInVerified ? "Verified" : "Pending"}
                </div>
              </div>
            </div>

            {talent.verification.reviewedAt && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>
                  Verified on{" "}
                  {new Date(talent.verification.reviewedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-center text-white">
          <h3 className="text-lg font-semibold mb-2">
            Interested in working with {talent.profile.firstName ?? fullName.split(" ")[0]}?
          </h3>
          <p className="text-blue-100 mb-4">
            Send a message to discuss your project requirements and see if they&apos;re a good fit.
          </p>
          <Link
            href={`/employer/messages?to=${talent.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
          >
            <MessageSquare className="w-5 h-5" />
            Start Conversation
          </Link>
        </div>
      </div>
    </main>
  );
}
