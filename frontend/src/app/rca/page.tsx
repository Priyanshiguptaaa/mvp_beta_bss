"use client";
export const dynamic = "force-dynamic";
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, FileText, Search, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RCAConsole } from '../../components/root-cause/RCAConsole';
import { ReplayViewer } from '../../components/root-cause/ReplayViewer';
import { Skeleton } from "@/components/ui/skeleton";
import { mockIncident } from "../../mockDemoData";

interface Incident {
  id: number;
  title: string;
  severity: string;
  status: string;
  time: string;
  impact: number;
  description: string;
  test_result_id: number;
  summary: string;
  created_at: string;
  rca_report: {
    summary: string;
    root_cause: string;
    contributing_factors: Array<{
      title: string;
      details: string;
      log_id?: string;
      trace_id?: string;
      timestamp?: string;
    }>;
    replay: Array<{
      step: number;
      title: string;
      details: string;
      timestamp?: string;
    }>;
    resolution: Array<{
      action: string;
      details: string;
      status: string;
    }>;
  };
}

interface RCADetail {
  id: number;
  incident_id: string;
  summary: string;
  status: string;
  severity: string;
  created_at: string;
  updated_at: string;
  agent: string;
  rca_report: {
    summary: string;
    root_cause: string;
    contributing_factors: Array<{
      title: string;
      details: string;
      log_id: string;
      trace_id: string;
      timestamp: string;
    }>;
    replay: Array<{
      step: number;
      title: string;
      details: string;
      timestamp: string;
    }>;
    resolution: Array<{
      action: string;
      status: string;
      details: string;
    }>;
  };
  test_result: {
    id: number;
    test_name: string;
    instruction: string;
    expected_behavior: string;
    status: string;
    details: string;
    run_date: string;
  } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RCAPage() {
  const [activeTab, setActiveTab] = useState('summary');

  return (
    <div className="container mx-auto p-6">
      {/* Header summary */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Root Cause Analysis Breakdown</h2>
            <p className="text-gray-600 max-w-2xl">This page provides a structured, step-by-step breakdown of the incident, surfacing what broke, why it broke, and how to fix it.</p>
          </div>
          <div>
            <Badge className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold">high severity</Badge>
          </div>
        </div>
      </div>
      {/* Main RCA Card */}
      <Card className="bg-[#f6f3fd] border-0 shadow-none">
        <CardHeader className="bg-[#ede9fe] rounded-t-2xl flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-xl font-semibold">{mockIncident.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-red-500 text-white px-3 py-1 rounded-full">Critical</Badge>
              <span className="text-gray-500 text-sm">Incident {mockIncident.code}</span>
            </div>
          </div>
          <Button variant="outline" className="border-red-200 text-red-600 flex items-center gap-2">
            <span className="text-lg">&#9888;</span> Create Incident
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 rounded-lg overflow-hidden mt-6 mb-4 bg-white border">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="contributing_factors">Contributing Factors</TabsTrigger>
              <TabsTrigger value="replay">Replay</TabsTrigger>
              <TabsTrigger value="resolution">Resolution</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              <RCAConsole
                section={activeTab}
                rca={mockIncident.rca_report}
                incident={mockIncident}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 