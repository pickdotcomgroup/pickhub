"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ArrowLeft, UserPlus } from "lucide-react";

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
  website?: string;
  location?: string;
  foundedYear?: string;
}

type FormErrors = Record<string, string>;

const skillOptions = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "Node.js",
  "PHP",
  "Laravel",
  "WordPress",
  "Shopify",
  "UI/UX Design",
  "Graphic Design",
  "Mobile Development",
  "DevOps",
  "Data Science",
  "Machine Learning",
  "Vue.js",
  "Angular",
  "Flutter",
  "React Native",
  "AWS",
  "Docker",
];

function SignupContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [professionalType, setProfessionalType] =
    useState<ProfessionalType>("talent");
  const [currentStep, setCurrentStep] = useState(1);
  const [professionalFormData, setProfessionalFormData] =
    useState<ProfessionalFormData>({
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

  const totalSteps = professionalType === "client" ? 2 : 3;

  useEffect(() => {
    const type = searchParams.get("type") as ProfessionalType;
    if (type && ["client", "talent", "agency"].includes(type)) {
      setProfessionalType(type);
      setProfessionalFormData((prev) => ({ ...prev, professionalType: type }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (session?.user) {
      if (session.user.role === "client") {
        router.push("/client/browse");
      } else if (session.user.role === "talent") {
        router.push("/developer");
      } else if (session.user.role === "agency") {
        router.push("/agency/browse-clients");
      } else if (session.user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  }, [session, router]);

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (professionalType === "agency") {
        // Agency validation - only agencyName and email required
        if (!professionalFormData.agencyName?.trim())
          newErrors.agencyName = "Agency name is required";
      } else {
        // Client and Talent validation - firstName and lastName required
        if (!professionalFormData.firstName.trim())
          newErrors.firstName = "First name is required";
        if (!professionalFormData.lastName.trim())
          newErrors.lastName = "Last name is required";
      }
      if (!professionalFormData.email.trim())
        newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(professionalFormData.email))
        newErrors.email = "Invalid email format";
    } else if (step === 2) {
      if (!professionalFormData.password)
        newErrors.password = "Password is required";
      else if (professionalFormData.password.length < 8)
        newErrors.password = "Password must be at least 8 characters";

      if (
        professionalFormData.password !== professionalFormData.confirmPassword
      ) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    } else if (step === 3) {
      if (professionalType === "talent") {
        if (!professionalFormData.title?.trim())
          newErrors.title = "Professional title is required";
        if (!professionalFormData.skills?.length)
          newErrors.skills = "At least one skill is required";
        if (!professionalFormData.experience)
          newErrors.experience = "Experience level is required";
      } else if (professionalType === "agency") {
        if (!professionalFormData.agencyName?.trim())
          newErrors.agencyName = "Agency name is required";
        if (!professionalFormData.description?.trim())
          newErrors.description = "Agency description is required";
        if (!professionalFormData.agencySkills?.length)
          newErrors.agencySkills = "At least one skill is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

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
          website: professionalFormData.website,
          location: professionalFormData.location,
          foundedYear: professionalFormData.foundedYear,
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
          name:
            professionalType === "agency"
              ? professionalFormData.agencyName
              : `${professionalFormData.firstName} ${professionalFormData.lastName}`,
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
        setErrors({
          general:
            "Account created but signin failed. Please try signing in manually.",
        });
      }
    } catch {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setProfessionalFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSkillToggle = (
    skill: string,
    fieldName: "skills" | "agencySkills" = "skills",
  ) => {
    setProfessionalFormData((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName]?.includes(skill)
        ? prev[fieldName].filter((s) => s !== skill)
        : [...(prev[fieldName] ?? []), skill],
    }));
  };

  if (session?.user) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-white py-3">
      <div className="w-full max-w-4xl px-6">
        <div className="rounded-2xl bg-white p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {professionalType === "client" && "Client Sign Up"}
              {professionalType === "talent" && "Developer Sign Up"}
              {professionalType === "agency" && "Agency Sign Up"}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {professionalType === "client" &&
                "Create your account to start hiring top talent"}
              {professionalType === "talent" &&
                "Create your account to find amazing opportunities"}
              {professionalType === "agency" &&
                "Create your account to connect with clients"}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="mx-auto flex max-w-xs items-center justify-center gap-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                    currentStep > index ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div>
                {professionalType === "agency" ? (
                  // Agency-specific fields
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="agencyName"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Agency Name / Company Name *
                      </label>
                      <input
                        type="text"
                        id="agencyName"
                        name="agencyName"
                        value={professionalFormData.agencyName ?? ""}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.agencyName ? "border-red-500" : "border-gray-300"}`}
                        placeholder="Enter your agency or company name"
                      />
                      {errors.agencyName && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.agencyName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Business Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={professionalFormData.email}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.email ? "border-red-500" : "border-gray-300"}`}
                        placeholder="Enter your business email"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="website"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Company Website
                      </label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={professionalFormData.website ?? ""}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="https://www.yourcompany.com"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="location"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Location
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={professionalFormData.location ?? ""}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="e.g., San Francisco, CA"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="foundedYear"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Founded Year
                        </label>
                        <input
                          type="text"
                          id="foundedYear"
                          name="foundedYear"
                          value={professionalFormData.foundedYear ?? ""}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="e.g., 2020"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Client and Talent fields
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={professionalFormData.firstName}
                          onChange={handleInputChange}
                          className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
                          placeholder="Enter your first name"
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-400">
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={professionalFormData.lastName}
                          onChange={handleInputChange}
                          className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
                          placeholder="Enter your last name"
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-400">
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="email"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={professionalFormData.email}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.email ? "border-red-500" : "border-gray-300"}`}
                        placeholder="Enter your email address"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 2: Password Setup */}
            {currentStep === 2 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Create a secure password
                </h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Password *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={professionalFormData.password}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.password ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Create a password"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.password}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={professionalFormData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Professional Information (only for talent and agency) */}

            {currentStep === 3 && professionalType !== "client" && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Professional Information
                </h3>

                {professionalType === "talent" && (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="title"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Professional Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={professionalFormData.title ?? ""}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.title ? "border-red-500" : "border-gray-300"}`}
                        placeholder="e.g., Full Stack Developer"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.title}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Skills & Technologies *
                      </label>
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        {skillOptions.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleSkillToggle(skill)}
                            className={`rounded-lg px-3 py-2 text-sm transition ${professionalFormData.skills?.includes(skill) ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                      {errors.skills && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.skills}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="experience"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Experience Level *
                        </label>
                        <select
                          id="experience"
                          name="experience"
                          value={professionalFormData.experience ?? ""}
                          onChange={handleInputChange}
                          className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.experience ? "border-red-500" : "border-gray-300"}`}
                        >
                          <option value="">Select experience level</option>
                          <option value="entry">Entry Level (0-2 years)</option>
                          <option value="intermediate">
                            Intermediate (2-5 years)
                          </option>
                          <option value="senior">Senior (5-10 years)</option>
                          <option value="expert">Expert (10+ years)</option>
                        </select>
                        {errors.experience && (
                          <p className="mt-1 text-sm text-red-400">
                            {errors.experience}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="hourlyRate"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Hourly Rate (USD)
                        </label>
                        <input
                          type="text"
                          id="hourlyRate"
                          name="hourlyRate"
                          value={professionalFormData.hourlyRate ?? ""}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="e.g., $50/hr"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="portfolio"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Portfolio URL
                      </label>
                      <input
                        type="url"
                        id="portfolio"
                        name="portfolio"
                        value={professionalFormData.portfolio ?? ""}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="https://your-portfolio.com"
                      />
                    </div>
                  </div>
                )}

                {professionalType === "agency" && (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="agencyName"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Agency Name *
                      </label>
                      <input
                        type="text"
                        id="agencyName"
                        name="agencyName"
                        value={professionalFormData.agencyName ?? ""}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.agencyName ? "border-red-500" : "border-gray-300"}`}
                        placeholder="Enter your agency name"
                      />
                      {errors.agencyName && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.agencyName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Agency Description *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        value={professionalFormData.description ?? ""}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.description ? "border-red-500" : "border-gray-300"}`}
                        placeholder="Describe your agency's services"
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="teamSize"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Team Size
                      </label>
                      <select
                        id="teamSize"
                        name="teamSize"
                        value={professionalFormData.teamSize ?? ""}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">Select team size</option>
                        <option value="1-5">1-5 people</option>
                        <option value="6-15">6-15 people</option>
                        <option value="16-50">16-50 people</option>
                        <option value="50+">50+ people</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Agency Skills & Services *
                      </label>
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        {skillOptions.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() =>
                              handleSkillToggle(skill, "agencySkills")
                            }
                            className={`rounded-lg px-3 py-2 text-sm transition ${professionalFormData.agencySkills?.includes(skill) ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                      {errors.agencySkills && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.agencySkills}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {errors.general && (
              <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-3">
                <p className="text-sm text-red-400">{errors.general}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-3 font-semibold text-gray-700 transition duration-200 hover:bg-gray-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className={`flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition duration-200 hover:bg-blue-700 ${
                    currentStep === 1 ? "ml-auto" : ""
                  }`}
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Create Account
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Want to choose a different account type?{" "}
              <Link
                href="/join"
                className="font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Go back
              </Link>
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          By creating an account, you agree to our{" "}
          <Link href="#" className="text-blue-600 hover:text-blue-700">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-blue-600 hover:text-blue-700">
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="text-xl text-white">Loading...</div>
        </main>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
