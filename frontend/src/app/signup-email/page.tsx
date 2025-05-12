"use client";

import { RegisterForm } from "@/components/auth/RegisterForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6a8dff] via-[#a084ee] to-[#e0c3fc]">
      <RegisterForm />
    </main>
  );
} 