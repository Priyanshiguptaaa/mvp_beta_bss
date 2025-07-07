import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from 'lucide-react';
import { ScheduledTest } from '@/types/scheduler';
import { getStatusBadge, getCardBackgroundColor } from './utils/schedulerUtils';

interface SchedulerListViewProps {
  scheduledTests: ScheduledTest[];
}

export function SchedulerListView({ scheduledTests }: SchedulerListViewProps) {
  return (
    <div className="max-w-7xl mx-auto">
      <Card className="bg-white shadow-lg rounded-2xl p-6 border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-purple-800 font-bold">Active Tests</CardTitle>
          <CardDescription className="text-sm">Currently scheduled tests</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-2">
            {scheduledTests.map((test, idx) => (
              <div
                key={test.id}
                className={`w-full rounded-xl p-4 flex flex-row justify-between items-center ${idx !== scheduledTests.length - 1 ? 'mb-2' : ''}`}
                style={{ background: test.status === 'failed' ? '#fef2f2' : test.status === 'passed' ? '#f0fdf4' : test.status === 'pending' ? '#fefce8' : '#f5f3ff' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg text-purple-900 mb-0.5 truncate">{test.name}</div>
                  <div className="text-sm text-gray-500 mt-0.5 line-clamp-2 truncate">{test.instruction}</div>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {test.schedule}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      Last run: {test.lastRun}
                    </div>
                    <div className="flex items-center text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-medium">
                      {test.agent}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 ml-6 min-w-[110px]">
                  {getStatusBadge(test.status)}
                  <span className="text-xs text-gray-400 font-medium mt-1">{test.environments?.[0]}</span>
                  <Button asChild variant="outline" size="sm" className="button-hover mt-2 px-3 py-1 text-xs font-medium">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 