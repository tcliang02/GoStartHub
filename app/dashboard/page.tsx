'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage, initializeData } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, DollarSign, Users, ArrowRight, MessageSquare, FileText, Calendar, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [startups, setStartups] = useState<any[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<any[]>([]);
  const [fundingApplications, setFundingApplications] = useState<any[]>([]);
  const [programmeRegistrations, setProgrammeRegistrations] = useState<any[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStartups: 0,
    totalFunding: 0,
    totalMentors: 0,
  });

  useEffect(() => {
    const session = storage.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setUser(session);
    
    // Initialize demo data if it's the demo user
    if (session.id === 'demo-user' || session.email === 'demo@dreamify.com') {
      initializeData();
    }

    const allStartups = storage.getStartups();
    const userStartups = allStartups.filter((p: any) => p.innovatorId === session.id);
    setStartups(userStartups);

    const allMentors = storage.getMentors();
    setStats({
      totalStartups: allStartups.length,
      totalFunding: allStartups.reduce((sum: number, p: any) => sum + p.fundingReceived, 0),
      totalMentors: allMentors.length,
    });

    // Load mentorship requests
    const allRequests = storage.getMentorshipRequests();
    const userRequests = allRequests.filter((req: any) => req.innovatorId === session.id);
    setMentorshipRequests(userRequests);

    // Load funding applications
    const allApplications = storage.getApplications();
    const userApplications = allApplications.filter((app: any) => app.innovatorId === session.id);
    setFundingApplications(userApplications);

    // Load programme registrations
    const allProgrammeRegs = storage.getProgrammeRegistrations();
    const userProgrammeRegs = allProgrammeRegs.filter((reg: any) => reg.innovatorId === session.id);
    setProgrammeRegistrations(userProgrammeRegs);

    // Load event registrations
    const allEventRegs = storage.getEventRegistrations();
    const userEventRegs = allEventRegs.filter((reg: any) => reg.attendeeId === session.id);
    setEventRegistrations(userEventRegs);
  }, [router]);

  if (!user) {
    return null;
  }

  // Calculate user-specific stats
  const userStats = {
    myStartups: startups.length,
    myFunding: startups.reduce((sum: number, s: any) => sum + (s.fundingReceived || 0), 0),
    activeApplications: fundingApplications.filter((a: any) => a.status === 'pending').length,
    activeMentorships: mentorshipRequests.filter((r: any) => r.status === 'approved' || r.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-xl text-muted-foreground">
            Manage your startups and track your innovation journey
          </p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="hover-lift border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">My Startups</p>
                  <div className="text-2xl font-bold">{userStats.myStartups}</div>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">My Funding</p>
                  <div className="text-2xl font-bold">RM {userStats.myFunding.toLocaleString()}</div>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Applications</p>
                  <div className="text-2xl font-bold">{userStats.activeApplications}</div>
                </div>
                <FileText className="h-8 w-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mentorships</p>
                  <div className="text-2xl font-bold">{userStats.activeMentorships}</div>
                </div>
                <Users className="h-8 w-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - My Startups */}
          <div className="lg:col-span-2 space-y-6">

            {/* My Startups */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">My Startups</CardTitle>
                    <CardDescription>Manage your innovation projects</CardDescription>
                  </div>
                  <Link href="/startups/new">
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Startup
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {startups.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You haven't created any startups yet.</p>
                    <Link href="/startups/new">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Startup
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {startups.map((startup) => (
                      <Link key={startup.id} href={`/startups/${startup.id}`}>
                        <Card className="hover-lift border-2 hover:border-primary/50 transition-all cursor-pointer">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1 line-clamp-1">{startup.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{startup.description}</p>
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge variant="outline" className="text-xs">{startup.category}</Badge>
                                  <Badge variant="secondary" className="text-xs capitalize">{startup.stage}</Badge>
                                  {startup.projectType && (
                                    <Badge variant="outline" className="text-xs">
                                      {startup.projectType === 'uni' ? 'University' : startup.projectType.charAt(0).toUpperCase() + startup.projectType.slice(1)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Funding Progress</span>
                                <span className="font-semibold">
                                  RM {startup.fundingReceived.toLocaleString()} / RM {startup.fundingNeeded.toLocaleString()}
                                </span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{
                                    width: `${Math.min((startup.fundingReceived / startup.fundingNeeded) * 100, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Programme Applications */}
            {user.role === 'innovator' && (
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Programme Applications
                      </CardTitle>
                      <CardDescription>{programmeRegistrations.length} application{programmeRegistrations.length !== 1 ? 's' : ''}</CardDescription>
                    </div>
                    <Link href="/programmes">
                      <Button size="sm" variant="outline">
                        Browse
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {programmeRegistrations.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-3">No applications yet</p>
                      <Link href="/programmes">
                        <Button size="sm">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Explore Programmes
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {programmeRegistrations.slice(0, 3).map((registration) => {
                        const programme = storage.getProgrammes().find(
                          (p: any) => p.id === registration.programmeId
                        );
                        return (
                          <div key={registration.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-sm line-clamp-1">{programme?.title || 'Programme'}</h4>
                              <Badge
                                variant={
                                  registration.status === 'accepted'
                                    ? 'default'
                                    : registration.status === 'rejected'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {registration.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(registration.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        );
                      })}
                      {programmeRegistrations.length > 3 && (
                        <Link href="/programmes">
                          <Button variant="ghost" size="sm" className="w-full">
                            View All ({programmeRegistrations.length})
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Funding Applications */}
            {user.role === 'innovator' && (
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Funding Applications
                      </CardTitle>
                      <CardDescription>{fundingApplications.length} application{fundingApplications.length !== 1 ? 's' : ''}</CardDescription>
                    </div>
                    <Link href="/funding">
                      <Button size="sm" variant="outline">
                        Browse
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {fundingApplications.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-3">No applications yet</p>
                      <Link href="/funding">
                        <Button size="sm">
                          <DollarSign className="mr-2 h-4 w-4" />
                          Find Funding
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {fundingApplications.slice(0, 3).map((application) => {
                        const opportunity = storage.getFundingOpportunities().find(
                          (opp: any) => opp.id === application.opportunityId
                        );
                        return (
                          <div key={application.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-sm line-clamp-1">{opportunity?.title || 'Funding Opportunity'}</h4>
                              <Badge
                                variant={
                                  application.status === 'approved'
                                    ? 'default'
                                    : application.status === 'rejected'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {application.status}
                              </Badge>
                            </div>
                            {opportunity && (
                              <p className="text-xs text-muted-foreground mb-1">
                                RM {opportunity.amount.toLocaleString()}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(application.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        );
                      })}
                      {fundingApplications.length > 3 && (
                        <Link href="/funding">
                          <Button variant="ghost" size="sm" className="w-full">
                            View All ({fundingApplications.length})
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Mentorship Requests */}
            {user.role === 'innovator' && (
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Mentorship
                      </CardTitle>
                      <CardDescription>{mentorshipRequests.length} request{mentorshipRequests.length !== 1 ? 's' : ''}</CardDescription>
                    </div>
                    <Link href="/mentors">
                      <Button size="sm" variant="outline">
                        Find
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {mentorshipRequests.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-3">No requests yet</p>
                      <Link href="/mentors">
                        <Button size="sm">
                          <Users className="mr-2 h-4 w-4" />
                          Find Mentor
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mentorshipRequests.slice(0, 3).map((request) => (
                        <div key={request.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm line-clamp-1">{request.mentorName}</h4>
                            <Badge
                              variant={
                                request.status === 'approved'
                                  ? 'default'
                                  : request.status === 'rejected'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {request.status}
                            </Badge>
                          </div>
                          {request.mentorResponse && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                              {request.mentorResponse}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                      {mentorshipRequests.length > 3 && (
                        <Link href="/mentors">
                          <Button variant="ghost" size="sm" className="w-full">
                            View All ({mentorshipRequests.length})
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Event Registrations */}
            {user.role === 'innovator' && (
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Upcoming Events
                      </CardTitle>
                      <CardDescription>{eventRegistrations.length} event{eventRegistrations.length !== 1 ? 's' : ''}</CardDescription>
                    </div>
                    <Link href="/events">
                      <Button size="sm" variant="outline">
                        Browse
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {eventRegistrations.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-3">No registrations yet</p>
                      <Link href="/events">
                        <Button size="sm">
                          <Calendar className="mr-2 h-4 w-4" />
                          Explore Events
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {eventRegistrations.slice(0, 3).map((registration) => {
                        const event = storage.getEvents().find(
                          (e: any) => e.id === registration.eventId
                        );
                        return (
                          <div key={registration.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-sm line-clamp-1">{event?.title || 'Event'}</h4>
                              <Badge
                                variant={
                                  registration.status === 'attended'
                                    ? 'default'
                                    : registration.status === 'cancelled'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {registration.status}
                              </Badge>
                            </div>
                            {event && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(event.date).toLocaleDateString('en-MY', {
                                  month: 'short',
                                  day: 'numeric',
                                })} • {event.startTime}
                              </p>
                            )}
                          </div>
                        );
                      })}
                      {eventRegistrations.length > 3 && (
                        <Link href="/events">
                          <Button variant="ghost" size="sm" className="w-full">
                            View All ({eventRegistrations.length})
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
                <CardDescription>Get started quickly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/startups">
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Browse Startups
                    </Button>
                  </Link>
                  <Link href="/programmes">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse Programmes
                    </Button>
                  </Link>
                  <Link href="/events">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Browse Events
                    </Button>
                  </Link>
                  <Link href="/mentors">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Find Mentors
                    </Button>
                  </Link>
                  <Link href="/funding">
                    <Button variant="outline" className="w-full justify-start">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Find Funding
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

