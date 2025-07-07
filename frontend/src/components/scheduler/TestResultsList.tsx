import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Diff } from 'lucide-react';
import { TestResult } from '@/types/scheduler';
import { getStatusBadge } from './utils/schedulerUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PromptDiff } from '@/components/dashboard/PromptDiff';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from 'next/navigation';

interface TestResultsListProps {
  testResults: TestResult[];
}

export function TestResultsList({ testResults: initialTestResults }: TestResultsListProps) {
  const [testResults] = useState<TestResult[]>(initialTestResults);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDiff, setSelectedDiff] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const handleViewHistory = (result: TestResult) => {
    setSelectedTest(result);
    setShowHistory(true);
  };

  const handleBackToResults = () => {
    setShowHistory(false);
    setSelectedTest(null);
  };

  const handleCompare = (run: any) => {
    setSelectedDiff(run);
    setDialogOpen(true);
  };

  const handleViewRootCause = (incidentId: number) => {
    router.push(`/rca-console/${incidentId}`);
  };

  if (showHistory && selectedTest) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="bg-white shadow-lg rounded-xl p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Test Run History: {selectedTest.testName}</CardTitle>
              <CardDescription>Previous runs of this test</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleBackToResults}>
              Back to Results
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Agent Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedTest.history?.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">{run.timestamp}</TableCell>
                    <TableCell>{run.agentVersion}</TableCell>
                    <TableCell>{getStatusBadge(run.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleCompare(run)}
                        className="gap-1"
                      >
                        <Diff className="h-4 w-4" />
                        Compare
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Prompt Comparison</DialogTitle>
            </DialogHeader>
            {selectedDiff && (
              <PromptDiff
                oldVersion={selectedDiff.promptBefore}
                newVersion={selectedDiff.promptAfter}
                oldSettings={selectedDiff.settingsBefore}
                newSettings={selectedDiff.settingsAfter}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="bg-white shadow-lg rounded-xl p-6">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg text-purple-800 font-bold">Recent Test Results</CardTitle>
            <CardDescription>Latest test runs and their outcomes</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {testResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No test results available</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {testResults.map(result => (
                <div
                  key={result.id}
                  className={`rounded-lg p-4 shadow border flex flex-col gap-2`}
                  style={{ background: result.status === 'failed' ? '#fef2f2' : result.status === 'passed' ? '#f0fdf4' : result.status === 'pending' ? '#fefce8' : '#f5f3ff', borderColor: '#f3e8ff' }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-lg text-purple-900 mb-1">{result.testName}</div>
                      <div className="text-sm text-gray-500 mt-1 line-clamp-2">{result.details}</div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{result.runDate}</span>
                          <span className="ml-2 px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">{result.agent}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-semibold rounded px-2 py-1 ${result.status === 'failed' ? 'bg-red-100 text-red-800' : result.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{result.status.charAt(0).toUpperCase() + result.status.slice(1)}</span>
                      <span className="text-xs text-gray-400 font-medium mt-1">{result.environment}</span>
                      <div className="mt-3 flex gap-2">
                        {result.status === 'failed' && result.incidentId && (
                          <Button
                            variant="default"
                            size="sm"
                            className="text-xs bg-purple-600 hover:bg-purple-700"
                            asChild
                          >
                            <a href={`/rca-console/${result.incidentId}`}>View Root Cause</a>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleViewHistory(result)}
                        >
                          View History
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 