export const dynamic = "force-dynamic";
"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Incident {
  id: number;
  title: string;
  severity: "high" | "medium" | "low";
  status: string;
  time: string;
  impact: number;
  description: string;
}

interface TestSchedule {
  id: number;
  date: string;
  test_name: string;
  description: string;
  tags: string[];
  time: string;
}

interface RCADetail {
  id: number;
  incident_id: number;
  summary: string;
  root_cause: string;
  contributing_factors: string[];
  replay: string;
  resolution: string;
  status: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RCAPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [testSchedules, setTestSchedules] = useState<TestSchedule[]>([]);
  const [rcaDetails, setRcaDetails] = useState<RCADetail[]>([]);
  const [tab, setTab] = useState("incidents");

  useEffect(() => {
    if (tab === "incidents") {
      fetch(`${API_URL}/incidents`)
        .then((res) => res.json())
        .then((data) => setIncidents(data));
    } else if (tab === "test-schedule") {
      fetch(`${API_URL}/test_schedules`)
        .then((res) => res.json())
        .then((data) => setTestSchedules(data));
    } else if (tab === "rca-detail") {
      fetch(`${API_URL}/rca_details`)
        .then((res) => res.json())
        .then((data) => setRcaDetails(data));
    }
  }, [tab]);

  const getSeverityBadge = (severity: string) => {
    if (severity === "high") return "destructive";
    if (severity === "medium") return "secondary";
    if (severity === "low") return "success";
    return "outline";
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Root Cause Analysis</h1>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="test-schedule">Test Schedule</TabsTrigger>
          <TabsTrigger value="rca-detail">RCA Detail</TabsTrigger>
        </TabsList>
        <TabsContent value="incidents">
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Incidents</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Incident</th>
                    <th className="text-left py-2 px-4">Severity</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Time</th>
                    <th className="text-left py-2 px-4">Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr key={incident.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">{incident.title}</td>
                      <td className="py-2 px-4">
                        <Badge variant={getSeverityBadge(incident.severity)}>
                          {incident.severity}
                        </Badge>
                      </td>
                      <td className="py-2 px-4">{incident.status}</td>
                      <td className="py-2 px-4">{new Date(incident.time).toLocaleString()}</td>
                      <td className="py-2 px-4">{incident.impact} users</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="test-schedule">
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Test Schedules</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Test Name</th>
                    <th className="text-left py-2 px-4">Date</th>
                    <th className="text-left py-2 px-4">Time</th>
                    <th className="text-left py-2 px-4">Tags</th>
                    <th className="text-left py-2 px-4">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {testSchedules.map((test) => (
                    <tr key={test.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">{test.test_name}</td>
                      <td className="py-2 px-4">{test.date}</td>
                      <td className="py-2 px-4">{test.time}</td>
                      <td className="py-2 px-4">
                        {test.tags && test.tags.length > 0
                          ? test.tags.map((tag, i) => (
                              <Badge key={i} variant="outline" className="mr-1">
                                {tag}
                              </Badge>
                            ))
                          : "-"}
                      </td>
                      <td className="py-2 px-4">{test.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="rca-detail">
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">RCA Details</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Incident ID</th>
                    <th className="text-left py-2 px-4">Summary</th>
                    <th className="text-left py-2 px-4">Root Cause</th>
                    <th className="text-left py-2 px-4">Contributing Factors</th>
                    <th className="text-left py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rcaDetails.map((rca) => (
                    <tr key={rca.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">{rca.incident_id}</td>
                      <td className="py-2 px-4">{rca.summary}</td>
                      <td className="py-2 px-4">{rca.root_cause}</td>
                      <td className="py-2 px-4">
                        {rca.contributing_factors && rca.contributing_factors.length > 0
                          ? rca.contributing_factors.map((factor, i) => (
                              <Badge key={i} variant="outline" className="mr-1">
                                {factor}
                              </Badge>
                            ))
                          : "-"}
                      </td>
                      <td className="py-2 px-4">{rca.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 