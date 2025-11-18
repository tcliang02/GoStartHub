'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { storage } from '@/lib/storage';
import { Startup } from '@/types';
import { Loader2, Send, AlertCircle } from 'lucide-react';
import { canRequestMentorship, getOnDemandPrice, purchaseOnDemand } from '@/lib/subscription';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import OnDemandPurchaseDialog from './OnDemandPurchaseDialog';

interface MentorshipRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorId: string;
  mentorName: string;
  mentorRequiresPayment?: boolean;
  mentorPrice?: number;
}

export default function MentorshipRequestDialog({
  open,
  onOpenChange,
  mentorId,
  mentorName,
  mentorRequiresPayment = false,
  mentorPrice = 0,
}: MentorshipRequestDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [prototypes, setPrototypes] = useState<Startup[]>([]);
  const [formData, setFormData] = useState({
    prototypeId: '',
    message: '',
    goals: '',
  });
  const [mentorshipCheck, setMentorshipCheck] = useState<{ allowed: boolean; reason?: string; tokensRemaining?: number; canPurchase?: boolean; purchasePrice?: number; requiresPayment?: boolean; paymentAmount?: number } | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const currentSession = storage.getSession();
    if (!currentSession) {
      onOpenChange(false);
      router.push('/login');
      return;
    }

    setSession(currentSession);

    // Check subscription limits with mentor payment info
    const check = canRequestMentorship(currentSession.id, mentorRequiresPayment, mentorPrice);
    setMentorshipCheck(check);

    // Load user's prototypes
    const allPrototypes = storage.getPrototypes();
    const userPrototypes = allPrototypes.filter(
      (p: Startup) => p.innovatorId === currentSession.id
    );
    setPrototypes(userPrototypes);
  }, [open, router, onOpenChange, mentorRequiresPayment, mentorPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      alert('Please provide a message explaining why you need mentorship.');
      return;
    }

    // Check subscription limits again before submitting
    const currentSession = storage.getSession();
    if (currentSession) {
      const check = canRequestMentorship(currentSession.id, mentorRequiresPayment, mentorPrice);
      if (!check.allowed && !check.requiresPayment) {
        if (check.canPurchase) {
          setShowPurchaseDialog(true);
          return;
        }
        alert(check.reason || 'You have reached your mentorship token limit. Please upgrade your subscription.');
        return;
      }
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
        startupId: formData.prototypeId || undefined,
        startupTitle: selectedPrototype?.title,
        message: formData.message,
        goals: formData.goals || undefined,
        status: 'pending' as const,
        requiresPayment: mentorRequiresPayment || false,
        paymentAmount: mentorRequiresPayment ? mentorPrice : undefined,
        paymentStatus: mentorRequiresPayment ? 'pending' as const : undefined,
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
          {mentorshipCheck && !mentorshipCheck.allowed && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Limit Reached</AlertTitle>
              <AlertDescription>
                {mentorshipCheck.reason}
                <Link href="/subscription" className="ml-2 underline font-semibold">
                  Upgrade Now
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {mentorshipCheck && mentorshipCheck.requiresPayment && mentorshipCheck.paymentAmount && (
            <Alert variant="default" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Premium Mentorship</AlertTitle>
              <AlertDescription>
                This mentor requires payment of <strong>RM {mentorshipCheck.paymentAmount}</strong> per session.
                Payment will be processed when the mentor approves your request.
              </AlertDescription>
            </Alert>
          )}

          {mentorshipCheck && mentorshipCheck.allowed && !mentorshipCheck.requiresPayment && mentorshipCheck.tokensRemaining !== undefined && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have {mentorshipCheck.tokensRemaining} mentorship token(s) remaining.
              </AlertDescription>
            </Alert>
          )}

          {mentorshipCheck && !mentorshipCheck.allowed && mentorshipCheck.canPurchase && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {mentorshipCheck.reason}
                <Button
                  variant="link"
                  className="ml-2 p-0 h-auto"
                  onClick={() => setShowPurchaseDialog(true)}
                >
                  Purchase Token Now
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {prototypes.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="prototype">Related Startup (Optional)</Label>
              <Select
                value={formData.prototypeId || 'none'}
                onValueChange={(value) => setFormData({ ...formData, prototypeId: value === 'none' ? '' : value })}
              >
                <SelectTrigger id="prototype">
                  <SelectValue placeholder="Select a startup (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
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
            <Button type="submit" disabled={loading || (mentorshipCheck && !mentorshipCheck.allowed && !mentorshipCheck.requiresPayment)}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {mentorshipCheck?.requiresPayment ? `Send Request (RM ${mentorshipCheck.paymentAmount})` : 'Send Request'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        {session && mentorshipCheck?.canPurchase && mentorshipCheck.purchasePrice && (
          <OnDemandPurchaseDialog
            open={showPurchaseDialog}
            onOpenChange={setShowPurchaseDialog}
            type="mentorship_token"
            price={mentorshipCheck.purchasePrice}
            userId={session.id}
            onSuccess={() => {
              // Refresh the check
              const newCheck = canRequestMentorship(session.id, mentorRequiresPayment, mentorPrice);
              setMentorshipCheck(newCheck);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

