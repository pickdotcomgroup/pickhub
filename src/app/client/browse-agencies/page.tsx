"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Building2, MapPin, Users, Globe, Calendar } from "lucide-react";
import ProjectCardSkeleton from "~/app/_components/project-card-skeleton";

interface AgencyProfile {
  id: string;
  firstName: string;
  lastName: string;
  agencyName: string;
  description: string;
  teamSize: string | null;
  skills: string[];
  website: string | null;
  location: string | null;
  foundedYear: string | null;
}

interface Agency {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  profile: AgencyProfile | null;
}

export default function ClientBrowseAgenciesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState("");
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messagingAgencyId, setMessagingAgencyId] = useState<string | null>(null);

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

  const fetchAgencies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (teamSize) params.append("teamSize", teamSize);
      if (selectedSkills.length > 0) params.append("skills", selectedSkills.join(","));

      const response = await fetch(`/api/agencies?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch agencies");
      }

      const data = await response.json() as { agencies: Agency[] };
      setAgencies(data.agencies);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching agencies:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, teamSize, selectedSkills]);

  useEffect(() => {
    if (session?.user.role === "client") {
      void fetchAgencies();
    }
  }, [session, fetchAgencies]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center gap-3 m-10">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <div className="text-gray-500 text-md">Loading Agencies...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "client") {
    return null;
  }

  const skillCategories = {
    "Programming Languages": ["JavaScript", "TypeScript", "Python", "Java", "C#", "PHP", "Ruby", "Go", "Swift", "Kotlin"],
    "Frontend": ["React", "Next.js", "Angular", "Vue.js", "HTML/CSS", "Tailwind CSS"],
    "Backend": ["Node.js", "Django", "Flask", "Express.js", "Spring Boot", "ASP.NET", "Laravel", "Ruby on Rails"],
    "Mobile": ["React Native", "Flutter", "iOS", "Android", "Mobile Dev"],
    "Database": ["MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase"],
    "DevOps & Cloud": ["Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "DevOps"],
    "API": ["REST API", "GraphQL", "WebSocket"],
    "Design": ["UI/UX Design", "Figma", "Adobe XD", "Sketch"],
    "Emerging Tech": ["Machine Learning", "AI", "Data Science", "Blockchain", "Web3"],
    "Other": ["Cybersecurity", "Testing", "QA", "Git"]
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const getInitials = (agency: Agency) => {
    if (agency.profile?.agencyName) {
      const words = agency.profile.agencyName.split(" ");
      return words.length > 1
        ? `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase()
        : (words[0]?.[0] ?? "A").toUpperCase();
    }
    if (agency.name) {
      const names = agency.name.split(" ");
      return names.length > 1
        ? `${names[0]?.[0] ?? ""}${names[1]?.[0] ?? ""}`.toUpperCase()
        : (names[0]?.[0] ?? "A").toUpperCase();
    }
    return "A";
  };

  const getDisplayName = (agency: Agency) => {
    if (agency.profile?.agencyName) {
      return agency.profile.agencyName;
    }
    return agency.name ?? "Unknown Agency";
  };

  const handleStartConversation = async (agencyId: string) => {
    try {
      setMessagingAgencyId(agencyId);
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: agencyId }),
      });

      if (response.ok) {
        router.push("/client/messages");
      } else {
        console.error("Failed to create conversation");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setMessagingAgencyId(null);
    }
  };

  return (
    <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Agencies & Companies</h1>
            <p className="text-gray-600">Discover and partner with professional agencies for your projects</p>
          </div>

          {/* Two Column Layout: Filters Left, Content Right */}
          <div className="flex gap-6">
            {/* Left Sidebar - Filters */}
            <aside className="w-80 flex-shrink-0">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
                
                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, location..."
                      className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Team Size */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" className="bg-white">All Sizes</option>
                    <option value="1-10" className="bg-white">1-10 employees</option>
                    <option value="11-50" className="bg-white">11-50 employees</option>
                    <option value="51-200" className="bg-white">51-200 employees</option>
                    <option value="200+" className="bg-white">200+ employees</option>
                  </select>
                </div>

                {/* Services Filter - Categorized */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
                  <div className="max-h-96 overflow-y-auto space-y-4">
                    {Object.entries(skillCategories).map(([category, skills]) => (
                      <div key={category}>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">{category}</h3>
                        <div className="space-y-1">
                          {skills.map((skill) => (
                            <button
                              key={skill}
                              onClick={() => toggleSkill(skill)}
                              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm font-medium transition ${selectedSkills.includes(skill)
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                }`}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Content - Agencies List */}
            <div className="flex-1">
              {/* Loading State */}
              {loading && (
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <ProjectCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-300 rounded-xl p-6 mb-8">
                  <p className="text-red-700">Error: {error}</p>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && agencies.length === 0 && (
                <div className="bg-gray-50 rounded-xl p-12 border border-gray-200 text-center">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No agencies found</h3>
                  <p className="text-gray-600">Try adjusting your search filters to find more agencies</p>
                </div>
              )}

              {/* Agencies Grid */}
              {!loading && !error && agencies.length > 0 && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
              {agencies.map((agency) => (
                <div key={agency.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {agency.image ? (
                          <Image
                            src={agency.image}
                            alt={getDisplayName(agency)}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {getInitials(agency)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{getDisplayName(agency)}</h3>
                        {agency.profile?.location && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {agency.profile.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                      <svg className="w-5 h-5 text-gray-500 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  {agency.profile && (
                    <>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {agency.profile.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {agency.profile.teamSize && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Team Size</p>
                            <p className="text-sm text-gray-900 font-medium flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {agency.profile.teamSize}
                            </p>
                          </div>
                        )}
                        {agency.profile.foundedYear && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Founded</p>
                            <p className="text-sm text-gray-900 font-medium">{agency.profile.foundedYear}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {agency.profile.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                        {agency.profile.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{agency.profile.skills.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        {agency.profile.website && (
                          <a
                            href={agency.profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Globe className="w-4 h-4" />
                            Website
                          </a>
                        )}
                        <button
                          onClick={() => handleStartConversation(agency.id)}
                          disabled={messagingAgencyId === agency.id}
                          className="px-4 py-2 bg-transparent border border-blue-600 hover:bg-blue-50 text-blue-600 text-sm font-medium rounded-lg transition disabled:border-gray-400 disabled:text-gray-400 ml-auto"
                        >
                          {messagingAgencyId === agency.id ? "..." : "Message Agency"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
                  </div>
                  
                  {/* Results Count */}
                  {!loading && !error && agencies.length > 0 && (
                    <div className="mt-8 text-center">
                      <p className="text-gray-600">
                        Showing {agencies.length} agenc{agencies.length !== 1 ? "ies" : "y"}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
  );
}
