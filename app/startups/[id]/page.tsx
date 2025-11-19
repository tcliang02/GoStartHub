'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { Startup } from '@/types';
import { ArrowLeft, Mail, Send, DollarSign, Users, Building2, Calendar, MapPin, Phone, Globe, Linkedin, FileText, ExternalLink, Eye, Heart, TrendingUp, GraduationCap, Share2, Facebook, Twitter } from 'lucide-react';
import CommentsSection from '@/components/CommentsSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function StartupDetailPage() {
  const params = useParams();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [viewsIncremented, setViewsIncremented] = useState(false);

  useEffect(() => {
    const startups = storage.getStartups();
    const found = startups.find((s: Startup) => s.id === params.id);
    if (found) {
      // Increment views only once per page load
      if (!viewsIncremented) {
        const updatedViews = (found.views || 0) + 1;
        const updatedStartup = { ...found, views: updatedViews };
        const updatedStartups = startups.map((s: Startup) => 
          s.id === params.id ? updatedStartup : s
        );
        storage.saveStartups(updatedStartups);
        setStartup(updatedStartup);
        setViewsIncremented(true);
      } else {
        setStartup(found);
      }
    } else {
      setStartup(null);
    }
    
    // Check if already liked (from localStorage)
    const likedStartups = JSON.parse(localStorage.getItem('liked_startups') || '[]');
    setIsLiked(likedStartups.includes(params.id));
  }, [params.id, viewsIncremented]);

  const handleLike = () => {
    if (!startup) return;
    
    const startups = storage.getStartups();
    const likedStartups = JSON.parse(localStorage.getItem('liked_startups') || '[]');
    
    if (isLiked) {
      // Unlike
      const updatedLikes = Math.max((startup.likes || 0) - 1, 0);
      const updatedStartup = { ...startup, likes: updatedLikes };
      const updatedStartups = startups.map((s: Startup) => 
        s.id === params.id ? updatedStartup : s
      );
      storage.saveStartups(updatedStartups);
      setStartup(updatedStartup);
      setIsLiked(false);
      localStorage.setItem('liked_startups', JSON.stringify(likedStartups.filter((id: string) => id !== params.id)));
    } else {
      // Like
      const updatedLikes = (startup.likes || 0) + 1;
      const updatedStartup = { ...startup, likes: updatedLikes };
      const updatedStartups = startups.map((s: Startup) => 
        s.id === params.id ? updatedStartup : s
      );
      storage.saveStartups(updatedStartups);
      setStartup(updatedStartup);
      setIsLiked(true);
      localStorage.setItem('liked_startups', JSON.stringify([...likedStartups, params.id]));
    }
  };

  if (!startup) {
    return (
      <div className="min-h-screen  py-12">
        <div className="container mx-auto px-4">
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">Startup not found</p>
              <Link href="/startups">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Startups
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const fundingProgress = (startup.fundingReceived / startup.fundingNeeded) * 100;

  return (
    <div className="min-h-screen  py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/startups">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Startups
          </Button>
        </Link>

        {/* Header Section */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <CardTitle className="text-2xl sm:text-3xl md:text-4xl">{startup.title}</CardTitle>
                  {startup.projectType && (
                    <Badge 
                      variant="default" 
                      className={`text-base font-bold px-4 py-2 ${
                        startup.projectType === 'uni' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : startup.projectType === 'company'
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                    >
                      {startup.projectType === 'uni' ? 'University' : startup.projectType.charAt(0).toUpperCase() + startup.projectType.slice(1)}
                    </Badge>
                  )}
                  {((startup.views || 0) > 200 && (startup.likes || 0) > 20) || 
                   ((startup.views || 0) > 500) || 
                   ((startup.likes || 0) > 50) ? (
                    <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </Badge>
                  ) : null}
                </div>
                {startup.university && (
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <span className="font-medium">{startup.university}</span>
                  </div>
                )}
                {startup.companyName && (
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">{startup.companyName}</span>
                  </div>
                )}
                <CardDescription className="text-base sm:text-lg">{startup.description}</CardDescription>
              </div>
            </div>

            {/* Views, Likes, Like Button, and Social Sharing */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <span className="text-base sm:text-lg font-bold text-blue-700">{startup.views || 0}</span>
                  <span className="text-xs sm:text-sm text-blue-600 font-medium">views</span>
                </div>
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className={isLiked ? "bg-pink-500 hover:bg-pink-600" : "border-pink-200 hover:bg-pink-50"}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-white' : ''}`} />
                  <span className="font-semibold">{startup.likes || 0}</span>
                </Button>
              </div>
              
              {/* Social Sharing Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm text-muted-foreground font-medium mr-1 sm:mr-2 hidden sm:inline">Share:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = window.location.href;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                  }}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = window.location.href;
                    const text = `${startup.title} - ${startup.description.substring(0, 100)}...`;
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
                  }}
                  className="border-sky-300 text-sky-700 hover:bg-sky-50"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = window.location.href;
                    const title = startup.title;
                    const summary = startup.description.substring(0, 200);
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                  }}
                  className="border-blue-600 text-blue-700 hover:bg-blue-50"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    alert('Link copied to clipboard!');
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Category</div>
                <Badge variant="outline">{startup.category}</Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Stage</div>
                <Badge variant="secondary" className="capitalize">{startup.stage}</Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <Badge variant={startup.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                  {startup.status}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Innovator</div>
                <div className="font-semibold">{startup.innovatorName}</div>
              </div>
            </div>

            {/* Funding Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Funding Progress</span>
                <span className="text-sm text-muted-foreground">
                  RM {startup.fundingReceived.toLocaleString()} / RM {startup.fundingNeeded.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-4">
                <div
                  className="bg-primary h-4 rounded-full transition-all"
                  style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {startup.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-5 h-auto gap-1">
              <TabsTrigger value="profile" className="whitespace-nowrap flex-shrink-0 px-4 sm:px-3">Profile</TabsTrigger>
              <TabsTrigger value="team" className="whitespace-nowrap flex-shrink-0 px-4 sm:px-3">Team</TabsTrigger>
              <TabsTrigger value="financials" className="whitespace-nowrap flex-shrink-0 px-4 sm:px-3">Financials</TabsTrigger>
              <TabsTrigger value="pitch" className="whitespace-nowrap flex-shrink-0 px-4 sm:px-3">Pitch Details</TabsTrigger>
              <TabsTrigger value="news" className="whitespace-nowrap flex-shrink-0 px-4 sm:px-3">News</TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {startup.profile?.generalInfo?.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{startup.profile.generalInfo.description}</p>
                  </div>
                )}

                {startup.profile?.contactInfo && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {startup.profile.contactInfo.location && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <div className="text-sm text-muted-foreground">Location</div>
                            <div className="font-medium">{startup.profile.contactInfo.location}</div>
                          </div>
                        </div>
                      )}
                      {startup.profile.contactInfo.url && (
                        <div className="flex items-start gap-2">
                          <Globe className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <div className="text-sm text-muted-foreground">Website</div>
                            <a href={startup.profile.contactInfo.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline flex items-center gap-1">
                              {startup.profile.contactInfo.url}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      )}
                      {startup.profile.contactInfo.email && (
                        <div className="flex items-start gap-2">
                          <Mail className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <div className="text-sm text-muted-foreground">Email</div>
                            <div className="font-medium">{startup.profile.contactInfo.email}</div>
                          </div>
                        </div>
                      )}
                      {startup.profile.contactInfo.phone && (
                        <div className="flex items-start gap-2">
                          <Phone className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <div className="text-sm text-muted-foreground">Phone</div>
                            <div className="font-medium">{startup.profile.contactInfo.phone}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {startup.profile?.keyPeople && startup.profile.keyPeople.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Key People</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {startup.profile.keyPeople.map((person, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">{person.name}</div>
                            <div className="text-sm text-muted-foreground">{person.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {startup.profile?.programmes && startup.profile.programmes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Programmes</h3>
                      <div className="flex flex-wrap gap-2">
                        {startup.profile.programmes.map((programme, idx) => (
                          <Badge key={idx} variant="outline">{programme}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {startup.profile?.foundedYear && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Founded Year</h3>
                      <p className="text-muted-foreground">{startup.profile.foundedYear}</p>
                    </div>
                  )}
                  {startup.profile?.legalName && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Legal Name</h3>
                      <p className="text-muted-foreground">{startup.profile.legalName}</p>
                    </div>
                  )}
                  {startup.profile?.commercialName && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Commercial Name</h3>
                      <p className="text-muted-foreground">{startup.profile.commercialName}</p>
                    </div>
                  )}
                  {startup.profile?.growthStage && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Growth Stage</h3>
                      <Badge variant="secondary">{startup.profile.growthStage}</Badge>
                    </div>
                  )}
                  {startup.profile?.primaryHQ && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Primary HQ</h3>
                      <p className="text-muted-foreground">{startup.profile.primaryHQ}</p>
                    </div>
                  )}
                  {startup.profile?.primaryIndustry && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Primary Industry</h3>
                      <p className="text-muted-foreground">{startup.profile.primaryIndustry}</p>
                    </div>
                  )}
                  {startup.profile?.otherIndustries && startup.profile.otherIndustries.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Other Industries</h3>
                      <div className="flex flex-wrap gap-2">
                        {startup.profile.otherIndustries.map((industry, idx) => (
                          <Badge key={idx} variant="outline">{industry}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {startup.profile?.primaryTechnology && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Primary Technology</h3>
                      <p className="text-muted-foreground">{startup.profile.primaryTechnology}</p>
                    </div>
                  )}
                  {startup.profile?.otherTechnology && startup.profile.otherTechnology.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Other Technology</h3>
                      <div className="flex flex-wrap gap-2">
                        {startup.profile.otherTechnology.map((tech, idx) => (
                          <Badge key={idx} variant="outline">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {startup.profile?.companySize && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Company Size</h3>
                      <p className="text-muted-foreground">{startup.profile.companySize}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {startup.team?.companySize && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Company Size</h3>
                    <p className="text-muted-foreground">{startup.team.companySize}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {startup.team?.totalFounders !== undefined && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Total Number of Founders</div>
                      <div className="text-2xl font-bold">{startup.team.totalFounders}</div>
                    </div>
                  )}
                  {startup.team?.totalTopManagement !== undefined && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Total Number of Top Management</div>
                      <div className="text-2xl font-bold">{startup.team.totalTopManagement}</div>
                    </div>
                  )}
                  {startup.team?.otherEmployees !== undefined && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Other Employees</div>
                      <div className="text-2xl font-bold">{startup.team.otherEmployees}</div>
                    </div>
                  )}
                </div>

                {startup.team?.founders && startup.team.founders.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Founders</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {startup.team.founders.map((founder, idx) => (
                        <Card key={idx} className="border">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <div className="font-semibold">{founder.name}</div>
                                  <div className="text-sm text-muted-foreground">{founder.role}</div>
                                </div>
                              </div>
                              {founder.linkedin && (
                                <a href={founder.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                                  <Linkedin className="h-5 w-5" />
                                </a>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {startup.team?.topManagement && startup.team.topManagement.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Top Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {startup.team.topManagement.map((member, idx) => (
                        <Card key={idx} className="border">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <div className="font-semibold">{member.name}</div>
                                  <div className="text-sm text-muted-foreground">{member.role}</div>
                                </div>
                              </div>
                              {member.linkedin && (
                                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                                  <Linkedin className="h-5 w-5" />
                                </a>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {startup.team?.otherEmployeesList && startup.team.otherEmployeesList.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Other Employees</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {startup.team.otherEmployeesList.map((employee, idx) => (
                        <Card key={idx} className="border">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <div className="font-semibold">{employee.name}</div>
                                  <div className="text-sm text-muted-foreground">{employee.role}</div>
                                </div>
                              </div>
                              {employee.linkedin && (
                                <a href={employee.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                                  <Linkedin className="h-5 w-5" />
                                </a>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {startup.financials?.totalDeals !== undefined && (
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">TOTAL DEALS</div>
                      <div className="text-3xl font-bold">{startup.financials.totalDeals}</div>
                    </div>
                  )}
                  {startup.financials?.totalInvestors !== undefined && (
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">TOTAL INVESTORS</div>
                      <div className="text-3xl font-bold">{startup.financials.totalInvestors}</div>
                    </div>
                  )}
                  {startup.financials?.lastDealDetails && (
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">LAST DEAL DETAILS</div>
                      <div className="text-2xl font-bold">
                        {startup.financials.lastDealDetails.currency} {startup.financials.lastDealDetails.amount}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{startup.financials.lastDealDetails.date}</div>
                    </div>
                  )}
                  {startup.financials?.totalFundraised && (
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">TOTAL FUNDRAISED</div>
                      <div className="text-2xl font-bold">{startup.financials.totalFundraised}</div>
                    </div>
                  )}
                  {startup.financials?.latestValuation && (
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">LATEST VALUATION</div>
                      <div className="text-2xl font-bold">{startup.financials.latestValuation}</div>
                    </div>
                  )}
                  {startup.financials?.latestFundingRound && (
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">LATEST FUNDING ROUND</div>
                      <div className="text-2xl font-bold">{startup.financials.latestFundingRound}</div>
                    </div>
                  )}
                </div>

                {/* Financial Charts */}
                {startup.financials && (
                  <div className="space-y-4 mt-6">
                    {/* Deals vs Investors - Compact Comparison */}
                    {startup.financials.totalDeals !== undefined && startup.financials.totalInvestors !== undefined && (
                      <div className="p-4 border rounded-lg bg-muted/30">
                        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">DEALS & INVESTORS OVERVIEW</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Total Deals</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-secondary rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all" 
                                  style={{ 
                                    width: `${Math.min((startup.financials.totalDeals / (startup.financials.totalDeals + startup.financials.totalInvestors)) * 100, 100)}%` 
                                  }}
                                />
                              </div>
                              <span className="text-sm font-semibold w-12 text-right">{startup.financials.totalDeals}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Total Investors</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-secondary rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all" 
                                  style={{ 
                                    width: `${Math.min((startup.financials.totalInvestors / (startup.financials.totalDeals + startup.financials.totalInvestors)) * 100, 100)}%` 
                                  }}
                                />
                              </div>
                              <span className="text-sm font-semibold w-12 text-right">{startup.financials.totalInvestors}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Valuation vs Fundraised - Horizontal Bar Chart */}
                    {startup.financials.latestValuation && startup.financials.totalFundraised && (
                      <div className="p-4 border rounded-lg bg-muted/30">
                        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">FUNDING OVERVIEW</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart
                            layout="vertical"
                            data={[
                              { 
                                name: 'Fundraised', 
                                value: parseFloat(startup.financials.totalFundraised.replace(/[^\d.]/g, '')) || 0 
                              },
                              { 
                                name: 'Valuation', 
                                value: parseFloat(startup.financials.latestValuation.replace(/[^\d.]/g, '')) || 0 
                              },
                            ]}
                            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" 
                              tickFormatter={(value) => {
                                if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                                if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                                return `$${value}`;
                              }}
                            />
                            <YAxis type="category" dataKey="name" width={70} />
                            <Tooltip 
                              formatter={(value: number) => {
                                if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
                                if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
                                return `$${value.toFixed(2)}`;
                              }}
                              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                            />
                            <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    * All information provided on this website is based on aggregated data derived from our third-party providers and is general in nature, intended for general informational purposes only. If any inaccuracies are displayed, please reach out to us promptly at mystartup@cradle.com.my
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Please refer to our Terms of Use for more information.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pitch Details Tab */}
          <TabsContent value="pitch" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pitch Details</CardTitle>
              </CardHeader>
              <CardContent>
                {startup.pitchPdf ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-5 w-5" />
                      <span>Pitch PDF Available</span>
                    </div>
                    <div className="w-full border rounded-lg overflow-hidden bg-gray-50">
                      <iframe
                        src={`${startup.pitchPdf}#toolbar=1&navpanes=1&scrollbar=1`}
                        className="w-full h-[600px]"
                        title="Pitch PDF"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <a href={startup.pitchPdf} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
                        <ExternalLink className="h-4 w-4" />
                        Open PDF in new tab
                      </a>
                      <a href={startup.pitchPdf} download className="inline-flex items-center gap-2 text-primary hover:underline">
                        <FileText className="h-4 w-4" />
                        Download PDF
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No pitch PDF uploaded yet.</p>
                    <p className="text-sm text-muted-foreground">The startup can upload their pitch PDF here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>News & Updates</CardTitle>
              </CardHeader>
              <CardContent>
                {startup.news && startup.news.length > 0 ? (
                  <div className="space-y-6">
                    {startup.news.map((article) => (
                      <Card key={article.id} className="border">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {article.programmes && article.programmes.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">programmes</Badge>
                                    <span>{article.programmes.join(', ')}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{article.date} {article.time && `• ${article.time}`}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground leading-relaxed">{article.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No news articles available yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="hover-lift border-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Contact Startup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Interested in this startup? Connect with the team to learn more.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Contact Startup
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover-lift border-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Apply for Funding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This startup is seeking funding. Apply now to support this innovation.
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/funding/apply?startup=${startup.id}`} className="w-full">
                <Button className="w-full">
                  Apply for Funding
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Comments Section */}
        <div className="mt-6">
          <CommentsSection 
            startupId={startup.id} 
            userId={storage.getSession()?.id}
            userName={storage.getSession()?.name}
          />
        </div>
      </div>
    </div>
  );
}

