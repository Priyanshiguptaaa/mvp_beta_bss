"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

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

  const handleLogin = () => {
    // Check for token (simulate GitHub OAuth for demo)
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard");
    } else {
      // Start GitHub OAuth (replace with real URL in prod)
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/auth/github/login`;
    }
  };

  const handleSignup = () => {
    router.push("/create-team");
  };

  useEffect(() => {
    // Autofill from sessionStorage if available
    if (typeof window !== "undefined") {
      const pending = sessionStorage.getItem('pendingProject');
      if (pending) {
        const data = JSON.parse(pending);
        // You can prefill any form fields you need here
      }
    }
  }, []);

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
            <Button size="lg" className="px-8 text-base font-semibold" onClick={handleLogin}>
              Login
            </Button>
            <Button size="lg" variant="secondary" className="px-8 text-base font-semibold" onClick={handleSignup}>
              Sign Up
            </Button>
          </div>
          <div className="text-sm text-gray-500 mt-2">Trusted by leading enterprises worldwide</div>
        </div>
        {/* Right: Features Card */}
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="w-full max-w-md p-8 bg-white/90 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Key Features</h2>
            <ul className="space-y-3">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="text-blue-500 w-5 h-5" />
                  {feature}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>
    </main>
  );
} 