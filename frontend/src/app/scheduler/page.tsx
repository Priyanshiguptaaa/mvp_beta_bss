"use client";

import { TestScheduler as TestSchedulerComponent } from '@/components/scheduler/TestScheduler';
import { mockTests } from '@/mockDemoData';

export default function TestSchedulerPage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Test Scheduler
        </h1>
        <p className="text-lg text-muted-foreground">
          Schedule and manage automated tests for AI model monitoring, hallucination detection, and system performance.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        <div className="bg-card rounded-lg border shadow-sm">
          <TestSchedulerComponent tests={mockTests} />
        </div>
      </div>
    </div>
  );
} 