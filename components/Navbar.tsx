'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getUserSubscriptionPlan } from '@/lib/subscription';
import { storage } from '@/lib/storage';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('Free');
  const [mounted, setMounted] = useState(false);

  // Load user session and subscription
  const loadUserData = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const session = localStorage.getItem('dreamify_session');
      if (session) {
        const userData = JSON.parse(session);
        setUser(userData);
        // Get subscription tier
        const subscription = storage.getUserSubscription(userData.id);
        if (subscription) {
          if (subscription.tier === 'pro') {
            // Check if they used a promo code
            if (subscription.promoCode) {
              setSubscriptionTier('Education');
            } else {
              setSubscriptionTier('Pro');
            }
          } else if (subscription.tier === 'pro-plus') {
            setSubscriptionTier('Pro+');
          } else {
            setSubscriptionTier('Free');
          }
        } else {
          setSubscriptionTier('Free');
        }
      } else {
        setUser(null);
        setSubscriptionTier('Free');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser(null);
      setSubscriptionTier('Free');
    }
  };

  useEffect(() => {
    setMounted(true);
    loadUserData();

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dreamify_session') {
        loadUserData();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom login/logout events (same-tab updates)
    const handleAuthChange = () => {
      loadUserData();
    };
    window.addEventListener('dreamify:auth-change', handleAuthChange);

    // Also check periodically in case of same-tab updates (less frequent)
    const interval = setInterval(() => {
      loadUserData();
    }, 2000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dreamify:auth-change', handleAuthChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dreamify_session');
      setUser(null);
      setSubscriptionTier('Free');
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('dreamify:auth-change'));
      window.location.href = '/';
    }
  };

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all",
      scrolled && "shadow-md"
    )}>
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-3 group">
          <img 
            src="/images/dreamifylogo.png" 
            alt="Dreamify Logo" 
            className="h-12 w-auto group-hover:opacity-80 transition-opacity flex-shrink-0"
            onError={(e) => {
              // Fallback to icon if image fails
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = '<div class="relative"><svg class="h-6 w-6 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg></div><span class="text-2xl font-medium tracking-wider bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">DREAMIFY</span>';
              }
            }}
          />
          <span className="text-2xl font-medium tracking-wider bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 500 }}>
            DREAMIFY
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
          <Link href="/resources" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Resources
          </Link>

          {mounted && user ? (
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l">
              <Link href="/subscription" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                <Crown className="h-4 w-4" />
                <span>{subscriptionTier}</span>
              </Link>
              <Link href="/dashboard" className="flex items-center space-x-2 text-sm font-medium hover:text-primary transition-colors">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : mounted ? (
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l">
              <div className="h-9 w-16 bg-muted animate-pulse rounded"></div>
              <div className="h-9 w-20 bg-muted animate-pulse rounded"></div>
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
            <Link href="/resources" className="block text-sm font-medium hover:text-primary transition-colors">
              Resources
            </Link>
            {mounted && user ? (
              <>
                <Link href="/subscription" className="flex items-center gap-1.5 block text-sm font-medium hover:text-primary transition-colors">
                  <Crown className="h-4 w-4" />
                  <span>{subscriptionTier}</span>
                </Link>
                <Link href="/dashboard" className="block text-sm font-medium hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : mounted ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="w-full">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="w-full">Sign Up</Button>
                </Link>
              </>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}

