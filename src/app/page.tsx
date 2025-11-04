"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Footer from "./_components/footer";

type BrowseCategory = "clients" | "developer" | "agencies";

interface Project {
  id: string;
  title: string;
  description: string;
  budget: string | number;
  skills: string[];
  client?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  postedDate?: string;
  category: string;
  createdAt?: string;
}

interface Talent {
  id: string;
  name: string | null;
  title?: string;
  skills?: string[];
  experience?: string;
  rating?: number;
  hourlyRate?: string;
  avatar?: string;
  image?: string | null;
  profile?: {
    firstName: string;
    lastName: string;
    title: string;
    skills: string[];
    experience: string;
    hourlyRate: string | null;
  } | null;
}

interface Agency {
  id: string;
  name: string;
  description: string;
  teamSize: string;
  skills: string[];
  projectsCompleted: number;
  rating: number;
}


export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<BrowseCategory>("clients");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [projects, setProjects] = useState<Project[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch projects and talents
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);

        // Fetch projects
        const projectsRes = await fetch('/api/projects');
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json() as { projects: Project[] };
          setProjects(projectsData.projects ?? []);
        }

        // Fetch talents
        const talentsRes = await fetch('/api/talents');
        if (talentsRes.ok) {
          const talentsData = await talentsRes.json() as { talents: Talent[] };
          setTalents(talentsData.talents ?? []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    void fetchData();
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (session?.user.role === "client") {
      router.push("/client/dashboard");
    } else if (session?.user.role === "talent") {
      router.push("/talent/dashboard");
    } else if (session?.user.role === "agency") {
      router.push("/agency/dashboard");
    } else if (session?.user.role === "admin") {
      router.push("/admin/dashboard");
    }
  }, [session, router]);

  const categoryOptions = [
    "Web Designer", "UI/UX Designer", "Framer Designer", "Webflow Designer",
    "Product Designer", "Design System", "Figma", "Figjam"
  ];

  const experienceOptions = [
    { label: "Entry level", count: 1028 },
    { label: "Intermediate", count: 902 },
    { label: "Expert", count: 106 }
  ];

  const jobTypeOptions = [
    { label: "Full-time job", count: 620 },
    { label: "Part-time job", count: 232 },
    { label: "Remote", count: 1872 },
    { label: "Freelance", count: 1121 }
  ];
  const mockAgencies: Agency[] = [
    {
      id: "1",
      name: "Digital Innovations Agency",
      description: "Full-service digital agency specializing in web development, mobile apps, and digital marketing solutions.",
      teamSize: "15-25 people",
      skills: ["React", "Node.js", "Mobile Development", "UI/UX Design"],
      projectsCompleted: 150,
      rating: 4.8
    },
    {
      id: "2",
      name: "CodeCraft Solutions",
      description: "Expert software development team focused on enterprise solutions and custom web applications.",
      teamSize: "10-15 people",
      skills: ["Python", "JavaScript", "AWS", "DevOps"],
      projectsCompleted: 89,
      rating: 4.9
    },
    {
      id: "3",
      name: "Creative Tech Studio",
      description: "Design-focused agency creating beautiful and functional digital experiences for modern businesses.",
      teamSize: "8-12 people",
      skills: ["UI/UX Design", "React", "Branding", "Mobile Design"],
      projectsCompleted: 120,
      rating: 4.7
    }
  ];

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleExperienceToggle = (experience: string) => {
    setSelectedExperience(prev =>
      prev.includes(experience)
        ? prev.filter(e => e !== experience)
        : [...prev, experience]
    );
  };

  const handleJobTypeToggle = (jobType: string) => {
    setSelectedJobTypes(prev =>
      prev.includes(jobType)
        ? prev.filter(j => j !== jobType)
        : [...prev, jobType]
    );
  };

  type FilteredProject = {
    id: string;
    title: string;
    description: string;
    budget: string;
    skills: string[];
    client: string;
    postedDate: string;
    category: string;
  };

  type FilteredTalent = {
    id: string;
    name: string;
    title: string;
    skills: string[];
    experience: string;
    rating: number;
    hourlyRate: string;
    avatar: string;
  };

  const filteredData = (): (FilteredProject | FilteredTalent | Agency)[] => {
    let data: (FilteredProject | FilteredTalent | Agency)[] = [];

    switch (activeCategory) {
      case "clients":
        data = projects.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          budget: `$${p.budget}`,
          skills: p.skills,
          client: p.client?.name ?? 'Unknown Client',
          postedDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recently',
          category: p.category
        }));
        break;
      case "developer":
        data = talents.map(t => ({
          id: t.id,
          name: t.profile ? `${t.profile.firstName} ${t.profile.lastName}` : t.name ?? 'Unknown',
          title: t.profile?.title ?? 'Professional',
          skills: t.profile?.skills ?? [],
          experience: t.profile?.experience ?? 'Not specified',
          rating: 4.5,
          hourlyRate: t.profile?.hourlyRate ?? 'Not specified',
          avatar: t.image ?? '👤'
        }));
        break;
      case "agencies":
        data = mockAgencies;
        break;
    }

    // Filter by search query
    if (searchQuery) {
      data = data.filter(item => {
        if (activeCategory === "clients") {
          const project = item as FilteredProject;
          return [project.title, project.description, project.client].some(field =>
            field?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else if (activeCategory === "developer") {
          const talent = item as FilteredTalent;
          return [talent.name, talent.title].some(field =>
            field?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else {
          const agency = item as Agency;
          return [agency.name, agency.description].some(field =>
            field?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
      });
    }

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      data = data.filter(item => {
        const itemSkills = item.skills ?? [];
        return selectedCategories.some(category => itemSkills.includes(category));
      });
    }

    // Filter by selected experience
    if (selectedExperience.length > 0 && activeCategory === "developer") {
      data = data.filter(item => {
        const talent = item as FilteredTalent;
        return selectedExperience.some(exp => talent.experience?.includes(exp));
      });
    }

    // Filter by selected job types
    if (selectedJobTypes.length > 0) {
      // This would need additional data in the mock data to filter properly
      // For now, we'll just return the data as is
    }

    return data;
  };

  // Pagination logic
  const allFilteredData = filteredData();
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = allFilteredData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleCategoryChange = (category: BrowseCategory) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePick = (_category: string, _item: FilteredProject | FilteredTalent | Agency) => {
    // Show join modal when pick button is clicked
    setShowJoinModal(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-400'}`}>
        ★
      </span>
    ));
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center gap-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            <span className="text-purple-400">TechPick</span>Hub
          </h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
        </div>
      </main>
    );
  }

  // If authenticated, will redirect via useEffect
  if (session?.user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Join TechPickHub</h2>
              <button
                onClick={() => setShowJoinModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <p className="text-xl text-gray-300 text-center mb-8">
              Choose your professional path to get started
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Client Professional Signup */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-blue-400/50 transition-all duration-300">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-3">🏢</div>
                  <h3 className="text-xl font-bold text-white mb-2">Join as Client</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Post projects and hire top Developers for your business needs
                  </p>
                </div>
                <ul className="text-sm text-gray-400 space-y-2 mb-6">
                  <li>• Post unlimited projects</li>
                  <li>• Access to verified professionals</li>
                  <li>• Project management tools</li>
                  <li>• Secure payment system</li>
                </ul>
                <Link
                  href="/auth?type=client"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 block text-center"
                >
                  Sign Up as Client
                </Link>
              </div>

              {/* Talent Professional Signup */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-green-400/50 transition-all duration-300">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-3">👨‍💻</div>
                  <h3 className="text-xl font-bold text-white mb-2">Join as Developer</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Showcase your skills and find exciting freelance opportunities
                  </p>
                </div>
                <ul className="text-sm text-gray-400 space-y-2 mb-6">
                  <li>• Create professional profile</li>
                  <li>• Bid on quality projects</li>
                  <li>• Build your reputation</li>
                  <li>• Secure payment guarantee</li>
                </ul>
                <Link
                  href="/auth?type=talent"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 block text-center"
                >
                  Sign Up as Developer
                </Link>
              </div>

              {/* Agency Professional Signup */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-indigo-400/50 transition-all duration-300">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-3">🏛️</div>
                  <h3 className="text-xl font-bold text-white mb-2">Join as Agency</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Scale your business and manage multiple client relationships
                  </p>
                </div>
                <ul className="text-sm text-gray-400 space-y-2 mb-6">
                  <li>• Team collaboration tools</li>
                  <li>• Multi-project management</li>
                  <li>• Client relationship tools</li>
                  <li>• Advanced analytics</li>
                </ul>
                <Link
                  href="/auth?type=agency"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 block text-center"
                >
                  Sign Up as Agency
                </Link>
              </div>
            </div>

            {/* General CTA */}
            <div className="text-center border-t border-white/10 pt-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Already have an account?
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signin"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900/40 via-purple-800/40 to-purple-900/40 py-8 sm:py-12 md:py-16 border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            The #1 IT development marketplace that connects<br className="hidden sm:block" />Clients, Developers, and Agencies
          </h1>
          <p className="text-base sm:text-md md:text-lg text-gray-300 mb-6 sm:mb-8">
            Whether you're a Client seeking top Developers, a Developer looking for exciting projects, or an Agency ready to scale, <br className="hidden sm:block" />browse the latest opportunities and pick your next collaboration!
          </p>

          {/* Toggle Button for Browse Categories */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="inline-flex bg-purple-900/30 backdrop-blur-sm rounded-lg p-1 border border-purple-500/30 w-full sm:w-auto">
              <button
                onClick={() => handleCategoryChange("clients")}
                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base flex-1 sm:flex-initial ${activeCategory === "clients"
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:text-white"
                  }`}
              >
                Client Projects
              </button>
              <button
                onClick={() => handleCategoryChange("developer")}
                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base flex-1 sm:flex-initial ${activeCategory === "developer"
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:text-white"
                  }`}
              >
                Developers
              </button>
              <button
                onClick={() => handleCategoryChange("agencies")}
                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base flex-1 sm:flex-initial ${activeCategory === "agencies"
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:text-white"
                  }`}
              >
                Agencies
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={
                  activeCategory === "clients"
                    ? "Search projects (e.g., Web Designer, UI/UX)"
                    : activeCategory === "developer"
                      ? "Search developers (e.g., Full Stack, Designer)"
                      : "Search agencies (e.g., Digital Agency, Development)"
                }
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-12 py-4 bg-purple-900/30 backdrop-blur-sm border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  ×
                </button>
              )}
            </div>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold transition text-sm sm:text-base">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-300">
            {dataLoading ? 'Loading...' : `Showing results (${allFilteredData.length})`}
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-white text-sm sm:text-base">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/10 text-white px-3 sm:px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base flex-1 sm:flex-initial"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="budget-high">Budget: High to Low</option>
              <option value="budget-low">Budget: Low to High</option>
            </select>
          </div>
        </div>

        {/* Column Layout: Main Content + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area */}
          <div className="flex-1">

            {/* Results */}
            <div className="space-y-4">
              {dataLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                  <span className="ml-3 text-white">Loading data...</span>
                </div>
              ) : paginatedData.length === 0 ? (
                <div className="text-center py-12 bg-purple-900/20 backdrop-blur-sm rounded-xl border border-purple-500/30">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-semibold text-white mb-2">No results found</h3>
                  <p className="text-gray-400">Try adjusting your search or filters</p>
                </div>
              ) : paginatedData.map((item) => {
                if (activeCategory === "clients") {
                  const project = item as FilteredProject;
                  return (
                    <div
                      key={item.id}
                      className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0">
                            {project.client.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{project.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-300 mb-3">
                              <span className="flex items-center gap-1">
                                <span className="font-semibold text-white">
                                  {project.client}
                                </span>
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-green-400">Payment verified</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                Remote
                              </span>
                              <span className="bg-purple-800/40 px-3 py-1 rounded-full text-purple-200">
                                120 applicants
                              </span>
                            </div>
                            <p className="text-sm sm:text-base text-gray-300 mb-4">{project.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {project.skills.map((skill: string) => (
                                <span
                                  key={skill}
                                  className="px-3 py-1.5 bg-purple-800/40 text-purple-200 rounded-md text-sm font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-300">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {project.budget}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                25 proposal
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handlePick('project', item)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition w-full sm:w-auto text-sm sm:text-base"
                        >
                          Pick
                        </button>
                      </div>
                    </div>
                  );
                } else if (activeCategory === "developer") {
                  const talent = item as FilteredTalent;
                  return (
                    <div
                      key={item.id}
                      className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white text-2xl">
                            {talent.avatar}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white mb-2">{talent.name}</h3>
                            <p className="text-gray-300 mb-3">{talent.title}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
                              <span className="flex items-center gap-1">
                                {renderStars(talent.rating || 4.5)}
                                <span className="ml-1 font-semibold text-white">{talent.rating || 4.5}</span>
                              </span>
                              <span>{talent.experience || 'Not specified'} experience</span>
                              <span className="font-semibold text-white">{talent.hourlyRate || 'Not specified'}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(talent.skills || []).map((skill: string) => (
                                <span
                                  key={skill}
                                  className="px-3 py-1.5 bg-purple-800/40 text-purple-200 rounded-md text-sm font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handlePick('talent', item)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                        >
                          Pick
                        </button>
                      </div>
                    </div>
                  );
                } else {
                  const agency = item as Agency;
                  return (
                    <div
                      key={item.id}
                      className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            {agency.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white mb-2">{agency.name}</h3>
                            <p className="text-gray-300 mb-3">{agency.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
                              <span className="flex items-center gap-1">
                                {renderStars(agency.rating)}
                                <span className="ml-1 font-semibold text-white">{agency.rating}</span>
                              </span>
                              <span>{agency.teamSize}</span>
                              <span>{agency.projectsCompleted} projects completed</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {agency.skills.map((skill: string) => (
                                <span
                                  key={skill}
                                  className="px-3 py-1.5 bg-purple-800/40 text-purple-200 rounded-md text-sm font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handlePick('agency', item)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                        >
                          Pick
                        </button>
                      </div>
                    </div>
                  );
                }
              })}

            </div>
          </div>

          {/* Right Sidebar - Filters */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Filter</h3>
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedExperience([]);
                    setSelectedJobTypes([]);
                    setPriceRange("");
                  }}
                  className="text-purple-400 hover:text-purple-300 font-semibold text-sm"
                >
                  Reset
                </button>
              </div>

              {/* Categories Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-white mb-3">Categories</h4>
                <select
                  className="w-full px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleCategoryToggle(e.target.value);
                    }
                  }}
                  value=""
                >
                  <option value="" className="bg-slate-800">Select categories</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category} className="bg-slate-800">
                      {category}
                    </option>
                  ))}
                </select>
                {selectedCategories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedCategories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-800/40 text-purple-200 rounded-full text-sm"
                      >
                        {category}
                        <button
                          onClick={() => handleCategoryToggle(category)}
                          className="hover:text-purple-100"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Experience Level Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-white mb-3">Experience level</h4>
                <div className="space-y-2">
                  {experienceOptions.map((option) => (
                    <label key={option.label} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedExperience.includes(option.label)}
                          onChange={() => handleExperienceToggle(option.label)}
                          className="w-4 h-4 text-purple-600 border-purple-500/30 rounded focus:ring-purple-500"
                        />
                        <span className="text-gray-300">{option.label}</span>
                      </div>
                      <span className="text-gray-400 text-sm">{option.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Job Type Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-white mb-3">Job type</h4>
                <div className="space-y-2">
                  {jobTypeOptions.map((option) => (
                    <label key={option.label} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedJobTypes.includes(option.label)}
                          onChange={() => handleJobTypeToggle(option.label)}
                          className="w-4 h-4 text-purple-600 border-purple-500/30 rounded focus:ring-purple-500"
                        />
                        <span className="text-gray-300">{option.label}</span>
                      </div>
                      <span className="text-gray-400 text-sm">{option.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h4 className="font-semibold text-white mb-3">Price range</h4>
                <input
                  type="text"
                  placeholder="Enter fixed price"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
