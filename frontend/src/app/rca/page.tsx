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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RCAPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [tab, setTab] = useState("incidents");

  useEffect(() => {
    if (tab === "incidents") {
      fetch(`${API_URL}/incidents`)
        .then((res) => res.json())
        .then((data) => setIncidents(data));
    }
  }, [tab]);

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
                        <Badge
                          variant={
                            incident.severity === "high"
                              ? "destructive"
                              : incident.severity === "medium"
                              ? "warning"
                              : "outline"
                          }
                        >
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
          <Card className="p-6">Test Schedule (Coming soon)</Card>
        </TabsContent>
        <TabsContent value="rca-detail">
          <Card className="p-6">RCA Detail (Coming soon)</Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 