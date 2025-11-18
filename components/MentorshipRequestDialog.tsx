'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { storage } from '@/lib/storage';
import { Prototype } from '@/types';
import { Loader2, Send } from 'lucide-react';

interface MentorshipRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorId: string;
  mentorName: string;
}

export default function MentorshipRequestDialog({
  open,
  onOpenChange,
  mentorId,
  mentorName,
}: MentorshipRequestDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [formData, setFormData] = useState({
    prototypeId: '',
    message: '',
    goals: '',
  });

  useEffect(() => {
    const session = storage.getSession();
    if (!session) {
      onOpenChange(false);
      router.push('/login');
      return;
    }

    // Load user's prototypes
    const allPrototypes = storage.getPrototypes();
    const userPrototypes = allPrototypes.filter(
      (p: Prototype) => p.innovatorId === session.id
    );
    setPrototypes(userPrototypes);
  }, [open, router, onOpenChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      alert('Please provide a message explaining why you need mentorship.');
      return;
    }

    setLoading(true);

    try {
      const session = storage.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const selectedPrototype = prototypes.find((p) => p.id === formData.prototypeId);

      const request = {
        id: Date.now().toString(),
        mentorId,
        mentorName,
        innovatorId: session.id,
        innovatorName: session.name,
        innovatorEmail: session.email,
        prototypeId: formData.prototypeId || undefined,
        prototypeTitle: selectedPrototype?.title,
        message: formData.message,
        goals: formData.goals || undefined,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to local storage
      const existingRequests = storage.getMentorshipRequests();
      storage.saveMentorshipRequests([...existingRequests, request]);

      // Also save via API (for consistency)
      await fetch('/api/mentorship-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      // Reset form
      setFormData({ prototypeId: '', message: '', goals: '' });
      onOpenChange(false);
      
      alert('Mentorship request sent successfully! The mentor will review your request.');
    } catch (error) {
      console.error('Error submitting mentorship request:', error);
      alert('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Mentorship from {mentorName}</DialogTitle>
          <DialogDescription>
            Tell the mentor about yourself and what you'd like help with. Be specific about your goals.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {prototypes.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="prototype">Related Prototype (Optional)</Label>
              <Select
                value={formData.prototypeId}
                onValueChange={(value) => setFormData({ ...formData, prototypeId: value })}
              >
                <SelectTrigger id="prototype">
                  <SelectValue placeholder="Select a prototype (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {prototypes.map((prototype) => (
                    <SelectItem key={prototype.id} value={prototype.id}>
                      {prototype.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Tell the mentor about yourself, your project, and why you need their guidance..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Be specific about what you need help with. This helps mentors understand how they can assist you.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Expected Outcomes (Optional)</Label>
            <Textarea
              id="goals"
              placeholder="What do you hope to achieve with this mentorship? (e.g., improve prototype, learn new skills, get funding advice)"
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

