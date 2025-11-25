"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

type AuthMode = "signin" | "signup" | "professional";
type ProfessionalType = "client" | "talent" | "agency";

interface FormData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}

interface ProfessionalFormData {
  // Basic Info
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  
  // Professional Info
  professionalType: ProfessionalType;
  
  // Client specific
  companyName?: string;
  industry?: string;
  companySize?: string;
  
  // Talent specific
  title?: string;
  skills?: string[];
  experience?: string;
  hourlyRate?: string;
  portfolio?: string;
  
  // Agency specific
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

function AuthContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [professionalType, setProfessionalType] = useState<ProfessionalType>("talent");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
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

  // Check for professional signup type in URL
  useEffect(() => {
    const type = searchParams.get("type") as ProfessionalType;
    if (type && ["client", "talent", "agency"].includes(type)) {
      setAuthMode("professional");
      setProfessionalType(type);
      setProfessionalFormData(prev => ({ ...prev, professionalType: type }));
    }
  }, [searchParams]);

  // Redirect if already authenticated based on user role
  useEffect(() => {
    if (session?.user) {
      // Route users to their role-specific dashboard
      if (session.user.role === "client") {
        router.push("/client/browse");
      } else if (session.user.role === "talent") {
        router.push("/talent/browse");
      } else if (session.user.role === "agency") {
        router.push("/agency");
      } else if (session.user.role === "admin") {
        router.push("/admin/dashboard");
      }
      else {
        // Users without a role go to general dashboard or onboarding
        router.push("/dashboard");
      }
    }
  }, [session, router]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (authMode === "professional") {
      // Professional form validation
      if (!professionalFormData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!professionalFormData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!professionalFormData.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(professionalFormData.email)) newErrors.email = "Invalid email format";
      
      if (!professionalFormData.password) newErrors.password = "Password is required";
      else if (professionalFormData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
      
      if (professionalFormData.password !== professionalFormData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      // Professional type specific validation
      if (professionalType === "client") {
        // No required professional fields for clients - all optional
      } else if (professionalType === "talent") {
        if (!professionalFormData.title?.trim()) newErrors.title = "Professional title is required";
        if (!professionalFormData.skills?.length) newErrors.skills = "At least one skill is required";
        if (!professionalFormData.experience) newErrors.experience = "Experience level is required";
      } else if (professionalType === "agency") {
        if (!professionalFormData.agencyName?.trim()) newErrors.agencyName = "Agency name is required";
        if (!professionalFormData.description?.trim()) newErrors.description = "Agency description is required";
        if (!professionalFormData.agencySkills?.length) newErrors.agencySkills = "At least one skill is required";
      }
    } else {
      // Regular form validation
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
      }

      if (authMode === "signup") {
        if (!formData.name) {
          newErrors.name = "Full name is required";
        }
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
      }
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
      if (authMode === "professional") {
        // Professional signup
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

        // Auto-signin after successful registration
        const result = await signIn("credentials", {
          email: professionalFormData.email,
          password: professionalFormData.password,
          redirect: false,
        });

        if (result?.error) {
          setErrors({ general: "Account created but signin failed. Please try signing in manually." });
        }
      } else if (authMode === "signup") {
        // Regular signup
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
          }),
        });

        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          setErrors({ general: data.error ?? "Registration failed" });
          return;
        }

        // Auto-signin after successful registration
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setErrors({ general: "Account created but signin failed. Please try signing in manually." });
        }
      } else {
        // Sign in
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setErrors({ general: "Invalid email or password" });
        }
      }
  } catch {
    setErrors({ general: "An unexpected error occurred. Please try again." });
  } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (authMode === "professional") {
      setProfessionalFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error when user starts typing
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

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      // Call NextAuth signIn with Google provider
      await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setErrors({ general: "Failed to sign in with Google. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };


  const getProfessionalInfo = () => {
    switch (professionalType) {
      case "client":
        return {
          title: "Join as a Client",
          subtitle: "Post projects and hire top Developers",
          icon: "🏢",
          color: "blue"
        };
      case "talent":
        return {
          title: "Join as a Talent",
          subtitle: "Showcase your skills and find opportunities",
          icon: "👨‍💻",
          color: "green"
        };
      case "agency":
        return {
          title: "Join as an Agency",
          subtitle: "Scale your business and manage clients",
          icon: "🏛️",
          color: "indigo"
        };
    }
  };

  if (session?.user) {
    return null; // Will redirect via useEffect
  }

  const professionalInfo = getProfessionalInfo();

  return (
    <main className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="w-full flex mt-16 justify-center py-12 px-4">
        <div className={`w-full ${authMode === "professional" ? "max-w-2xl" : "max-w-md"}`}>
            <div>

              {/* Sign In Header - only show for signin mode */}
              {authMode === "signin" && (
                <div className="text-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Sign In
                  </h2>
                </div>
              )}

              {/* Sign Up Header - only show for signup mode */}
              {authMode === "signup" && (
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Create Account
                  </h2>
                  <p className="text-gray-600">Join TechPickHub to get started</p>
                </div>
              )}

              {/* Professional Mode Header */}
              {authMode === "professional" && (
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {professionalInfo.title}
                  </h2>
                  <p className="text-gray-600">{professionalInfo.subtitle}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === "professional" ? (
              // Professional Signup Form
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={professionalFormData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                          errors.firstName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={professionalFormData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                          errors.lastName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={professionalFormData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={professionalFormData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                          errors.password ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Create a password"
                      />
                      {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={professionalFormData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                          errors.confirmPassword ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Confirm your password"
                      />
                      {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                {professionalType !== "client" && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>

                    {/* Talent Fields */}
                    {professionalType === "talent" && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Professional Title *
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={professionalFormData.title ?? ""}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                            errors.title ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="e.g., Full Stack Developer, UI/UX Designer"
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Skills & Technologies *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {skillOptions.map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleSkillToggle(skill)}
                              className={`px-3 py-2 rounded-lg text-sm transition ${
                                professionalFormData.skills?.includes(skill)
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                        {errors.skills && <p className="mt-1 text-sm text-red-400">{errors.skills}</p>}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                            Experience Level *
                          </label>
                          <select
                            id="experience"
                            name="experience"
                            value={professionalFormData.experience ?? ""}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                              errors.experience ? "border-red-500" : "border-gray-300"
                            }`}
                          >
                            <option value="">Select experience level</option>
                            <option value="entry" className="bg-white">Entry Level (0-2 years)</option>
                            <option value="intermediate" className="bg-white">Intermediate (2-5 years)</option>
                            <option value="senior" className="bg-white">Senior (5-10 years)</option>
                            <option value="expert" className="bg-white">Expert (10+ years)</option>
                          </select>
                          {errors.experience && <p className="mt-1 text-sm text-red-400">{errors.experience}</p>}
                        </div>

                        <div>
                          <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-1">
                            Hourly Rate (USD)
                          </label>
                          <input
                            type="text"
                            id="hourlyRate"
                            name="hourlyRate"
                            value={professionalFormData.hourlyRate ?? ""}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., $50/hr"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-1">
                          Portfolio URL
                        </label>
                        <input
                          type="url"
                          id="portfolio"
                          name="portfolio"
                          value={professionalFormData.portfolio ?? ""}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://your-portfolio.com"
                        />
                      </div>
                    </div>
                  )}

                    {/* Agency Fields */}
                    {professionalType === "agency" && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700 mb-1">
                          Agency Name *
                        </label>
                        <input
                          type="text"
                          id="agencyName"
                          name="agencyName"
                          value={professionalFormData.agencyName ?? ""}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                            errors.agencyName ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Enter your agency name"
                        />
                        {errors.agencyName && <p className="mt-1 text-sm text-red-400">{errors.agencyName}</p>}
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                          Agency Description *
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={4}
                          value={professionalFormData.description ?? ""}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                            errors.description ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Describe your agency's services and expertise"
                        />
                        {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
                      </div>

                      <div>
                        <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-1">
                          Team Size
                        </label>
                        <select
                          id="teamSize"
                          name="teamSize"
                          value={professionalFormData.teamSize ?? ""}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select team size</option>
                          <option value="1-5" className="bg-white">1-5 people</option>
                          <option value="6-15" className="bg-white">6-15 people</option>
                          <option value="16-50" className="bg-white">16-50 people</option>
                          <option value="50+" className="bg-white">50+ people</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Agency Skills & Services *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {skillOptions.map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleSkillToggle(skill, 'agencySkills')}
                              className={`px-3 py-2 rounded-lg text-sm transition ${
                                professionalFormData.agencySkills?.includes(skill)
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
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
              </div>
            ) : (
              // Regular Auth Form
              <>
                {/* Name field (Sign Up only) */}
                {authMode === "signup" && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name ?? ""}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                  </div>
                )}

                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                </div>

                {/* Password field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your password"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                </div>

                {/* Confirm Password field (Sign Up only) */}
                {authMode === "signup" && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        errors.confirmPassword ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
                  </div>
                )}
              </>
            )}

                {/* General error message */}
                {errors.general && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-sm text-red-400">{errors.general}</p>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center text-white disabled:cursor-not-allowed ${
                    authMode === "professional"
                      ? professionalType === "client"
                        ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800"
                        : professionalType === "talent"
                        ? "bg-green-600 hover:bg-green-700 disabled:bg-green-800"
                        : "bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800"
                        : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {authMode === "professional" 
                        ? "Creating Account..." 
                        : authMode === "signup" 
                        ? "Creating Account..." 
                        : "Signing In..."
                      }
                    </div>
                  ) : (
                    authMode === "professional" 
                      ? `Create ${professionalInfo.title.split(' ')[2]} Account`
                      : authMode === "signup" 
                      ? "Create Account" 
                      : "Sign In"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>

              {/* Footer links - only show for non-professional mode */}
              {authMode !== "professional" && (
                <>
                  {authMode === "signin" && (
                    <div className="mt-4 text-center">
                      <Link
                        href="#"
                        className="text-sm text-blue-600 hover:text-blue-700 transition"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                  )}
                  
                  {/* Toggle between Sign In and Sign Up */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      {authMode === "signin" ? (
                        <>
                          Don&apos;t have an account?{" "}
                          <Link
                            href="/join"
                            className="text-blue-600 hover:text-blue-700 font-semibold transition"
                          >
                            Join Us
                          </Link>
                        </>
                      ) : (
                        <>
                          Already have an account?{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode("signin");
                              setErrors({});
                            }}
                            className="text-blue-600 hover:text-blue-700 font-semibold transition"
                          >
                            Sign In
                          </button>
                        </>
                      )}
                    </p>
                  </div>
                </>
              )}

              {/* Professional mode - link back to join page */}
              {authMode === "professional" && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Want to choose a different account type?{" "}
                    <Link
                      href="/join"
                      className="text-blue-600 hover:text-blue-700 font-semibold transition"
                    >
                      Go back
                    </Link>
                  </p>
                </div>
              )}

              {/* Terms and Privacy */}
              <div className="mt-6 text-center text-xs text-gray-600">
                By {authMode === "professional" ? "creating a professional account" : authMode === "signup" ? "creating an account" : "signing in"}, you agree to our{" "}
                <Link href="#" className="text-blue-600 hover:text-blue-700">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-blue-600 hover:text-blue-700">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-gray-900 text-xl">Loading...</div>
      </main>
    }>
      <AuthContent />
    </Suspense>
  );
}
