"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
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
  tier: string;
  completedProjects: number;
  successRate: number;
  verificationStatus: string;
  platformAccess: boolean;
  portfolioUrl?: string | null;
  bio?: string | null;
  certifications?: string[];
}

interface Talent {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  profile: TalentProfile | null;
}

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
  verificationDecision: string;
  reviewedAt: string | null;
}

interface DetailedTalent extends Talent {
  verification: TalentVerification | null;
}

export default function ClientBrowsePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messagingTalentId, setMessagingTalentId] = useState<string | null>(null);
  const [selectedTalentId, setSelectedTalentId] = useState<string | null>(null);
  const [selectedTalentDetails, setSelectedTalentDetails] = useState<DetailedTalent | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth");
      return;
    }

    if (session.user.role !== "client") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  const fetchTalents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (experienceLevel) params.append("experience", experienceLevel);
      if (selectedSkills.length > 0) params.append("skills", selectedSkills.join(","));

      const response = await fetch(`/api/talents?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch talents");
      }

      const data = await response.json() as { talents: Talent[] };
      setTalents(data.talents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching talents:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, experienceLevel, selectedSkills]);

  useEffect(() => {
    if (session?.user.role === "client") {
      void fetchTalents();
    }
  }, [session, fetchTalents]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center gap-3 m-10">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
        <div className="text-gray-500 text-md">Loading Developers...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "client") {
    return null;
  }

  const skills = ["React", "Next.js", "TypeScript", "Node.js", "Python", "UI/UX Design", "Mobile Dev", "DevOps"];

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const getInitials = (talent: Talent) => {
    if (talent.profile) {
      return `${talent.profile.firstName[0] ?? ""}${talent.profile.lastName[0] ?? ""}`.toUpperCase();
    }
    if (talent.name) {
      const names = talent.name.split(" ");
      return names.length > 1
        ? `${names[0]?.[0] ?? ""}${names[1]?.[0] ?? ""}`.toUpperCase()
        : (names[0]?.[0] ?? "T").toUpperCase();
    }
    return "T";
  };

  const getDisplayName = (talent: Talent) => {
    if (talent.profile) {
      return `${talent.profile.firstName} ${talent.profile.lastName}`;
    }
    return talent.name ?? "Unknown User";
  };

  const formatExperience = (experience: string) => {
    return experience.charAt(0).toUpperCase() + experience.slice(1);
  };

  const handleStartConversation = async (talentId: string) => {
    try {
      setMessagingTalentId(talentId);
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: talentId }),
      });

      if (response.ok) {
        router.push("/client/messages");
      } else {
        console.error("Failed to create conversation");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setMessagingTalentId(null);
    }
  };

  const handleViewProfile = async (talentId: string) => {
    setSelectedTalentId(talentId);
    setLoadingDetails(true);

    try {
      const response = await fetch(`/api/talents/${talentId}`);
      if (response.ok) {
        const data = await response.json() as DetailedTalent;
        setSelectedTalentDetails(data);
      } else {
        console.error("Failed to fetch talent details");
      }
    } catch (error) {
      console.error("Error fetching talent details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setSelectedTalentId(null);
    setSelectedTalentDetails(null);
  };

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

  return (
    <>
      {/* Profile Modal */}
      {selectedTalentId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={closeModal}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition z-10"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {loadingDetails ? (
                <div className="flex items-center justify-center p-12">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                </div>
              ) : selectedTalentDetails ? (
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start gap-6 mb-8 pb-8 border-b border-gray-200">
                    <div className="relative">
                      {selectedTalentDetails.image ? (
                        <Image
                          src={selectedTalentDetails.image}
                          alt={getDisplayName(selectedTalentDetails)}
                          width={96}
                          height={96}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-semibold">
                          {getInitials(selectedTalentDetails)}
                        </div>
                      )}
                      {selectedTalentDetails.profile?.verificationStatus === "verified" && (
                        <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-bold text-gray-900">
                          {getDisplayName(selectedTalentDetails)}
                        </h2>
                        {selectedTalentDetails.profile && (
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getTierBadgeColor(selectedTalentDetails.profile.tier)}`}>
                            {selectedTalentDetails.profile.tier.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-xl text-gray-600 mb-4">{selectedTalentDetails.profile?.title}</p>

                      {selectedTalentDetails.profile?.bio && (
                        <p className="text-gray-700 mb-4">{selectedTalentDetails.profile.bio}</p>
                      )}

                      <div className="flex gap-4">
                        <button
                          onClick={() => handleStartConversation(selectedTalentDetails.id)}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                        >
                          Message
                        </button>
                        {selectedTalentDetails.profile?.portfolioUrl && (
                          <a
                            href={selectedTalentDetails.profile.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition"
                          >
                            View Portfolio
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Experience</p>
                      <p className="text-lg font-semibold text-gray-900">{formatExperience(selectedTalentDetails.profile?.experience ?? "")}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Completed</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedTalentDetails.profile?.completedProjects ?? 0}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedTalentDetails.profile?.successRate ?? 0}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Hourly Rate</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedTalentDetails.profile?.hourlyRate ?? "N/A"}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  {selectedTalentDetails.profile?.skills && selectedTalentDetails.profile.skills.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTalentDetails.profile.skills.map((skill, index) => (
                          <span key={index} className="px-3 py-1.5 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {selectedTalentDetails.profile?.certifications && selectedTalentDetails.profile.certifications.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTalentDetails.profile.certifications.map((cert, index) => (
                          <span key={index} className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verification Details */}
                  {selectedTalentDetails.verification && (
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900">Verification Status</h3>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {selectedTalentDetails.verification.overallScore !== null && (
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Overall Score</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${selectedTalentDetails.verification.overallScore}%` }}
                                ></div>
                              </div>
                              <span className="text-lg font-semibold text-gray-900">
                                {selectedTalentDetails.verification.overallScore.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        )}

                        {selectedTalentDetails.verification.portfolioScore !== null && (
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Portfolio Score</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full transition-all"
                                  style={{ width: `${selectedTalentDetails.verification.portfolioScore}%` }}
                                ></div>
                              </div>
                              <span className="text-lg font-semibold text-gray-900">
                                {selectedTalentDetails.verification.portfolioScore.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        )}

                        {selectedTalentDetails.verification.codeSampleScore !== null && (
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Code Sample Score</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full transition-all"
                                  style={{ width: `${selectedTalentDetails.verification.codeSampleScore}%` }}
                                ></div>
                              </div>
                              <span className="text-lg font-semibold text-gray-900">
                                {selectedTalentDetails.verification.codeSampleScore.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${selectedTalentDetails.verification.identityVerified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm text-gray-700">Identity Verified</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${selectedTalentDetails.verification.linkedInVerified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm text-gray-700">LinkedIn Verified</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${selectedTalentDetails.verification.portfolioReviewed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm text-gray-700">Portfolio Reviewed</span>
                        </div>
                      </div>

                      {(selectedTalentDetails.verification.githubUsername ?? selectedTalentDetails.verification.linkedInUrl) && (
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">Verified Profiles:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedTalentDetails.verification.githubUsername && (
                              <a
                                href={`https://github.com/${selectedTalentDetails.verification.githubUsername}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                GitHub
                              </a>
                            )}
                            {selectedTalentDetails.verification.linkedInUrl && (
                              <a
                                href={selectedTalentDetails.verification.linkedInUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                LinkedIn
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Developers</h1>
            <p className="text-gray-600">Discover and hire skilled professionals for your projects</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Talents</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, skills, or expertise..."
                    className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="" className="bg-white">All Levels</option>
                  <option value="entry" className="bg-white">Entry Level</option>
                  <option value="intermediate" className="bg-white">Intermediate</option>
                  <option value="senior" className="bg-white">Senior</option>
                  <option value="expert" className="bg-white">Expert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Skills</label>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedSkills.includes(skill)
                      ? "bg-purple-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 m-10">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
              <div className="text-gray-500 text-md">Loading Developers...</div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-6 mb-8">
              <p className="text-red-700">Error: {error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && talents.length === 0 && (
            <div className="bg-gray-50 rounded-xl p-12 border border-gray-200 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No talents found</h3>
              <p className="text-gray-600">Try adjusting your search filters to find more talents</p>
            </div>
          )}

          {/* Talents Grid */}
          {!loading && !error && talents.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {talents.map((talent) => (
                <div key={talent.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {talent.image ? (
                          <Image
                            src={talent.image}
                            alt={getDisplayName(talent)}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                            {getInitials(talent)}
                          </div>
                        )}
                        {talent.profile?.verificationStatus === "verified" && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1" title="Verified Talent">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{getDisplayName(talent)}</h3>
                          {talent.profile && (
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getTierBadgeColor(talent.profile.tier)}`}>
                              {talent.profile.tier.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{talent.profile?.title ?? "Professional"}</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                      <svg className="w-5 h-5 text-gray-500 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  {talent.profile && (
                    <>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Experience Level</p>
                          <p className="text-sm text-gray-900 font-medium">{formatExperience(talent.profile.experience)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Completed Projects</p>
                          <p className="text-sm text-gray-900 font-medium">{talent.profile.completedProjects}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {talent.profile.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                        {talent.profile.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{talent.profile.skills.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500">Hourly Rate</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {talent.profile.hourlyRate ?? "Not specified"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartConversation(talent.id)}
                            disabled={messagingTalentId === talent.id}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:bg-gray-600"
                          >
                            {messagingTalentId === talent.id ? "..." : "Message"}
                          </button>
                          <button
                            onClick={() => handleViewProfile(talent.id)}
                            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Results Count */}
          {!loading && !error && talents.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Showing {talents.length} talent{talents.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
