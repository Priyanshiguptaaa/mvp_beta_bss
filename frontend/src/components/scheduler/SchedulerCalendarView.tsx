import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CalendarDays } from 'lucide-react';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ScheduledTest } from '@/types/scheduler';
import { getStatusBadge, getCardBackgroundColor } from './utils/schedulerUtils';

interface SchedulerCalendarViewProps {
  scheduledTests: ScheduledTest[];
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
}

export function SchedulerCalendarView({ 
  scheduledTests, 
  selectedDate, 
  setSelectedDate 
}: SchedulerCalendarViewProps) {
  // Function to get tests for selected date
  const getTestsForSelectedDate = () => {
    if (!selectedDate) return [];
    
    return scheduledTests.filter(test => {
      if (!test.date) return false;
      return test.date.getDate() === selectedDate.getDate() && 
             test.date.getMonth() === selectedDate.getMonth() && 
             test.date.getFullYear() === selectedDate.getFullYear();
    });
  };

  // Function to render custom day content with status indicator
  const renderDay = (day: Date) => {
    const testsOnDate = scheduledTests.filter(test => {
      if (!test.date) return false;
      return test.date.getDate() === day.getDate() && 
             test.date.getMonth() === day.getMonth() && 
             test.date.getFullYear() === day.getFullYear();
    });
    
    if (testsOnDate.length === 0) return null;
    
    let color = 'bg-purple-500';
    if (testsOnDate.some(test => test.status === 'failed')) {
      color = 'bg-red-500';
    } else if (testsOnDate.some(test => test.status === 'pending')) {
      color = 'bg-amber-500';
    } else if (testsOnDate.some(test => test.status === 'passed')) {
      color = 'bg-green-500';
    }
    
    return (
      <div className="flex justify-center">
        <div className={`w-1.5 h-1.5 rounded-full mt-1 ${color}`} />
      </div>
    );
  };

  const testsForSelectedDate = getTestsForSelectedDate();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="col-span-1 bg-white shadow-lg rounded-2xl p-6 border-0">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="p-3 pointer-events-auto"
              initialFocus
              modifiers={{
                highlighted: scheduledTests
                  .filter(test => test.date)
                  .map(test => test.date as Date)
              }}
              components={{
                DayContent: ({ date }: { date: Date }) => (
                  <>
                    {date.getDate()}
                    {renderDay(date)}
                  </>
                ),
              }}
            />
            <div className="mt-4 space-y-1">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs">Passed Tests</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-xs">Failed Tests</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                <span className="text-xs">Pending Tests</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2 bg-white shadow-lg rounded-2xl p-6 border-0">
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              Tests for {selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testsForSelectedDate.length > 0 ? (
              <div className="flex flex-col gap-2">
                {testsForSelectedDate.map(test => (
                  <div
                    key={test.id}
                    className={`w-full rounded-xl p-4 flex flex-row justify-between items-center`}
                    style={{ background: test.status === 'failed' ? '#fef2f2' : test.status === 'passed' ? '#f0fdf4' : test.status === 'pending' ? '#fefce8' : '#f5f3ff' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-lg text-purple-900 mb-0.5 truncate">{test.name}</div>
                      <div className="text-sm text-gray-500 mt-0.5 line-clamp-2 truncate">{test.instruction}</div>
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {test.schedule}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-6 min-w-[110px]">
                      {getStatusBadge(test.status)}
                      {test.status === 'failed' && test.incidentId && (
                        <Link href={`/root-cause?incident=${test.incidentId}`}>
                          <Button size="sm" variant="outline" className="button-hover mt-2 px-3 py-1 text-xs font-medium bg-purple-50 text-purple-700 border-0 hover:bg-purple-100">View Details</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) :
              <div className="text-center py-8 text-gray-500">
                <CalendarDays className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No tests scheduled for this date</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 bg-purple-50 text-purple-700 border-0 hover:bg-purple-100"
                  onClick={() => document.getElementById('create-test-tab')?.click()}
                >
                  Schedule a test
                </Button>
              </div>
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 