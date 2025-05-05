"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from '@/lib/api';

export default function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get("token");
        if (!token) {
          setError("No authentication token received");
          return;
        }

        // Store the token
        localStorage.setItem("authToken", token);

        // Check for pending project
        const pending = sessionStorage.getItem('pendingProject');
        if (pending) {
          try {
            const project = await api.createProject(JSON.parse(pending));
            sessionStorage.setItem('projectData', JSON.stringify(project));
            sessionStorage.removeItem('pendingProject');
            router.replace('/onboarding/tools');
          } catch (err) {
            console.error('Project creation failed:', err);
            setError('Failed to create project after authentication');
            sessionStorage.removeItem('pendingProject');
            router.replace('/onboarding');
          }
        } else {
          router.replace('/dashboard');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg font-semibold">Completing authentication...</div>
    </div>
  );
} 