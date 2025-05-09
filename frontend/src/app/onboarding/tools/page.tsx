"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api';

const categories = [
  {
    title: 'Project Management Tools',
    description: 'Select at least one project management tool to connect.',
    key: 'project',
    options: [
      { id: 'linear', name: 'Linear', icon: '📈' },
      { id: 'notion', name: 'Notion', icon: '📝' },
      { id: 'github', name: 'GitHub', icon: '🐙' },
      { id: 'jira', name: 'Jira', icon: '📊' },
    ],
  },
  {
    title: 'Observability Tools',
    description: 'Select at least one observability tool to connect.',
    key: 'observability',
    options: [
      { id: 'sentry', name: 'Sentry', icon: '🛡️' },
      { id: 'datadog', name: 'Datadog', icon: '📈' },
    ],
  },
  {
    title: 'Cloud Platforms',
    description: 'Select at least one cloud platform to connect.',
    key: 'cloud',
    options: [
      { id: 'gcp', name: 'Google Cloud Platform', icon: '☁️' },
      { id: 'aws', name: 'Amazon Web Services', icon: '☁️' },
      { id: 'azure', name: 'Microsoft Azure', icon: '☁️' },
    ],
  },
  {
    title: 'Code Editors',
    description: 'Select at least one code editor to connect.',
    key: 'editor',
    options: [
      { id: 'cursor', name: 'Cursor', icon: '✏️' },
    ],
  },
];

export default function OnboardingToolsPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[][]>(categories.map(() => []));
  const [projectData, setProjectData] = useState<any>(null);

  useEffect(() => {
    // Restore project data from sessionStorage
    const stored = sessionStorage.getItem('projectData');
    if (stored) {
      setProjectData(JSON.parse(stored));
    }
  }, []);

  const current = categories[step];

  const handleToggle = (optionId: string) => {
    setSelected(prev => {
      const updated = [...prev];
      if (updated[step].includes(optionId)) {
        updated[step] = updated[step].filter(id => id !== optionId);
      } else {
        updated[step] = [...updated[step], optionId];
      }
      return updated;
    });
  };

  const handleNext = async () => {
    if (step < categories.length - 1) {
      setStep(step + 1);
    } else {
      // Complete setup: save selected tools to backend
      const projectData = sessionStorage.getItem('projectData');
      if (projectData) {
        const project = JSON.parse(projectData);
        // Build integrations object by category
        const integrations: Record<string, string[]> = {};
        categories.forEach((cat, idx) => {
          integrations[cat.key] = selected[idx];
        });
        try {
          console.log('PATCHING integrations for project', project.id, integrations);
          const resp = await api.updateProjectIntegrations(project.id, integrations);
          console.log('PATCH response:', resp);
          // Optionally update sessionStorage
          project.integrations = integrations;
          sessionStorage.setItem('projectData', JSON.stringify(project));
        } catch (e) {
          console.error('Failed to save integrations:', e);
          alert('Failed to save integrations.');
        }
      }
      // Redirect to dashboard or next step
      router.push(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-xl p-8 shadow-lg bg-white">
        <div className="mb-6">
          <div className="text-sm text-muted mb-2">Step {step + 1} of {categories.length}</div>
          <h2 className="text-2xl font-bold mb-1 bg-clip-text text-transparent bg-echosys-gradient">{current.title}</h2>
          <div className="text-muted mb-4">{current.description}</div>
        </div>
        <div className="space-y-4 mb-8">
          {current.options.map(opt => (
            <label key={opt.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded cursor-pointer">
              <Checkbox
                checked={selected[step].includes(opt.id)}
                onCheckedChange={() => handleToggle(opt.id)}
              />
              <span className="text-2xl">{opt.icon}</span>
              <span className="font-medium text-primary">{opt.name}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            disabled={selected[step].length === 0}
            className="bg-gradient-to-r from-purple to-accent text-white"
          >
            {step < categories.length - 1 ? 'Next' : 'Complete Setup'}
          </Button>
        </div>
      </Card>
    </div>
  );
} 