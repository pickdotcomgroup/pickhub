"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ArrowLeft, UserPlus, CheckCircle2, Users, Briefcase, GraduationCap, TrendingUp, Shield, Zap, Globe, Award, Target } from "lucide-react";

type ProfessionalType = "employer" | "talent" | "trainer";

interface ProfessionalFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  professionalType: ProfessionalType;
  // Employer specific
  companyName?: string;
  industry?: string;
  companySize?: string;
  description?: string;
  website?: string;
  location?: string;
  // Talent specific
  title?: string;
  skills?: string[];
  experience?: string;
  hourlyRate?: string;
  portfolio?: string;
  // Trainer/Organization specific
  organizationName?: string;
  organizationType?: string;
  contactPersonName?: string;
  contactPersonRole?: string;
  organizationDescription?: string;
  specializations?: string[];
  organizationWebsite?: string;
  organizationLocation?: string;
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

const trainingSpecializationOptions = [
  "Artificial Intelligence (AI)",
  "Machine Learning (ML)",
  "Deep Learning (DL)",
  "Natural Language Processing (NLP)",
  "Generative AI & LLMs",
  "Computer Vision",
  "Data Science",
  "Data Analytics",
  "Data Engineering",
  "Business Intelligence",
  "Web3 & Blockchain",
  "Smart Contracts",
  "Cybersecurity",
  "Cloud Security",
  "Ethical Hacking",
  "Penetration Testing",
  "Cloud Computing (AWS)",
  "Cloud Computing (Azure)",
  "Cloud Computing (GCP)",
  "DevOps & MLOps",
  "Full Stack Development",
  "Mobile App Development",
  "IoT & Embedded Systems",
  "Robotics & Automation",
  "Quantum Computing",
  "AR/VR Development",
  "Product Management",
  "Agile & Scrum",
];

const marketingContent = {
  employer: {
    title: "Hire Top Tech Talent",
    subtitle: "Find vetted developers ready to build your next big thing",
    features: [
      {
        icon: Users,
        title: "Access Pre-Vetted Talent",
        description: "Connect with skilled developers who have been thoroughly assessed for technical expertise",
      },
      {
        icon: Zap,
        title: "Fast Hiring Process",
        description: "Reduce time-to-hire with our streamlined matching and interview process",
      },
      {
        icon: Shield,
        title: "Quality Guaranteed",
        description: "Every developer is background-checked and skill-verified before joining our platform",
      },
      {
        icon: TrendingUp,
        title: "Scale Your Team",
        description: "Quickly scale up or down based on your project needs with flexible engagement models",
      },
    ],
    stats: [
      { value: "10,000+", label: "Verified Developers" },
      { value: "500+", label: "Companies Hiring" },
      { value: "95%", label: "Client Satisfaction" },
    ],
  },
  talent: {
    title: "Accelerate Your Career",
    subtitle: "Join a community of top developers and land your dream opportunities",
    features: [
      {
        icon: Briefcase,
        title: "Premium Job Opportunities",
        description: "Access exclusive positions at top companies looking for developers like you",
      },
      {
        icon: Award,
        title: "Showcase Your Skills",
        description: "Build a professional profile that highlights your expertise and projects",
      },
      {
        icon: Globe,
        title: "Work Remotely",
        description: "Find remote-friendly positions that offer flexibility and work-life balance",
      },
      {
        icon: TrendingUp,
        title: "Grow Your Earnings",
        description: "Negotiate competitive rates and access higher-paying opportunities",
      },
    ],
    stats: [
      { value: "$80K+", label: "Avg. Salary" },
      { value: "2,000+", label: "Open Positions" },
      { value: "85%", label: "Placement Rate" },
    ],
  },
  trainer: {
    title: "Empower the Next Generation",
    subtitle: "Partner with us to train and upskill developers worldwide",
    features: [
      {
        icon: GraduationCap,
        title: "Reach More Students",
        description: "Expand your reach and connect with learners seeking quality tech education",
      },
      {
        icon: Target,
        title: "Industry-Aligned Training",
        description: "Develop curriculum that meets real-world industry demands and job requirements",
      },
      {
        icon: Users,
        title: "Build Your Network",
        description: "Connect with employers looking to hire your graduates and trainees",
      },
      {
        icon: CheckCircle2,
        title: "Track Success",
        description: "Monitor student progress and placement rates with comprehensive analytics",
      },
    ],
    stats: [
      { value: "50+", label: "Partner Organizations" },
      { value: "5,000+", label: "Students Trained" },
      { value: "90%", label: "Employment Rate" },
    ],
  },
};

function MarketingPanel({ type }: { type: ProfessionalType }) {
  const content = marketingContent[type];

  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 text-white">
      <div className="max-w-lg mx-auto">
        <h2 className="text-3xl font-bold mb-3">{content.title}</h2>
        <p className="text-blue-100 text-lg mb-8">{content.subtitle}</p>

        <div className="space-y-6 mb-10">
          {content.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-blue-200 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/20">
          {content.stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-blue-200 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
      specializations: [],
    });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 3; // All roles have 3 steps: Basic Info, Password, Professional Info

  useEffect(() => {
    const type = searchParams.get("type") as ProfessionalType;
    if (type && ["employer", "talent", "trainer"].includes(type)) {
      setProfessionalType(type);
      setProfessionalFormData((prev) => ({ ...prev, professionalType: type }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (session?.user) {
      if (session.user.role === "employer") {
        router.push("/employer/browse");
      } else if (session.user.role === "talent") {
        router.push("/developer");
      } else if (session.user.role === "trainer") {
        router.push("/trainer/dashboard");
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
      // All roles require firstName, lastName, and email
      if (!professionalFormData.firstName.trim())
        newErrors.firstName = "First name is required";
      if (!professionalFormData.lastName.trim())
        newErrors.lastName = "Last name is required";
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
      if (professionalType === "employer") {
        if (!professionalFormData.companyName?.trim())
          newErrors.companyName = "Company/Agency name is required";
        if (!professionalFormData.industry?.trim())
          newErrors.industry = "Industry is required";
      } else if (professionalType === "talent") {
        if (!professionalFormData.title?.trim())
          newErrors.title = "Professional title is required";
        if (!professionalFormData.skills?.length)
          newErrors.skills = "At least one skill is required";
        if (!professionalFormData.experience)
          newErrors.experience = "Experience level is required";
      } else if (professionalType === "trainer") {
        if (!professionalFormData.organizationName?.trim())
          newErrors.organizationName = "Organization name is required";
        if (!professionalFormData.organizationType?.trim())
          newErrors.organizationType = "Organization type is required";
        if (!professionalFormData.specializations?.length)
          newErrors.specializations = "At least one specialization is required";
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
        ...(professionalType === "employer" && {
          companyName: professionalFormData.companyName,
          industry: professionalFormData.industry,
          companySize: professionalFormData.companySize,
          description: professionalFormData.description,
          website: professionalFormData.website,
          location: professionalFormData.location,
        }),
        ...(professionalType === "talent" && {
          title: professionalFormData.title,
          skills: professionalFormData.skills,
          experience: professionalFormData.experience,
          hourlyRate: professionalFormData.hourlyRate,
          portfolio: professionalFormData.portfolio,
        }),
        ...(professionalType === "trainer" && {
          organizationName: professionalFormData.organizationName,
          organizationType: professionalFormData.organizationType,
          contactPersonName: `${professionalFormData.firstName} ${professionalFormData.lastName}`,
          contactPersonRole: professionalFormData.contactPersonRole,
          description: professionalFormData.organizationDescription,
          specializations: professionalFormData.specializations,
          website: professionalFormData.organizationWebsite,
          location: professionalFormData.organizationLocation,
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
    fieldName: "skills" | "specializations" = "skills",
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
    <main className="flex max-h-screen bg-white">
      {/* Left Side - Marketing Content */}
      <MarketingPanel type={professionalType} />

      {/* Right Side - Signup Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-8 mx-auto">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {professionalType === "employer" && "Employer Sign Up"}
              {professionalType === "talent" && "Developer Sign Up"}
              {professionalType === "trainer" && "Training Organization Sign Up"}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {professionalType === "employer" &&
                "Create your account to start hiring top talent"}
              {professionalType === "talent" &&
                "Create your account to find amazing opportunities"}
              {professionalType === "trainer" &&
                "Register your organization or institution to provide training"}
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
                {professionalType === "trainer" && (
                  <p className="mb-4 text-sm text-gray-500">
                    Please provide the contact person details for your organization
                  </p>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      {professionalType === "trainer" ? "Contact Person First Name *" : "First Name *"}
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={professionalFormData.firstName}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
                      placeholder={professionalType === "trainer" ? "Contact person's first name" : "Enter your first name"}
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
                      {professionalType === "trainer" ? "Contact Person Last Name *" : "Last Name *"}
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={professionalFormData.lastName}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
                      placeholder={professionalType === "trainer" ? "Contact person's last name" : "Enter your last name"}
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
                    {professionalType === "trainer" ? "Contact Email *" : "Email Address *"}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={professionalFormData.email}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.email ? "border-red-500" : "border-gray-300"}`}
                    placeholder={professionalType === "trainer" ? "Organization contact email" : "Enter your email address"}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.email}
                    </p>
                  )}
                </div>
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

            {/* Step 3: Professional Information */}

            {currentStep === 3 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  {professionalType === "employer" && "Company/Agency Information"}
                  {professionalType === "talent" && "Professional Information"}
                  {professionalType === "trainer" && "Organization Information"}
                </h3>

                {professionalType === "employer" && (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="companyName"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Company / Agency Name *
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={professionalFormData.companyName ?? ""}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.companyName ? "border-red-500" : "border-gray-300"}`}
                        placeholder="Enter your company or agency name"
                      />
                      {errors.companyName && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.companyName}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="industry"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Industry *
                        </label>
                        <select
                          id="industry"
                          name="industry"
                          value={professionalFormData.industry ?? ""}
                          onChange={handleInputChange}
                          className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.industry ? "border-red-500" : "border-gray-300"}`}
                        >
                          <option value="">Select industry</option>
                          <option value="technology">Technology</option>
                          <option value="finance">Finance & Banking</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="ecommerce">E-commerce & Retail</option>
                          <option value="education">Education</option>
                          <option value="marketing">Marketing & Advertising</option>
                          <option value="consulting">Consulting</option>
                          <option value="startup">Startup</option>
                          <option value="agency">Digital Agency</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.industry && (
                          <p className="mt-1 text-sm text-red-400">
                            {errors.industry}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="companySize"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Company Size
                        </label>
                        <select
                          id="companySize"
                          name="companySize"
                          value={professionalFormData.companySize ?? ""}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="">Select size</option>
                          <option value="1">Just me (Individual)</option>
                          <option value="2-10">2-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="500+">500+ employees</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Company Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        value={professionalFormData.description ?? ""}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Tell us about your company or what you're looking for"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="website"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Website
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
                    </div>
                  </div>
                )}

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

                {professionalType === "trainer" && (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="organizationName"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Organization / Institution Name *
                      </label>
                      <input
                        type="text"
                        id="organizationName"
                        name="organizationName"
                        value={professionalFormData.organizationName ?? ""}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.organizationName ? "border-red-500" : "border-gray-300"}`}
                        placeholder="e.g., Tech Training Academy"
                      />
                      {errors.organizationName && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.organizationName}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="organizationType"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Organization Type *
                        </label>
                        <select
                          id="organizationType"
                          name="organizationType"
                          value={professionalFormData.organizationType ?? ""}
                          onChange={handleInputChange}
                          className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.organizationType ? "border-red-500" : "border-gray-300"}`}
                        >
                          <option value="">Select type</option>
                          <option value="training_center">Training Center</option>
                          <option value="bootcamp">Bootcamp</option>
                          <option value="university">University / College</option>
                          <option value="corporate_training">Corporate Training</option>
                          <option value="online_academy">Online Academy</option>
                          <option value="certification_body">Certification Body</option>
                          <option value="consulting_firm">Consulting Firm</option>
                          <option value="nonprofit">Non-profit Organization</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.organizationType && (
                          <p className="mt-1 text-sm text-red-400">
                            {errors.organizationType}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="contactPersonRole"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Your Role in Organization
                        </label>
                        <input
                          type="text"
                          id="contactPersonRole"
                          name="contactPersonRole"
                          value={professionalFormData.contactPersonRole ?? ""}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="e.g., Director, Manager, Admin"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="organizationDescription"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Organization Description
                      </label>
                      <textarea
                        id="organizationDescription"
                        name="organizationDescription"
                        rows={4}
                        value={professionalFormData.organizationDescription ?? ""}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Tell us about your organization, training programs, and expertise"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Training Specializations *
                      </label>
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                        {trainingSpecializationOptions.map((specialization) => (
                          <button
                            key={specialization}
                            type="button"
                            onClick={() =>
                              handleSkillToggle(specialization, "specializations")
                            }
                            className={`rounded-lg px-3 py-2 text-sm transition ${professionalFormData.specializations?.includes(specialization) ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                          >
                            {specialization}
                          </button>
                        ))}
                      </div>
                      {errors.specializations && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.specializations}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="organizationWebsite"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Website
                        </label>
                        <input
                          type="url"
                          id="organizationWebsite"
                          name="organizationWebsite"
                          value={professionalFormData.organizationWebsite ?? ""}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="https://www.yourorganization.com"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="organizationLocation"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Location
                        </label>
                        <input
                          type="text"
                          id="organizationLocation"
                          name="organizationLocation"
                          value={professionalFormData.organizationLocation ?? ""}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="e.g., San Francisco, CA"
                        />
                      </div>
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
