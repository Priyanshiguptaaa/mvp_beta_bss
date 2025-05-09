"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

const FEATURES = [
  "AI-powered trace analysis",
  "Automated issue detection",
  "Real-time system monitoring",
  "Comprehensive audit trails",
  "Customizable alerts",
  "Team collaboration tools",
];

export default function StartPage() {
  const router = useRouter();

  const handleSignup = () => {
    router.push("/create-team");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6a8dff] via-[#a084ee] to-[#e0c3fc]">
      <section className="flex w-full max-w-6xl rounded-2xl shadow-xl overflow-hidden bg-white/80 backdrop-blur-md">
        {/* Left: Hero */}
        <div className="flex-1 p-12 flex flex-col justify-center">
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            <span className="block">Put System</span>
            <span className="block">Reliability on</span>
            <span className="block text-blue-500">Autopilot</span>
            <span className="block mt-2">with the World's first</span>
            <span className="block text-blue-500">Agentic AI Operations Console</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-lg">
            Transform your AI-powered system reliability with real-time diagnostics and intelligent debugging — all powered by natural language tests and automated root cause analysis.
          </p>
          <div className="flex gap-4 mb-8">
            <Button size="lg" variant="secondary" className="px-8 text-base font-semibold" onClick={handleSignup}>
              Sign Up
            </Button>
          </div>
          <div className="text-sm text-gray-500 mt-2">Trusted by leading enterprises worldwide</div>
        </div>

        {/* Right: Login Form */}
        <div className="flex-1 p-12 bg-white">
          <LoginForm />
        </div>
      </section>
    </main>
  );
} 