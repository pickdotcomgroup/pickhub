"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
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

    // Redirect to appropriate dashboard if not an admin
    if (session.user.role !== "admin") {
      if (session.user.role === "client") {
        router.push("/client/dashboard");
      } else if (session.user.role === "talent") {
        router.push("/talent/dashboard");
      } else if (session.user.role === "agency") {
        router.push("/agency");
      } else {
        router.push("/");
      }
    }
  }, [session, status, router]);

  // Show loading state
  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </main>
    );
  }

  // Don't render if not authenticated or wrong role
  if (!session || session.user.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
