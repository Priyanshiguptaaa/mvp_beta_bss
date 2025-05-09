'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Load saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('lastUsedEmail');
    if (savedEmail) {
      setValue('email', savedEmail);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // Create form data for OAuth2 password flow
      const formData = new FormData();
      formData.append('username', data.email); // OAuth2 uses 'username' for email
      formData.append('password', data.password);

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const result = await response.json();
      localStorage.setItem('authToken', result.token);
      // Save the email for future autofill
      localStorage.setItem('lastUsedEmail', data.email);
      toast.success('Login successful');
      router.replace('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `demo_${Date.now()}@example.com`,
          password: 'demo123',
          full_name: 'Demo User'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create demo user');
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      toast.success('Demo login successful');
      router.replace('/dashboard');
    } catch (error) {
      console.error('Demo login error:', error);
      toast.error('Failed to login with demo account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-8 shadow-lg bg-white">
      <h1 className="text-2xl font-bold mb-6 text-center">Welcome Back</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            className={errors.password ? 'border-red-500' : ''}
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleDemoLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Try Demo'}
        </Button>
      </form>
    </Card>
  );
} 