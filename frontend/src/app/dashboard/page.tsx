"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { SystemHealth, Incident } from '@/types/api';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import TodaySnapshotCard from "@/components/dashboard/TodaySnapshotCard";
import RecentIncidentsCard from "@/components/dashboard/RecentIncidentsCard";
import ModelReliabilityCard from "@/components/dashboard/ModelReliabilityCard";
import RetrainingQueueCard from "@/components/dashboard/RetrainingQueueCard";
import SuggestionsCard from "@/components/dashboard/SuggestionsCard";

export default function DashboardPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [health, incidentsData, projects] = await Promise.all([
          api.getSystemHealth(),
          api.getIncidents(),
          api.getMyProjects(),
        ]);
        setSystemHealth(health);
        setIncidents(incidentsData);
        if (projects && projects.length > 0) {
          setProject(projects[0]);
          if (typeof window !== 'undefined') {
            const authToken = localStorage.getItem('authToken');
            let userEmail = null;
            if (authToken) {
              try {
                const payload = JSON.parse(atob(authToken.split('.')[1]));
                userEmail = payload.sub;
              } catch {}
            }
            const member = projects[0]?.members?.find((m: any) => m.email === userEmail);
            setUserRole(member?.role || null);
          }
        }
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0e7ff] p-6">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-gray-900">📊 Command Center</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TodaySnapshotCard />
        <RecentIncidentsCard />
        <ModelReliabilityCard />
        <RetrainingQueueCard />
        <SuggestionsCard />
      </div>
    </main>
  );
} 