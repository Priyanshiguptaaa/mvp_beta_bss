"use client";

import { useEffect, useState } from 'react';
import { SystemHealth, Incident, Model } from '@/types/api';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, Activity, TrendingUp, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import TodaySnapshotCard from "@/components/dashboard/TodaySnapshotCard";
import RecentIncidentsCard from "@/components/dashboard/RecentIncidentsCard";
import ModelReliabilityCard from "@/components/dashboard/ModelReliabilityCard";
import RetrainingQueueCard from "@/components/dashboard/RetrainingQueueCard";
import SuggestionsCard from "@/components/dashboard/SuggestionsCard";

export default function DashboardPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [health, incidentsData, modelsData, projects] = await Promise.all([
          api.getSystemHealth(),
          api.getIncidents(),
          api.getModels(),
          api.getMyProjects(),
        ]);
        setSystemHealth(health);
        setIncidents(incidentsData);
        setModels(modelsData);
        if (projects && projects.length > 0) {
          setProject(projects[0]);
          // Find the current user's role in the project
          const authToken = localStorage.getItem('authToken');
          let userEmail = null;
          if (authToken) {
            try {
              const payload = JSON.parse(atob(authToken.split('.')[1]));
              userEmail = payload.sub;
            } catch {}
          }
          const member = projects[0].members.find((m: any) => m.email === userEmail);
          setUserRole(member?.role || null);
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

  const handleInvite = async () => {
    if (!project) return;
    setInviteLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('authToken');
      const resp = await fetch(`${apiUrl}/projects/${project.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: inviteEmail, role: 'member' }),
      });
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to invite member');
      }
      toast.success('Member invited successfully!');
      setShowInvite(false);
      setInviteEmail('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to invite member');
    } finally {
      setInviteLoading(false);
    }
  };

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

function MetricCard({ icon, label, value, trend, trendColor, info }: any) {
  return (
    <Card className="rounded-xl shadow bg-white p-6 flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
        <span className="ml-1" title={info}><Info className="w-4 h-4 text-gray-400" /></span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className={`text-xs ${trendColor}`}>{trend}</div>
    </Card>
  );
}

function ActionCard({ icon, title, description }: any) {
  return (
    <Card className="rounded-xl shadow bg-white p-6 flex flex-col gap-2 cursor-pointer hover:shadow-lg transition">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className="text-xs text-gray-500">{description}</div>
    </Card>
  );
}

function ModelStatusCard({ name, status, lastRun, server, hallucinations }: any) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between border rounded-lg p-4 mb-2 bg-gray-50">
      <div>
        <div className="font-semibold">{name}</div>
        <div className="text-xs text-gray-500">Last Run: {lastRun}</div>
        <div className="text-xs text-gray-500">Server: {server}</div>
      </div>
      <div className="flex flex-col items-end mt-2 md:mt-0">
        <Badge variant="success">{status}</Badge>
        <div className="text-xs text-green-600 mt-1">Hallucinations: {hallucinations}</div>
      </div>
    </div>
  );
}

function IncidentCard({ title, impact, status, description, time }: any) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50 mb-2">
      <div className="flex items-center gap-2 mb-1">
        <AlertCircle className="w-4 h-4 text-red-500" />
        <span className="font-semibold text-red-600">{title}</span>
        <Badge variant="destructive">{impact}</Badge>
        <span className="text-xs text-gray-400 ml-auto">{time}</span>
      </div>
      <div className="text-xs text-gray-700 mb-1">{description}</div>
      <Badge variant="outline" className="text-xs text-orange-600 border-orange-400 bg-orange-50">{status}</Badge>
    </div>
  );
} 