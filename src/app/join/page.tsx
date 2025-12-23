"use client";

import Link from "next/link";

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join PickHub
          </h1>
          <p className="text-md text-gray-600 max-w-2xl mx-auto">
            Transform your career journey—whether you&apos;re a job seeker looking to upskill, a training provider offering courses, or an employer searching for skilled talent.
          </p>
        </div>

        {/* Professional Signup Section */}
        <div className="rounded-2xl p-4">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Job Seeker Signup */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-400 transition-all duration-300 shadow-sm flex flex-col">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Join as Job Seeker</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Upskill, reskill, and get matched to your dream job opportunities
                </p>
              </div>
              <div className="flex-grow">
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>• Access training marketplace</li>
                  <li>• Earn skill certifications</li>
                  <li>• Smart job matching</li>
                  <li>• Track your learning progress</li>
                </ul>
              </div>
              <div className="mt-auto">
                <Link
                  href="/signup?type=talent"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 block text-center"
                >
                  Sign Up as Job Seeker
                </Link>
              </div>
            </div>

            {/* Training Provider Signup */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-green-400 transition-all duration-300 shadow-sm flex flex-col">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🎓</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Join as Training Provider</h3>
                <p className="text-gray-600 text-sm mb-4">
                  List your courses and reach thousands of eager learners
                </p>
              </div>
              <div className="flex-grow">
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>• List unlimited courses</li>
                  <li>• Reach targeted learners</li>
                  <li>• Issue certifications</li>
                  <li>• Analytics dashboard</li>
                  <li>• Secure payment system</li>
                </ul>
              </div>
              <div className="mt-auto">
                <Link
                  href="/signup?type=agency"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 block text-center"
                >
                  Sign Up as Training Provider
                </Link>
              </div>
            </div>

            {/* Employer Signup */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-indigo-400 transition-all duration-300 shadow-sm flex flex-col">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🏢</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Join as Employer</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Post jobs and hire skilled, trained candidates ready to work
                </p>
              </div>
              <div className="flex-grow">
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>• Post unlimited jobs</li>
                  <li>• Access trained talent pool</li>
                  <li>• Smart candidate matching</li>
                  <li>• Hiring analytics</li>
                </ul>
              </div>
              <div className="mt-auto">
                <Link
                  href="/signup?type=client"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 block text-center"
                >
                  Sign Up as Employer
                </Link>
              </div>
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
