"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    // Redirect to auth if not authenticated
    if (!session) {
      router.push("/auth");
      return;
    }

    // Redirect to appropriate dashboard if not a client
    if (session.user.role !== "client") {
      if (session.user.role === "talent") {
        router.push("/talent");
      } else if (session.user.role === "agency") {
        router.push("/agency");
      } else {
        router.push("/dashboard");
      }
    }
  }, [session, status, router]);

  // Show loading state
  if (status === "loading") {
    return (
      <main className="flex min-h-screen gap-5 flex-col items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
        <div className="text-gray-500 text-md">Loading Resource...</div>
      </main>
    );
  }

  // Don't render if not authenticated or wrong role
  if (!session || session.user.role !== "client") {
    return null;
  }

  return <>{children}</>;
}
