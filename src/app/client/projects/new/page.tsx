"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
    category: "",
    skills: [] as string[],
    projectType: "fixed",
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth");
      return;
    }

    if (session.user.role !== "client") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <div className="text-lg text-white">Loading projects...</div>
        </div>
      </main>
    );
  }

  if (!session || session.user.role !== "client") {
    return null;
  }

  const skillOptions = [
    "React", "Next.js", "Vue.js", "Angular", "Svelte",
    "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS", "Bootstrap",
    "Node.js", "Express.js", "NestJS", "Python", "Django", "Flask",
    "Java", "Spring Boot", "C#", ".NET", "PHP", "Laravel",
    "Ruby", "Ruby on Rails", "Go", "Rust",
    "React Native", "Flutter", "Swift", "Kotlin", "Ionic",
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase",
    "GraphQL", "REST API", "WebSocket", "Microservices",
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes",
    "CI/CD", "Jenkins", "GitHub Actions", "DevOps",
    "Git", "Linux", "Nginx", "Apache",
    "TensorFlow", "PyTorch", "Machine Learning", "AI",
    "Blockchain", "Solidity", "Web3", "Smart Contracts",
    "Unity", "Unreal Engine", "Game Development",
    "Selenium", "Jest", "Cypress", "Testing",
    "UI/UX Design", "Figma", "Adobe XD",
  ];

  const categories = [
    "Web Development",
    "Mobile App Development",
    "Desktop Application",
    "UI/UX Design",
    "Frontend Development",
    "Backend Development",
    "Full Stack Development",
    "Database Development",
    "API Development",
    "Cloud Computing",
    "DevOps & CI/CD",
    "Software Testing & QA",
    "Cybersecurity",
    "Blockchain Development",
    "AI & Machine Learning",
    "Data Science & Analytics",
    "Game Development",
    "IoT Development",
    "System Architecture",
    "Technical Support",
  ];

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Project title is required";
    if (!formData.description.trim()) newErrors.description = "Project description is required";
    if (!formData.budget) newErrors.budget = "Budget is required";
    if (!formData.deadline) newErrors.deadline = "Deadline is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.skills.length === 0) newErrors.skills = "At least one skill is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json() as { error?: string };

      if (!response.ok) {
        setErrors({ general: data.error ?? "Failed to create project" });
        return;
      }

      // Redirect to projects page on success
      router.push("/client/projects");
    } catch {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Post a New Project</h1>
          <p className="text-gray-400">Fill in the details to create your project posting</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Title */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.title ? "border-red-500" : "border-white/10"
              }`}
              placeholder="e.g., Build a responsive e-commerce website"
            />
            {errors.title && <p className="mt-2 text-sm text-red-400">{errors.title}</p>}
          </div>

          {/* Project Description */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Project Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.description ? "border-red-500" : "border-white/10"
              }`}
              placeholder="Describe your project in detail..."
            />
            {errors.description && <p className="mt-2 text-sm text-red-400">{errors.description}</p>}
          </div>

          {/* Budget and Deadline */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">
                Budget (USD) *
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.budget ? "border-red-500" : "border-white/10"
                }`}
                placeholder="5000"
              />
              {errors.budget && <p className="mt-2 text-sm text-red-400">{errors.budget}</p>}
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-2">
                Deadline *
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.deadline ? "border-red-500" : "border-white/10"
                }`}
              />
              {errors.deadline && <p className="mt-2 text-sm text-red-400">{errors.deadline}</p>}
            </div>
          </div>

          {/* Category and Project Type */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.category ? "border-red-500" : "border-white/10"
                }`}
              >
                <option value="" className="bg-slate-800">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-800">
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-2 text-sm text-red-400">{errors.category}</p>}
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <label htmlFor="projectType" className="block text-sm font-medium text-gray-300 mb-2">
                Project Type
              </label>
              <select
                id="projectType"
                name="projectType"
                value={formData.projectType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="fixed" className="bg-slate-800">Fixed Price</option>
                <option value="hourly" className="bg-slate-800">Hourly Rate</option>
              </select>
            </div>
          </div>

          {/* Required Skills */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Required Skills *
            </label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    formData.skills.includes(skill)
                      ? "bg-purple-600 text-white"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            {errors.skills && <p className="mt-2 text-sm text-red-400">{errors.skills}</p>}
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-sm text-red-400">{errors.general}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition border border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Posting..." : "Post Project"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
