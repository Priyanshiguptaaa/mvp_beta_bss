"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "lucide-react";
import Spinner from '@/components/ui/Spinner';

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
  const [rcaResults, setRcaResults] = useState<any[]>([]); // RCA Console data
  const [incidents, setIncidents] = useState<any[]>([]); // Incidents data
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'Pipeline Test',
    date: '',
    time: '',
    services: [] as string[],
    description: '',
  });
  const [formError, setFormError] = useState('');

  // Generate calendar days for May 2025
  const daysInMonth = 31;
  const firstDay = new Date("2025-05-01").getDay();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleFormChange = (field: string, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
    if (field === 'services' && value.length > 0) setFormError('');
  };

  const handleServiceToggle = (service: string) => {
    setForm(f => {
      const exists = f.services.includes(service);
      const newServices = exists ? f.services.filter(s => s !== service) : [...f.services, service];
      return { ...f, services: newServices };
    });
    setFormError('');
  };

  const handleScheduleTest = async () => {
    if (!form.title || !form.type || !form.date || !form.time || form.services.length === 0) {
      setFormError('Select at least one service and fill all fields');
      return;
    }
    setLoading(true);
    setFormError('');
    try {
      const res = await fetch('/api/sanity-scheduler/run-test', { method: 'POST' });
      const data = await res.json();
      // Assume data.result is either JSON or text
      const rca = typeof data.result === 'string' ? { summary: data.result } : data.result;
      setRcaResults(prev => [rca, ...prev]);
      setIncidents(prev => [{
        title: form.title,
        date: form.date,
        status: 'Auto-Resolved',
        summary: rca.summary || 'See RCA Console',
        ...rca,
      }, ...prev]);
      setTab('rca-console');
    } catch (e) {
      setFormError('Failed to schedule test.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold mb-1 text-gray-900">Test Scheduler</h1>
          <div className="text-lg text-gray-500">Schedule automated tests to detect issues and trigger RCA workflows</div>
        </div>
        <Button className="bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white font-semibold px-7 py-2 rounded-full shadow-lg transition">Create New Test</Button>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="w-full mb-8">
        <TabsList className="mb-6 bg-white/80 rounded-xl shadow flex gap-2 p-2">
          <TabsTrigger value="scheduled">Scheduled Tests</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="create">Create Test</TabsTrigger>
          <TabsTrigger value="rca-console">RCA Console</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
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
                className="p-8 bg-white/80 rounded-2xl shadow-xl max-w-2xl mx-auto"
              >
                <form className="space-y-8">
                  <div>
                    <label className="block font-semibold text-lg mb-2 text-gray-900">Test Title</label>
                    <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-purple-300 focus:outline-none bg-gray-50" value={form.title} onChange={e => handleFormChange('title', e.target.value)} placeholder="Enter test title" />
                  </div>
                  <div>
                    <label className="block font-semibold text-lg mb-2 text-gray-900">Test Type</label>
                    <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50" value={form.type} onChange={e => handleFormChange('type', e.target.value)}>
                      <option>Pipeline Test</option>
                      <option>Unit Test</option>
                    </select>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex-1">
                      <label className="block font-semibold text-lg mb-2 text-gray-900">Date</label>
                      <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50" value={form.date} onChange={e => handleFormChange('date', e.target.value)} />
                    </div>
                    <div className="flex-1">
                      <label className="block font-semibold text-lg mb-2 text-gray-900">Time</label>
                      <input type="time" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50" value={form.time} onChange={e => handleFormChange('time', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-lg mb-2 text-gray-900">Services to Test</label>
                    <div className="flex flex-wrap gap-2 mb-1">
                      {["Data Pipeline", "Retrieval", "Model Training", "Inference Engine", "Recommendation Engine", "Question Answering", "Content Generation", "Classification", "User Interface", "API Gateway"].map(service => (
                        <button
                          type="button"
                          key={service}
                          className={`px-4 py-1.5 rounded-full border text-base font-medium transition shadow-sm ${form.services.includes(service) ? 'bg-gradient-to-r from-purple-200 to-purple-300 border-purple-400 text-purple-800' : 'bg-white border-gray-300 text-gray-700 hover:bg-purple-50'}`}
                          onClick={() => handleServiceToggle(service)}
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                    {form.services.length === 0 && <div className="text-red-500 text-sm mt-1">Select at least one service</div>}
                  </div>
                  <div>
                    <label className="block font-semibold text-lg mb-2 text-gray-900">Description</label>
                    <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50" rows={3} value={form.description} onChange={e => handleFormChange('description', e.target.value)} placeholder="Describe the test purpose and expected outcomes" />
                  </div>
                  {formError && <div className="text-red-500 text-base font-medium mt-2">{formError}</div>}
                  <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="outline" className="rounded-full px-6 py-2 text-base font-semibold" onClick={() => setTab('scheduled')}>Cancel</Button>
                    <Button type="button" className="bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white font-semibold px-8 py-2 rounded-full shadow-lg transition flex items-center gap-2" onClick={handleScheduleTest} disabled={loading}>
                      {loading && <Spinner size={18} />} Schedule Test
                    </Button>
                  </div>
                </form>
              </motion.div>
            </TabsContent>
          )}
          {tab === "rca-console" && (
            <TabsContent value="rca-console" forceMount>
              <motion.div
                key="rca-console"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="p-8 bg-purple-50 rounded-2xl shadow-xl max-w-3xl mx-auto"
              >
                <h2 className="text-2xl font-bold mb-6 text-purple-800">RCA Console</h2>
                {rcaResults.length === 0 ? (
                  <div className="text-gray-400">No RCA results yet.</div>
                ) : (
                  rcaResults.map((rca, idx) => (
                    <Card key={idx} className="mb-6 p-6 bg-white/90 border-l-4 border-purple-400 rounded-xl shadow">
                      <div className="font-semibold text-purple-700 mb-2 text-lg">{rca.title || 'RCA Result'}</div>
                      <div className="text-gray-700 whitespace-pre-line text-base">{rca.summary || JSON.stringify(rca, null, 2)}</div>
                    </Card>
                  ))
                )}
              </motion.div>
            </TabsContent>
          )}
          {tab === "incidents" && (
            <TabsContent value="incidents" forceMount>
              <motion.div
                key="incidents"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="p-8 bg-red-50 rounded-2xl shadow-xl max-w-3xl mx-auto"
              >
                <h2 className="text-2xl font-bold mb-6 text-red-700">Incidents</h2>
                {incidents.length === 0 ? (
                  <div className="text-gray-400">No incidents yet.</div>
                ) : (
                  incidents.map((incident, idx) => (
                    <Card key={idx} className="mb-6 p-6 bg-white/90 border-l-4 border-red-400 rounded-xl shadow">
                      <div className="font-semibold text-red-700 mb-2 text-lg">{incident.title || 'Incident'}</div>
                      <div className="text-gray-700 whitespace-pre-line text-base">{incident.summary || JSON.stringify(incident, null, 2)}</div>
                      <div className="text-xs text-gray-500 mt-2">{incident.date} | Status: {incident.status}</div>
                    </Card>
                  ))
                )}
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