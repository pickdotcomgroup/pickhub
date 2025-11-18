"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PROJECT_TEMPLATES = {
  web_app: { name: "Web Application", desc: "Build a responsive web application", tech: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL"], duration: 30 },
  mobile_app: { name: "Mobile Application", desc: "Create a native or cross-platform mobile app", tech: ["React Native", "Flutter", "Swift", "Kotlin", "Firebase"], duration: 45 },
  api_development: { name: "API Development", desc: "Design and implement RESTful or GraphQL APIs", tech: ["Node.js", "Express.js", "Python", "Django", "PostgreSQL"], duration: 20 },
  ecommerce: { name: "E-commerce Platform", desc: "Build a complete online store", tech: ["Next.js", "Stripe", "PostgreSQL", "Redis", "AWS"], duration: 60 },
  dashboard: { name: "Admin Dashboard", desc: "Create a data visualization dashboard", tech: ["React", "TypeScript", "Chart.js", "Material-UI"], duration: 25 },
  ai_development: { name: "AI Development", desc: "Build AI-powered applications and machine learning models", tech: ["Python", "TensorFlow", "PyTorch", "OpenAI", "LangChain", "FastAPI"], duration: 40 },
  cms_application: { name: "CMS Application Development", desc: "Create a content management system", tech: ["Next.js", "Strapi", "WordPress", "Contentful", "PostgreSQL", "GraphQL"], duration: 35 },
  blockchain_development: { name: "BlockChain Development", desc: "Develop blockchain and smart contract solutions", tech: ["Solidity", "Ethereum", "Web3.js", "Hardhat", "React", "Node.js"], duration: 50 },
  web3_development: { name: "Web3 Development", desc: "Build decentralized applications (dApps)", tech: ["Solidity", "Ethers.js", "IPFS", "MetaMask", "React", "TypeScript"], duration: 45 },
  custom: { name: "Custom Project", desc: "Define your own requirements", tech: [], duration: 30 },
};

const MARKET_RATE = { min: 45, max: 75, avg: 60 };

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
    budget: "", projectType: "fixed", deadline: "", estimatedDuration: 30, visibility: "public", hourlyRate: 0,
  });

  // Authentication check - must be before any conditional returns
  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.push("/auth"); return; }
    if (session.user.role !== "client") { router.push("/dashboard"); return; }
  }, [session, status, router]);

  // Update hourly rate when budget or duration changes
  useEffect(() => {
    if (form.projectType === "hourly") {
      const hoursPerDay = 8;
      const workingDays = 22;
      const totalHours = workingDays * hoursPerDay;
      const rate = form.budget && form.estimatedDuration ? parseFloat(form.budget) / totalHours : 0;
      setForm(p => ({ ...p, hourlyRate: rate }));
    }
  }, [form.budget, form.estimatedDuration, form.projectType]);

  if (status === "loading" || !session || session.user.role !== "client") {
    return <main className="flex min-h-screen items-center justify-center bg-white"><div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div></main>;
  }

  const techOptions = ["React", "Next.js", "Vue.js", "Angular", "TypeScript", "JavaScript", "Node.js", "Express.js", "Python", "Django", "Java", "Spring Boot", "C#", ".NET", "PHP", "Laravel", "Ruby", "Go", "Rust", "React Native", "Flutter", "Swift", "Kotlin", "MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase", "GraphQL", "REST API", "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes"];
  const skillOptions = ["Frontend Development", "Backend Development", "Full Stack Development", "Mobile Development", "UI/UX Design", "Database Design", "API Development", "Cloud Architecture", "DevOps", "Testing & QA", "Security", "Performance Optimization"];
  const categories = ["Web Development", "Mobile App Development", "Desktop Application", "UI/UX Design", "Frontend Development", "Backend Development", "Full Stack Development", "Database Development", "API Development", "Cloud Computing", "DevOps & CI/CD", "Software Testing & QA"];

  const selectTemplate = (key: string) => {
    const t = PROJECT_TEMPLATES[key as keyof typeof PROJECT_TEMPLATES];
    setForm(p => ({ ...p, projectTemplate: key, techStack: t.tech, estimatedDuration: t.duration }));
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
    const est = MARKET_RATE.avg * 6 * form.estimatedDuration;
    return { min: MARKET_RATE.min * 6 * form.estimatedDuration, max: MARKET_RATE.max * 6 * form.estimatedDuration, suggested: est };
  };

  // Calculate hourly rate based on budget and estimated duration
  const calcHourlyRate = () => {
    if (!form.budget || !form.estimatedDuration) return 0;
    const hoursPerDay = 8; // Assuming 8 working hours per day
    const workingDays = 22; // Standard working days per month (excluding weekends)
    const totalHours = workingDays * hoursPerDay;
    return parseFloat(form.budget) / totalHours;
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
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Project</h1>
          <p className="text-gray-600">Guided workflow with AI-assisted features</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex flex-col items-center" style={{ flex: s < 5 ? '1' : '0 0 auto' }}>
                <div className="flex items-center w-full">
                  {s > 1 && <div className={`flex-1 h-1 ${step > s - 1 ? "bg-blue-600" : "bg-gray-200"}`} />}
                  <div className="flex-shrink-0">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= s ? "bg-blue-600 border-blue-600 text-white" : "bg-gray-100 border-gray-300 text-gray-400"}`}>{s}</div>
                  </div>
                  {s < 5 && <div className={`flex-1 h-1 ${step > s ? "bg-blue-600" : "bg-gray-200"}`} />}
                </div>
                <span className="mt-2 text-xs text-gray-500 text-center whitespace-nowrap">
                  {s === 1 && "Template"}
                  {s === 2 && "Details"}
                  {s === 3 && "Tech Stack"}
                  {s === 4 && "Budget"}
                  {s === 5 && "Visibility"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {step === 1 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose a Project Template</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(PROJECT_TEMPLATES).map(([key, t]) => {
                  const getIcon = () => {
                    switch(key) {
                      case 'web_app':
                        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />;
                      case 'mobile_app':
                        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />;
                      case 'api_development':
                        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />;
                      case 'ecommerce':
                        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />;
                      case 'dashboard':
                        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />;
                      case 'ai_development':
                        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />;
                      case 'cms_application':
                        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />;
                      case 'blockchain_development':
                        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />;
                      case 'web3_development':
                        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />;
                      case 'custom':
                        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />;
                      default:
                        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />;
                    }
                  };
                  
                  return (
                    <button key={key} type="button" onClick={() => selectTemplate(key)} className={`p-6 rounded-lg border-2 text-left transition flex items-start gap-4 ${form.projectTemplate === key ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}>
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {getIcon()}
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.name}</h3>
                        <p className="text-sm text-gray-600">{t.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.projectTemplate && <p className="mt-4 text-sm text-red-600">{errors.projectTemplate}</p>}
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Title *</label>
                  <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? "border-red-500" : "border-gray-300"}`} placeholder="e.g., Build a responsive e-commerce website" />
                  {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Description *</label>
                  <textarea rows={6} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? "border-red-500" : "border-gray-300"}`} placeholder="Describe your project in detail..." />
                  {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
                  <button type="button" onClick={refineDesc} className="mt-3 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm transition">✨ AI-Assist: Add Suggested Features</button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category ? "border-red-500" : "border-gray-300"}`}>
                    <option value="" className="bg-white">Select a category</option>
                    {categories.map((cat) => (<option key={cat} value={cat} className="bg-white">{cat}</option>))}
                  </select>
                  {errors.category && <p className="mt-2 text-sm text-red-600">{errors.category}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Technical Requirements</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Technology Stack *</label>
                  <div className="relative">
                    <input type="text" value={techInput} onChange={(e) => { setTechInput(e.target.value); setShowSuggestions(e.target.value.length > 0); }} onFocus={() => setShowSuggestions(techInput.length > 0)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type to search technologies..." />
                    {showSuggestions && filtered.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {filtered.slice(0, 10).map((tech) => (<button key={tech} type="button" onClick={() => { setForm(p => ({ ...p, techStack: [...p.techStack, tech] })); setTechInput(""); setShowSuggestions(false); }} className="w-full px-4 py-2 text-left text-gray-900 hover:bg-blue-50 transition">{tech}</button>))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.techStack.map((tech) => (<span key={tech} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2">{tech}<button type="button" onClick={() => setForm(p => ({ ...p, techStack: p.techStack.filter(t => t !== tech) }))} className="hover:text-red-300">×</button></span>))}
                  </div>
                  {errors.techStack && <p className="mt-2 text-sm text-red-600">{errors.techStack}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Required Skills *</label>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map((skill) => (<button key={skill} type="button" onClick={() => setForm(p => ({ ...p, skills: p.skills.includes(skill) ? p.skills.filter(s => s !== skill) : [...p.skills, skill] }))} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${form.skills.includes(skill) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{skill}</button>))}
                  </div>
                  {errors.skills && <p className="mt-2 text-sm text-red-600">{errors.skills}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget & Timeline</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget (USD) *</label>
                  <input type="number" value={form.budget} onChange={(e) => setForm(p => ({ ...p, budget: e.target.value }))} className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.budget ? "border-red-500" : "border-gray-300"}`} placeholder="5000" />
                  {errors.budget && <p className="mt-2 text-sm text-red-600">{errors.budget}</p>}
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-700 font-semibold mb-2">💡 Market Rate Suggestions</div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div><div className="text-gray-600">Minimum</div><div className="text-gray-900 font-semibold">${budget.min.toLocaleString()}</div></div>
                      <div><div className="text-gray-600">Suggested</div><div className="text-blue-700 font-semibold">${budget.suggested.toLocaleString()}</div></div>
                      <div><div className="text-gray-600">Maximum</div><div className="text-gray-900 font-semibold">${budget.max.toLocaleString()}</div></div>
                    </div>
                    <button type="button" onClick={() => setForm(p => ({ ...p, budget: budget.suggested.toString() }))} className="mt-3 text-xs text-blue-700 hover:text-blue-800 underline">Use suggested budget</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Project Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    {["fixed", "hourly"].map((type) => (<button key={type} type="button" onClick={() => setForm(p => ({ ...p, projectType: type }))} className={`p-4 rounded-lg border-2 text-center transition ${form.projectType === type ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}><div className="text-gray-900 font-semibold capitalize">{type === "fixed" ? "Fixed Price" : "Hourly Rate"}</div><div className="text-xs text-gray-600 mt-1">{type === "fixed" ? "One-time payment" : "Pay per hour"}</div></button>))}
                  </div>
                  {form.projectType === "hourly" && form.budget && form.estimatedDuration && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm text-green-700 font-semibold mb-2">💰 Calculated Hourly Rate</div>
                      <div className="text-2xl font-bold text-green-700">${calcHourlyRate().toFixed(2)}/hour</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Based on ${parseFloat(form.budget).toLocaleString()} budget ÷ 22 working days × 8 hours/day
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target completion Date</label>
                    <input type="date" value={form.deadline} onChange={(e) => setForm(p => ({ ...p, deadline: e.target.value }))} className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.deadline ? "border-red-500" : "border-gray-300"}`} />
                    {errors.deadline && <p className="mt-2 text-sm text-red-600">{errors.deadline}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Duration</label>
                    <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg"><div className="text-2xl font-bold text-blue-700">{form.estimatedDuration} days</div><div className="text-xs text-gray-600 mt-1">Based on project template</div></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Visibility</h2>
              <p className="text-gray-600 mb-6">Choose who can see and apply to your project</p>
              <div className="grid md:grid-cols-2 gap-4">
                {[{ key: "public", name: "Public to All Developers", desc: "Anyone can see and apply to your project" }, { key: "invite_only", name: "Invite Only", desc: "Only developers you invite can see and apply" }].map((vis) => (<button key={vis.key} type="button" onClick={() => setForm(p => ({ ...p, visibility: vis.key }))} className={`p-6 rounded-lg border-2 text-left transition ${form.visibility === vis.key ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}><h3 className="text-lg font-semibold text-gray-900 mb-2">{vis.name}</h3><p className="text-sm text-gray-600">{vis.desc}</p></button>))}
              </div>
            </div>
          )}

          {errors.general && (<div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-sm text-red-600">{errors.general}</p></div>)}

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition border border-gray-300">Cancel</button>
            <div className="flex gap-4">
              {step > 1 && <button type="button" onClick={prev} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition border border-gray-300">Previous</button>}
              {step < 5 ? (<button type="button" onClick={next} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">Next</button>) : (<button type="button" onClick={handlePostProject} disabled={submitting} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? "Posting..." : "Post Project"}</button>)}
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
