'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { initializeData } from '@/lib/storage';
import { ArrowRight, Users, DollarSign, Target, TrendingUp, Sparkles, Zap, Rocket, BookOpen, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  useEffect(() => {
    initializeData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white py-24 md:py-32">
        {/* GIF Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://blog.uber-cdn.com/cdn-cgi/image/width=2160,quality=80,onerror=redirect,format=auto/wp-content/uploads/sites/353/2016/01/CityNight.gif)',
          }}
        />
        {/* Light overlay for text readability only */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Platform for Young Innovators</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Empowering Young Innovators
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-2xl mx-auto">
              Showcase your prototypes, connect with mentors, and secure funding to turn your ideas into reality
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/programmes">
                <Button size="lg" variant="outline" className="border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20">
                  View Programmes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Why Choose Dreamify?</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The complete platform for student innovators in Malaysia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover-lift hover:border-primary/50 transition-all group">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <CardTitle>Showcase Prototypes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Display your innovative prototypes to potential investors and mentors
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover-lift hover:border-primary/50 transition-all group">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <CardTitle>Innovation Programmes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Join accelerators, bootcamps, and hackathons to grow your innovation
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover-lift hover:border-primary/50 transition-all group">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <CardTitle>Networking Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Attend workshops, seminars, and networking events to expand your network
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover-lift hover:border-primary/50 transition-all group">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <CardTitle>Expert Mentorship</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with industry experts and experienced mentors
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover-lift hover:border-primary/50 transition-all group">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
                <CardTitle>Funding Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access funding from businesses and investors across Malaysia
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover-lift hover:border-primary/50 transition-all group">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <CardTitle>Growth Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get the support you need to scale from idea to startup
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Simple Process</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple steps to get started on your innovation journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center border-2 hover-lift">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                  1
                </div>
                <CardTitle>Create Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sign up as an innovator and create your profile showcasing your skills and interests
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover-lift">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                  2
                </div>
                <CardTitle>Showcase Your Prototype</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Upload your prototype details, images, and documentation to attract attention
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover-lift">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                  3
                </div>
                <CardTitle>Connect & Grow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with mentors, apply for funding, and grow your innovation into a startup
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <Rocket className="h-16 w-16 mx-auto mb-6 animate-bounce" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Start Your Innovation Journey?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join hundreds of young innovators already on Dreamify
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all">
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

