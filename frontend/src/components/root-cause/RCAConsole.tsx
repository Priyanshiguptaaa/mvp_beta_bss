import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReplayViewer } from './ReplayViewer';

interface ContributingFactor {
  title: string;
  timestamp: string;
  trace_id: string;
  details: string;
  description: string;
}

interface ReplayStep {
  step: number;
  time?: string;
  timestamp?: string;
  description?: string;
  title?: string;
}

interface ReplayTimelineEvent {
  time: string;
  label: string;
  status: string;
}

interface HealthStats {
  retrievalSimilarity: number;
  semanticDrift: number;
  threshold: number;
  outliers: number;
}

interface ResolutionAction {
  action: string;
  description?: string;
  details?: string;
  status: string;
}

interface RCAReport {
  summary: string;
  root_cause: string;
  contributing_factors: ContributingFactor[];
  replay: ReplayStep[];
  replay_timeline: ReplayTimelineEvent[];
  health: HealthStats;
  resolution: ResolutionAction[];
}

interface Incident {
  id: number;
  code: string;
  title: string;
  first_detected: string;
  trace_id: string;
  severity: string;
  status: string;
  services: string[];
  description: string;
  rca_report: RCAReport;
}

interface RCAConsoleProps {
  section: string;
  rca: RCAReport;
  incident: Incident;
}

export function RCAConsole({ section, rca, incident }: RCAConsoleProps) {
  if (!rca || !incident) {
    return <div className="p-6 text-center text-muted-foreground">No data available</div>;
  }

  const renderSection = () => {
    switch (section) {
      case 'summary':
        return (
          <div className="space-y-4">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-500 font-semibold">&#9888; Error Detected</span>
                </div>
                <div className="text-red-700 font-medium mb-2">{rca.summary}</div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="py-4">
                <div className="font-semibold mb-1">Root Cause</div>
                <div className="text-yellow-800 font-medium">{rca.root_cause}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="font-semibold mb-1">Summary</div>
                <div className="mb-2 text-gray-700">{incident.description}</div>
                <div className="flex flex-wrap gap-6 mt-4">
                  <div>
                    <div className="text-xs text-gray-500">First Detected</div>
                    <div className="font-mono text-sm">{incident.first_detected}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Primary Trace ID</div>
                    <div className="font-mono text-sm">{incident.trace_id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Impacted Services</div>
                    <div className="flex gap-2 mt-1">
                      {incident.services.map((svc: string, i: number) => (
                        <Badge key={i} variant="outline">{svc}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Status</div>
                    <Badge className="bg-purple-200 text-purple-800 font-semibold">{incident.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'contributing_factors':
        return (
          <div className="space-y-4">
            {rca.contributing_factors.map((factor: ContributingFactor, idx: number) => (
              <Card key={idx} className="border-gray-200">
                <CardHeader>
                  <CardTitle>{factor.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 p-3 bg-gray-50 border-l-4 border-purple-300 text-gray-800 rounded">
                    {factor.description}
                  </div>
                  <div className="flex flex-wrap gap-8 mb-2">
                    <div>
                      <div className="text-xs text-gray-500">Timestamp</div>
                      <div className="font-mono text-sm flex items-center gap-1">{factor.timestamp}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Trace ID</div>
                      <div className="font-mono text-sm">{factor.trace_id}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      case 'replay':
        return (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Event Timeline */}
            <div className="flex-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Root Cause Replay</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {rca.replay.map((step: ReplayStep, idx: number) => (
                      <div key={idx} className="relative pl-10 pb-8">
                        {/* Step Number Circle */}
                        <div className="absolute left-0 top-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-800 font-bold text-lg border-2 border-gray-300 shadow">{step.step}</div>
                        {/* Step Title */}
                        <div className="font-bold text-lg text-gray-900 mb-2">{step.title}</div>
                        {/* Main Error/Message in code block or highlight */}
                        {step.description && step.description.toLowerCase().includes('error') ? (
                          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-2 font-mono text-sm mb-2 whitespace-pre-wrap">
                            {step.description}
                          </div>
                        ) : step.description ? (
                          <div className="bg-gray-100 border border-gray-200 text-gray-800 rounded px-4 py-2 font-mono text-sm mb-2 whitespace-pre-wrap">
                            {step.description}
                          </div>
                        ) : null}
                        {/* Timestamp and Service Trace */}
                        <div className="flex flex-wrap gap-8 mb-2 items-center">
                          {step.timestamp && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <span className="material-icons text-base align-middle">schedule</span>
                              <span className="font-mono text-sm">{step.timestamp}</span>
                            </div>
                          )}
                          {(step as any).trace_id && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <span className="material-icons text-base align-middle">timeline</span>
                              <span className="font-mono text-sm">{(step as any).trace_id}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Right: Replay/Audit Player */}
            <div className="w-full md:w-96">
              <ReplayViewer replay={rca.replay_timeline} health={rca.health} />
            </div>
          </div>
        );
      case 'resolution':
        return (
          <div className="space-y-4">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="py-4">
                <div className="font-semibold text-yellow-700 mb-2">Resolution Status: Human Action Needed</div>
                <div className="text-yellow-800">EchoSysAI traced the issues and recommends 3 clear remediations. No fix is applied yet. Human engineer needs to act.</div>
              </CardContent>
            </Card>
            {rca.resolution.map((action: ResolutionAction, idx: number) => (
              <Card key={idx} className="border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{idx + 1}. {action.action}</CardTitle>
                  <Badge className="bg-yellow-200 text-yellow-800 font-semibold ml-2">⚠️ Not Resolved</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700">{action.description || action.details}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {renderSection()}
    </div>
  );
} 