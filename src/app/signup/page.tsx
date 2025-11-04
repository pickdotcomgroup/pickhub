"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

type ProfessionalType = "client" | "talent" | "agency";

interface ProfessionalFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  professionalType: ProfessionalType;
  companyName?: string;
  industry?: string;
  companySize?: string;
  title?: string;
  skills?: string[];
  experience?: string;
  hourlyRate?: string;
  portfolio?: string;
  agencyName?: string;
  teamSize?: string;
  agencySkills?: string[];
  description?: string;
}

type FormErrors = Record<string, string>;

const skillOptions = [
  "React", "Next.js", "TypeScript", "JavaScript", "Python", "Node.js",
  "PHP", "Laravel", "WordPress", "Shopify", "UI/UX Design", "Graphic Design",
  "Mobile Development", "DevOps", "Data Science", "Machine Learning",
  "Vue.js", "Angular", "Flutter", "React Native", "AWS", "Docker"
];

function SignupContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [professionalType, setProfessionalType] = useState<ProfessionalType>("talent");
  const [professionalFormData, setProfessionalFormData] = useState<ProfessionalFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    professionalType: "talent",
    skills: [],
    agencySkills: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const type = searchParams.get("type") as ProfessionalType;
    if (type && ["client", "talent", "agency"].includes(type)) {
      setProfessionalType(type);
      setProfessionalFormData(prev => ({ ...prev, professionalType: type }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (session?.user) {
      if (session.user.role === "client") {
        router.push("/client/browse");
      } else if (session.user.role === "talent") {
        router.push("/talent/dashboard");
      } else if (session.user.role === "agency") {
        router.push("/agency");
      } else if (session.user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  }, [session, router]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!professionalFormData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!professionalFormData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!professionalFormData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(professionalFormData.email)) newErrors.email = "Invalid email format";
    
    if (!professionalFormData.password) newErrors.password = "Password is required";
    else if (professionalFormData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    
    if (professionalFormData.password !== professionalFormData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (professionalType === "talent") {
      if (!professionalFormData.title?.trim()) newErrors.title = "Professional title is required";
      if (!professionalFormData.skills?.length) newErrors.skills = "At least one skill is required";
      if (!professionalFormData.experience) newErrors.experience = "Experience level is required";
    } else if (professionalType === "agency") {
      if (!professionalFormData.agencyName?.trim()) newErrors.agencyName = "Agency name is required";
      if (!professionalFormData.description?.trim()) newErrors.description = "Agency description is required";
      if (!professionalFormData.agencySkills?.length) newErrors.agencySkills = "At least one skill is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const professionalData = {
        professionalType,
        firstName: professionalFormData.firstName,
        lastName: professionalFormData.lastName,
        ...(professionalType === "client" && {
          companyName: professionalFormData.companyName,
          industry: professionalFormData.industry,
          companySize: professionalFormData.companySize,
        }),
        ...(professionalType === "talent" && {
          title: professionalFormData.title,
          skills: professionalFormData.skills,
          experience: professionalFormData.experience,
          hourlyRate: professionalFormData.hourlyRate,
          portfolio: professionalFormData.portfolio,
        }),
        ...(professionalType === "agency" && {
          agencyName: professionalFormData.agencyName,
          description: professionalFormData.description,
          teamSize: professionalFormData.teamSize,
          skills: professionalFormData.agencySkills,
        }),
      };

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: professionalFormData.email,
          password: professionalFormData.password,
          name: `${professionalFormData.firstName} ${professionalFormData.lastName}`,
          professionalData,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setErrors({ general: data.error ?? "Registration failed" });
        return;
      }

      const result = await signIn("credentials", {
        email: professionalFormData.email,
        password: professionalFormData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: "Account created but signin failed. Please try signing in manually." });
      }
    } catch {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfessionalFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSkillToggle = (skill: string, fieldName: 'skills' | 'agencySkills' = 'skills') => {
    setProfessionalFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName]?.includes(skill)
        ? prev[fieldName].filter(s => s !== skill)
        : [...(prev[fieldName] ?? []), skill]
    }));
  };

  const getProfessionalInfo = () => {
    switch (professionalType) {
      case "client":
        return {
          title: "Join as a Client",
          subtitle: "Post projects and hire top Developers",
          icon: "🏢"
        };
      case "talent":
        return {
          title: "Join as a Talent",
          subtitle: "Showcase your skills and find opportunities",
          icon: "👨‍💻"
        };
      case "agency":
        return {
          title: "Join as an Agency",
          subtitle: "Scale your business and manage clients",
          icon: "🏛️"
        };
    }
  };

  if (session?.user) {
    return null;
  }

  const professionalInfo = getProfessionalInfo();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="w-full px-6 max-w-4xl">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{professionalInfo.icon}</div>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-purple-400">TechPick</span>Hub
          </h1>
          <p className="text-gray-300">{professionalInfo.subtitle}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">{professionalInfo.title}</h2>
            <p className="text-gray-300">{professionalInfo.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-1">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={professionalFormData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.firstName ? "border-red-500" : "border-white/20"}`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-1">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={professionalFormData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.lastName ? "border-red-500" : "border-white/20"}`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={professionalFormData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.email ? "border-red-500" : "border-white/20"}`}
                  placeholder="Enter your email address"
                />
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={professionalFormData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.password ? "border-red-500" : "border-white/20"}`}
                    placeholder="Create a password"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={professionalFormData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.confirmPassword ? "border-red-500" : "border-white/20"}`}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {professionalType !== "client" && (
              <div className="border-t border-white/20 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Professional Information</h3>

                {professionalType === "talent" && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-1">Professional Title *</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={professionalFormData.title ?? ""}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.title ? "border-red-500" : "border-white/20"}`}
                        placeholder="e.g., Full Stack Developer"
                      />
                      {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Skills & Technologies *</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {skillOptions.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleSkillToggle(skill)}
                            className={`px-3 py-2 rounded-lg text-sm transition ${professionalFormData.skills?.includes(skill) ? "bg-purple-600 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                      {errors.skills && <p className="mt-1 text-sm text-red-400">{errors.skills}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="experience" className="block text-sm font-medium text-gray-200 mb-1">Experience Level *</label>
                        <select
                          id="experience"
                          name="experience"
                          value={professionalFormData.experience ?? ""}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.experience ? "border-red-500" : "border-white/20"}`}
                        >
                          <option value="">Select experience level</option>
                          <option value="entry" className="bg-slate-800">Entry Level (0-2 years)</option>
                          <option value="intermediate" className="bg-slate-800">Intermediate (2-5 years)</option>
                          <option value="senior" className="bg-slate-800">Senior (5-10 years)</option>
                          <option value="expert" className="bg-slate-800">Expert (10+ years)</option>
                        </select>
                        {errors.experience && <p className="mt-1 text-sm text-red-400">{errors.experience}</p>}
                      </div>
                      <div>
                        <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-200 mb-1">Hourly Rate (USD)</label>
                        <input
                          type="text"
                          id="hourlyRate"
                          name="hourlyRate"
                          value={professionalFormData.hourlyRate ?? ""}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., $50/hr"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="portfolio" className="block text-sm font-medium text-gray-200 mb-1">Portfolio URL</label>
                      <input
                        type="url"
                        id="portfolio"
                        name="portfolio"
                        value={professionalFormData.portfolio ?? ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="https://your-portfolio.com"
                      />
                    </div>
                  </div>
                )}

                {professionalType === "agency" && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="agencyName" className="block text-sm font-medium text-gray-200 mb-1">Agency Name *</label>
                      <input
                        type="text"
                        id="agencyName"
                        name="agencyName"
                        value={professionalFormData.agencyName ?? ""}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.agencyName ? "border-red-500" : "border-white/20"}`}
                        placeholder="Enter your agency name"
                      />
                      {errors.agencyName && <p className="mt-1 text-sm text-red-400">{errors.agencyName}</p>}
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-1">Agency Description *</label>
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        value={professionalFormData.description ?? ""}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.description ? "border-red-500" : "border-white/20"}`}
                        placeholder="Describe your agency's services"
                      />
                      {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
                    </div>

                    <div>
                      <label htmlFor="teamSize" className="block text-sm font-medium text-gray-200 mb-1">Team Size</label>
                      <select
                        id="teamSize"
                        name="teamSize"
                        value={professionalFormData.teamSize ?? ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select team size</option>
                        <option value="1-5" className="bg-slate-800">1-5 people</option>
                        <option value="6-15" className="bg-slate-800">6-15 people</option>
                        <option value="16-50" className="bg-slate-800">16-50 people</option>
                        <option value="50+" className="bg-slate-800">50+ people</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Agency Skills & Services *</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {skillOptions.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleSkillToggle(skill, 'agencySkills')}
                            className={`px-3 py-2 rounded-lg text-sm transition ${professionalFormData.agencySkills?.includes(skill) ? "bg-purple-600 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                      {errors.agencySkills && <p className="mt-1 text-sm text-red-400">{errors.agencySkills}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {errors.general && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-400">{errors.general}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center text-white disabled:cursor-not-allowed ${
                professionalType === "client" ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800" :
                professionalType === "talent" ? "bg-green-600 hover:bg-green-700 disabled:bg-green-800" :
                "bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                `Create ${professionalInfo.title.split(' ')[2]} Account`
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">
              Want to choose a different account type?{" "}
              <Link href="/join" className="text-purple-400 hover:text-purple-300 font-semibold transition">
                Go back
              </Link>
            </p>
            <p className="text-sm text-gray-300 mt-2">
              Already have an account?{" "}
              <Link href="/signin" className="text-purple-400 hover:text-purple-300 font-semibold transition">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          By creating an account, you agree to our{" "}
          <Link href="#" className="text-purple-400 hover:text-purple-300">Terms of Service</Link>
          {" "}and{" "}
          <Link href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </main>
    }>
      <SignupContent />
    </Suspense>
  );
}
