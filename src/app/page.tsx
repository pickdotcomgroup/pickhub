"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentFeature, setCurrentFeature] = useState(0);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (session?.user) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const features = [
    {
      title: "Find Perfect Matches",
      description: "Connect with skilled freelancers or exciting projects using our intelligent matching system",
      icon: "🎯",
      details: ["AI-powered matching", "Skill-based filtering", "Portfolio reviews", "Rating system"]
    },
    {
      title: "Integrated Project Management",
      description: "Manage your projects from start to finish with built-in tools and collaboration features",
      icon: "📊",
      details: ["Task tracking", "Timeline management", "File sharing", "Progress monitoring"]
    },
    {
      title: "Secure Payments",
      description: "Handle payments safely with escrow protection and milestone-based releases",
      icon: "💳",
      details: ["Escrow protection", "Milestone payments", "Secure transactions", "Dispute resolution"]
    },
    {
      title: "Communication Hub",
      description: "Stay connected with integrated messaging, video calls, and project discussions",
      icon: "💬",
      details: ["Real-time messaging", "Video conferencing", "Project discussions", "File attachments"]
    }
  ];

  const roles = [
    {
      title: "For Clients",
      description: "Find and hire talented freelancers for your projects",
      icon: "🏢",
      benefits: [
        "Access to vetted freelancers",
        "Project management tools",
        "Secure payment system",
        "24/7 support"
      ]
    },
    {
      title: "For Developers",
      description: "Discover exciting projects and grow your freelance career",
      icon: "👨‍💻",
      benefits: [
        "Quality project opportunities",
        "Fair payment terms",
        "Skill development",
        "Portfolio building"
      ]
    },
    {
      title: "For Agencies",
      description: "Connect with clients and manage multiple developer relationships",
      icon: "🏛️",
      benefits: [
        "Team collaboration tools",
        "Client management",
        "Resource allocation",
        "Business growth"
      ]
    }
  ];

  // Auto-rotate features every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-2">
            <span className="text-purple-400">Pick</span>Hub
          </h1>
          <p className="text-gray-300">Loading...</p>
        </div>
      </main>
    );
  }

  // If authenticated, will redirect via useEffect
  if (session?.user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Welcome to <span className="text-purple-400">PickHub</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The ultimate web freelance platform with integrated project management. 
              Connect, collaborate, and create amazing projects together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/browse"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 text-lg"
              >
                Get Started
              </Link>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-transparent border-2 border-white/30 hover:border-white/50 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 text-lg"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Powerful features designed to make freelancing and project management seamless
            </p>
          </div>

          {/* Feature Showcase */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl transition-all duration-300 cursor-pointer ${
                    currentFeature === index
                      ? "bg-white/10 border border-purple-400/50"
                      : "bg-white/5 border border-white/10 hover:bg-white/8"
                  }`}
                  onClick={() => setCurrentFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{feature.icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 mb-3">
                        {feature.description}
                      </p>
                      {currentFeature === index && (
                        <ul className="space-y-1">
                          {feature.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="text-sm text-purple-300 flex items-center">
                              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Visual */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <div className="text-center">
                <div className="text-6xl mb-4">{features[currentFeature]?.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {features[currentFeature]?.title}
                </h3>
                <p className="text-gray-300 mb-6">
                  {features[currentFeature]?.description}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {features[currentFeature]?.details.map((detail, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3">
                      <span className="text-sm text-purple-300">{detail}</span>
                    </div>
                  )) ?? []}
                </div>
              </div>
            </div>
          </div>

          {/* Feature Indicators */}
          <div className="flex justify-center space-x-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFeature(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  currentFeature === index ? "bg-purple-400" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for everyone
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Whether you&apos;re a client, developer, or agency, PickHub has the tools you need
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-purple-400/50 transition-all duration-300 group"
              >
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">{role.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {role.title}
                  </h3>
                  <p className="text-gray-300">
                    {role.description}
                  </p>
                </div>
                <ul className="space-y-3">
                  {role.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-gray-300">
                      <svg className="w-5 h-5 text-purple-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of freelancers and clients who trust PickHub for their projects
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 text-lg"
            >
              Sign Up Now
            </Link>
            <Link
              href="/auth"
              className="bg-transparent border-2 border-purple-400 hover:bg-purple-400/10 text-purple-400 font-semibold py-4 px-8 rounded-lg transition duration-200 text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              <span className="text-purple-400">Pick</span>Hub
            </h3>
            <p className="text-gray-400 mb-6">
              Web Freelance Platform with Integrated Project Management
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-purple-400 transition">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-purple-400 transition">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-purple-400 transition">
                Support
              </Link>
              <Link href="#" className="hover:text-purple-400 transition">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
