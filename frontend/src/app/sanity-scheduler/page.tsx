"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "lucide-react";

const mockTests = [
  { date: "2025-05-06", status: "failed" },
  { date: "2025-05-08", status: "failed" },
  { date: "2025-05-09", status: "pending" },
  { date: "2025-05-12", status: "passed" },
];

const statusColors = {
  passed: "bg-green-500",
  failed: "bg-red-500",
  pending: "bg-orange-400",
};

const workflow = [
  { label: "Test Execution", icon: "✔️", color: "text-purple-500" },
  { label: "Issue Detection", icon: "⚠️", color: "text-yellow-500" },
  { label: "RCA Generation", icon: "<>", color: "text-blue-500" },
  { label: "Fix Assignment", icon: "↗️", color: "text-green-500" },
];

function getStatusDot(status: string) {
  return <span className={`inline-block w-2 h-2 rounded-full ${statusColors[status as keyof typeof statusColors]}`} />;
}

function getTestsForDate(date: string) {
  return mockTests.filter((t) => t.date === date);
}

export default function SanitySchedulerPage() {
  const [tab, setTab] = useState("scheduled");
  const [selectedDate, setSelectedDate] = useState("2025-05-09");

  // Generate calendar days for May 2025
  const daysInMonth = 31;
  const firstDay = new Date("2025-05-01").getDay();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Test Scheduler</h1>
          <div className="text-gray-500">Schedule automated tests to detect issues and trigger RCA workflows</div>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition">Create New Test</Button>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="w-full mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="scheduled">Scheduled Tests</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="create">Create Test</TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait">
          {tab === "scheduled" && (
            <TabsContent value="scheduled" forceMount>
              <motion.div
                key="scheduled"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-2 gap-6"
              >
                {/* Calendar */}
                <Card className="p-6 flex flex-col items-center">
                  <div className="font-semibold mb-2">Select Date</div>
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-gray-400">&lt;</span>
                    <span className="font-medium">May 2025</span>
                    <span className="text-gray-400">&gt;</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 w-full mb-2 text-center text-xs text-gray-400">
                    {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1 w-full mb-2">
                    {Array(firstDay).fill(null).map((_, i) => <div key={"empty-"+i}></div>)}
                    {calendarDays.map(day => {
                      const dateStr = `2025-05-${day.toString().padStart(2, '0')}`;
                      const tests = getTestsForDate(dateStr);
                      const isSelected = selectedDate === dateStr;
                      return (
                        <button
                          key={dateStr}
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-medium transition-all relative
                            ${isSelected ? "bg-purple-600 text-white shadow" : "hover:bg-purple-100 hover:text-purple-700 text-gray-700"}
                          `}
                          onClick={() => setSelectedDate(dateStr)}
                        >
                          {day}
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                            {tests.map(t => getStatusDot(t.status))}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Passed Tests</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Failed Tests</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" /> Pending Tests</span>
                  </div>
                </Card>
                {/* Test List */}
                <Card className="p-6 flex-1">
                  <div className="font-semibold mb-2">Tests for {new Date(selectedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <Calendar className="w-10 h-10 mb-2" />
                    <div>No tests scheduled for this date</div>
                    <Button variant="outline" className="mt-2">Schedule a test</Button>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
          )}
          {tab === "results" && (
            <TabsContent value="results" forceMount>
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="p-6"
              >
                <div className="text-center text-gray-400">Test Results view coming soon...</div>
              </motion.div>
            </TabsContent>
          )}
          {tab === "create" && (
            <TabsContent value="create" forceMount>
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="p-6"
              >
                <div className="text-center text-gray-400">Create Test form coming soon...</div>
              </motion.div>
            </TabsContent>
          )}
        </AnimatePresence>
      </Tabs>
      {/* Workflow Diagram */}
      <Card className="mt-8 p-6">
        <div className="font-semibold mb-4">Test to RCA Workflow</div>
        <div className="flex items-center justify-between gap-4">
          {workflow.map((step, i) => (
            <div key={step.label} className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 mb-2 text-2xl ${step.color}`}>{step.icon}</div>
              <div className="text-sm font-medium text-gray-700 mb-1">{step.label}</div>
              {i < workflow.length - 1 && <span className="text-2xl text-gray-300">→</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 