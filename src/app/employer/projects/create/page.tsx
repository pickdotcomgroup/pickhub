"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FileText,
  DollarSign,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Layers,
  Code,
  Eye,
  Clock,
  Target,
} from "lucide-react";
import { api } from "~/trpc/react";

type Step = 1 | 2 | 3 | 4;

interface ProjectFormData {
  // Step 1: Project Details
  title: string;
  description: string;
  category: string;
  projectType: "fixed" | "hourly";
  visibility: "public" | "private" | "invite_only";
  // Step 2: Budget & Timeline
  budget: string;
  hourlyRate: string;
  deadline: string;
  estimatedDuration: string;
  // Step 3: Skills & Requirements
  skills: string[];
  techStack: string[];
  minimumTier: "bronze" | "silver" | "gold" | "platinum";
}

const steps = [
  { number: 1, label: "Project Details" },
  { number: 2, label: "Budget & Timeline" },
  { number: 3, label: "Skills & Requirements" },
  { number: 4, label: "Review" },
];

const categories = [
  "Web Development",
  "Mobile App Development",
  "E-Commerce",
  "UI/UX Design",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "Cloud Services",
  "Blockchain",
  "Game Development",
  "Desktop Application",
  "API Development",
  "Other",
];

const projectTypes = [
  { value: "fixed", label: "Fixed Price", description: "Set a fixed budget for the entire project" },
  { value: "hourly", label: "Hourly Rate", description: "Pay based on hours worked" },
];

const visibilityOptions = [
  { value: "public", label: "Public", description: "Visible to all talents on the platform" },
  { value: "private", label: "Private", description: "Only visible to invited talents" },
  { value: "invite_only", label: "Invite Only", description: "Talents must be invited to apply" },
];

const tierOptions = [
  { value: "bronze", label: "Bronze", description: "Open to all verified talents" },
  { value: "silver", label: "Silver", description: "Talents with completed projects" },
  { value: "gold", label: "Gold", description: "Experienced talents with high ratings" },
  { value: "platinum", label: "Platinum", description: "Top-tier talents only" },
];

const commonSkills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "SQL",
  "MongoDB",
  "PostgreSQL",
  "AWS",
  "Docker",
  "Kubernetes",
];

const commonTechStack = [
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Node.js",
  "Express",
  "Django",
  "Flask",
  "FastAPI",
  "Spring Boot",
  ".NET",
  "Laravel",
  "Ruby on Rails",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "AWS",
  "GCP",
  "Azure",
];

export default function CreateProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);

  const createProjectMutation = api.projects.create.useMutation({
    onSuccess: () => {
      router.push("/employer/projects");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    category: "Web Development",
    projectType: "fixed",
    visibility: "public",
    budget: "",
    hourlyRate: "",
    deadline: "",
    estimatedDuration: "",
    skills: [],
    techStack: [],
    minimumTier: "bronze",
  });

  const [skillInput, setSkillInput] = useState("");
  const [techInput, setTechInput] = useState("");

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

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [session, status, router]);

  const updateFormData = <K extends keyof ProjectFormData>(
    field: K,
    value: ProjectFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = (skill?: string) => {
    const skillToAdd = skill ?? skillInput.trim();
    if (skillToAdd && !formData.skills.includes(skillToAdd)) {
      updateFormData("skills", [...formData.skills, skillToAdd]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    updateFormData(
      "skills",
      formData.skills.filter((s) => s !== skill)
    );
  };

  const addTech = (tech?: string) => {
    const techToAdd = tech ?? techInput.trim();
    if (techToAdd && !formData.techStack.includes(techToAdd)) {
      updateFormData("techStack", [...formData.techStack, techToAdd]);
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    updateFormData(
      "techStack",
      formData.techStack.filter((t) => t !== tech)
    );
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const prepareProjectData = () => {
    return {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      projectType: formData.projectType,
      visibility: formData.visibility,
      budget: formData.budget ? parseFloat(formData.budget) : 0,
      hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
      deadline: new Date(formData.deadline),
      estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration, 10) : undefined,
      skills: formData.skills,
      techStack: formData.techStack,
      minimumTier: formData.minimumTier,
    };
  };

  const handleSubmit = () => {
    setError(null);
    createProjectMutation.mutate(prepareProjectData());
  };

  const isStepValid = (step: Step): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.description && formData.category);
      case 2:
        return !!(formData.budget && formData.deadline);
      case 3:
        return formData.skills.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="flex justify-between mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 ml-2"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl p-6 h-96"></div>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-gray-600 mt-1">
            Define your project requirements and find the perfect talent to bring it to life.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-colors ${
                      currentStep === step.number
                        ? "bg-blue-600 border-blue-600 text-white"
                        : currentStep > step.number
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-gray-300 text-gray-500"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      currentStep === step.number
                        ? "text-blue-600"
                        : currentStep > step.number
                          ? "text-blue-600"
                          : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.number ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Step 1: Project Details */}
          {currentStep === 1 && (
            <div className="p-6 space-y-8">
              {/* Basic Information */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Basic Information
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Project Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateFormData("title", e.target.value)}
                      placeholder="E-Commerce Platform Development"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => updateFormData("category", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateFormData("description", e.target.value)}
                      placeholder="Describe your project in detail. Include the goals, expected deliverables, and any specific requirements..."
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Project Type */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Layers className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Project Type
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-start p-4 border rounded-lg cursor-pointer transition ${
                        formData.projectType === type.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="projectType"
                        value={type.value}
                        checked={formData.projectType === type.value}
                        onChange={() => updateFormData("projectType", type.value as "fixed" | "hourly")}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900">
                          {type.label}
                        </span>
                        <span className="block text-sm text-gray-500">
                          {type.description}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Visibility */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Eye className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Project Visibility
                  </h2>
                </div>

                <div className="space-y-3">
                  {visibilityOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start p-4 border rounded-lg cursor-pointer transition ${
                        formData.visibility === option.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value={option.value}
                        checked={formData.visibility === option.value}
                        onChange={() => updateFormData("visibility", option.value as "public" | "private" | "invite_only")}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900">
                          {option.label}
                        </span>
                        <span className="block text-sm text-gray-500">
                          {option.description}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Step 2: Budget & Timeline */}
          {currentStep === 2 && (
            <div className="p-6 space-y-8">
              {/* Budget */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Budget
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.projectType === "fixed" ? "Total Budget" : "Budget Cap"} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => updateFormData("budget", e.target.value)}
                        placeholder="5000"
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {formData.projectType === "hourly" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hourly Rate
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={formData.hourlyRate}
                          onChange={(e) => updateFormData("hourlyRate", e.target.value)}
                          placeholder="50"
                          className="w-full pl-8 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          /hr
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Timeline */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Timeline
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Deadline <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => updateFormData("deadline", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Duration (days)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.estimatedDuration}
                        onChange={(e) => updateFormData("estimatedDuration", e.target.value)}
                        placeholder="30"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Step 3: Skills & Requirements */}
          {currentStep === 3 && (
            <div className="p-6 space-y-8">
              {/* Required Skills */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Code className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Required Skills <span className="text-red-500">*</span>
                  </h2>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="Type a skill and press Enter"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => addSkill()}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Add
                  </button>
                </div>

                {/* Selected Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                {/* Suggested Skills */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Popular skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {commonSkills
                      .filter((skill) => !formData.skills.includes(skill))
                      .slice(0, 10)
                      .map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => addSkill(skill)}
                          className="px-3 py-1 border border-gray-200 text-gray-600 rounded-full text-sm hover:border-blue-500 hover:text-blue-600 transition"
                        >
                          + {skill}
                        </button>
                      ))}
                  </div>
                </div>
              </section>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Tech Stack */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Layers className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Tech Stack (Optional)
                  </h2>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTech();
                      }
                    }}
                    placeholder="Type a technology and press Enter"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => addTech()}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Add
                  </button>
                </div>

                {/* Selected Tech */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="ml-2 text-green-500 hover:text-green-700"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                {/* Suggested Tech */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Popular technologies:</p>
                  <div className="flex flex-wrap gap-2">
                    {commonTechStack
                      .filter((tech) => !formData.techStack.includes(tech))
                      .slice(0, 10)
                      .map((tech) => (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => addTech(tech)}
                          className="px-3 py-1 border border-gray-200 text-gray-600 rounded-full text-sm hover:border-green-500 hover:text-green-600 transition"
                        >
                          + {tech}
                        </button>
                      ))}
                  </div>
                </div>
              </section>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Minimum Tier */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Minimum Talent Tier
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tierOptions.map((tier) => (
                    <label
                      key={tier.value}
                      className={`flex items-start p-4 border rounded-lg cursor-pointer transition ${
                        formData.minimumTier === tier.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="minimumTier"
                        value={tier.value}
                        checked={formData.minimumTier === tier.value}
                        onChange={() => updateFormData("minimumTier", tier.value as "bronze" | "silver" | "gold" | "platinum")}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900">
                          {tier.label}
                        </span>
                        <span className="block text-sm text-gray-500">
                          {tier.description}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Review Your Project
              </h2>

              {/* Project Details Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Project Details</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">Project Title</dt>
                    <dd className="font-medium text-gray-900">
                      {formData.title || "Not specified"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Category</dt>
                    <dd className="font-medium text-gray-900">
                      {formData.category}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Project Type</dt>
                    <dd className="font-medium text-gray-900 capitalize">
                      {formData.projectType} Price
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Visibility</dt>
                    <dd className="font-medium text-gray-900 capitalize">
                      {formData.visibility.replace("_", " ")}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Budget & Timeline Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Budget & Timeline</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">Budget</dt>
                    <dd className="font-medium text-gray-900">
                      ${formData.budget || "0"}
                    </dd>
                  </div>
                  {formData.projectType === "hourly" && formData.hourlyRate && (
                    <div>
                      <dt className="text-gray-500">Hourly Rate</dt>
                      <dd className="font-medium text-gray-900">
                        ${formData.hourlyRate}/hr
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-gray-500">Deadline</dt>
                    <dd className="font-medium text-gray-900">
                      {formData.deadline
                        ? new Date(formData.deadline).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Not specified"}
                    </dd>
                  </div>
                  {formData.estimatedDuration && (
                    <div>
                      <dt className="text-gray-500">Estimated Duration</dt>
                      <dd className="font-medium text-gray-900">
                        {formData.estimatedDuration} days
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Skills */}
              {formData.skills.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech Stack */}
              {formData.techStack.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Minimum Tier */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Talent Requirements</h3>
                <p className="text-sm text-gray-700">
                  Minimum Tier:{" "}
                  <span className="font-medium capitalize">{formData.minimumTier}</span>
                </p>
              </div>

              {/* Description Preview */}
              {formData.description && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Project Description</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {formData.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid(currentStep)}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={createProjectMutation.isPending}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                  <span>{createProjectMutation.isPending ? "Creating..." : "Create Project"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
