'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { Programme } from '@/types';
import { Calendar, MapPin, Users, DollarSign, Clock, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProgrammesPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const allProgrammes = storage.getProgrammes();
    // Debug: Log programmes to check image paths
    console.log('Programmes loaded:', allProgrammes.map(p => ({ id: p.id, title: p.title, image: p.image })));
    setProgrammes(allProgrammes);
  }, []);

  const filteredProgrammes = programmes.filter((programme) => {
    const matchesStatus = filter === 'all' || programme.status === filter;
    const matchesType = typeFilter === 'all' || programme.type === typeFilter;
    const matchesSearch =
      programme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      programme.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      programme.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesType && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'upcoming':
        return 'secondary';
      case 'closed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      accelerator: 'Accelerator',
      'pre-accelerator': 'Pre-Accelerator',
      hackathon: 'Hackathon',
      workshop: 'Workshop',
      bootcamp: 'Bootcamp',
      competition: 'Competition',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 sm:mb-8">
          <Badge variant="secondary" className="mb-3 sm:mb-4">Programmes</Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Innovation Programmes</h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Join structured programmes designed to help you grow from idea to startup
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search programmes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="accelerator">Accelerator</SelectItem>
                <SelectItem value="pre-accelerator">Pre-Accelerator</SelectItem>
                <SelectItem value="hackathon">Hackathon</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="bootcamp">Bootcamp</SelectItem>
                <SelectItem value="competition">Competition</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              All
            </Button>
            <Button
              onClick={() => setFilter('open')}
              variant={filter === 'open' ? 'default' : 'outline'}
              size="sm"
            >
              Open
            </Button>
            <Button
              onClick={() => setFilter('upcoming')}
              variant={filter === 'upcoming' ? 'default' : 'outline'}
              size="sm"
            >
              Upcoming
            </Button>
            <Button
              onClick={() => setFilter('closed')}
              variant={filter === 'closed' ? 'default' : 'outline'}
              size="sm"
            >
              Closed
            </Button>
          </div>
        </div>

        {/* Programmes Grid */}
        {filteredProgrammes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No programmes found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProgrammes.map((programme) => (
              <Card key={programme.id} className="hover-lift border-2 hover:border-primary/50 transition-all flex flex-col">
                {/* Programme Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary to-purple-600 overflow-hidden">
                  {programme.image ? (
                    <img 
                      src={programme.image} 
                      alt={programme.title}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        console.error('Image failed to load:', programme.image);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-purple-600">
                      <div className="text-center p-4">
                        <div className="text-4xl font-bold text-white/80 mb-2">
                          {programme.title.charAt(0)}
                        </div>
                        <div className="text-white/60 text-sm">{getTypeLabel(programme.type)}</div>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 z-10">
                    <Badge variant={getStatusColor(programme.status)}>
                      {programme.status}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline">{getTypeLabel(programme.type)}</Badge>
                  </div>
                  <CardTitle className="text-lg sm:text-xl line-clamp-2">{programme.title}</CardTitle>
                  <CardDescription className="text-sm sm:text-base line-clamp-3">{programme.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {formatDate(programme.startDate)} - {formatDate(programme.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{programme.location}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        {programme.currentParticipants}
                        {programme.maxParticipants ? ` / ${programme.maxParticipants}` : ''} participants
                      </span>
                    </div>
                    {programme.grantAmount && (
                      <div className="flex items-center text-primary font-semibold">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>Up to RM {programme.grantAmount.toLocaleString()} in grants</span>
                      </div>
                    )}
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Deadline: {formatDate(programme.applicationDeadline)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {programme.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/programmes/${programme.id}`} className="w-full">
                    <Button className="w-full">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

