"use client";

import { useEffect, useState } from 'react';
import { SystemHealth, Incident, Model } from '@/types/api';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, Activity } from 'lucide-react';

export default function DashboardPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [health, incidentsData, modelsData] = await Promise.all([
          api.getSystemHealth(),
          api.getIncidents(),
          api.getModels(),
        ]);
        setSystemHealth(health);
        setIncidents(incidentsData);
        setModels(modelsData);
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
    <div className="p-6 space-y-6">
      {/* System Health Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Models</p>
              <p className="text-2xl font-bold">{systemHealth?.total_models}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Models</p>
              <p className="text-2xl font-bold">{systemHealth?.active_models}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Open Incidents</p>
              <p className="text-2xl font-bold">{systemHealth?.open_incidents}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">System Status</p>
              <Badge variant={systemHealth?.system_status === 'healthy' ? 'success' : 'destructive'}>
                {systemHealth?.system_status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Recent Incidents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incidents.slice(0, 5).map((incident) => (
              <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">{incident.title}</h3>
                  <p className="text-sm text-muted-foreground">{incident.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={incident.status === 'resolved' ? 'success' : 'destructive'}>
                    {incident.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Model Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <div key={model.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{model.name}</h3>
                  <Badge variant={model.status === 'active' ? 'success' : 'secondary'}>
                    {model.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Version: {model.version}</p>
                <p className="text-sm text-muted-foreground">
                  Last Updated: {new Date(model.last_updated).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 