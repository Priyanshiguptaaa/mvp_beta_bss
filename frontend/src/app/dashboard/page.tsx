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
        // First check if we have an auth token
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }

        // Fetch data in parallel
        const [health, incidentsData, projects] = await Promise.all([
          api.getSystemHealth().catch(err => {
            console.error('Error fetching system health:', err);
            return null;
          }),
          api.getIncidents().catch(err => {
            console.error('Error fetching incidents:', err);
            return [];
          }),
          api.getMyProjects().catch(err => {
            console.error('Error fetching projects:', err);
            return [];
          }),
        ]);

        setSystemHealth(health);
        setIncidents(incidentsData);
        
        if (projects && projects.length > 0) {
          setProject(projects[0]);
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userEmail = payload.sub;
            const member = projects[0]?.members?.find((m: any) => m.email === userEmail);
            setUserRole(member?.role || null);
          } catch (err) {
            console.error('Error parsing token:', err);
          }
        } else {
          toast.error('No projects found. Please create a project first.');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Dashboard data fetch error:', err);
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
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
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