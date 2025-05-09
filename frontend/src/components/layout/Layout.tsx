"use client";

import { ReactNode } from 'react';
import { Toaster } from 'sonner';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Toaster position="top-right" />
      <div className="flex-1">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
} 