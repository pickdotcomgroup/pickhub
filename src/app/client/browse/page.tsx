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
}

interface Talent {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  profile: TalentProfile | null;
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
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </main>
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Find Developers</h1>
          <p className="text-gray-400">Discover and hire skilled professionals for your projects</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search Talents</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, skills, or expertise..."
                  className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
              <select 
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="" className="bg-slate-800">All Levels</option>
                <option value="entry" className="bg-slate-800">Entry Level</option>
                <option value="intermediate" className="bg-slate-800">Intermediate</option>
                <option value="senior" className="bg-slate-800">Senior</option>
                <option value="expert" className="bg-slate-800">Expert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Skills</label>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedSkills.includes(skill)
                      ? "bg-purple-600 text-white"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
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
          <div className="flex items-center justify-center py-12">
            <div className="text-white text-lg">Loading talents...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 mb-8">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && talents.length === 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">No talents found</h3>
            <p className="text-gray-400">Try adjusting your search filters to find more talents</p>
          </div>
        )}

        {/* Talents Grid */}
        {!loading && !error && talents.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talents.map((talent) => (
              <div key={talent.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
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
                    <div>
                      <h3 className="text-lg font-semibold text-white">{getDisplayName(talent)}</h3>
                      <p className="text-sm text-gray-400">{talent.profile?.title ?? "Professional"}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition">
                    <svg className="w-5 h-5 text-gray-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                {talent.profile && (
                  <>
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-1">Experience Level</p>
                      <p className="text-sm text-white font-medium">{formatExperience(talent.profile.experience)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {talent.profile.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                      {talent.profile.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full">
                          +{talent.profile.skills.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div>
                        <p className="text-xs text-gray-400">Hourly Rate</p>
                        <p className="text-lg font-semibold text-white">
                          {talent.profile.hourlyRate ?? "Not specified"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartConversation(talent.id)}
                          disabled={messagingTalentId === talent.id}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:bg-gray-600"
                        >
                          {messagingTalentId === talent.id ? "..." : "Message"}
                        </button>
                        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition">
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
            <p className="text-gray-400">
              Showing {talents.length} talent{talents.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
