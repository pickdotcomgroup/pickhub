"use client";

import Link from "next/link";

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join TechPickHub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect, collaborate, and grow—whether you&apos;re a client seeking talent, a developer looking for projects, or an agency ready to scale.
          </p>
        </div>

        {/* Professional Signup Section */}
        <div className="rounded-2xl p-4">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Client Professional Signup */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-400 transition-all duration-300 shadow-sm">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🏢</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Join as Client</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Post projects and hire top talent for your business needs
                </p>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>• Post unlimited projects</li>
                <li>• Access to verified professionals</li>
                <li>• Project management tools</li>
                <li>• Secure payment system</li>
              </ul>
              <Link
                href="/signup?type=client"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 block text-center"
              >
                Sign Up as Client
              </Link>
            </div>

            {/* Talent Professional Signup */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-green-400 transition-all duration-300 shadow-sm">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">👨‍💻</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Join as Developer</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Showcase your skills and find exciting freelance opportunities
                </p>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>• Create professional profile</li>
                <li>• Bid on quality projects</li>
                <li>• Build your reputation</li>
                <li>• Secure payment guarantee</li>
              </ul>
              <Link
                href="/signup?type=talent"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 block text-center"
              >
                Sign Up as Developer
              </Link>
            </div>

            {/* Agency Professional Signup */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-indigo-400 transition-all duration-300 shadow-sm">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🏛️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Join as Agency</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Scale your business and manage multiple client relationships
                </p>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>• Team collaboration tools</li>
                <li>• Multi-project management</li>
                <li>• Client relationship tools</li>
                <li>• Advanced analytics</li>
              </ul>
              {/* <Link
                href="/signup?type=agency"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 block text-center"
              >
                Sign Up as Agency
              </Link> */}
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 block text-center">
                Sign Up as Agency (Coming Soon)
              </button>
            </div>
          </div>

          {/* General CTA */}
          <div className="text-center border-t border-gray-200 pt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Already have an account?
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signin"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
