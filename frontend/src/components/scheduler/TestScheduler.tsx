import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestForm } from "./TestForm";
import { List, CalendarDays } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { SchedulerListView } from './SchedulerListView';
import { SchedulerCalendarView } from './SchedulerCalendarView';
import { TestResultsList } from './TestResultsList';
import { ScheduledTest, TestResult, TestFormValues } from '@/types/scheduler';
import { formatDate } from './utils/schedulerUtils';
import { cn } from '@/lib/utils';

export function TestScheduler({ tests = [] }: { tests?: ScheduledTest[] }) {
  const [activeTab, setActiveTab] = useState('scheduled');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Use the tests prop for scheduledTests
  const scheduledTests: ScheduledTest[] = tests;

  // Map tests to TestResult structure for testResults
  const testResults: TestResult[] = tests.map((test: ScheduledTest) => ({
    id: test.id.toString(),
    testName: test.name,
    runDate: test.lastRun || "N/A",
    status: test.status,
    details: test.instruction,
    agent: test.agent,
    environment: test.environments[0] || "Production",
    incidentId: test.incidentId,
    history: (test as any).history || [],
  }));

  // Function to handle form submission
  const handleFormSubmit = (values: TestFormValues) => {
    toast({
      title: "Test scheduled successfully",
      description: `${values.title} will run ${values.frequency} starting ${formatDate(values.date, 'PP')} at ${values.time}`,
    });
    setActiveTab('scheduled');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end mb-2">
        <Button
          type="button"
          className="bg-[#7C3AED] text-white rounded-full px-8 py-3 font-medium text-lg shadow-none hover:bg-[#6d28d9] transition-all"
          onClick={() => setActiveTab('create')}
        >
          Create New Test
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 bg-purple-50 border border-purple-100 rounded-lg p-1 flex gap-2">
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-purple-200 px-4 py-2 rounded-lg font-medium transition-all">Scheduled Tests</TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-purple-200 px-4 py-2 rounded-lg font-medium transition-all">Test Results</TabsTrigger>
          <TabsTrigger value="create" id="create-test-tab" className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-purple-200 px-4 py-2 rounded-lg font-medium transition-all">Create Test</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scheduled" className="space-y-6">
          <div className="flex justify-end mb-4">
            <div className="border border-gray-200 rounded-2xl inline-flex overflow-hidden">
              <Button 
                type="button"
                size="sm" 
                onClick={() => setViewMode('list')}
                className={cn(
                  "rounded-none px-6 py-2 font-medium transition-all flex items-center gap-2",
                  viewMode === 'list' 
                    ? "bg-[#7C3AED] text-white" 
                    : "bg-white text-black hover:bg-gray-50"
                )}
              >
                <List className={cn("h-5 w-5", viewMode === 'list' ? 'text-white' : 'text-black')} />
                List
              </Button>
              <Button 
                type="button"
                size="sm" 
                onClick={() => setViewMode('calendar')}
                className={cn(
                  "rounded-none px-6 py-2 font-medium transition-all flex items-center gap-2",
                  viewMode === 'calendar' 
                    ? "bg-[#7C3AED] text-white" 
                    : "bg-white text-black hover:bg-gray-50"
                )}
              >
                <CalendarDays className={cn("h-5 w-5", viewMode === 'calendar' ? 'text-white' : 'text-black')} />
                Calendar
              </Button>
            </div>
          </div>

          {viewMode === 'list' ? (
            <SchedulerListView scheduledTests={scheduledTests} />
          ) : (
            <SchedulerCalendarView 
              scheduledTests={scheduledTests} 
              selectedDate={selectedDate} 
              setSelectedDate={setSelectedDate} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="results">
          <TestResultsList testResults={testResults} />
        </TabsContent>

        <TabsContent value="create">
          <TestForm onSubmit={handleFormSubmit} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 