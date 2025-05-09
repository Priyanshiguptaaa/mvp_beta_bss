"use client";

import { useEffect, useState } from 'react';
import { SystemHealth, Incident, Model } from '@/types/api';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, Activity, TrendingUp, RefreshCw, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* 1. Today's Snapshot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" />Today's Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Stat label="Incidents" value={4} />
            <Stat label="Failed Tests" value={2} />
            <Stat label="Auto-fixed" value={3} />
            <Stat label="Pending Fixes" value={1} />
            <Stat label="Hallucinations" value={2} />
          </div>
          <div className="mb-2">
            <span className="font-semibold">Quick Filters:</span>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline">Finance Agent</Button>
              <Button size="sm" variant="outline">Only Hallucinations</Button>
            </div>
          </div>
          <div>
            <span className="font-semibold">Upcoming Scheduled Tests:</span>
            <ul className="list-disc ml-6 text-sm mt-1">
              <li>Finance Agent - 2:00pm</li>
              <li>Sales Agent - 4:00pm</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 2. Suggestions / At-Risk Warnings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-yellow-500" />Suggestions & At-Risk Warnings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-6 text-sm space-y-2">
            <li>This domain is drifting</li>
            <li>Fallbacks triggered 10+ times today</li>
            <li>Model X failed 3 times on Y-type queries</li>
          </ul>
        </CardContent>
      </Card>

      {/* 3. Top 3 Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertCircle className="w-5 h-5" />Top 3 Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[{id:1,summary:'Finance agent misclassified lead',status:'Auto-fixed'},{id:2,summary:'Hallucination in sales summary',status:'Needs review'},{id:3,summary:'Fallback triggered 10+ times',status:'Fixed'}].map((incident) => (
              <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">{incident.summary}</h3>
                  <p className="text-xs text-muted-foreground">Status: <span className="font-semibold">{incident.status}</span></p>
                </div>
                <Button variant="outline" size="sm">View RCA</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4. Model Reliability Graphs (Mocked) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" />Model Reliability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="font-semibold">Hallucination Rate (last 7/30 days)</div>
            <div className="h-24 bg-gradient-to-r from-blue-200 to-blue-400 rounded mb-2 flex items-center justify-center text-xs text-blue-900">[Graph Placeholder]</div>
            <div className="font-semibold">Drift Detection Timeline</div>
            <div className="h-16 bg-gradient-to-r from-yellow-100 to-yellow-300 rounded mb-2 flex items-center justify-center text-xs text-yellow-900">[Graph Placeholder]</div>
            <div className="font-semibold">Accuracy & Confidence Spread</div>
            <div className="h-16 bg-gradient-to-r from-green-100 to-green-300 rounded flex items-center justify-center text-xs text-green-900">[Graph Placeholder]</div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Retraining Queue or Feedback Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><RefreshCw className="w-5 h-5" />Retraining Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-6 text-sm space-y-2">
            <li>Job #1234 - 80% completed</li>
            <li>Job #1235 - Awaiting user approval</li>
            <li>Job #1236 - 20% completed</li>
          </ul>
        </CardContent>
      </Card>

      {/* Invite Member (Owner Only) */}
      {userRole === 'owner' && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Team Member</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowInvite(true)} className="bg-blue-600 text-white">Invite Member</Button>
            {showInvite && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                  <h2 className="text-lg font-bold mb-2">Invite Team Member</h2>
                  <Input
                    type="email"
                    placeholder="Enter email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="mb-4"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowInvite(false)} disabled={inviteLoading}>Cancel</Button>
                    <Button onClick={handleInvite} disabled={inviteLoading || !inviteEmail}>
                      {inviteLoading ? 'Inviting...' : 'Invite'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
} 