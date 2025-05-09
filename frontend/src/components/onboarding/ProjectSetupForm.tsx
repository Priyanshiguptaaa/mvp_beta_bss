'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { HexColorPicker } from 'react-colorful';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';

const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  seats: z.number().min(1, 'Must have at least 1 seat'),
  colorScheme: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  teamEmails: z.array(z.string().email('Invalid email format')),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export function ProjectSetupForm() {
  const router = useRouter();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [teamEmails, setTeamEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [projectData, setProjectData] = useState<ProjectFormData | null>(null);
  const [showAuthChoice, setShowAuthChoice] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      colorScheme: '#3B82F6',
    },
  });

  const colorScheme = watch('colorScheme');

  useEffect(() => {
    // Autofill from sessionStorage if available
    if (typeof window !== "undefined") {
      const pending = sessionStorage.getItem('pendingProject');
      if (pending) {
        const data = JSON.parse(pending);
        setValue('name', data.name);
        setValue('description', data.description);
        setValue('colorScheme', data.color_scheme);
        setTeamEmails(data.members?.map((m: any) => m.email) || []);
        setValue('teamEmails', data.members?.map((m: any) => m.email) || []);
        // Optionally prefill seats if you store it
      }
    }
  }, [setValue]);

  const onSubmit = async (data: ProjectFormData) => {
    try {
      // Prepare members array for API
      const members = teamEmails.map(email => ({ email, role: 'member' }));
      const payload = {
        name: data.name,
        description: data.description,
        color_scheme: data.colorScheme,
        members,
        integrations: {}
      };

      console.log('Creating project with payload:', payload);

      // Get the API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      console.log('Using API URL:', apiUrl);

      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Making request to:', `${apiUrl}/projects/`);
      console.log('With headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });

      // Create project via API
      try {
        const response = await fetch(`${apiUrl}/projects/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response text:', errorText);
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { detail: errorText };
          }
          console.error('Project creation failed:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          throw new Error(errorData.detail || `Failed to create project: ${response.status} ${response.statusText}`);
        }

        const project = await response.json();
        console.log('Project created successfully:', project);

        // Store project data
        sessionStorage.setItem('projectData', JSON.stringify(project));
        setProjectData(project);
        
        // Redirect to tools page
        router.push('/onboarding/tools');
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        throw new Error(`Network error: ${fetchError.message}`);
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      alert(`Error creating project: ${error.message || 'An unexpected error occurred'}`);
    }
  };

  const addTeamEmail = () => {
    if (newEmail && !teamEmails.includes(newEmail)) {
      const updatedEmails = [...teamEmails, newEmail];
      setTeamEmails(updatedEmails);
      setValue('teamEmails', updatedEmails);
      setNewEmail('');
    }
  };

  const removeTeamEmail = (email: string) => {
    const updatedEmails = teamEmails.filter((e) => e !== email);
    setTeamEmails(updatedEmails);
    setValue('teamEmails', updatedEmails);
  };

  // Handler for GitHub auth
  const handleGithubAuth = () => {
    if (projectData) {
      // Store project data in sessionStorage for retrieval after OAuth
      sessionStorage.setItem('projectData', JSON.stringify(projectData));
    }
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/github/login`;
  };

  // Handler for skipping auth
  const handleContinue = () => {
    if (projectData) {
      sessionStorage.setItem('projectData', JSON.stringify(projectData));
    }
    router.push('/onboarding/tools');
  };

  if (showAuthChoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-lg p-8 shadow-lg bg-white text-center">
          <h2 className="text-2xl font-bold mb-4">Link your account</h2>
          <p className="mb-6 text-muted-foreground">Would you like to sign in with GitHub to link your account and enable advanced features?</p>
          <div className="flex flex-col gap-4">
            <Button onClick={handleGithubAuth} className="w-full bg-black text-white flex items-center justify-center gap-2">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98.01 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z"/></svg>
              Sign in with GitHub
            </Button>
            <Button variant="outline" onClick={handleContinue} className="w-full">Continue without GitHub</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-lg p-8 shadow-lg bg-white">
        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-echosys-gradient">
          Welcome to RCA Dashboard
        </h1>
        <p className="mb-6 text-muted">Set up your project and start monitoring AI model health.</p>
        <h2 className="text-xl font-semibold mb-6 text-primary">Project Setup</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              {...register('name')}
              className={errors.name ? 'border-error' : ''}
            />
            {errors.name && (
              <p className="text-error text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description</Label>
            <Input
              id="description"
              {...register('description')}
              className={errors.description ? 'border-error' : ''}
            />
            {errors.description && (
              <p className="text-error text-sm">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="seats">Number of Seats</Label>
            <Input
              id="seats"
              type="number"
              {...register('seats', { valueAsNumber: true })}
              className={errors.seats ? 'border-error' : ''}
            />
            {errors.seats && (
              <p className="text-error text-sm">{errors.seats.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Color Scheme</Label>
            <div className="flex items-center space-x-4">
              <div
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-accent"
                style={{ backgroundColor: colorScheme }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute z-10"
                >
                  <HexColorPicker
                    color={colorScheme}
                    onChange={(color) => setValue('colorScheme', color)}
                  />
                </motion.div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Team Members</Label>
            <div className="flex space-x-2">
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter team member email"
              />
              <Button type="button" variant="outline" onClick={addTeamEmail}>
                Add
              </Button>
            </div>
            <div className="mt-2 space-y-2">
              {teamEmails.map((email) => (
                <motion.div
                  key={email}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-2 bg-accent/10 rounded"
                >
                  <span className="text-primary">{email}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeTeamEmail(email)}
                  >
                    Remove
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple to-accent text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Project...' : 'Create Project'}
          </Button>
        </form>
      </Card>
    </div>
  );
} 