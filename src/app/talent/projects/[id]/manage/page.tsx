"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function TalentProjectManagePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  useEffect(() => {
    // Redirect to client project management page
    // Talents will access the same project management interface as clients
    router.push(`/client/projects/${projectId}`);
  }, [router, projectId]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to project management...</p>
      </div>
    </main>
  );
}
