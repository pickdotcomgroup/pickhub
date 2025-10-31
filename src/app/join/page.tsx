"use client";

import Link from "next/link";
import Header from "../_components/header";

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Join TechPickHub
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose your professional path and start building your career on PickHub
          </p>

          {/* Back to Browse */}
          <div className="text-center mt-8">
            <Link
              href="/browse"
              className="text-purple-400 hover:text-purple-300 transition"
            >
              ← Back to Browse
            </Link>
          </div>

        </div>

        {/* Professional Signup Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Client Professional Signup */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-blue-400/50 transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🏢</div>
                <h3 className="text-xl font-bold text-white mb-2">Join as Client</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Post projects and hire top talent for your business needs
                </p>
              </div>
              <ul className="text-sm text-gray-400 space-y-2 mb-6">
                <li>• Post unlimited projects</li>
                <li>• Access to verified professionals</li>
                <li>• Project management tools</li>
                <li>• Secure payment system</li>
              </ul>
              <Link
                href="/auth?type=client"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 block text-center"
              >
                Sign Up as Client
              </Link>
            </div>

            {/* Talent Professional Signup */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-green-400/50 transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">👨‍💻</div>
                <h3 className="text-xl font-bold text-white mb-2">Join as Talent</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Showcase your skills and find exciting freelance opportunities
                </p>
              </div>
              <ul className="text-sm text-gray-400 space-y-2 mb-6">
                <li>• Create professional profile</li>
                <li>• Bid on quality projects</li>
                <li>• Build your reputation</li>
                <li>• Secure payment guarantee</li>
              </ul>
              <Link
                href="/auth?type=talent"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 block text-center"
              >
                Sign Up as Talent
              </Link>
            </div>

            {/* Agency Professional Signup */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-indigo-400/50 transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🏛️</div>
                <h3 className="text-xl font-bold text-white mb-2">Join as Agency</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Scale your business and manage multiple client relationships
                </p>
              </div>
              <ul className="text-sm text-gray-400 space-y-2 mb-6">
                <li>• Team collaboration tools</li>
                <li>• Multi-project management</li>
                <li>• Client relationship tools</li>
                <li>• Advanced analytics</li>
              </ul>
              <Link
                href="/auth?type=agency"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 block text-center"
              >
                Sign Up as Agency
              </Link>
            </div>
          </div>

          {/* General CTA */}
          <div className="text-center border-t border-white/10 pt-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Already have an account?
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
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
