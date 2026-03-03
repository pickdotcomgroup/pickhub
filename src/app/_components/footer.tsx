import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/landing-page" className="text-2xl font-bold text-white mb-4 block">
              <span className="text-blue-400">Pick</span>Hub
            </Link>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              The ultimate platform connecting job seekers with training providers and employers. Upskill, reskill, and get matched to your dream job.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition duration-200">
                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-blue-400 rounded-lg flex items-center justify-center transition duration-200">
                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-blue-700 rounded-lg flex items-center justify-center transition duration-200">
                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">For Job Seekers</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/signup?type=talent" className="text-gray-400 hover:text-white transition duration-200 text-sm">
                  Sign Up as Job Seeker
                </Link>
              </li>
              <li>
                <Link href="/home-page" className="text-gray-400 hover:text-white transition duration-200 text-sm">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/home-page" className="text-gray-400 hover:text-white transition duration-200 text-sm">
                  Training Marketplace
                </Link>
              </li>
              <li>
                <Link href="/home-page" className="text-gray-400 hover:text-white transition duration-200 text-sm">
                  Skill Certifications
                </Link>
              </li>
              <li>
                <Link href="/home-page" className="text-gray-400 hover:text-white transition duration-200 text-sm">
                  Smart Job Matching
                </Link>
              </li>
            </ul>
          </div>

          {/* For Training Providers & Employers */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">For Partners</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/signup?type=trainer" className="text-gray-400 hover:text-white transition duration-200 text-sm">
                  Become a Training Provider
                </Link>
              </li>
              <li>
                <Link href="/signup?type=employer" className="text-gray-400 hover:text-white transition duration-200 text-sm">
                  Become an Employer
                </Link>
              </li>
              <li>
                <Link href="/home-page" className="text-gray-400 hover:text-white transition duration-200 text-sm">
                  Post Jobs
                </Link>
              </li>
              <li>
                <Link href="/home-page" className="text-gray-400 hover:text-white transition duration-200 text-sm">
                  List Courses
                </Link>
              </li>
              <li>
                <Link href="/home-page" className="text-gray-400 hover:text-white transition duration-200 text-sm">
                  Hiring Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* How It Works & Support */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/landing-page" className="text-gray-400 hover:text-white transition duration-200 text-sm">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/landing-page" className="text-gray-400 hover:text-white transition duration-200 text-sm">
                  Why PickHub
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition duration-200 text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition duration-200 text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition duration-200 text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} PickHub. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-1.5 text-gray-500 text-sm">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Certified Providers
            </span>
            <span className="flex items-center gap-1.5 text-gray-500 text-sm">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Smart Matching
            </span>
            <span className="flex items-center gap-1.5 text-gray-500 text-sm">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              1000+ Opportunities
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
