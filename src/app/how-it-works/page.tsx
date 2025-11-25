import Link from "next/link";
import Footer from "../_components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | TechPickHub - Connect Clients, Developers & Agencies",
  description: "Learn how TechPickHub works. A simple 3-step process connecting clients, developers, and agencies for successful project collaboration. Create your profile, browse & connect, and collaborate seamlessly.",
  keywords: "how techpickhub works, freelance platform guide, hire developers, find projects, agency collaboration, project marketplace",
  openGraph: {
    title: "How TechPickHub Works - Simple 3-Step Process",
    description: "Discover how our three-way marketplace connects clients, developers, and agencies for successful project delivery.",
    type: "website",
    url: "https://techpickhub.com/how-it-works",
  },
  twitter: {
    card: "summary_large_image",
    title: "How TechPickHub Works",
    description: "Learn how our platform connects clients, developers, and agencies in 3 simple steps.",
  },
};

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 overflow-hidden">
        {/* Honeycomb Background Pattern */}
        <div className="absolute inset-0 opacity-[0.08]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="honeycomb" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
                <polygon points="28,0 56,17 56,50 28,67 0,50 0,17" fill="none" stroke="#3B82F6" strokeWidth="1"/>
                <polygon points="28,33 56,50 56,83 28,100 0,83 0,50" fill="none" stroke="#3B82F6" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#honeycomb)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              How <span className="text-blue-600">TechPickHub</span> Works
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              A simple, transparent process that connects clients, developers, and agencies for successful project delivery
            </p>
          </div>
        </div>
      </section>

      {/* Main Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="relative">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <span className="text-3xl font-bold text-blue-600">1</span>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Create Your Profile</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sign up as a client, developer, or agency. Build your professional profile, showcase your expertise, and set your preferences.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <span className="text-3xl font-bold text-green-600">2</span>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Browse & Connect</h3>
                <p className="text-gray-600 leading-relaxed">
                  Clients post projects, developers pick the ones they want, and agencies browse opportunities to hire developers for delivery.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <span className="text-3xl font-bold text-indigo-600">3</span>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Collaborate & Succeed</h3>
                <p className="text-gray-600 leading-relaxed">
                  Work together using built-in tools. Track milestones, communicate seamlessly, and deliver exceptional results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals already using TechPickHub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/join"
              className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-4 px-8 rounded-full transition duration-200 shadow-lg hover:shadow-xl text-lg"
            >
              Join Us Now
            </Link>
            <Link
              href="/signin"
              className="bg-transparent hover:bg-white/10 text-white font-semibold py-4 px-8 rounded-full transition duration-200 border-2 border-white text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
