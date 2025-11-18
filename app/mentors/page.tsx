'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { Mentor } from '@/types';
import { User, Briefcase, Mail, CheckCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import MentorshipRequestDialog from '@/components/MentorshipRequestDialog';

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<{ id: string; name: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const allMentors = storage.getMentors();
    setMentors(allMentors);
  }, []);

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch = 
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">Mentorship Network</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find a Mentor</h1>
          <p className="text-xl text-muted-foreground">
            Connect with experienced mentors who can guide your innovation journey
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search mentors by name or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Mentors Grid */}
        {filteredMentors.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No mentors found. Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="hover-lift border-2 hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="flex items-start mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mr-4 shadow-lg">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{mentor.name}</CardTitle>
                      {mentor.company && (
                        <div className="flex items-center text-muted-foreground text-sm mb-2">
                          <Briefcase className="h-3 w-3 mr-1" />
                          <span>{mentor.company}</span>
                        </div>
                      )}
                      <Badge
                        variant={mentor.availability === 'available' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {mentor.availability}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-3">{mentor.bio}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="text-sm font-semibold mb-2">Expertise:</div>
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise.map((exp, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <span>{mentor.experience} years experience</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedMentor({ id: mentor.id, name: mentor.name });
                      setDialogOpen(true);
                    }}
                  >
                    Request Mentorship
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/mentors/register">
            <Button variant="outline" size="lg">
              Become a Mentor
            </Button>
          </Link>
        </div>
      </div>

      {selectedMentor && (
        <MentorshipRequestDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          mentorId={selectedMentor.id}
          mentorName={selectedMentor.name}
        />
      )}
    </div>
  );
}

