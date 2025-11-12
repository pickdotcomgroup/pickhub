"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { MessageSquare, Calendar, Briefcase, X } from "lucide-react";

interface TalentProfile {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  skills: string[];
  experience: string;
  hourlyRate: string | null;
  tier: string;
  completedProjects: number;
  successRate: number;
  verificationStatus: string;
  portfolioUrl?: string | null;
  bio?: string | null;
}

interface Talent {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  profile: TalentProfile | null;
}

export default function AgencyPickedDevelopersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pickedDevelopers, setPickedDevelopers] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPickedDevelopers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get picked developer IDs from localStorage
      const pickedIds = JSON.parse(localStorage.getItem("pickedDevelopers") ?? "[]") as string[];

      if (pickedIds.length === 0) {
        setPickedDevelopers([]);
        setLoading(false);
        return;
      }

      // Fetch all talents
      const response = await fetch("/api/talents");
      if (!response.ok) {
        throw new Error("Failed to fetch talents");
      }

      const data = await response.json() as { talents: Talent[] };
      
      // Filter to only picked developers
      const picked = data.talents.filter(talent => pickedIds.includes(talent.id));
      setPickedDevelopers(picked);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching picked developers:", err);
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

    void fetchPickedDevelopers();
  }, [session, status, router, fetchPickedDevelopers]);

  if (status === "loading" || loading) {
    return (
      <>
        <div className="flex items-center justify-center gap-3 m-10">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <div className="text-gray-500 text-md">Loading picked developers...</div>
        </div>
      </>
    );
  }

  if (!session || session.user.role !== "agency") {
    return null;
  }

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

  const handleStartConversation = async (talentId: string) => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: talentId }),
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

  const handleScheduleInterview = async (talentId: string) => {
    // Navigate to messages to schedule interview
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: talentId }),
      });

      if (response.ok) {
        router.push("/agency/messages");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleHire = (_talentId: string) => {
    alert("Hire functionality will be implemented soon!");
  };

  const handleRemovePick = (talentId: string) => {
    const pickedIds = JSON.parse(localStorage.getItem("pickedDevelopers") ?? "[]") as string[];
    const updatedIds = pickedIds.filter(id => id !== talentId);
    localStorage.setItem("pickedDevelopers", JSON.stringify(updatedIds));
    setPickedDevelopers(prev => prev.filter(dev => dev.id !== talentId));
  };

  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Picked Developers</h1>
            <p className="text-gray-600">
              Manage your picked developers - message, hire, interview, and schedule meetings
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-6 mb-8">
              <p className="text-red-700">Error: {error}</p>
            </div>
          )}

          {pickedDevelopers.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-12 border border-gray-200 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No picked developers yet</h3>
              <p className="text-gray-600 mb-6">
                Browse developers and pick the ones you want to work with
              </p>
              <button
                onClick={() => router.push("/agency/browse-developers")}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                Browse Developers
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pickedDevelopers.map((talent) => (
                <div key={talent.id} className="bg-white rounded-xl p-6 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all relative">
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemovePick(talent.id)}
                    className="absolute top-4 right-4 p-1.5 hover:bg-red-50 rounded-lg transition group"
                    title="Remove from picked"
                  >
                    <X className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
                  </button>

                  <div className="flex items-start space-x-3 mb-4">
                    <div className="relative">
                      {talent.image ? (
                        <Image
                          src={talent.image}
                          alt={getDisplayName(talent)}
                          width={56}
                          height={56}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-semibold">
                          {getInitials(talent)}
                        </div>
                      )}
                      {talent.profile?.verificationStatus === "verified" && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-2 mb-1">
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

                  {talent.profile && (
                    <>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Experience</p>
                          <p className="text-sm text-gray-900 font-medium">{formatExperience(talent.profile.experience)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Completed</p>
                          <p className="text-sm text-gray-900 font-medium">{talent.profile.completedProjects}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {talent.profile.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                        {talent.profile.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{talent.profile.skills.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <p className="text-xs text-blue-600 mb-1">Hourly Rate</p>
                        <p className="text-lg font-bold text-blue-900">
                          {talent.profile.hourlyRate ?? "Not specified"}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <button
                          onClick={() => handleStartConversation(talent.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Message
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleHire(talent.id)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                          >
                            <Briefcase className="w-4 h-4" />
                            Hire
                          </button>
                          <button
                            onClick={() => handleScheduleInterview(talent.id)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition"
                          >
                            <Calendar className="w-4 h-4" />
                            Interview
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {pickedDevelopers.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {pickedDevelopers.length} developer{pickedDevelopers.length !== 1 ? "s" : ""} picked
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
