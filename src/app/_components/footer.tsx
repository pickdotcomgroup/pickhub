import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black/30 backdrop-blur-lg border-t border-white/10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/onboarding" className="text-2xl font-bold text-white mb-4 block">
              <span className="text-purple-400">Pick</span>Hub
            </Link>
            <p className="text-gray-300 mb-4 max-w-md">
              Connect with top IT professionals, discover exciting projects, and build your career in the tech industry.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <span className="sr-only">Facebook</span>
                📘
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <span className="sr-only">Twitter</span>
                🐦
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <span className="sr-only">LinkedIn</span>
                💼
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <span className="sr-only">GitHub</span>
                🐙
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/browse" className="text-gray-300 hover:text-white transition">
                  Browse
                </Link>
              </li>
              <li>
                <Link href="/join" className="text-gray-300 hover:text-white transition">
                  Join Us
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-gray-300 hover:text-white transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-300">🏢 Clients</span>
              </li>
              <li>
                <span className="text-gray-300">👨‍💻 Talents</span>
              </li>
              <li>
                <span className="text-gray-300">🏛️ Agencies</span>
              </li>
              <li>
                <span className="text-gray-300">💼 Projects</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 PickHub. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="text-gray-400 hover:text-white text-sm transition">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white text-sm transition">
              Terms of Service
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white text-sm transition">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
