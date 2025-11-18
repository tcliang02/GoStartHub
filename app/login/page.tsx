'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storage, initializeData } from '@/lib/storage';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Auto-login as demo user
  useEffect(() => {
    const autoLogin = () => {
      const users = storage.getUsers();
      let demoUser = users.find((u: any) => u.email === 'demo@dreamify.com' || u.id === 'demo-user');
      
      if (!demoUser) {
        // Create demo user
        demoUser = {
          id: 'demo-user',
          name: 'Demo User',
          email: 'demo@dreamify.com',
          role: 'innovator',
          university: 'Universiti Malaya (UM)',
          field: 'Computer Science',
          bio: 'Passionate innovator working on IoT and AI solutions for smart cities.',
        };
        storage.saveUsers([...users, demoUser]);
      }
      
      storage.saveSession(demoUser);
      initializeData();
      // Dispatch event to notify navbar
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('dreamify:auth-change'));
      }
      router.push('/dashboard');
    };

    // Auto-login after a short delay
    const timer = setTimeout(autoLogin, 500);
    return () => clearTimeout(timer);
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple login - in production, this would verify against a database
    const users = storage.getUsers();
    let user = users.find((u: any) => u.email === email);
    
    // Check if it's demo user email
    if (email.toLowerCase() === 'demo@dreamify.com' || email.toLowerCase().includes('demo')) {
      user = users.find((u: any) => u.email === 'demo@dreamify.com' || u.id === 'demo-user');
      if (!user) {
        // Create demo user
        user = {
          id: 'demo-user',
          name: 'Demo User',
          email: 'demo@dreamify.com',
          role: 'innovator',
          university: 'Universiti Malaya (UM)',
          field: 'Computer Science',
          bio: 'Passionate innovator working on IoT and AI solutions for smart cities.',
        };
        storage.saveUsers([...users, user]);
      }
    } else if (!user) {
      // Create a new user if none exists
      const newUser = {
        id: Date.now().toString(),
        name: 'Demo User',
        email: email,
        role: 'innovator',
      };
      storage.saveUsers([...users, newUser]);
      user = newUser;
    }
    
    if (user) {
      storage.saveSession(user);
      // Initialize demo data if it's the demo user
      if (user.id === 'demo-user' || user.email === 'demo@dreamify.com') {
        // Trigger initialization (it will check if data exists)
        initializeData();
      }
      // Dispatch event to notify navbar
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('dreamify:auth-change'));
      }
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your Dreamify account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

