"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AccountInfo from "~/app/_components/account-info";

export default function ClientAccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth");
      return;
    }

    if (session.user.role !== "client") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <div className="text-lg text-gray-900">Loading...</div>
        </div>
      </main>
    );
  }

  if (!session || session.user.role !== "client") {
    return null;
  }

  return (
    <main className="min-h-screen bg-white">
      <AccountInfo session={session} />
    </main>
  );
}
