export const dynamic = "force-dynamic";
"use client";
import { ProjectSetupForm } from '@/components/onboarding/ProjectSetupForm';
import { useRouter } from "next/navigation";
import React from "react";

export default function CreateTeamPage() {
  const router = useRouter();

  // You may want to pass a callback to ProjectSetupForm to handle post-creation logic
  const handleTeamCreated = () => {
    // Redirect to GitHub OAuth or dashboard
    // For now, just redirect to dashboard
    router.replace("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f6fa] to-[#e6e9f5]">
      <section className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Your Team</h1>
        <ProjectSetupForm />
      </section>
    </main>
  );
} 