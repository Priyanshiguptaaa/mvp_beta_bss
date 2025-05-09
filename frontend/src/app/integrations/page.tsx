"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

const categories = [
  { key: 'project', label: 'Project Management' },
  { key: 'observability', label: 'Observability' },
  { key: 'cloud', label: 'Cloud Platforms' },
  { key: 'editor', label: 'Code Editors' },
];

export default function IntegrationsPage() {
  const [projectId, setProjectId] = useState<number | null>(null);
  const [integrations, setIntegrations] = useState<Record<string, string[]>>({});
  const [activeTab, setActiveTab] = useState(categories[0].key);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProjectAndIntegrations = async () => {
      try {
        const projects = await api.getMyProjects();
        if (projects && projects.length > 0) {
          const project = projects[0];
          setProjectId(project.id);
          const data = await api.getProjectIntegrations(project.id);
          setIntegrations(data.integrations || {});
        } else {
          setError('No projects found. Please create a project first.');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch project data');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndIntegrations();
  }, []);

  const handleRemove = async (catKey: string, tool: string) => {
    if (!projectId) return;
    
    const previousState = { ...integrations };
    const updated = { ...integrations, [catKey]: (integrations[catKey] || []).filter(t => t !== tool) };
    
    setIntegrations(updated);
    setUpdating(true);
    
    try {
      await api.updateProjectIntegrations(projectId, updated);
      toast.success('Integration removed successfully');
    } catch (err) {
      console.error('Error updating integrations:', err);
      setIntegrations(previousState); // Revert on failure
      toast.error('Failed to remove integration');
      setError(err instanceof Error ? err.message : 'Failed to update integrations');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Integrations</h1>
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            {categories.map(cat => (
              <TabsTrigger key={cat.key} value={cat.key}>{cat.label}</TabsTrigger>
            ))}
          </TabsList>
          {categories.map(cat => (
            <TabsContent key={cat.key} value={cat.key}>
              <div className="space-y-2">
                {(integrations[cat.key] || []).length === 0 && (
                  <div className="text-muted-foreground">No integrations selected.</div>
                )}
                {(integrations[cat.key] || []).map(tool => (
                  <div key={tool} className="flex items-center justify-between p-2 border rounded">
                    <span>{tool}</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleRemove(cat.key, tool)}
                      disabled={updating}
                    >
                      {updating ? 'Removing...' : 'Remove'}
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
} 