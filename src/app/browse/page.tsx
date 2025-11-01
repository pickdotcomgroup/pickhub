"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Footer from "../_components/footer";

type BrowseCategory = "clients" | "developer" | "agencies";

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session } = useSession();
  const [activeCategory, setActiveCategory] = useState<BrowseCategory>("clients");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
      client: "Jhon doe",
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockClients: Client[] = [
    {
      id: "1",
      name: "TechStart Inc.",
      company: "TechStart Inc.",
      projectsPosted: 12,
      totalSpent: "$45,000",
      rating: 4.8,
      industry: "E-commerce"
    },
    {
      id: "2",
      name: "FitLife Solutions",
      company: "FitLife Solutions",
      projectsPosted: 8,
      totalSpent: "$28,000",
      rating: 4.9,
      industry: "Health & Fitness"
    },
    {
      id: "3",
      name: "DataCorp Analytics",
      company: "DataCorp Analytics",
      projectsPosted: 15,
      totalSpent: "$120,000",
      rating: 4.7,
      industry: "Data Science"
    }
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

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const filteredData = (): (Project | Talent | Agency)[] => {
    let data: (Project | Talent | Agency)[] = [];
    
    switch (activeCategory) {
      case "clients":
        data = mockProjects;
        break;
      case "developer":
        data = mockTalents;
        break;
      case "agencies":
        data = mockAgencies;
        break;
    }

    // Filter by search query
    if (searchQuery) {
      data = data.filter(item => {
        if (activeCategory === "clients") {
          const project = item as Project;
          return [project.title, project.description, project.client].some(field => 
            field.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else if (activeCategory === "developer") {
          const talent = item as Talent;
          return [talent.name, talent.title].some(field => 
            field.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else {
          const agency = item as Agency;
          return [agency.name, agency.description].some(field => 
            field.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
      });
    }

    // Filter by selected skills
    if (selectedSkills.length > 0) {
      data = data.filter(item => {
        const itemSkills = item.skills ?? [];
        return selectedSkills.some(skill => itemSkills.includes(skill));
      });
    }

    return data;
  };

  // Pagination logic
  const allFilteredData = filteredData();
  const totalPages = Math.ceil(allFilteredData.length / itemsPerPage);
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

  const handleSkillToggleWithReset = (skill: string) => {
    handleSkillToggle(skill);
    setCurrentPage(1);
  };

  const handlePick = (_category: string, _item: Project | Talent | Agency) => {
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
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Column Layout: Sidebar + Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 sticky top-8">
              {/* Category Toggles */}
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3">Browse Categories</h3>
                <div className="space-y-2">
                  {[
                    { key: "clients", label: "Clients", icon: "🏢" },
                    { key: "developer", label: "Developer", icon: "👨‍💻" },
                    { key: "agencies", label: "Agencies", icon: "🏛️" }
                  ].map(({ key, label, icon }) => (
                    <button
                      key={key}
                      onClick={() => handleCategoryChange(key as BrowseCategory)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition ${
                        activeCategory === key
                          ? "bg-purple-600 text-white"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      }`}
                    >
                      <span className="text-xl">{icon}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3">Search</h3>
                <input
                  type="text"
                  placeholder={`Search ${activeCategory}...`}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Skills Filter */}
              <div>
                <h3 className="text-white font-semibold mb-3">Filter by Skills</h3>
                <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto">
                  {skillOptions.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => handleSkillToggleWithReset(skill)}
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
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedData.map((item) => (
            <div
              key={item.id}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300"
            >
              {activeCategory === "clients" && (() => {
                const project = item as Project;
                return (
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
                      <p className="text-gray-300 mb-3">{project.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                        <span>💰 {project.budget}</span>
                        <span>🏢 {project.client}</span>
                        <span>📅 {project.postedDate}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handlePick('project', item)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
                    >
                      Pick
                    </button>
                  </div>
                );
              })()}

              {activeCategory === "developer" && (() => {
                const talent = item as Talent;
                return (
                  <div className="flex flex-col h-full">
                    <div className="flex items-start space-x-4 flex-1 mb-4">
                      <div className="text-4xl">{talent.avatar}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-semibold text-white">{talent.name}</h3>
                            <p className="text-purple-300">{talent.title}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1 mb-1">
                              {renderStars(talent.rating)}
                              <span className="text-gray-300 text-sm">({talent.rating})</span>
                            </div>
                            <p className="text-green-400 font-semibold">{talent.hourlyRate}</p>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{talent.experience} experience</p>
                        <div className="flex flex-wrap gap-2">
                          {talent.skills.map((skill: string) => (
                            <span
                              key={skill}
                              className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePick('talent', item)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
                    >
                      Pick
                    </button>
                  </div>
                );
              })()}

              {activeCategory === "agencies" && (() => {
                const agency = item as Agency;
                return (
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white">{agency.name}</h3>
                          <p className="text-gray-300 mb-2">{agency.description}</p>
                          <p className="text-gray-400 text-sm">Team Size: {agency.teamSize}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 mb-1">
                            {renderStars(agency.rating)}
                            <span className="text-gray-300 text-sm">({agency.rating})</span>
                          </div>
                          <p className="text-gray-400 text-sm">{agency.projectsCompleted} projects completed</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {agency.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handlePick('agency', item)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
                    >
                      Pick
                    </button>
                  </div>
                );
              })()}
            </div>
              ))}

              {allFilteredData.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-semibold text-white mb-2">No results found</h3>
                  <p className="text-gray-300">Try adjusting your search or filters</p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {allFilteredData.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    currentPage === 1
                      ? "bg-white/5 text-gray-500 cursor-not-allowed"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  Previous
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        currentPage === page
                          ? "bg-purple-600 text-white"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    currentPage === totalPages
                      ? "bg-white/5 text-gray-500 cursor-not-allowed"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  Next
                </button>
              </div>
            )}

            {/* Results Info */}
            {allFilteredData.length > 0 && (
              <div className="mt-4 text-center text-gray-400 text-sm">
                Showing {startIndex + 1}-{Math.min(endIndex, allFilteredData.length)} of {allFilteredData.length} results
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
