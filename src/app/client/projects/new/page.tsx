"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PROJECT_TEMPLATES = {
  web_app: { name: "Web Application", desc: "Build a responsive web application", tech: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL"], complexity: "moderate", duration: 30 },
  mobile_app: { name: "Mobile Application", desc: "Create a native or cross-platform mobile app", tech: ["React Native", "Flutter", "Swift", "Kotlin", "Firebase"], complexity: "moderate", duration: 45 },
  api_development: { name: "API Development", desc: "Design and implement RESTful or GraphQL APIs", tech: ["Node.js", "Express.js", "Python", "Django", "PostgreSQL"], complexity: "simple", duration: 20 },
  ecommerce: { name: "E-commerce Platform", desc: "Build a complete online store", tech: ["Next.js", "Stripe", "PostgreSQL", "Redis", "AWS"], complexity: "complex", duration: 60 },
  dashboard: { name: "Admin Dashboard", desc: "Create a data visualization dashboard", tech: ["React", "TypeScript", "Chart.js", "Material-UI"], complexity: "moderate", duration: 25 },
  custom: { name: "Custom Project", desc: "Define your own requirements", tech: [], complexity: "moderate", duration: 30 },
};

const MARKET_RATES = { simple: { min: 30, max: 50, avg: 40 }, moderate: { min: 45, max: 75, avg: 60 }, complex: { min: 70, max: 120, avg: 95 } };

export default function NewProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [techInput, setTechInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [form, setForm] = useState({
    projectTemplate: "", title: "", description: "", category: "", techStack: [] as string[], skills: [] as string[],
    complexity: "moderate", budget: "", projectType: "fixed", deadline: "", estimatedDuration: 30, visibility: "public",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.push("/auth"); return; }
    if (session.user.role !== "client") { router.push("/dashboard"); return; }
  }, [session, status, router]);

  if (status === "loading" || !session || session.user.role !== "client") {
    return <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"><div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div></main>;
  }

  const techOptions = ["React", "Next.js", "Vue.js", "Angular", "TypeScript", "JavaScript", "Node.js", "Express.js", "Python", "Django", "Java", "Spring Boot", "C#", ".NET", "PHP", "Laravel", "Ruby", "Go", "Rust", "React Native", "Flutter", "Swift", "Kotlin", "MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase", "GraphQL", "REST API", "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes"];
  const skillOptions = ["Frontend Development", "Backend Development", "Full Stack Development", "Mobile Development", "UI/UX Design", "Database Design", "API Development", "Cloud Architecture", "DevOps", "Testing & QA", "Security", "Performance Optimization"];
  const categories = ["Web Development", "Mobile App Development", "Desktop Application", "UI/UX Design", "Frontend Development", "Backend Development", "Full Stack Development", "Database Development", "API Development", "Cloud Computing", "DevOps & CI/CD", "Software Testing & QA"];

  const selectTemplate = (key: string) => {
    const t = PROJECT_TEMPLATES[key as keyof typeof PROJECT_TEMPLATES];
    setForm(p => ({ ...p, projectTemplate: key, techStack: t.tech, complexity: t.complexity, estimatedDuration: t.duration }));
  };

  const refineDesc = () => {
    let desc = form.description;
    if (form.projectTemplate && form.projectTemplate !== "custom") {
      desc += `\n\nSuggested Features:\n`;
      if (form.projectTemplate === "web_app") desc += "- User authentication\n- Responsive design\n- Database integration\n- RESTful API\n";
      else if (form.projectTemplate === "mobile_app") desc += "- Cross-platform compatibility\n- Push notifications\n- Offline functionality\n- App store deployment\n";
      else if (form.projectTemplate === "api_development") desc += "- RESTful/GraphQL endpoints\n- Authentication & rate limiting\n- Documentation\n- Error handling\n";
      else if (form.projectTemplate === "ecommerce") desc += "- Product catalog\n- Shopping cart\n- Payment gateway\n- Order tracking\n";
    }
    setForm(p => ({ ...p, description: desc }));
  };

  const calcBudget = () => {
    const rates = MARKET_RATES[form.complexity as keyof typeof MARKET_RATES];
    const est = rates.avg * 6 * form.estimatedDuration;
    return { min: rates.min * 6 * form.estimatedDuration, max: rates.max * 6 * form.estimatedDuration, suggested: est };
  };

  const estimateTime = () => {
    let base = 30;
    if (form.projectTemplate && form.projectTemplate !== "custom") {
      base = PROJECT_TEMPLATES[form.projectTemplate as keyof typeof PROJECT_TEMPLATES].duration;
    }
    const multipliers: Record<string, number> = { simple: 0.7, moderate: 1.0, complex: 1.5 };
    const mult = multipliers[form.complexity] ?? 1.0;
    setForm(p => ({ ...p, estimatedDuration: Math.round(base * mult) }));
  };

  const filtered = techOptions.filter(t => t.toLowerCase().includes(techInput.toLowerCase()) && !form.techStack.includes(t));

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1 && !form.projectTemplate) e.projectTemplate = "Select a template";
    if (s === 2) {
      if (!form.title.trim()) e.title = "Title required";
      if (!form.description.trim()) e.description = "Description required";
      if (!form.category) e.category = "Category required";
    }
    if (s === 3) {
      if (form.techStack.length === 0) e.techStack = "Add at least one technology";
      if (form.skills.length === 0) e.skills = "Select at least one skill";
    }
    if (s === 4) {
      if (!form.budget) e.budget = "Budget required";
      if (!form.deadline) e.deadline = "Deadline required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep(p => Math.min(p + 1, 5)); };
  const prev = () => setStep(p => Math.max(p - 1, 1));

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent form submission on Enter key - only allow explicit button clicks
    if (step < 5) {
      next();
    }
    // Do nothing if on step 5 - only the submit button should trigger submission
  };

  const handlePostProject = async () => {
    if (!validate(5)) return;
    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setErrors({ general: data.error ?? "Failed to create project" }); return; }
      router.push("/client/projects");
    } catch { setErrors({ general: "An error occurred" }); }
    finally { setSubmitting(false); }
  };

  const budget = calcBudget();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Post a New Project</h1>
          <p className="text-gray-400">Guided workflow with AI-assisted features</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= s ? "bg-purple-600 border-purple-600 text-white" : "bg-white/5 border-white/20 text-gray-400"}`}>{s}</div>
                {s < 5 && <div className={`flex-1 h-1 mx-2 ${step > s ? "bg-purple-600" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Template</span><span>Details</span><span>Tech Stack</span><span>Budget</span><span>Visibility</span>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {step === 1 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Choose a Project Template</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(PROJECT_TEMPLATES).map(([key, t]) => (
                  <button key={key} type="button" onClick={() => selectTemplate(key)} className={`p-6 rounded-lg border-2 text-left transition ${form.projectTemplate === key ? "border-purple-500 bg-purple-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
                    <h3 className="text-lg font-semibold text-white mb-2">{t.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{t.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {t.tech.slice(0, 3).map((tech) => (<span key={tech} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">{tech}</span>))}
                      {t.tech.length > 3 && <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">+{t.tech.length - 3} more</span>}
                    </div>
                  </button>
                ))}
              </div>
              {errors.projectTemplate && <p className="mt-4 text-sm text-red-400">{errors.projectTemplate}</p>}
            </div>
          )}

          {step === 2 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Project Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Project Title *</label>
                  <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.title ? "border-red-500" : "border-white/10"}`} placeholder="e.g., Build a responsive e-commerce website" />
                  {errors.title && <p className="mt-2 text-sm text-red-400">{errors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Project Description *</label>
                  <textarea rows={6} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.description ? "border-red-500" : "border-white/10"}`} placeholder="Describe your project in detail..." />
                  {errors.description && <p className="mt-2 text-sm text-red-400">{errors.description}</p>}
                  <button type="button" onClick={refineDesc} className="mt-3 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-sm transition">✨ AI-Assist: Add Suggested Features</button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                  <select value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.category ? "border-red-500" : "border-white/10"}`}>
                    <option value="" className="bg-slate-800">Select a category</option>
                    {categories.map((cat) => (<option key={cat} value={cat} className="bg-slate-800">{cat}</option>))}
                  </select>
                  {errors.category && <p className="mt-2 text-sm text-red-400">{errors.category}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Technical Requirements</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Technology Stack *</label>
                  <div className="relative">
                    <input type="text" value={techInput} onChange={(e) => { setTechInput(e.target.value); setShowSuggestions(e.target.value.length > 0); }} onFocus={() => setShowSuggestions(techInput.length > 0)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Type to search technologies..." />
                    {showSuggestions && filtered.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {filtered.slice(0, 10).map((tech) => (<button key={tech} type="button" onClick={() => { setForm(p => ({ ...p, techStack: [...p.techStack, tech] })); setTechInput(""); setShowSuggestions(false); }} className="w-full px-4 py-2 text-left text-white hover:bg-purple-600/20 transition">{tech}</button>))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.techStack.map((tech) => (<span key={tech} className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm flex items-center gap-2">{tech}<button type="button" onClick={() => setForm(p => ({ ...p, techStack: p.techStack.filter(t => t !== tech) }))} className="hover:text-red-300">×</button></span>))}
                  </div>
                  {errors.techStack && <p className="mt-2 text-sm text-red-400">{errors.techStack}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Required Skills *</label>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map((skill) => (<button key={skill} type="button" onClick={() => setForm(p => ({ ...p, skills: p.skills.includes(skill) ? p.skills.filter(s => s !== skill) : [...p.skills, skill] }))} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${form.skills.includes(skill) ? "bg-purple-600 text-white" : "bg-white/5 text-gray-300 hover:bg-white/10"}`}>{skill}</button>))}
                  </div>
                  {errors.skills && <p className="mt-2 text-sm text-red-400">{errors.skills}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Project Complexity</label>
                  <div className="grid grid-cols-3 gap-4">
                    {["simple", "moderate", "complex"].map((level) => (<button key={level} type="button" onClick={() => { setForm(p => ({ ...p, complexity: level })); estimateTime(); }} className={`p-4 rounded-lg border-2 text-center transition ${form.complexity === level ? "border-purple-500 bg-purple-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}><div className="text-white font-semibold capitalize">{level}</div><div className="text-xs text-gray-400 mt-1">${MARKET_RATES[level as keyof typeof MARKET_RATES].min}-${MARKET_RATES[level as keyof typeof MARKET_RATES].max}/hr</div></button>))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Budget & Timeline</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Budget (USD) *</label>
                  <input type="number" value={form.budget} onChange={(e) => setForm(p => ({ ...p, budget: e.target.value }))} className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.budget ? "border-red-500" : "border-white/10"}`} placeholder="5000" />
                  {errors.budget && <p className="mt-2 text-sm text-red-400">{errors.budget}</p>}
                  <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="text-sm text-purple-300 font-semibold mb-2">💡 Market Rate Suggestions</div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div><div className="text-gray-400">Minimum</div><div className="text-white font-semibold">${budget.min.toLocaleString()}</div></div>
                      <div><div className="text-gray-400">Suggested</div><div className="text-purple-300 font-semibold">${budget.suggested.toLocaleString()}</div></div>
                      <div><div className="text-gray-400">Maximum</div><div className="text-white font-semibold">${budget.max.toLocaleString()}</div></div>
                    </div>
                    <button type="button" onClick={() => setForm(p => ({ ...p, budget: budget.suggested.toString() }))} className="mt-3 text-xs text-purple-300 hover:text-purple-200 underline">Use suggested budget</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Project Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    {["fixed", "hourly"].map((type) => (<button key={type} type="button" onClick={() => setForm(p => ({ ...p, projectType: type }))} className={`p-4 rounded-lg border-2 text-center transition ${form.projectType === type ? "border-purple-500 bg-purple-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}><div className="text-white font-semibold capitalize">{type === "fixed" ? "Fixed Price" : "Hourly Rate"}</div><div className="text-xs text-gray-400 mt-1">{type === "fixed" ? "One-time payment" : "Pay per hour"}</div></button>))}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Deadline *</label>
                    <input type="date" value={form.deadline} onChange={(e) => setForm(p => ({ ...p, deadline: e.target.value }))} className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.deadline ? "border-red-500" : "border-white/10"}`} />
                    {errors.deadline && <p className="mt-2 text-sm text-red-400">{errors.deadline}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Duration</label>
                    <div className="px-4 py-3 bg-purple-500/10 border border-purple-500/20 rounded-lg"><div className="text-2xl font-bold text-purple-300">{form.estimatedDuration} days</div><div className="text-xs text-gray-400 mt-1">Based on complexity</div></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Project Visibility</h2>
              <p className="text-gray-400 mb-6">Choose who can see and apply to your project</p>
              <div className="grid md:grid-cols-2 gap-4">
                {[{ key: "public", name: "Public to All Developers", desc: "Anyone can see and apply to your project" }, { key: "invite_only", name: "Invite Only", desc: "Only developers you invite can see and apply" }].map((vis) => (<button key={vis.key} type="button" onClick={() => setForm(p => ({ ...p, visibility: vis.key }))} className={`p-6 rounded-lg border-2 text-left transition ${form.visibility === vis.key ? "border-purple-500 bg-purple-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}><h3 className="text-lg font-semibold text-white mb-2">{vis.name}</h3><p className="text-sm text-gray-400">{vis.desc}</p></button>))}
              </div>
            </div>
          )}

          {errors.general && (<div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4"><p className="text-sm text-red-400">{errors.general}</p></div>)}

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition border border-white/10">Cancel</button>
            <div className="flex gap-4">
              {step > 1 && <button type="button" onClick={prev} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition border border-white/10">Previous</button>}
              {step < 5 ? (<button type="button" onClick={next} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition">Next</button>) : (<button type="button" onClick={handlePostProject} disabled={submitting} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? "Posting..." : "Post Project"}</button>)}
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
