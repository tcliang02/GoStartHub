'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { FundingOpportunity } from '@/types';
import { DollarSign, Calendar, Tag, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function FundingPage() {
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [filter, setFilter] = useState<string>('open');

  useEffect(() => {
    const allOpportunities = storage.getFundingOpportunities();
    setOpportunities(allOpportunities);
  }, []);

  const filteredOpportunities = filter === 'all'
    ? opportunities
    : opportunities.filter(opp => opp.status === filter);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const daysRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">Funding Hub</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Funding Opportunities</h1>
          <p className="text-xl text-muted-foreground">
            Discover funding opportunities for your innovative startups
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8 flex gap-2">
          <Button
            onClick={() => setFilter('open')}
            variant={filter === 'open' ? 'default' : 'outline'}
            size="sm"
          >
            Open
          </Button>
          <Button
            onClick={() => setFilter('closed')}
            variant={filter === 'closed' ? 'default' : 'outline'}
            size="sm"
          >
            Closed
          </Button>
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            All
          </Button>
        </div>

        {/* Opportunities List */}
        {filteredOpportunities.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No funding opportunities found at the moment.</p>
              <p className="text-muted-foreground">Check back soon for new opportunities!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover-lift border-2 hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{opportunity.title}</CardTitle>
                      <CardDescription className="text-base">{opportunity.description}</CardDescription>
                    </div>
                    <Badge variant={opportunity.status === 'open' ? 'default' : 'secondary'}>
                      {opportunity.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-primary" />
                      <span className="font-semibold">RM {opportunity.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{opportunity.category}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{daysRemaining(opportunity.deadline)} days remaining</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-semibold mb-2">Requirements:</div>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      {opportunity.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <span>Provider: {opportunity.providerName}</span>
                    <span className="ml-4">
                      {opportunity.applications.length} application(s)
                    </span>
                  </div>
                  {opportunity.status === 'open' && (
                    <Link href={`/funding/${opportunity.id}/apply`}>
                      <Button>
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/funding/new">
            <Button variant="outline" size="lg">
              Offer Funding Opportunity
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

