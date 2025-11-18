'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { Startup } from '@/types';
import { Eye, DollarSign, Tag, Calendar, Plus, Heart, GraduationCap, Building2, ArrowUpDown, ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StartupsPage() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [stageFilter, setStageFilter] = useState<string>('all');

  useEffect(() => {
    const allStartups = storage.getStartups();
    setStartups(allStartups);
  }, []);

  const categories = ['all', 'IoT & Hardware', 'AI & Machine Learning', 'Software', 'Sustainability', 'Healthcare', 'Retail & Marketplace', 'Food & Beverage'];
  const projectTypes = ['all', 'uni', 'individual', 'company'];
  const stages = ['all', 'pre-stage', 'early-stage', 'mid-stage', 'late-stage'];
  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'views-desc', label: 'Most Views' },
    { value: 'views-asc', label: 'Least Views' },
    { value: 'likes-desc', label: 'Most Likes' },
    { value: 'likes-asc', label: 'Least Likes' },
    { value: 'stage-asc', label: 'Stage: Early to Late' },
    { value: 'stage-desc', label: 'Stage: Late to Early' },
  ];

  const filteredAndSortedStartups = useMemo(() => {
    let filtered = [...startups];

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(s => s.category.toLowerCase().includes(categoryFilter.toLowerCase()));
    }

    // Project type filter
    if (projectTypeFilter !== 'all') {
      filtered = filtered.filter(s => {
        if (projectTypeFilter === 'uni') {
          return s.projectType === 'uni' || s.university !== undefined;
        }
        return s.projectType === projectTypeFilter;
      });
    }

    // Stage filter
    if (stageFilter !== 'all') {
      filtered = filtered.filter(s => {
        const stage = s.growthStage || (s.profile?.growthStage ? 
          s.profile.growthStage.toLowerCase().replace(' ', '-') + '-stage' : 
          'pre-stage');
        return stage === stageFilter;
      });
    }

    // Sorting
    if (sortBy !== 'default') {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'views-desc':
            return (b.views || 0) - (a.views || 0);
          case 'views-asc':
            return (a.views || 0) - (b.views || 0);
          case 'likes-desc':
            return (b.likes || 0) - (a.likes || 0);
          case 'likes-asc':
            return (a.likes || 0) - (b.likes || 0);
          case 'stage-asc': {
            const stageOrder = { 'pre-stage': 1, 'early-stage': 2, 'mid-stage': 3, 'late-stage': 4 };
            const aStage = a.growthStage || (a.profile?.growthStage ? 
              a.profile.growthStage.toLowerCase().replace(' ', '-') + '-stage' : 
              'pre-stage');
            const bStage = b.growthStage || (b.profile?.growthStage ? 
              b.profile.growthStage.toLowerCase().replace(' ', '-') + '-stage' : 
              'pre-stage');
            return (stageOrder[aStage as keyof typeof stageOrder] || 1) - (stageOrder[bStage as keyof typeof stageOrder] || 1);
          }
          case 'stage-desc': {
            const stageOrder = { 'pre-stage': 1, 'early-stage': 2, 'mid-stage': 3, 'late-stage': 4 };
            const aStage = a.growthStage || (a.profile?.growthStage ? 
              a.profile.growthStage.toLowerCase().replace(' ', '-') + '-stage' : 
              'pre-stage');
            const bStage = b.growthStage || (b.profile?.growthStage ? 
              b.profile.growthStage.toLowerCase().replace(' ', '-') + '-stage' : 
              'pre-stage');
            return (stageOrder[bStage as keyof typeof stageOrder] || 1) - (stageOrder[aStage as keyof typeof stageOrder] || 1);
          }
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [startups, categoryFilter, projectTypeFilter, stageFilter, sortBy]);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 sm:mb-8">
          <Badge variant="secondary" className="mb-3 sm:mb-4">Innovation Showcase</Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Discover Startups</h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Explore innovative startups from young innovators across Malaysia
          </p>
        </div>

        {/* Filters and Sorting */}
        <div className="mb-8 space-y-4">
        {/* Category Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
                  onClick={() => setCategoryFilter(category)}
                  variant={categoryFilter === category ? "default" : "outline"}
              size="sm"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
            </div>
          </div>

          {/* Project Type, Stage, and Sort Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Project Type</label>
              <div className="flex flex-wrap gap-2">
                {projectTypes.map((type) => (
                  <Button
                    key={type}
                    onClick={() => setProjectTypeFilter(type)}
                    variant={projectTypeFilter === type ? "default" : "outline"}
                    size="sm"
                  >
                    {type === 'uni' ? 'University' : type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Stage</label>
              <div className="flex flex-wrap gap-2">
                {stages.map((stage) => (
                  <Button
                    key={stage}
                    onClick={() => setStageFilter(stage)}
                    variant={stageFilter === stage ? "default" : "outline"}
                    size="sm"
                  >
                    {stage === 'all' ? 'All' : stage.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Startups Grid */}
        {filteredAndSortedStartups.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No startups found. Be the first to showcase your innovation!</p>
              <Link href="/startups/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your Startup
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedStartups.map((startup) => (
              <Card key={startup.id} className="hover-lift border-2 hover:border-primary/50 transition-all">
                <Link href={`/startups/${startup.id}`}>
                  {/* Startup Image */}
                  {(startup.image || (startup.images && startup.images.length > 0)) && (
                    <div className="relative w-full h-48 overflow-hidden rounded-t-lg bg-muted">
                      <img
                        src={startup.image || startup.images[0]}
                        alt={startup.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to a placeholder if image fails to load
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"%3E%3Crect fill="%23e5e7eb" width="400" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EStartup Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <CardTitle className="text-xl line-clamp-2 flex-1">{startup.title}</CardTitle>
                      {startup.projectType && (
                        <Badge 
                          variant="default" 
                          className={`shrink-0 text-sm font-bold px-3 py-1 ${
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
                    </div>
                    {/* University/Company and Innovator Info */}
                    <div className="mb-2 space-y-1">
                      {startup.university && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <GraduationCap className="h-4 w-4" />
                          <span className="font-medium">{startup.university}</span>
                        </div>
                      )}
                      {startup.companyName && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">{startup.companyName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <span>By {startup.innovatorName}</span>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-3">{startup.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline">{startup.category}</Badge>
                      <Badge variant="secondary" className="capitalize">{startup.stage}</Badge>
                      {startup.growthStage && (
                        <Badge variant="outline" className="capitalize">
                          {startup.growthStage.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
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

                    <div className="flex flex-wrap gap-2 mb-4">
                      {startup.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t">
                    <div className="w-full flex items-center justify-between gap-3">
                      {/* Views and Likes - Made more prominent */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                          <Eye className="h-5 w-5 text-blue-600" />
                          <span className="font-bold text-blue-700 text-base">{startup.views || 0}</span>
                          <span className="text-xs text-blue-600 font-medium">views</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-50 rounded-lg border border-pink-200">
                          <Heart className="h-5 w-5 text-pink-600 fill-pink-600" />
                          <span className="font-bold text-pink-700 text-base">{startup.likes || 0}</span>
                          <span className="text-xs text-pink-600 font-medium">likes</span>
                        </div>
                      </div>
                      {/* Trending Badge - Made more prominent */}
                      {((startup.views || 0) > 200 && (startup.likes || 0) > 20) || 
                       ((startup.views || 0) > 500) || 
                       ((startup.likes || 0) > 50) ? (
                        <Badge 
                          variant="default" 
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-4 py-2 text-sm shadow-lg border-2 border-orange-300"
                        >
                          <TrendingUp className="h-4 w-4 mr-1.5" />
                          TRENDING
                        </Badge>
                      ) : null}
                    </div>
                  </CardFooter>
                </Link>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/startups/new">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Showcase Your Startup
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

