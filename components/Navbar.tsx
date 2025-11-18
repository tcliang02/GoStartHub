'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('dreamify_session');
      if (session) {
        setUser(JSON.parse(session));
      }

      const handleScroll = () => {
        setScrolled(window.scrollY > 10);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dreamify_session');
      setUser(null);
      window.location.href = '/';
    }
  };

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all",
      scrolled && "shadow-md"
    )}>
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <Sparkles className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Dreamify
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/startups" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Startups
          </Link>
          <Link href="/programmes" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Programmes
          </Link>
          <Link href="/events" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Events
          </Link>
          <Link href="/mentors" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Mentors
          </Link>
          <Link href="/funding" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Funding
          </Link>
          <Link href="/businesses" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Businesses
          </Link>

          {user ? (
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l">
              <Link href="/dashboard" className="flex items-center space-x-2 text-sm font-medium hover:text-primary transition-colors">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container px-4 py-4 space-y-3">
            <Link href="/startups" className="block text-sm font-medium hover:text-primary transition-colors">
              Startups
            </Link>
            <Link href="/programmes" className="block text-sm font-medium hover:text-primary transition-colors">
              Programmes
            </Link>
            <Link href="/events" className="block text-sm font-medium hover:text-primary transition-colors">
              Events
            </Link>
            <Link href="/mentors" className="block text-sm font-medium hover:text-primary transition-colors">
              Mentors
            </Link>
            <Link href="/funding" className="block text-sm font-medium hover:text-primary transition-colors">
              Funding
            </Link>
            <Link href="/businesses" className="block text-sm font-medium hover:text-primary transition-colors">
              Businesses
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block text-sm font-medium hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="w-full">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="w-full">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

