"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Temporary redirect to wait-list page
    router.push("/wait-list");
  }, [router]);

  // Show a loading state while redirecting
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="text-center gap-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          <span className="text-blue-600">TechPick</span>Hub
        </h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to waitlist...</p>
      </div>
    </main>
  );
}
