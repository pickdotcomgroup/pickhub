"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type UserRole = "client" | "developer" | "agency";

interface OnboardingData {
  role: UserRole | null;
  companyName?: string;
  skills?: string[];
  experience?: string;
  projectTypes?: string[];
  budget?: string;
  teamSize?: string;
}

const skillOptions = [
  "React", "Next.js", "TypeScript", "JavaScript", "Python", "Node.js",
  "PHP", "Laravel", "WordPress", "Shopify", "UI/UX Design", "Graphic Design",
  "Mobile Development", "DevOps", "Data Science", "Machine Learning"
];

const projectTypeOptions = [
  "Web Development", "Mobile Apps", "E-commerce", "SaaS", "Landing Pages",
  "UI/UX Design", "Branding", "Content Writing", "SEO", "Digital Marketing"
];

export default function ProfileSetupPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    role: null,
    skills: [],
    projectTypes: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setData(prev => ({ ...prev, role }));
    setStep(2);
  };

  const handleSkillToggle = (skill: string) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills?.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...(prev.skills || []), skill]
    }));
  };

  const handleProjectTypeToggle = (projectType: string) => {
    setData(prev => ({
      ...prev,
      projectTypes: prev.projectTypes?.includes(projectType)
        ? prev.projectTypes.filter(p => p !== projectType)
        : [...(prev.projectTypes || []), projectType]
    }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    // Here you would typically save the onboarding data to your database
    // For now, we'll just simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Redirect to dashboard based on role
    router.push("/dashboard");
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case "client":
        return "Find and hire talented freelancers for your projects";
      case "developer":
        return "Discover exciting projects and grow your freelance career";
      case "agency":
        return "Connect with clients and manage multiple developer relationships";
      default:
        return "";
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "client":
        return "🏢";
      case "developer":
        return "👨‍💻";
      case "agency":
        return "🏛️";
      default:
        return "";
    }
  };

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please sign in to continue</h1>
          <Link
            href="/auth"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Go to Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Complete Your <span className="text-purple-400">PickHub</span> Profile
          </h1>
          <p className="text-gray-300">Let's set up your profile to get started</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 1 ? "bg-purple-600 text-white" : "bg-gray-600 text-gray-300"
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? "bg-purple-600" : "bg-gray-600"}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 2 ? "bg-purple-600 text-white" : "bg-gray-600 text-gray-300"
            }`}>
              2
            </div>
          </div>
          <div className="flex justify-center mt-2 space-x-8">
            <span className="text-sm text-gray-300">Choose Role</span>
            <span className="text-sm text-gray-300">Setup Profile</span>
          </div>
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              What best describes you?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Client Card */}
              <button
                onClick={() => handleRoleSelect("client")}
                className="group p-6 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-purple-400 rounded-xl transition-all duration-200 text-left"
              >
                <div className="text-4xl mb-4">{getRoleIcon("client")}</div>
                <h3 className="text-xl font-semibold text-white mb-2">Client</h3>
                <p className="text-gray-300 text-sm mb-4">
                  {getRoleDescription("client")}
                </p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Post project requirements</li>
                  <li>• Browse freelancer profiles</li>
                  <li>• Manage project timelines</li>
                  <li>• Handle payments securely</li>
                </ul>
              </button>

              {/* Developer Card */}
              <button
                onClick={() => handleRoleSelect("developer")}
                className="group p-6 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-purple-400 rounded-xl transition-all duration-200 text-left"
              >
                <div className="text-4xl mb-4">{getRoleIcon("developer")}</div>
                <h3 className="text-xl font-semibold text-white mb-2">Developer</h3>
                <p className="text-gray-300 text-sm mb-4">
                  {getRoleDescription("developer")}
                </p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Browse available projects</li>
                  <li>• Showcase your portfolio</li>
                  <li>• Track project progress</li>
                  <li>• Receive secure payments</li>
                </ul>
              </button>

              {/* Agency Card */}
              <button
                onClick={() => handleRoleSelect("agency")}
                className="group p-6 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-purple-400 rounded-xl transition-all duration-200 text-left"
              >
                <div className="text-4xl mb-4">{getRoleIcon("agency")}</div>
                <h3 className="text-xl font-semibold text-white mb-2">Agency</h3>
                <p className="text-gray-300 text-sm mb-4">
                  {getRoleDescription("agency")}
                </p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Manage multiple clients</li>
                  <li>• Coordinate developer teams</li>
                  <li>• Oversee project delivery</li>
                  <li>• Scale your business</li>
                </ul>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Profile Setup */}
        {step === 2 && data.role && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{getRoleIcon(data.role)}</div>
              <h2 className="text-2xl font-bold text-white">
                Set up your {data.role} profile
              </h2>
              <p className="text-gray-300">{getRoleDescription(data.role)}</p>
            </div>

            <div className="space-y-6">
              {/* Company/Agency Name */}
              {(data.role === "client" || data.role === "agency") && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    {data.role === "client" ? "Company Name" : "Agency Name"}
                  </label>
                  <input
                    type="text"
                    value={data.companyName || ""}
                    onChange={(e) => setData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={`Enter your ${data.role === "client" ? "company" : "agency"} name`}
                  />
                </div>
              )}

              {/* Skills (Developer/Agency) */}
              {(data.role === "developer" || data.role === "agency") && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Skills & Technologies
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {skillOptions.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleSkillToggle(skill)}
                        className={`px-3 py-2 rounded-lg text-sm transition ${
                          data.skills?.includes(skill)
                            ? "bg-purple-600 text-white"
                            : "bg-white/10 text-gray-300 hover:bg-white/20"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience Level (Developer) */}
              {data.role === "developer" && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={data.experience || ""}
                    onChange={(e) => setData(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select experience level</option>
                    <option value="beginner">Beginner (0-2 years)</option>
                    <option value="intermediate">Intermediate (2-5 years)</option>
                    <option value="expert">Expert (5+ years)</option>
                  </select>
                </div>
              )}

              {/* Project Types (Client/Agency) */}
              {(data.role === "client" || data.role === "agency") && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Project Types You're Interested In
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {projectTypeOptions.map((projectType) => (
                      <button
                        key={projectType}
                        type="button"
                        onClick={() => handleProjectTypeToggle(projectType)}
                        className={`px-3 py-2 rounded-lg text-sm transition ${
                          data.projectTypes?.includes(projectType)
                            ? "bg-purple-600 text-white"
                            : "bg-white/10 text-gray-300 hover:bg-white/20"
                        }`}
                      >
                        {projectType}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Budget Range (Client) */}
              {data.role === "client" && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Typical Project Budget
                  </label>
                  <select
                    value={data.budget || ""}
                    onChange={(e) => setData(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select budget range</option>
                    <option value="under-1k">Under $1,000</option>
                    <option value="1k-5k">$1,000 - $5,000</option>
                    <option value="5k-10k">$5,000 - $10,000</option>
                    <option value="10k-25k">$10,000 - $25,000</option>
                    <option value="25k-plus">$25,000+</option>
                  </select>
                </div>
              )}

              {/* Team Size (Agency) */}
              {data.role === "agency" && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Team Size
                  </label>
                  <select
                    value={data.teamSize || ""}
                    onChange={(e) => setData(prev => ({ ...prev, teamSize: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select team size</option>
                    <option value="solo">Solo (Just me)</option>
                    <option value="small">Small (2-5 people)</option>
                    <option value="medium">Medium (6-15 people)</option>
                    <option value="large">Large (16+ people)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
              >
                Back
              </button>
              <div className="flex gap-4">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
                >
                  Skip for Now
                </Link>
                <button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Setting up...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
