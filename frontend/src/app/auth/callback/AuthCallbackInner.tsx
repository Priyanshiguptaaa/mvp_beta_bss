"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from '@/lib/api';

export default function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("authToken", token);
    }
    const pending = sessionStorage.getItem('pendingProject');
    if (pending) {
      api.createProject(JSON.parse(pending))
        .then(project => {
          sessionStorage.setItem('projectData', JSON.stringify(project));
          sessionStorage.removeItem('pendingProject');
          router.replace(`${process.env.NEXT_PUBLIC_BASE_URL}/onboarding/tools`);
        })
        .catch(() => {
          alert('Project creation failed after authentication.');
          sessionStorage.removeItem('pendingProject');
          router.replace(`${process.env.NEXT_PUBLIC_BASE_URL}/onboarding`);
        });
    } else {
      router.replace(`${process.env.NEXT_PUBLIC_BASE_URL}/onboarding/tools`);
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg font-semibold">Completing authentication...</div>
    </div>
  );
} 