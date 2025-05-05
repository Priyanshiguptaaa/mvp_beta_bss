"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from '@/lib/api';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Store JWT token (for demo, use localStorage; in production, use httpOnly cookie if possible)
      localStorage.setItem("authToken", token);
    }
    // Check for pending project creation
    const pending = sessionStorage.getItem('pendingProject');
    if (pending) {
      // Try to create the project now that we're authenticated
      api.createProject(JSON.parse(pending))
        .then(project => {
          sessionStorage.setItem('projectData', JSON.stringify(project));
          sessionStorage.removeItem('pendingProject');
          router.replace("/onboarding/tools");
        })
        .catch(() => {
          alert('Project creation failed after authentication.');
          sessionStorage.removeItem('pendingProject');
          router.replace("/onboarding");
        });
    } else {
      // No pending project, just go to onboarding/tools
      router.replace("/onboarding/tools");
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg font-semibold">Completing authentication...</div>
    </div>
  );
} 