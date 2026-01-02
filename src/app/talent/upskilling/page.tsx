"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Star, ChevronDown, SlidersHorizontal, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Provider {
  id: string;
  name: string;
  category: string;
  rating: number;
  description: string;
  skills: string[];
  courseCount: number;
  courseType: string;
  logo: string;
  logoColor: string;
}

const providers: Provider[] = [
  {
    id: "1",
    name: "Microsoft Learn",
    category: "Cloud & Infrastructure",
    rating: 4.9,
    description: "Master Azure cloud services, .NET development, and enterprise solutions...",
    skills: ["Azure", "DevOps", ".NET"],
    courseCount: 142,
    courseType: "Courses",
    logo: "/logos/microsoft.svg",
    logoColor: "bg-blue-100",
  },
  {
    id: "2",
    name: "Netflix Engineering",
    category: "System Design",
    rating: 4.8,
    description: "Deep dive into microservices, chaos engineering, and high-scale...",
    skills: ["Microservices", "Java", "Scale"],
    courseCount: 28,
    courseType: "Workshops",
    logo: "/logos/netflix.svg",
    logoColor: "bg-red-100",
  },
  {
    id: "3",
    name: "CodeMaster Pro",
    category: "Full Stack Dev",
    rating: 4.7,
    description: "Intensive bootcamps for modern web development. Learn to build complete...",
    skills: ["React", "Node.js", "SQL"],
    courseCount: 56,
    courseType: "Courses",
    logo: "/logos/codemaster.svg",
    logoColor: "bg-green-100",
  },
  {
    id: "4",
    name: "Design Academy",
    category: "UI/UX & Product",
    rating: 4.9,
    description: "Learn user-centered design, prototyping, and design systems for...",
    skills: ["Figma", "UI/UX", "Prototyping"],
    courseCount: 34,
    courseType: "Courses",
    logo: "/logos/design.svg",
    logoColor: "bg-pink-100",
  },
  {
    id: "5",
    name: "DataWizards",
    category: "Data Science & AI",
    rating: 4.6,
    description: "Comprehensive data science tracks covering Python, Machine Learning,...",
    skills: ["Python", "ML", "Pandas"],
    courseCount: 41,
    courseType: "Courses",
    logo: "/logos/datawizards.svg",
    logoColor: "bg-teal-100",
  },
  {
    id: "6",
    name: "SecurNet Labs",
    category: "Cybersecurity",
    rating: 4.8,
    description: "Hands-on training in ethical hacking, network defense, and security...",
    skills: ["Ethical Hacking", "Network"],
    courseCount: 19,
    courseType: "Courses",
    logo: "/logos/securnet.svg",
    logoColor: "bg-orange-100",
  },
];

// Provider logo component with fallback icons
function ProviderLogo({ provider }: { provider: Provider }) {
  const logoIcons: Record<string, React.ReactNode> = {
    "Microsoft Learn": (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
        <rect x="1" y="1" width="10" height="10" fill="#f25022" />
        <rect x="13" y="1" width="10" height="10" fill="#7fba00" />
        <rect x="1" y="13" width="10" height="10" fill="#00a4ef" />
        <rect x="13" y="13" width="10" height="10" fill="#ffb900" />
      </svg>
    ),
    "Netflix Engineering": (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#E50914">
        <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24h-4.715zm8.489 0v9.63L18.6 24h-4.714V0h.001zm-8.487 0c-.024 0 0 24 0 24h4.714l-.002-9.63L5.4 0z"/>
      </svg>
    ),
    "CodeMaster Pro": (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="#22c55e" strokeWidth="2">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    "Design Academy": (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="#ec4899" strokeWidth="2">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
    "DataWizards": (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="#14b8a6" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    "SecurNet Labs": (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="#f97316" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  };

  return (
    <div className={`w-12 h-12 ${provider.logoColor} rounded-lg flex items-center justify-center`}>
      {logoIcons[provider.name] ?? <BookOpen className="w-6 h-6 text-gray-500" />}
    </div>
  );
}

export default function TalentUpskillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory] = useState("All Categories");
  const [selectedSkills] = useState("Skills");
  const [selectedRating] = useState("Rating");

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

    // Check verification status
    const checkVerification = async () => {
      try {
        const response = await fetch("/api/verification/status");
        if (response.ok) {
          const data = await response.json() as { platformAccess?: boolean };
          if (!data.platformAccess) {
            router.push("/talent/verification");
            return;
          }
        }
      } catch (error) {
        console.error("Error checking verification:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void checkVerification();
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-72 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upskilling Marketplace</h1>
          <p className="text-gray-600">Connect with top training providers and accelerate your career growth.</p>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-8">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search providers, skills, or specific courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition min-w-[160px]">
              <span className="text-gray-700">{selectedCategory}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
            </button>
          </div>

          {/* Skills Filter */}
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition min-w-[120px]">
              <span className="text-gray-700">{selectedSkills}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
            </button>
          </div>

          {/* Rating Filter */}
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition min-w-[100px]">
              <span className="text-gray-700">{selectedRating}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
            </button>
          </div>

          {/* More Filters */}
          <button className="p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition">
            <SlidersHorizontal className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Provider Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Provider Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <ProviderLogo provider={provider} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                    <p className="text-sm text-gray-500">{provider.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md">
                  <Star className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                  <span className="text-sm font-medium text-blue-600">{provider.rating}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{provider.description}</p>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {provider.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-500">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">{provider.courseCount} {provider.courseType}</span>
                </div>
                <Link
                  href={`/talent/upskilling/provider/${provider.id}`}
                  className="flex items-center gap-1 text-blue-600 font-medium text-sm hover:text-blue-700 transition"
                >
                  View Profile
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
