"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type BrowseCategory = "projects" | "talents" | "agencies";

interface Project {
  id: string;
  title: string;
  description: string;
  budget: string;
  skills: string[];
  client: string;
  postedDate: string;
  category: string;
}

interface Talent {
  id: string;
  name: string;
  title: string;
  skills: string[];
  experience: string;
  rating: number;
  hourlyRate: string;
  avatar: string;
}

interface Client {
  id: string;
  name: string;
  company: string;
  projectsPosted: number;
  totalSpent: string;
  rating: number;
  industry: string;
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

export default function BrowsePage() {
  const { data: session } = useSession();
  const [activeCategory, setActiveCategory] = useState<BrowseCategory>("projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const skillOptions = [
    "React", "Next.js", "TypeScript", "JavaScript", "Python", "Node.js",
    "PHP", "Laravel", "WordPress", "Shopify", "UI/UX Design", "Graphic Design",
    "Mobile Development", "DevOps", "Data Science", "Machine Learning",
    "Vue.js", "Angular", "Flutter", "React Native", "AWS", "Docker"
  ];

  // Mock data - in a real app, this would come from your API
  const mockProjects: Project[] = [
    {
      id: "1",
      title: "E-commerce Website Development",
      description: "Looking for a skilled developer to build a modern e-commerce platform with React and Node.js. Must have experience with payment integration and responsive design.",
      budget: "$5,000 - $10,000",
      skills: ["React", "Node.js", "TypeScript", "E-commerce"],
      client: "TechStart Inc.",
      postedDate: "2 days ago",
      category: "Web Development"
    },
    {
      id: "2",
      title: "Mobile App UI/UX Design",
      description: "Need a creative designer to design a mobile app interface for a fitness tracking application. Looking for modern, clean design with great user experience.",
      budget: "$2,000 - $4,000",
      skills: ["UI/UX Design", "Mobile Design", "Figma", "Prototyping"],
      client: "FitLife Solutions",
      postedDate: "1 day ago",
      category: "Design"
    },
    {
      id: "3",
      title: "Data Analytics Dashboard",
      description: "Seeking a data scientist to create an analytics dashboard using Python and machine learning algorithms for business intelligence.",
      budget: "$8,000 - $15,000",
      skills: ["Python", "Data Science", "Machine Learning", "Dashboard"],
      client: "DataCorp Analytics",
      postedDate: "3 days ago",
      category: "Data Science"
    }
  ];

  const mockTalents: Talent[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      title: "Full Stack Developer",
      skills: ["React", "Node.js", "TypeScript", "AWS"],
      experience: "5+ years",
      rating: 4.9,
      hourlyRate: "$75/hr",
      avatar: "👩‍💻"
    },
    {
      id: "2",
      name: "Mike Chen",
      title: "UI/UX Designer",
      skills: ["UI/UX Design", "Figma", "Prototyping", "Mobile Design"],
      experience: "4+ years",
      rating: 4.8,
      hourlyRate: "$60/hr",
      avatar: "👨‍🎨"
    },
    {
      id: "3",
      name: "Alex Rodriguez",
      title: "Data Scientist",
      skills: ["Python", "Machine Learning", "Data Science", "TensorFlow"],
      experience: "6+ years",
      rating: 4.9,
      hourlyRate: "$90/hr",
      avatar: "👨‍🔬"
    }
  ];

  const mockClients: Client[] = [];

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

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const filteredData = () => {
    let data: any[] = [];
    
    switch (activeCategory) {
      case "projects":
        data = mockProjects;
        break;
      case "talents":
        data = mockTalents;
        break;
      case "agencies":
        data = mockAgencies;
        break;
    }

    // Filter by search query
    if (searchQuery) {
      data = data.filter(item => {
        const searchFields = activeCategory === "projects" 
          ? [item.title, item.description, item.client]
          : activeCategory === "talents"
          ? [item.name, item.title]
          : [item.name, item.description];
        
        return searchFields.some(field => 
          field.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Filter by selected skills
    if (selectedSkills.length > 0) {
      data = data.filter(item => {
        const itemSkills = item.skills || [];
        return selectedSkills.some(skill => itemSkills.includes(skill));
      });
    }

    return data;
  };

  const handlePick = (category: string, item: any) => {
    // Handle pick action - could redirect to auth if not logged in, or show a modal
    if (!session?.user) {
      // Redirect to auth page if not logged in
      window.location.href = '/auth';
    } else {
      // Handle pick action for authenticated users
      console.log(`Picked ${category}:`, item);
      // You could show a modal, redirect to a detailed page, or add to favorites
      alert(`You picked: ${item.title || item.name}`);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-400'}`}>
        ★
      </span>
    ));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/onboarding" className="text-2xl font-bold text-white">
              <span className="text-purple-400">Pick</span>Hub
            </Link>
            <div className="flex items-center space-x-4">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Explore IT Opportunities
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover projects, talents, clients, and agencies in the IT industry. 
            Browse freely and find your perfect match.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center mb-8">
          {[
            { key: "projects", label: "Projects", icon: "💼" },
            { key: "talents", label: "Talents", icon: "👨‍💻" },
            { key: "agencies", label: "Agencies", icon: "🏛️" }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key as BrowseCategory)}
              className={`flex items-center space-x-2 px-6 py-3 m-1 rounded-lg font-semibold transition ${
                activeCategory === key
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder={`Search ${activeCategory}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Skills Filter */}
          <div>
            <h3 className="text-white font-semibold mb-3">Filter by Skills:</h3>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    selectedSkills.includes(skill)
                      ? "bg-purple-600 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            {selectedSkills.length > 0 && (
              <button
                onClick={() => setSelectedSkills([])}
                className="mt-3 text-purple-400 hover:text-purple-300 text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="grid gap-6">
          {filteredData().map((item) => (
            <div
              key={item.id}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300"
            >
              {activeCategory === "projects" && (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-300 mb-3">{item.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>💰 {item.budget}</span>
                        <span>🏢 {item.client}</span>
                        <span>📅 {item.postedDate}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePick('project', item)}
                      className="ml-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 flex-shrink-0"
                    >
                      Pick
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeCategory === "talents" && (
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{item.avatar}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                        <p className="text-purple-300">{item.title}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          {renderStars(item.rating)}
                          <span className="text-gray-300 text-sm">({item.rating})</span>
                        </div>
                        <p className="text-green-400 font-semibold">{item.hourlyRate}</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{item.experience} experience</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handlePick('talent', item)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
                      >
                        Pick
                      </button>
                    </div>
                  </div>
                </div>
              )}


              {activeCategory === "agencies" && (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                      <p className="text-gray-300 mb-2">{item.description}</p>
                      <p className="text-gray-400 text-sm">Team Size: {item.teamSize}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        {renderStars(item.rating)}
                        <span className="text-gray-300 text-sm">({item.rating})</span>
                      </div>
                      <p className="text-gray-400 text-sm">{item.projectsCompleted} projects completed</p>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex flex-wrap gap-2">
                      {item.skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handlePick('agency', item)}
                      className="ml-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 flex-shrink-0"
                    >
                      Pick
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredData().length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-white mb-2">No results found</h3>
            <p className="text-gray-300">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Professional Signup Section */}
        <div className="mt-16 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Join as a Professional
            </h2>
            <p className="text-xl text-gray-300">
              Choose your professional path and start building your career on PickHub
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Client Professional Signup */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-blue-400/50 transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🏢</div>
                <h3 className="text-xl font-bold text-white mb-2">Join as Client</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Post projects and hire top talent for your business needs
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
                <h3 className="text-xl font-bold text-white mb-2">Join as Talent</h3>
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
                Sign Up as Talent
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
                href="/auth"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/auth"
                className="bg-transparent border-2 border-purple-400 hover:bg-purple-400/10 text-purple-400 font-semibold py-3 px-8 rounded-lg transition duration-200"
              >
                General Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
