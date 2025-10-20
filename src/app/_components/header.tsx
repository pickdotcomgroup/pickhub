"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            <span className="text-purple-400">TechPick</span>Hub
          </Link>
          <div className="flex items-center space-x-4">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/join"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Join Us
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
