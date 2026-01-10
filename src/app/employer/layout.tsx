"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EmployerAsideNav from "./_components/employer-aside-nav";
import EmployerTopHeader from "./_components/employer-top-header";

interface EmployerProfile {
  companyName?: string;
}

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [companyName, setCompanyName] = useState<string | undefined>(undefined);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    // Redirect to auth if not authenticated
    if (!session) {
      router.push("/auth");
      return;
    }

    // Redirect to appropriate dashboard if not an employer
    if (session.user.role !== "employer") {
      if (session.user.role === "trainer") {
        router.push("/trainer/dashboard");
      } else if (session.user.role === "talent") {
        router.push("/talent/dashboard");
      } else if (session.user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  }, [session, status, router]);

  // Fetch employer profile to get company name
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/employer/profile");
        if (response.ok) {
          const data = (await response.json()) as EmployerProfile;
          if (data.companyName) {
            setCompanyName(data.companyName);
          }
        }
      } catch (error) {
        console.error("Error fetching employer profile:", error);
      }
    };

    if (session?.user.role === "employer") {
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
  if (!session || session.user.role !== "employer") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerAsideNav
        companyName={companyName}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? "ml-20" : "ml-64"}`}
      >
        <EmployerTopHeader companyName={companyName} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
