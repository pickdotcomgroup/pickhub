import Link from "next/link";
import Footer from "../_components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | TechPickHub - Transparent Platform Fees for Clients, Developers & Agencies",
  description: "Simple, transparent pricing for TechPickHub. Free to join for all users. Clients pay 5% platform fee, developers 10%, and agencies 7% on completed projects. No hidden fees, no surprises.",
  keywords: "techpickhub pricing, freelance platform fees, developer rates, agency pricing, project costs, transparent pricing",
  openGraph: {
    title: "TechPickHub Pricing - Simple & Transparent",
    description: "Free to join. Pay only when projects are completed. Clear pricing for clients, developers, and agencies.",
    type: "website",
    url: "https://techpickhub.com/pricing",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechPickHub Pricing",
    description: "Simple, transparent pricing. Free to join, pay only on completed projects.",
  },
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 overflow-hidden">
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
              Simple, Transparent <span className="text-blue-600">Pricing</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Choose the plan that works best for you. No hidden fees, no surprises.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Client Pricing */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-200 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🏢</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">For Clients</h3>
                <p className="text-gray-600 mb-6">Post projects and hire talent</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">Free</span>
                  <span className="text-gray-600 ml-2">to post</span>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-blue-600">5% platform fee</span> on completed projects
                  </p>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Unlimited project postings</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Access to verified developers</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Browse agencies</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Project management tools</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Milestone tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Secure payment protection</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">24/7 support</span>
                </li>
              </ul>

              <Link
                href="/join?type=client"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 text-center"
              >
                Get Started
              </Link>
            </div>

            {/* Developer Pricing */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-green-200 p-8 hover:shadow-2xl transition-all duration-300 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">👨‍💻</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">For Developers</h3>
                <p className="text-gray-600 mb-6">Pick projects you love</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">Free</span>
                  <span className="text-gray-600 ml-2">to join</span>
                </div>
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-green-600">10% platform fee</span> on earnings
                  </p>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Browse unlimited projects</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Pick projects you want</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Professional profile showcase</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Portfolio display</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Guaranteed payments</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Build your reputation</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">24/7 support</span>
                </li>
              </ul>

              <Link
                href="/join?type=talent"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 text-center"
              >
                Get Started
              </Link>
            </div>

            {/* Agency Pricing */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-indigo-200 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🏛️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">For Agencies</h3>
                <p className="text-gray-600 mb-6">Scale your business</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">Free</span>
                  <span className="text-gray-600 ml-2">to join</span>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-indigo-600">7% platform fee</span> on completed projects
                  </p>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Browse client projects</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Hire verified developers</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Team collaboration tools</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Multi-project management</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Advanced analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Dedicated account manager</span>
                </li>
              </ul>

              <Link
                href="/join?type=agency"
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                When do I pay the platform fee?
              </h3>
              <p className="text-gray-600">
                Platform fees are automatically deducted when a project is completed and payment is released. You only pay when work is successfully delivered.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Are there any hidden fees?
              </h3>
              <p className="text-gray-600">
                No hidden fees. The platform fee is the only cost. Payment processing fees may apply depending on your payment method.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel my account anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your account at any time. There are no long-term contracts or commitments required.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How does payment protection work?
              </h3>
              <p className="text-gray-600">
                Payments are held securely until milestones are completed and approved. This protects both clients and developers throughout the project.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                Platform fees are non-refundable, but project payments can be refunded according to our dispute resolution policy if work is not delivered as agreed.
              </p>
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
            Join TechPickHub today and start connecting with the right people
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
