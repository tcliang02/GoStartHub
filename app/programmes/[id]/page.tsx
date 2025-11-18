'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { Programme, Prototype } from '@/types';
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Clock, CheckCircle, AlertCircle, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ProgrammeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  useEffect(() => {
    const programmes = storage.getProgrammes();
    const found = programmes.find((p: Programme) => p.id === params.id);
    setProgramme(found || null);

    // Check if user is registered
    const session = storage.getSession();
    if (session) {
      const registrations = storage.getProgrammeRegistrations();
      const userRegistration = registrations.find(
        (reg: any) => reg.programmeId === params.id && reg.innovatorId === session.id
      );
      setIsRegistered(!!userRegistration);
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!programme) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">Programme not found</p>
              <Link href="/programmes">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Programmes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const canApply = programme.status === 'open' && !isRegistered;
  const applicationDeadline = new Date(programme.applicationDeadline);
  const isDeadlinePassed = applicationDeadline < new Date();

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/programmes">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Programmes
          </Button>
        </Link>

        <Card className="mb-6 border-2 overflow-hidden">
          {/* Programme Image - Full Poster View */}
          {programme.image && (
            <div className="relative w-full bg-background">
              <div className="relative w-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px] flex items-center justify-center bg-muted/30">
                <img 
                  src={programme.image} 
                  alt={programme.title}
                  className="w-full h-auto max-h-[600px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setIsImageFullscreen(true)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={() => setIsImageFullscreen(true)}
                >
                  <Maximize2 className="h-4 w-4 mr-2" />
                  View Full Size
                </Button>
              </div>
            </div>
          )}
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{programme.type}</Badge>
                  <Badge variant={programme.status === 'open' ? 'default' : 'secondary'}>
                    {programme.status}
                  </Badge>
                </div>
                <CardTitle className="text-4xl mb-4">{programme.title}</CardTitle>
                <CardDescription className="text-lg">{programme.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-semibold">
                      {formatDate(programme.startDate)} - {formatDate(programme.endDate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-semibold">{programme.location}</div>
                    <Badge variant="outline" className="mt-1">{programme.format}</Badge>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Participants</div>
                    <div className="font-semibold">
                      {programme.currentParticipants}
                      {programme.maxParticipants ? ` / ${programme.maxParticipants}` : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Application Deadline</div>
                    <div className="font-semibold">{formatDate(programme.applicationDeadline)}</div>
                  </div>
                </div>
                {programme.grantAmount && (
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Grant Amount</div>
                      <div className="font-semibold text-lg text-primary">
                        Up to RM {programme.grantAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isDeadlinePassed && programme.status === 'open' && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Application Deadline Passed</AlertTitle>
                <AlertDescription>
                  The application deadline for this programme has passed.
                </AlertDescription>
              </Alert>
            )}

            {isRegistered && (
              <Alert className="mb-6 border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">You are registered!</AlertTitle>
                <AlertDescription className="text-green-700">
                  You have successfully registered for this programme. Check your dashboard for updates.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Eligibility</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {programme.eligibility.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Benefits</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {programme.benefits.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Requirements</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {programme.requirements.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {programme.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardContent className="pt-0">
            {canApply && !isDeadlinePassed ? (
              <Link href={`/programmes/${programme.id}/apply`}>
                <Button size="lg" className="w-full">
                  Apply Now
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </Link>
            ) : isRegistered ? (
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="w-full">
                  View in Dashboard
                </Button>
              </Link>
            ) : (
              <Button size="lg" className="w-full" disabled>
                Applications Closed
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Fullscreen Image Modal */}
        {isImageFullscreen && programme.image && (
          <div 
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setIsImageFullscreen(false)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
              onClick={() => setIsImageFullscreen(false)}
            >
              <X className="h-8 w-8" />
            </button>
            <img 
              src={programme.image} 
              alt={programme.title}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
}

