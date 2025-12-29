"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TalentAsideNav from "./_components/talent-aside-nav";
import TalentTopHeader from "./_components/talent-top-header";

interface TalentProfile {
  title?: string;
}

export default function TalentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (status === "loading") return;

    // Redirect to auth if not authenticated
    if (!session) {
      router.push("/auth");
      return;
    }

    // Redirect to appropriate dashboard if not a talent
    if (session.user.role !== "talent") {
      if (session.user.role === "employer") {
        router.push("/employer/dashboard");
      } else if (session.user.role === "trainer") {
        router.push("/trainer/dashboard");
      } else if (session.user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  }, [session, status, router]);

  // Fetch talent profile to get title/role
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/talent/profile");
        if (response.ok) {
          const data = await response.json() as TalentProfile;
          if (data.title) {
            setUserRole(data.title);
          }
        }
      } catch (error) {
        console.error("Error fetching talent profile:", error);
      }
    };

    if (session?.user.role === "talent") {
      void fetchProfile();
    }
  }, [session]);

  // Show loading state
  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white">
        <div className="text-gray-600 text-xl">Loading...</div>
      </main>
    );
  }

  // Don't render if not authenticated or wrong role
  if (!session || session.user.role !== "talent") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TalentAsideNav userName={session.user.name ?? undefined} />
      <div className="ml-64 flex flex-col min-h-screen">
        <TalentTopHeader userRole={userRole} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
