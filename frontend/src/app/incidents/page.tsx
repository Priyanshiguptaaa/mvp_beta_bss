export const dynamic = "force-dynamic";

'use client';

import { useEffect, useState } from 'react';
import { Incident } from '@/types/api';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await api.getIncidents();
        setIncidents(data);
      } catch (err) {
        setError('Failed to fetch incidents');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  const filteredIncidents = incidents.filter(incident => 
    incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Incidents</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button>Create Incident</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            All Incidents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredIncidents.map((incident) => (
              <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{incident.title}</h3>
                    <Badge variant={incident.severity === 'high' ? 'destructive' : 'secondary'}>
                      {incident.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{incident.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Created: {new Date(incident.created_at).toLocaleString()}</span>
                    {incident.resolved_at && (
                      <span>Resolved: {new Date(incident.resolved_at).toLocaleString()}</span>
                    )}
                  </div>
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
    </div>
  );
} 