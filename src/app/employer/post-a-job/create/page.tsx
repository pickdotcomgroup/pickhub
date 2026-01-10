"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FileText,
  ClipboardList,
  DollarSign,
  CheckCircle,
  MapPin,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  LinkIcon,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Save,
} from "lucide-react";
import { api } from "~/trpc/react";

type Step = 1 | 2 | 3 | 4;

interface JobFormData {
  // Step 1: Job Details
  jobTitle: string;
  employmentType: string;
  workLocationType: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  salaryPeriod: string;
  jobDescription: string;
  // Step 2: Requirements
  experienceLevel: string;
  skills: string[];
  education: string;
  responsibilities: string;
  qualifications: string;
  // Step 3: Budget & Perks
  benefits: string[];
  equity: string;
  signingBonus: string;
  relocationAssistance: boolean;
  visaSponsorship: boolean;
}

const steps = [
  { number: 1, label: "Job Details" },
  { number: 2, label: "Requirements" },
  { number: 3, label: "Budget & Perks" },
  { number: 4, label: "Review" },
];

const employmentTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];
const workLocationTypes = ["Remote", "On-site", "Hybrid"];
const salaryPeriods = ["Per Year", "Per Month", "Per Hour", "Per Project"];
const experienceLevels = ["Entry Level", "Mid Level", "Senior Level", "Lead", "Executive"];
const educationLevels = [
  "High School",
  "Associate Degree",
  "Bachelor's",
  "Master's",
  "PhD",
  "No Requirement",
];
const commonBenefits = [
  "Health Insurance",
  "Dental Insurance",
  "Vision Insurance",
  "401(k) Matching",
  "Paid Time Off",
  "Remote Work",
  "Flexible Hours",
  "Professional Development",
  "Gym Membership",
  "Stock Options",
];

export default function CreateJobPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);

  const createJobMutation = api.jobs.create.useMutation({
    onSuccess: () => {
      router.push("/employer/post-a-job");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const [formData, setFormData] = useState<JobFormData>({
    jobTitle: "",
    employmentType: "Full-time",
    workLocationType: "Remote",
    location: "",
    salaryMin: "",
    salaryMax: "",
    salaryPeriod: "Per Year",
    jobDescription: "",
    experienceLevel: "Mid Level",
    skills: [],
    education: "Bachelor's",
    responsibilities: "",
    qualifications: "",
    benefits: [],
    equity: "",
    signingBonus: "",
    relocationAssistance: false,
    visaSponsorship: false,
  });

  const [skillInput, setSkillInput] = useState("");

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

  const updateFormData = <K extends keyof JobFormData>(
    field: K,
    value: JobFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      updateFormData("skills", [...formData.skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    updateFormData(
      "skills",
      formData.skills.filter((s) => s !== skill)
    );
  };

  const toggleBenefit = (benefit: string) => {
    if (formData.benefits.includes(benefit)) {
      updateFormData(
        "benefits",
        formData.benefits.filter((b) => b !== benefit)
      );
    } else {
      updateFormData("benefits", [...formData.benefits, benefit]);
    }
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

  const prepareJobData = (status: "draft" | "active") => {
    return {
      title: formData.jobTitle,
      employmentType: formData.employmentType as "Full-time" | "Part-time" | "Contract" | "Freelance" | "Internship",
      workLocationType: formData.workLocationType as "Remote" | "On-site" | "Hybrid",
      location: formData.location || undefined,
      salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : undefined,
      salaryPeriod: formData.salaryPeriod as "Per Year" | "Per Month" | "Per Hour" | "Per Project" | undefined,
      description: formData.jobDescription,
      experienceLevel: formData.experienceLevel as "Entry Level" | "Mid Level" | "Senior Level" | "Lead" | "Executive",
      education: formData.education as "High School" | "Associate Degree" | "Bachelor's" | "Master's" | "PhD" | "No Requirement" | undefined,
      skills: formData.skills,
      responsibilities: formData.responsibilities || undefined,
      qualifications: formData.qualifications || undefined,
      benefits: formData.benefits,
      equity: formData.equity || undefined,
      signingBonus: formData.signingBonus ? parseFloat(formData.signingBonus) : undefined,
      relocationAssistance: formData.relocationAssistance,
      visaSponsorship: formData.visaSponsorship,
      status,
    };
  };

  const handleSaveDraft = () => {
    setError(null);
    createJobMutation.mutate(prepareJobData("draft"));
  };

  const handleSubmit = () => {
    setError(null);
    createJobMutation.mutate(prepareJobData("active"));
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
          <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
          <p className="text-gray-600 mt-1">
            Create a new job listing to find the perfect talent for your team.
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
          {/* Step 1: Job Details */}
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
                  {/* Job Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => updateFormData("jobTitle", e.target.value)}
                      placeholder="Senior Data Scientist"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Employment Type & Work Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employment Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.employmentType}
                        onChange={(e) =>
                          updateFormData("employmentType", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {employmentTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Work Location Type
                      </label>
                      <select
                        value={formData.workLocationType}
                        onChange={(e) =>
                          updateFormData("workLocationType", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {workLocationTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => updateFormData("location", e.target.value)}
                        placeholder="Remote (US/Canada)"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Salary & Compensation */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Salary & Compensation
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        value={formData.salaryMin}
                        onChange={(e) => updateFormData("salaryMin", e.target.value)}
                        placeholder="120000"
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        value={formData.salaryMax}
                        onChange={(e) => updateFormData("salaryMax", e.target.value)}
                        placeholder="180000"
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Period
                    </label>
                    <select
                      value={formData.salaryPeriod}
                      onChange={(e) => updateFormData("salaryPeriod", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {salaryPeriods.map((period) => (
                        <option key={period} value={period}>
                          {period}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Job Description */}
              <section>
                <div className="flex items-center space-x-2 mb-2">
                  <ClipboardList className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Job Description
                  </h2>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Describe the responsibilities, day-to-day tasks, and why candidates
                  should join your team.
                </p>

                {/* Rich Text Toolbar */}
                <div className="border border-gray-300 rounded-lg">
                  <div className="flex items-center space-x-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-200 rounded transition"
                    >
                      <Bold className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-200 rounded transition"
                    >
                      <Italic className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-200 rounded transition"
                    >
                      <Underline className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-200 rounded transition"
                    >
                      <List className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-200 rounded transition"
                    >
                      <ListOrdered className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-200 rounded transition"
                    >
                      <LinkIcon className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-200 rounded transition"
                    >
                      <ImageIcon className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <textarea
                    value={formData.jobDescription}
                    onChange={(e) =>
                      updateFormData("jobDescription", e.target.value)
                    }
                    placeholder="We are looking for an experienced Data Scientist to join our growing AI team.&#10;&#10;Key Responsibilities:&#10;• Develop and deploy machine learning models&#10;• Analyze large datasets to derive insights&#10;• Collaborate with engineering teams"
                    rows={8}
                    className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-0 resize-none rounded-b-lg"
                  />
                </div>
              </section>
            </div>
          )}

          {/* Step 2: Requirements */}
          {currentStep === 2 && (
            <div className="p-6 space-y-8">
              {/* Experience & Education */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Experience & Education
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.experienceLevel}
                      onChange={(e) =>
                        updateFormData("experienceLevel", e.target.value)
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {experienceLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Education Requirement
                    </label>
                    <select
                      value={formData.education}
                      onChange={(e) => updateFormData("education", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {educationLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Required Skills */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Required Skills
                </h2>

                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
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
                    onClick={addSkill}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
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
              </section>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Responsibilities */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Key Responsibilities
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  List the main duties and responsibilities for this role.
                </p>
                <textarea
                  value={formData.responsibilities}
                  onChange={(e) =>
                    updateFormData("responsibilities", e.target.value)
                  }
                  placeholder="• Lead data science projects from conception to deployment&#10;• Mentor junior team members&#10;• Present findings to stakeholders"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </section>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Qualifications */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Qualifications
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Describe the ideal candidate qualifications.
                </p>
                <textarea
                  value={formData.qualifications}
                  onChange={(e) =>
                    updateFormData("qualifications", e.target.value)
                  }
                  placeholder="• 5+ years of experience in data science or machine learning&#10;• Proficiency in Python, SQL, and cloud platforms&#10;• Strong communication skills"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </section>
            </div>
          )}

          {/* Step 3: Budget & Perks */}
          {currentStep === 3 && (
            <div className="p-6 space-y-8">
              {/* Benefits */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Benefits & Perks
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Select the benefits you offer for this position.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {commonBenefits.map((benefit) => (
                    <label
                      key={benefit}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                        formData.benefits.includes(benefit)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.benefits.includes(benefit)}
                        onChange={() => toggleBenefit(benefit)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{benefit}</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Additional Compensation */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Compensation
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Equity / Stock Options
                    </label>
                    <input
                      type="text"
                      value={formData.equity}
                      onChange={(e) => updateFormData("equity", e.target.value)}
                      placeholder="e.g., 0.1% - 0.5%"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Signing Bonus
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        value={formData.signingBonus}
                        onChange={(e) =>
                          updateFormData("signingBonus", e.target.value)
                        }
                        placeholder="10000"
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Additional Options */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Options
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition">
                    <input
                      type="checkbox"
                      checked={formData.relocationAssistance}
                      onChange={(e) =>
                        updateFormData("relocationAssistance", e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-700">
                        Relocation Assistance
                      </span>
                      <p className="text-xs text-gray-500">
                        Offer support for candidates who need to relocate
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition">
                    <input
                      type="checkbox"
                      checked={formData.visaSponsorship}
                      onChange={(e) =>
                        updateFormData("visaSponsorship", e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-700">
                        Visa Sponsorship
                      </span>
                      <p className="text-xs text-gray-500">
                        Sponsor work visas for international candidates
                      </p>
                    </div>
                  </label>
                </div>
              </section>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Review Your Job Posting
              </h2>

              {/* Job Details Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Job Details</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">Job Title</dt>
                    <dd className="font-medium text-gray-900">
                      {formData.jobTitle || "Not specified"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Employment Type</dt>
                    <dd className="font-medium text-gray-900">
                      {formData.employmentType}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Work Location</dt>
                    <dd className="font-medium text-gray-900">
                      {formData.workLocationType}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Location</dt>
                    <dd className="font-medium text-gray-900">
                      {formData.location || "Not specified"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Salary Range</dt>
                    <dd className="font-medium text-gray-900">
                      {formData.salaryMin && formData.salaryMax
                        ? `$${formData.salaryMin} - $${formData.salaryMax} ${formData.salaryPeriod}`
                        : "Not specified"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Experience Level</dt>
                    <dd className="font-medium text-gray-900">
                      {formData.experienceLevel}
                    </dd>
                  </div>
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

              {/* Benefits */}
              {formData.benefits.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Benefits</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.benefits.map((benefit) => (
                      <span
                        key={benefit}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Job Description Preview */}
              {formData.jobDescription && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Job Description</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {formData.jobDescription}
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
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={createJobMutation.isPending}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{createJobMutation.isPending ? "Saving..." : "Save Draft"}</span>
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={createJobMutation.isPending}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                  <span>{createJobMutation.isPending ? "Publishing..." : "Publish Job"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
