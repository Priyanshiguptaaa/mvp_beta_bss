"use client";

import { ReactNode } from 'react';

export default function SchedulerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex-1 p-6">
      {children}
    </div>
  );
} 