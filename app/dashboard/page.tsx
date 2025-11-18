'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage, initializeData } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, DollarSign, Users, ArrowRight, MessageSquare, FileText, Calendar, BookOpen, Crown, Zap, Bell, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { getSubscriptionUsage } from '@/lib/subscription';
import NotificationCenter from '@/components/NotificationCenter';
import ActivityFeed from '@/components/ActivityFeed';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
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

  // Get subscription usage
  const subscriptionUsage = user ? getSubscriptionUsage(user.id) : null;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Welcome back, {user.name}!</h1>
              <p className="text-lg sm:text-xl text-muted-foreground">
                Manage your startups and track your innovation journey
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="flex items-center gap-2 relative flex-1 sm:flex-initial"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
                {user && storage.getNotifications(user.id).filter((n: any) => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {storage.getNotifications(user.id).filter((n: any) => !n.read).length}
                  </span>
                )}
              </Button>
              <Link href="/subscription" className="flex-1 sm:flex-initial">
                <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                  <Crown className="h-4 w-4" />
                  <span className="hidden sm:inline">Subscription</span>
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Notification Center */}
          {showNotifications && user && (
            <div className="mb-6">
              <NotificationCenter userId={user.id} onClose={() => setShowNotifications(false)} />
            </div>
          )}

          {/* Subscription Status */}
          {subscriptionUsage && (
            <Card className="border-2 border-primary/20 mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-base sm:text-lg">{subscriptionUsage.plan} Plan</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Startups: </span>
                        <span className="font-semibold">
                          {subscriptionUsage.startups.used} / {subscriptionUsage.startups.limit}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mentorship Tokens: </span>
                        <span className="font-semibold">
                          {subscriptionUsage.mentorship.used} / {subscriptionUsage.mentorship.limit}
                        </span>
                      </div>
                    </div>
                  </div>
                  {subscriptionUsage.tier === 'free' && (
                    <Link href="/subscription" className="w-full sm:w-auto">
                      <Button size="sm" className="w-full sm:w-auto">Upgrade</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* User Stats */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Overview Statistics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Card className="hover-lift border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">My Startups</p>
                    <div className="text-3xl font-bold text-blue-600">{userStats.myStartups}</div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift border-2 border-green-200 bg-gradient-to-br from-green-50 to-white shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">My Funding</p>
                    <div className="text-3xl font-bold text-green-600">RM {userStats.myFunding.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">Applications</p>
                    <div className="text-3xl font-bold text-purple-600">{userStats.activeApplications}</div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">Mentorships</p>
                    <div className="text-3xl font-bold text-orange-600">{userStats.activeMentorships}</div>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - My Startups */}
          <div className="lg:col-span-2 space-y-8">

            {/* My Startups */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold">My Startups</h2>
              </div>
              <Card className="border-2 border-blue-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b-2 border-blue-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Innovation Projects
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base mt-1">Manage and track your startup projects</CardDescription>
                    </div>
                    <Link href="/startups/new" className="w-full sm:w-auto">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Startup
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
              <CardContent className="pt-6">
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
            </div>

            {/* Programme Applications */}
            {user.role === 'innovator' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold">Programme Applications</h2>
                </div>
                <Card className="border-2 border-purple-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b-2 border-purple-200 pb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-purple-600" />
                          My Programmes
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base mt-2">{programmeRegistrations.length} application{programmeRegistrations.length !== 1 ? 's' : ''}</CardDescription>
                      </div>
                      <Link href="/programmes" className="w-full sm:w-auto">
                        <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 w-full sm:w-auto">
                          Browse
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                <CardContent className="pt-6">
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
            </div>
            )}

            {/* Funding Applications */}
            {user.role === 'innovator' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold">Funding Applications</h2>
                </div>
                <Card className="border-2 border-green-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b-2 border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          Funding Opportunities
                        </CardTitle>
                        <CardDescription className="text-base mt-1">{fundingApplications.length} application{fundingApplications.length !== 1 ? 's' : ''}</CardDescription>
                      </div>
                      <Link href="/funding">
                        <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                          Browse
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                <CardContent className="pt-6">
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
            </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Mentorship Requests */}
            {user.role === 'innovator' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-bold">Mentorship</h2>
                </div>
                <Card className="border-2 border-orange-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-white border-b-2 border-orange-200 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Users className="h-5 w-5 text-orange-600" />
                          My Mentorships
                        </CardTitle>
                        <CardDescription className="text-base mt-2">{mentorshipRequests.length} request{mentorshipRequests.length !== 1 ? 's' : ''}</CardDescription>
                      </div>
                      <Link href="/mentors" className="flex-shrink-0">
                        <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
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
            </div>
            )}

            {/* Event Registrations */}
            {user.role === 'innovator' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-pink-600" />
                  </div>
                  <h2 className="text-2xl font-bold">Upcoming Events</h2>
                </div>
                <Card className="border-2 border-pink-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-pink-50 to-white border-b-2 border-pink-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-pink-600" />
                          My Events
                        </CardTitle>
                        <CardDescription className="text-base mt-1">{eventRegistrations.length} event{eventRegistrations.length !== 1 ? 's' : ''}</CardDescription>
                      </div>
                      <Link href="/events">
                        <Button size="sm" variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-50">
                          Browse
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                <CardContent className="pt-6">
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
                            <div className="flex items-start gap-3">
                              {event?.image && (
                                <img 
                                  src={event.image} 
                                  alt={event.title}
                                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
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
                                    className="text-xs flex-shrink-0 ml-2"
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
                            </div>
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
            </div>
            )}

            {/* Quick Actions */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold">Quick Actions</h2>
              </div>
              <Card className="border-2 border-indigo-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b-2 border-indigo-200">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Zap className="h-5 w-5 text-indigo-600" />
                    Quick Access
                  </CardTitle>
                  <CardDescription className="text-base mt-1">Get started quickly</CardDescription>
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
                  <Link href="/analytics">
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Analytics
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Zap className="h-5 w-5 text-indigo-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-base mt-1">Your latest actions</CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityFeed userId={user?.id} limit={5} />
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

