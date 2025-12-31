"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Star,
  Globe,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Briefcase,
  BookOpen,
  Users,
  Award,
  Clock,
  Building,
  ArrowRight,
  CheckCircle,
  X,
  Shield,
  Zap,
} from "lucide-react";

interface Provider {
  id: string;
  name: string;
  category: string;
  type: string;
  rating: number;
  reviewCount: string;
  description: string;
  fullDescription: string;
  skills: string[];
  courseCount: number;
  studentCount: string;
  certificationCount: number;
  supportType: string;
  location: string;
  website: string;
  email: string;
  phone: string;
  headquarters: string;
  logo: string;
  logoColor: string;
  verified: boolean;
  courses: Course[];
  accreditations: string[];
}

interface Course {
  id: string;
  title: string;
  level: string;
  duration: string;
  rating: number;
  students: string;
}

// Pricing types and interfaces
type TrainingType = "online" | "onsite";

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  highlighted?: boolean;
  maxUsers?: number;
}

interface PricingConfig {
  online: PricingTier[];
  onsite: PricingTier[];
}

// Pricing plans data
const pricingPlans: PricingConfig = {
  online: [
    {
      id: "online-essential",
      name: "Essential",
      description: "Perfect for individual learners starting their journey",
      price: 49,
      duration: "1 month",
      features: [
        "Access to core course content",
        "Self-paced learning",
        "Community forum access",
        "Basic completion certificate",
        "Email support (48h response)",
      ],
      highlighted: false,
    },
    {
      id: "online-professional",
      name: "Professional",
      description: "Best for serious professionals advancing their career",
      price: 99,
      duration: "1 month",
      features: [
        "All Essential features",
        "2x 1-on-1 mentorship sessions",
        "Priority support (24h response)",
        "Verified certification",
        "Downloadable resources",
        "Project review & feedback",
      ],
      highlighted: true,
    },
    {
      id: "online-team",
      name: "Team",
      description: "Ideal for small teams learning together",
      price: 199,
      duration: "1 month",
      features: [
        "All Professional features",
        "Up to 5 team members",
        "Team progress dashboard",
        "Dedicated account manager",
        "Custom learning paths",
        "Group workshops",
      ],
      highlighted: false,
      maxUsers: 5,
    },
  ],
  onsite: [
    {
      id: "onsite-essential",
      name: "Essential",
      description: "Hands-on workshop experience for individuals",
      price: 99,
      duration: "1 month",
      features: [
        "In-person workshop attendance",
        "Training materials included",
        "Networking opportunities",
        "Basic completion certificate",
        "Email support",
      ],
      highlighted: false,
    },
    {
      id: "onsite-professional",
      name: "Professional",
      description: "Premium onsite experience with mentorship",
      price: 179,
      duration: "1 month",
      features: [
        "All Essential features",
        "Priority seating in workshops",
        "4x 1-on-1 mentorship sessions",
        "Verified certification",
        "Recording access post-session",
        "Exclusive networking events",
      ],
      highlighted: true,
    },
    {
      id: "onsite-team",
      name: "Team",
      description: "Complete team training solution",
      price: 399,
      duration: "1 month",
      features: [
        "All Professional features",
        "Up to 5 team members",
        "Private team workshop option",
        "Dedicated account manager",
        "Custom curriculum consultation",
        "Team building activities",
      ],
      highlighted: false,
      maxUsers: 5,
    },
  ],
};

// Extended provider data with full details
const providersData: Record<string, Provider> = {
  "1": {
    id: "1",
    name: "Microsoft Learn",
    category: "Cloud & Infrastructure",
    type: "Global Training Partner",
    rating: 4.9,
    reviewCount: "2.4k",
    description: "Master Azure cloud services, .NET development, and enterprise solutions...",
    fullDescription: `Microsoft Learn provides self-paced digital learning resources to help you build skills and advance your career. We offer interactive training, certification preparation, and hands-on labs for Microsoft technologies including Azure, Microsoft 365, Power Platform, and more.

Whether you're a student, a business professional, or a technical expert, our role-based learning paths are designed to help you gain the technical skills you need to succeed. Our curriculum is constantly updated to reflect the latest industry trends and technology updates.`,
    skills: ["Cloud Computing", ".NET Development", "Azure DevOps", "Data Science"],
    courseCount: 140,
    studentCount: "50k+",
    certificationCount: 35,
    supportType: "24/7",
    location: "Redmond, WA (HQ)",
    website: "learn.microsoft.com",
    email: "contact@learn.microsoft.com",
    phone: "+1 (800) 642-7676",
    headquarters: "One Microsoft Way, Redmond, WA 98052",
    logo: "/logos/microsoft.svg",
    logoColor: "bg-blue-100",
    verified: true,
    courses: [
      { id: "c1", title: "Azure Fundamentals (AZ-900)", level: "Beginner", duration: "8 hours", rating: 4.9, students: "15k+" },
      { id: "c2", title: "Azure Administrator (AZ-104)", level: "Intermediate", duration: "40 hours", rating: 4.8, students: "8k+" },
      { id: "c3", title: ".NET Core Web Development", level: "Intermediate", duration: "24 hours", rating: 4.7, students: "12k+" },
      { id: "c4", title: "Power Platform Fundamentals", level: "Beginner", duration: "6 hours", rating: 4.8, students: "5k+" },
    ],
    accreditations: ["Microsoft Partner Network", "ISO 27001 Certified", "SOC 2 Type II"],
  },
  "2": {
    id: "2",
    name: "Netflix Engineering",
    category: "System Design",
    type: "Industry Training Partner",
    rating: 4.8,
    reviewCount: "1.2k",
    description: "Deep dive into microservices, chaos engineering, and high-scale systems...",
    fullDescription: `Netflix Engineering offers exclusive insights into building and operating one of the world's largest streaming platforms. Our workshops cover microservices architecture, chaos engineering principles, and strategies for handling millions of concurrent users.

Learn from the engineers who built Netflix's resilient infrastructure. Our courses emphasize practical, battle-tested approaches to system design that can be applied to any large-scale application.`,
    skills: ["Microservices", "Java", "System Design", "Chaos Engineering"],
    courseCount: 28,
    studentCount: "12k+",
    certificationCount: 8,
    supportType: "Business Hours",
    location: "Los Gatos, CA (HQ)",
    website: "netflixtechblog.com",
    email: "training@netflix.com",
    phone: "+1 (408) 540-3700",
    headquarters: "100 Winchester Circle, Los Gatos, CA 95032",
    logo: "/logos/netflix.svg",
    logoColor: "bg-red-100",
    verified: true,
    courses: [
      { id: "c1", title: "Microservices at Scale", level: "Advanced", duration: "16 hours", rating: 4.9, students: "3k+" },
      { id: "c2", title: "Chaos Engineering Principles", level: "Advanced", duration: "12 hours", rating: 4.8, students: "2.5k+" },
      { id: "c3", title: "Building Resilient Systems", level: "Intermediate", duration: "20 hours", rating: 4.7, students: "4k+" },
    ],
    accreditations: ["AWS Advanced Partner", "Google Cloud Partner"],
  },
  "3": {
    id: "3",
    name: "CodeMaster Pro",
    category: "Full Stack Dev",
    type: "Bootcamp Provider",
    rating: 4.7,
    reviewCount: "3.1k",
    description: "Intensive bootcamps for modern web development. Learn to build complete applications...",
    fullDescription: `CodeMaster Pro delivers intensive, project-based training for aspiring full-stack developers. Our bootcamp-style courses take you from fundamentals to job-ready skills in weeks, not years.

Each course features real-world projects, code reviews from industry professionals, and career support to help you land your dream developer role. Join thousands of successful graduates who've transformed their careers with CodeMaster Pro.`,
    skills: ["React", "Node.js", "SQL", "TypeScript"],
    courseCount: 56,
    studentCount: "25k+",
    certificationCount: 12,
    supportType: "24/7",
    location: "San Francisco, CA (HQ)",
    website: "codemasterpro.com",
    email: "hello@codemasterpro.com",
    phone: "+1 (415) 555-0199",
    headquarters: "500 Terry Francois Blvd, San Francisco, CA 94158",
    logo: "/logos/codemaster.svg",
    logoColor: "bg-green-100",
    verified: true,
    courses: [
      { id: "c1", title: "Full Stack Web Development Bootcamp", level: "Beginner", duration: "120 hours", rating: 4.8, students: "8k+" },
      { id: "c2", title: "React & Redux Masterclass", level: "Intermediate", duration: "40 hours", rating: 4.7, students: "6k+" },
      { id: "c3", title: "Node.js Backend Development", level: "Intermediate", duration: "32 hours", rating: 4.6, students: "5k+" },
    ],
    accreditations: ["DEAC Accredited", "CareerSource Partner"],
  },
  "4": {
    id: "4",
    name: "Design Academy",
    category: "UI/UX & Product",
    type: "Design Education Partner",
    rating: 4.9,
    reviewCount: "2.8k",
    description: "Learn user-centered design, prototyping, and design systems for modern products...",
    fullDescription: `Design Academy is the premier destination for aspiring UI/UX designers. Our comprehensive curriculum covers everything from design thinking fundamentals to advanced prototyping and design systems.

Our instructors are industry veterans from companies like Apple, Google, and Airbnb. Learn the same techniques used to design products used by billions of people worldwide.`,
    skills: ["Figma", "UI/UX", "Prototyping", "Design Systems"],
    courseCount: 34,
    studentCount: "18k+",
    certificationCount: 10,
    supportType: "Business Hours",
    location: "New York, NY (HQ)",
    website: "designacademy.io",
    email: "learn@designacademy.io",
    phone: "+1 (212) 555-0147",
    headquarters: "350 5th Avenue, New York, NY 10118",
    logo: "/logos/design.svg",
    logoColor: "bg-pink-100",
    verified: true,
    courses: [
      { id: "c1", title: "UI/UX Design Fundamentals", level: "Beginner", duration: "24 hours", rating: 4.9, students: "7k+" },
      { id: "c2", title: "Advanced Figma Techniques", level: "Intermediate", duration: "16 hours", rating: 4.8, students: "4k+" },
      { id: "c3", title: "Design Systems Mastery", level: "Advanced", duration: "20 hours", rating: 4.9, students: "3k+" },
    ],
    accreditations: ["Adobe Partner", "Figma Education Partner", "IDEO Certified"],
  },
  "5": {
    id: "5",
    name: "DataWizards",
    category: "Data Science & AI",
    type: "Analytics Training Partner",
    rating: 4.6,
    reviewCount: "1.8k",
    description: "Comprehensive data science tracks covering Python, Machine Learning, and AI...",
    fullDescription: `DataWizards offers cutting-edge training in data science, machine learning, and artificial intelligence. Our courses are designed by data scientists from leading tech companies and research institutions.

From Python basics to deep learning and MLOps, our learning paths prepare you for the most in-demand roles in the data industry. All courses include hands-on projects with real datasets.`,
    skills: ["Python", "Machine Learning", "Pandas", "TensorFlow"],
    courseCount: 41,
    studentCount: "15k+",
    certificationCount: 15,
    supportType: "24/7",
    location: "Boston, MA (HQ)",
    website: "datawizards.ai",
    email: "info@datawizards.ai",
    phone: "+1 (617) 555-0123",
    headquarters: "75 State Street, Boston, MA 02109",
    logo: "/logos/datawizards.svg",
    logoColor: "bg-teal-100",
    verified: true,
    courses: [
      { id: "c1", title: "Python for Data Science", level: "Beginner", duration: "30 hours", rating: 4.7, students: "10k+" },
      { id: "c2", title: "Machine Learning Fundamentals", level: "Intermediate", duration: "40 hours", rating: 4.6, students: "6k+" },
      { id: "c3", title: "Deep Learning with TensorFlow", level: "Advanced", duration: "36 hours", rating: 4.5, students: "3k+" },
    ],
    accreditations: ["AWS Machine Learning Partner", "Google Cloud AI Partner"],
  },
  "6": {
    id: "6",
    name: "SecurNet Labs",
    category: "Cybersecurity",
    type: "Security Training Partner",
    rating: 4.8,
    reviewCount: "950",
    description: "Hands-on training in ethical hacking, network defense, and security operations...",
    fullDescription: `SecurNet Labs provides world-class cybersecurity training for professionals at all levels. Our courses cover ethical hacking, penetration testing, incident response, and security operations.

All training is conducted in isolated lab environments where you can practice real attack and defense techniques safely. Our certifications are recognized by government agencies and Fortune 500 companies.`,
    skills: ["Ethical Hacking", "Network Security", "Penetration Testing", "SIEM"],
    courseCount: 19,
    studentCount: "8k+",
    certificationCount: 7,
    supportType: "Business Hours",
    location: "Washington, DC (HQ)",
    website: "securnetlabs.com",
    email: "training@securnetlabs.com",
    phone: "+1 (202) 555-0189",
    headquarters: "1100 New York Avenue NW, Washington, DC 20005",
    logo: "/logos/securnet.svg",
    logoColor: "bg-orange-100",
    verified: true,
    courses: [
      { id: "c1", title: "Certified Ethical Hacker Prep", level: "Intermediate", duration: "40 hours", rating: 4.8, students: "4k+" },
      { id: "c2", title: "Network Defense Fundamentals", level: "Beginner", duration: "24 hours", rating: 4.7, students: "3k+" },
      { id: "c3", title: "Incident Response & Forensics", level: "Advanced", duration: "32 hours", rating: 4.9, students: "1.5k+" },
    ],
    accreditations: ["CompTIA Partner", "EC-Council ATC", "ISC2 Official Training Partner"],
  },
};

// Provider logo component with fallback icons
function ProviderLogo({ provider, size = "large" }: { provider: Provider; size?: "small" | "large" }) {
  const sizeClasses = size === "large" ? "w-20 h-20" : "w-12 h-12";
  const iconSizeClasses = size === "large" ? "w-10 h-10" : "w-6 h-6";

  const logoIcons: Record<string, React.ReactNode> = {
    "Microsoft Learn": (
      <svg viewBox="0 0 24 24" className={iconSizeClasses} fill="none">
        <rect x="1" y="1" width="10" height="10" fill="#f25022" />
        <rect x="13" y="1" width="10" height="10" fill="#7fba00" />
        <rect x="1" y="13" width="10" height="10" fill="#00a4ef" />
        <rect x="13" y="13" width="10" height="10" fill="#ffb900" />
      </svg>
    ),
    "Netflix Engineering": (
      <svg viewBox="0 0 24 24" className={iconSizeClasses} fill="#E50914">
        <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24h-4.715zm8.489 0v9.63L18.6 24h-4.714V0h.001zm-8.487 0c-.024 0 0 24 0 24h4.714l-.002-9.63L5.4 0z" />
      </svg>
    ),
    "CodeMaster Pro": (
      <svg viewBox="0 0 24 24" className={iconSizeClasses} fill="none" stroke="#22c55e" strokeWidth="2">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    "Design Academy": (
      <svg viewBox="0 0 24 24" className={iconSizeClasses} fill="none" stroke="#ec4899" strokeWidth="2">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
    DataWizards: (
      <svg viewBox="0 0 24 24" className={iconSizeClasses} fill="none" stroke="#14b8a6" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    "SecurNet Labs": (
      <svg viewBox="0 0 24 24" className={iconSizeClasses} fill="none" stroke="#f97316" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  };

  return (
    <div className={`${sizeClasses} bg-amber-50 rounded-xl flex items-center justify-center border-4 border-white shadow-lg`}>
      {logoIcons[provider.name] ?? (
        <div className="flex flex-col items-center gap-1">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#a3a3a3" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span className="text-[8px] text-gray-500 font-medium">COMPANY</span>
        </div>
      )}
    </div>
  );
}

// Star rating component
function StarRating({ rating, showCount = false, count = "" }: { rating: number; showCount?: boolean; count?: string }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[...Array<undefined>(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < fullStars
                ? "text-yellow-400 fill-yellow-400"
                : i === fullStars && hasHalfStar
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <span className="font-bold text-gray-900">{rating}</span>
      {showCount && <span className="text-gray-500 text-sm">{count} Reviews</span>}
    </div>
  );
}

// Pricing Card Component
function PricingCard({
  tier,
  trainingType,
  onSelect,
}: {
  tier: PricingTier;
  trainingType: TrainingType;
  onSelect: (tier: PricingTier) => void;
}) {
  return (
    <div
      className={`relative flex flex-col p-6 rounded-xl ${
        tier.highlighted
          ? "border-2 border-blue-500 ring-2 ring-blue-100 shadow-lg"
          : "border border-gray-200"
      } bg-white`}
    >
      {/* Most Popular Badge */}
      {tier.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}

      {/* Tier Name */}
      <h3 className="text-xl font-bold text-gray-900 mt-2">{tier.name}</h3>
      <p className="text-gray-500 text-sm mt-1 mb-4">{tier.description}</p>

      {/* Price */}
      <div className="mb-4">
        <span className="text-4xl font-bold text-gray-900">${tier.price}</span>
        <span className="text-gray-500">/month</span>
      </div>

      {/* Duration Badge */}
      <div className="mb-6">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
          trainingType === "online"
            ? "bg-blue-100 text-blue-700"
            : "bg-amber-100 text-amber-700"
        }`}>
          {trainingType === "online" ? <BookOpen className="w-4 h-4" /> : <Building className="w-4 h-4" />}
          {tier.duration} access
        </span>
      </div>

      {/* Features */}
      <ul className="space-y-3 flex-1 mb-6">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-600 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Select Button */}
      <button
        onClick={() => onSelect(tier)}
        className={`w-full py-3 rounded-lg font-semibold transition ${
          tier.highlighted
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-gray-900 hover:bg-gray-800 text-white"
        }`}
      >
        Select Plan
      </button>

      {/* Team indicator */}
      {tier.maxUsers && (
        <p className="text-center text-gray-500 text-xs mt-3">
          <Users className="w-3 h-3 inline mr-1" />
          Up to {tier.maxUsers} team members
        </p>
      )}
    </div>
  );
}

// Pricing Modal Component
function PricingModal({
  trainingType,
  provider,
  onClose,
  onSelectPlan,
}: {
  trainingType: TrainingType;
  provider: Provider;
  onClose: () => void;
  onSelectPlan: (tier: PricingTier) => void;
}) {
  const plans = pricingPlans[trainingType];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        {/* Modal Content */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition z-10"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>

          {/* Header */}
          <div className="p-8 pb-0">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                  trainingType === "online"
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-amber-100 text-amber-700 border border-amber-200"
                }`}
              >
                {trainingType === "online" ? (
                  <BookOpen className="w-4 h-4" />
                ) : (
                  <Building className="w-4 h-4" />
                )}
                {trainingType === "online" ? "Online Training" : "Onsite Training"}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Select a plan for {provider.name}
            </h2>
            <p className="text-gray-500 mt-1">
              Choose the plan that best fits your learning goals. All plans include 1 month of access.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((tier) => (
                <PricingCard
                  key={tier.id}
                  tier={tier}
                  trainingType={trainingType}
                  onSelect={onSelectPlan}
                />
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="px-8 pb-8">
            <div className="flex items-center justify-center gap-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Shield className="w-5 h-5 text-green-500" />
                Secure Payment
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Satisfaction Guaranteed
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Zap className="w-5 h-5 text-green-500" />
                Instant Access
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProviderProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const providerId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [selectedTrainingType, setSelectedTrainingType] = useState<TrainingType | null>(null);

  // Event handlers for pricing modal
  const handleOpenPricingModal = (type: TrainingType) => {
    setSelectedTrainingType(type);
    setPricingModalOpen(true);
  };

  const handleClosePricingModal = () => {
    setPricingModalOpen(false);
    setSelectedTrainingType(null);
  };

  const handleSelectPlan = (tier: PricingTier) => {
    // Navigate to scheduling page based on training type
    const route = selectedTrainingType === "online"
      ? `/talent/upskilling/provider/${providerId}/schedule/online`
      : `/talent/upskilling/provider/${providerId}/schedule/onsite`;

    router.push(`${route}?plan=${tier.id}&price=${tier.price}&name=${encodeURIComponent(tier.name)}`);
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth");
      return;
    }

    if (session.user.role !== "talent") {
      router.push("/dashboard");
      return;
    }

    // Check verification and load provider data
    const loadData = async () => {
      try {
        const response = await fetch("/api/verification/status");
        if (response.ok) {
          const data = (await response.json()) as { platformAccess?: boolean };
          if (!data.platformAccess) {
            router.push("/talent/verification");
            return;
          }
        }

        // Load provider data (in production, this would be an API call)
        const providerData = providersData[providerId];
        if (providerData) {
          setProvider(providerData);
        } else {
          router.push("/talent/upskilling");
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [session, status, router, providerId]);

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-200 rounded w-64"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded-xl"></div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!provider) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900">Provider not found</h1>
          <Link href="/talent/upskilling" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/talent/upskilling" className="text-gray-500 hover:text-gray-700">
              Marketplace
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500">Providers</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{provider.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Logo */}
            <ProviderLogo provider={provider} size="large" />

            {/* Provider Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">{provider.name}</h1>
              <div className="flex items-center gap-2 text-gray-300 mb-4">
                <span>{provider.type}</span>
                <span>•</span>
                <span>{provider.location}</span>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {provider.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Verified Badge */}
              {provider.verified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-green-400 text-green-400 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Verified Provider
                </span>
              )}
            </div>

            {/* Rating and Actions */}
            <div className="flex flex-col items-end gap-4">
              <div className="bg-white rounded-xl px-4 py-3 text-center">
                <StarRating rating={provider.rating} showCount count={provider.reviewCount} />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenPricingModal("onsite")}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition"
                >
                  <Building className="w-5 h-5" />
                  Onsite Training
                </button>
                <button
                  onClick={() => handleOpenPricingModal("online")}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  <BookOpen className="w-5 h-5" />
                  Online Training
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About and Courses */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About {provider.name}</h2>
              <div className="text-gray-600 whitespace-pre-line">{provider.fullDescription}</div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{provider.courseCount}+</div>
                  <div className="text-sm text-gray-500">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{provider.studentCount}</div>
                  <div className="text-sm text-gray-500">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{provider.certificationCount}</div>
                  <div className="text-sm text-gray-500">Certifications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{provider.supportType}</div>
                  <div className="text-sm text-gray-500">Support</div>
                </div>
              </div>
            </div>

            {/* Popular Courses Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Popular Courses</h2>
                <Link
                  href={`/talent/upskilling/provider/${provider.id}/courses`}
                  className="flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700 transition"
                >
                  View all courses
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {provider.courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50/50 transition cursor-pointer"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {course.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {course.students} students
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-yellow-400" />
                      <span className="font-medium text-gray-900">{course.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Contact Info and Accreditations */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide mb-4">Contact Information</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Website</div>
                    <a href={`https://${provider.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {provider.website}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <a href={`mailto:${provider.email}`} className="text-gray-900">
                      {provider.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <a href={`tel:${provider.phone}`} className="text-gray-900">
                      {provider.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Headquarters</div>
                    <span className="text-gray-900">{provider.headquarters}</span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
                <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition">
                  <Globe className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition">
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition">
                  <Briefcase className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Accreditations */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide mb-4">Accreditations</h3>

              <div className="space-y-3">
                {provider.accreditations.map((accreditation, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 text-sm">{accreditation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      {pricingModalOpen && selectedTrainingType && provider && (
        <PricingModal
          trainingType={selectedTrainingType}
          provider={provider}
          onClose={handleClosePricingModal}
          onSelectPlan={handleSelectPlan}
        />
      )}
    </main>
  );
}
