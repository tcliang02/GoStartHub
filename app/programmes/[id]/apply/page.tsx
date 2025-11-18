'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { Programme, Prototype, ProgrammeRegistration } from '@/types';
import { ArrowLeft, Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ProgrammeApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [formData, setFormData] = useState({
    prototypeId: '',
    applicationMessage: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const session = storage.getSession();
    if (!session) {
      router.push('/login?redirect=/programmes/' + params.id + '/apply');
      return;
    }

    const programmes = storage.getProgrammes();
    const found = programmes.find((p: Programme) => p.id === params.id);
    
    if (!found) {
      setError('Programme not found');
      return;
    }

    if (found.status !== 'open') {
      setError('This programme is not currently accepting applications');
      return;
    }

    setProgramme(found);

    const allPrototypes = storage.getPrototypes();
    const userPrototypes = allPrototypes.filter(
      (p: Prototype) => p.innovatorId === session.id && p.status === 'active'
    );
    
    if (userPrototypes.length === 0) {
      setError('You need to create a prototype before applying for programmes');
      return;
    }

    setPrototypes(userPrototypes);
    
    if (userPrototypes.length === 1) {
      setFormData({ prototypeId: userPrototypes[0].id, applicationMessage: '' });
    }
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const session = storage.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      if (!formData.prototypeId) {
        setError('Please select a prototype');
        setLoading(false);
        return;
      }

      // Check if already registered
      const existingRegistrations = storage.getProgrammeRegistrations();
      const alreadyRegistered = existingRegistrations.some(
        (reg: ProgrammeRegistration) => 
          reg.programmeId === params.id && 
          reg.innovatorId === session.id
      );

      if (alreadyRegistered) {
        setError('You have already applied for this programme');
        setLoading(false);
        return;
      }

      const selectedPrototype = prototypes.find((p) => p.id === formData.prototypeId);
      if (!selectedPrototype) {
        setError('Selected prototype not found');
        setLoading(false);
        return;
      }

      const newRegistration: ProgrammeRegistration = {
        id: Date.now().toString(),
        programmeId: params.id as string,
        innovatorId: session.id,
        innovatorName: session.name,
        innovatorEmail: session.email,
        prototypeId: formData.prototypeId,
        prototypeTitle: selectedPrototype.title,
        applicationMessage: formData.applicationMessage || undefined,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      storage.saveProgrammeRegistrations([...existingRegistrations, newRegistration]);

      // Update programme participant count
      if (programme) {
        const programmes = storage.getProgrammes();
        const progIndex = programmes.findIndex((p: Programme) => p.id === params.id);
        if (progIndex !== -1) {
          programmes[progIndex].currentParticipants += 1;
          storage.saveProgrammes(programmes);
        }
      }

      await fetch('/api/programme-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRegistration),
      });

      setSuccess(true);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error && !programme) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link href="/programmes">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Programmes
            </Button>
          </Link>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!programme) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-2 border-green-500">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Application Submitted Successfully!</CardTitle>
              <CardDescription>
                Your programme application has been submitted and is under review.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                You will be notified once the organizer reviews your application.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
                <Link href="/programmes">
                  <Button variant="outline">View More Programmes</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href={`/programmes/${params.id}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Programme
          </Button>
        </Link>

        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle className="text-3xl mb-2">Apply for {programme.title}</CardTitle>
            <CardDescription className="text-base">
              Fill out the form below to apply for this programme
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prototype">
                  Select Prototype <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.prototypeId}
                  onValueChange={(value) => setFormData({ ...formData, prototypeId: value })}
                  required
                >
                  <SelectTrigger id="prototype">
                    <SelectValue placeholder="Choose a prototype" />
                  </SelectTrigger>
                  <SelectContent>
                    {prototypes.map((prototype) => (
                      <SelectItem key={prototype.id} value={prototype.id}>
                        <div className="flex flex-col">
                          <span className="font-semibold">{prototype.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {prototype.category} • {prototype.stage}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.prototypeId && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    {(() => {
                      const selected = prototypes.find((p) => p.id === formData.prototypeId);
                      if (!selected) return null;
                      return (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{selected.title}</h4>
                            <Badge variant="outline">{selected.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{selected.description}</p>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="message">Application Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us why you want to join this programme and what you hope to achieve..."
                  value={formData.applicationMessage}
                  onChange={(e) => setFormData({ ...formData, applicationMessage: e.target.value })}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

