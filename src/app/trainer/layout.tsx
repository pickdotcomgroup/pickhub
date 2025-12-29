"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TrainerAsideNav from "./_components/trainer-aside-nav";
import TrainerTopHeader from "./_components/trainer-top-header";

interface TrainerProfile {
  organizationName?: string;
}

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [organizationName, setOrganizationName] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (status === "loading") return;

    // Redirect to auth if not authenticated
    if (!session) {
      router.push("/auth");
      return;
    }

    // Redirect to appropriate dashboard if not a trainer
    if (session.user.role !== "trainer") {
      if (session.user.role === "employer") {
        router.push("/employer/dashboard");
      } else if (session.user.role === "talent") {
        router.push("/talent/dashboard");
      } else if (session.user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  }, [session, status, router]);

  // Fetch trainer profile to get organization name
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/trainer/profile");
        if (response.ok) {
          const data = await response.json() as TrainerProfile;
          if (data.organizationName) {
            setOrganizationName(data.organizationName);
          }
        }
      } catch (error) {
        console.error("Error fetching trainer profile:", error);
      }
    };

    if (session?.user.role === "trainer") {
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
  if (!session || session.user.role !== "trainer") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TrainerAsideNav organizationName={organizationName} />
      <div className="ml-64 flex flex-col min-h-screen">
        <TrainerTopHeader organizationName={organizationName} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
