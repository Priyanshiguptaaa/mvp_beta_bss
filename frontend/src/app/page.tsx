"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const HERO_TEXT = [
  "Put System Reliability on Autopilot",
  "with the World's first Agentic AI Operations Console",
];

export default function StartPage() {
  const router = useRouter();

  useEffect(() => {
    // If JWT exists, auto-redirect to dashboard
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleLogin = () => {
    // Simulate login (replace with real OAuth or API call)
    // For demo, set a fake token and redirect
    localStorage.setItem("token", "demo-token");
    router.replace("/dashboard");
  };

  const handleSignup = () => {
    router.push("/create-team");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f6fa] to-[#e6e9f5]">
      <section className="flex w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left: Hero */}
        <div className="flex-1 p-12 flex flex-col justify-center bg-gradient-to-br from-[#e0e7ff] to-[#f0f4ff]">
          <h1 className="text-4xl font-extrabold leading-tight mb-6">
            <span className="block text-black">Put System Reliability on</span>
            <span className="block text-blue-400">Autopilot</span>
            <span className="block text-black mt-2">with the World's first</span>
            <span className="block text-blue-400">Agentic AI Operations Console</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Transform your AI-powered system reliability with real-time diagnostics and intelligent debugging — all powered by natural language tests and automated root cause analysis.
          </p>
          <Button className="mt-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-400 text-white font-semibold shadow hover:from-purple-600 hover:to-blue-500 transition border-0">
            Join the Waitlist
          </Button>
        </div>
        {/* Right: Login/Signup */}
        <div className="flex-1 p-12 flex flex-col justify-center items-center bg-white">
          <Card className="w-full max-w-xs p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Welcome to EchoSysAI</h2>
            <Button
              onClick={handleLogin}
              className="w-full mb-4 py-3 text-white font-semibold"
            >
              Login
            </Button>
            <Button
              onClick={handleSignup}
              variant="secondary"
              className="w-full py-3 font-semibold"
            >
              Sign Up
            </Button>
          </Card>
        </div>
      </section>
    </main>
  );
} 