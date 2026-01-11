"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Bookmark,
  BookmarkCheck,
  Award,
  Briefcase,
  X,
  ChevronDown,
  DollarSign,
} from "lucide-react";

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
  bio: string | null;
}

interface TalentData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  profile: TalentProfile | null;
}

interface Talent {
  id: string;
  name: string;
  title: string;
  experience: string;
  bio: string;
  skills: string[];
  avatar?: string;
  isBookmarked: boolean;
  tier: string;
  completedProjects: number;
  successRate: number;
  hourlyRate: string | null;
}

interface ActiveFilter {
  id: string;
  label: string;
  type: "role" | "skill" | "experience" | "location";
}

export default function EmployerTalentPoolPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([
    { id: "1", label: "Remote", type: "location" },
    { id: "2", label: "3-5 Years Exp", type: "experience" },
  ]);

  const [stats, setStats] = useState({
    totalCandidates: 0,
    newThisWeek: 0,
  });

  const [talents, setTalents] = useState<Talent[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const roles = [
    { value: "all", label: "All Roles" },
    { value: "frontend", label: "Frontend Developer" },
    { value: "backend", label: "Backend Developer" },
    { value: "fullstack", label: "Full Stack Developer" },
    { value: "designer", label: "Product Designer" },
    { value: "data", label: "Data Analyst" },
    { value: "devops", label: "DevOps Engineer" },
    { value: "marketing", label: "Marketing" },
  ];

  const experienceLevels = [
    { value: "", label: "Experience" },
    { value: "0-2", label: "0-2 Years" },
    { value: "3-5", label: "3-5 Years" },
    { value: "5-8", label: "5-8 Years" },
    { value: "8+", label: "8+ Years" },
  ];

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

    // Fetch talents from API
    const fetchTalents = async () => {
      try {
        const response = await fetch("/api/talents");
        const data = (await response.json()) as { talents?: TalentData[] };

        if (data.talents) {
          const transformedTalents: Talent[] = data.talents.map(
            (talent) => ({
              id: talent.id,
              name:
                talent.profile?.firstName && talent.profile?.lastName
                  ? `${talent.profile.firstName} ${talent.profile.lastName}`
                  : talent.name ?? "Unknown",
              title: talent.profile?.title ?? "No title",
              experience: talent.profile?.experience ?? "N/A",
              bio: talent.profile?.bio ?? "No bio available",
              skills: talent.profile?.skills ?? [],
              avatar: talent.image ?? undefined,
              isBookmarked: bookmarkedIds.has(talent.id),
              tier: talent.profile?.tier ?? "bronze",
              completedProjects: talent.profile?.completedProjects ?? 0,
              successRate: talent.profile?.successRate ?? 0,
              hourlyRate: talent.profile?.hourlyRate ?? null,
            })
          );

          setTalents(transformedTalents);
          setStats({
            totalCandidates: transformedTalents.length,
            newThisWeek: Math.min(transformedTalents.length, 5),
          });
        }
      } catch (error) {
        console.error("Error fetching talents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTalents();
  }, [session, status, router, bookmarkedIds]);

  const removeFilter = (filterId: string) => {
    setActiveFilters(activeFilters.filter((f) => f.id !== filterId));
  };

  const toggleBookmark = (talentId: string) => {
    setBookmarkedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(talentId)) {
        newSet.delete(talentId);
      } else {
        newSet.add(talentId);
      }
      return newSet;
    });
    setTalents(
      talents.map((t) => (t.id === talentId ? { ...t, isBookmarked: !t.isBookmarked } : t))
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredTalents = talents.filter((talent) => {
    const matchesSearch =
      searchQuery === "" ||
      talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Search and Filters Skeleton */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 animate-pulse">
            <div className="h-10 bg-gray-200 rounded-lg w-full mb-4"></div>
            <div className="flex space-x-2">
              <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-32 bg-gray-200 rounded-full"></div>
            </div>
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-6 h-72 animate-pulse"
              ></div>
            ))}
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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Talent Pool</h1>
            <p className="text-gray-600 mt-1">
              Discover, manage, and engage with top talent for your open roles.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                  {stats.totalCandidates.toLocaleString()}
                </span>{" "}
                Total Candidates
              </p>
              <p className="text-sm text-green-600 font-medium">+{stats.newThisWeek} this week</p>
            </div>
            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, skills, or job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center space-x-3">
              {/* Role Filter */}
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Skills Filter */}
              <div className="relative">
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Skills</option>
                  <option value="react">React</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="figma">Figma</option>
                  <option value="aws">AWS</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Experience Filter */}
              <div className="relative">
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {experienceLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 mt-4">
              {activeFilters.map((filter) => (
                <span
                  key={filter.id}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  <span>{filter.label}</span>
                  <button
                    onClick={() => removeFilter(filter.id)}
                    className="hover:text-gray-900 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Talent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTalents.map((talent) => (
            <div
              key={talent.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {talent.avatar ? (
                    <Image
                      src={talent.avatar}
                      alt={talent.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {getInitials(talent.name)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{talent.name}</h3>
                    <p className="text-sm text-gray-600">{talent.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleBookmark(talent.id)}
                  className={`p-1.5 rounded-lg transition ${
                    talent.isBookmarked
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {talent.isBookmarked ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Tier and Experience */}
              <div className="flex items-center space-x-4 mb-3 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span className="capitalize">{talent.tier}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{talent.experience}</span>
                </div>
                {talent.hourlyRate && (
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{talent.hourlyRate}/hr</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{talent.bio}</p>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-5">
                {talent.skills.map((skill, index) => (
                  <span
                    key={skill}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                      index === 0
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <Link
                  href={`/employer/talent-pool/${talent.id}`}
                  className="flex-1 px-4 py-2 text-center text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  View Profile
                </Link>
                <Link
                  href={`/employer/messages?to=${talent.id}`}
                  className="flex-1 px-4 py-2 text-center text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  Message
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Load More / Pagination */}
        <div className="mt-8 text-center">
          <button className="px-6 py-2.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition">
            Load More Candidates
          </button>
        </div>
      </div>
    </main>
  );
}
