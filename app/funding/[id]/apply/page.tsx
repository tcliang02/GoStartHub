'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { FundingOpportunity, Startup, Application } from '@/types';
import { ArrowLeft, DollarSign, Calendar, CheckCircle, Loader2, Send, AlertCircle, Building2, User, FileText, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FundingApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [opportunity, setOpportunity] = useState<FundingOpportunity | null>(null);
  const [prototypes, setPrototypes] = useState<Startup[]>([]);
  const [formData, setFormData] = useState({
    prototypeId: '',
    message: '',
    // Personal Information
    fullName: '',
    icNumber: '',
    phoneNumber: '',
    country: 'Malaysia',
    // Company Information
    companyName: '',
    companyWebsite: '',
    companyDescription: '',
    companyIncorporatedDate: '',
    officeAddress: '',
    hasOfficeInMalaysia: '' as 'yes' | 'no' | 'used-to-have' | 'thinking-about-it' | '',
    // Company Stage
    companyStage: '' as 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'late-stage' | 'post-valuation' | '',
    postValuation: '',
    annualRevenue: '',
    // Focus Areas
    focusArea: [] as string[],
    technologyArea: [] as string[],
    proposedActivities: [] as string[],
    industryFocus: [] as string[],
    hasRegisteredCompany: false,
    // Files (for future implementation)
    businessProposalFile: '',
    companyRegistrationFile: '',
    companyProfileFile: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const session = storage.getSession();
    if (!session) {
      router.push('/login?redirect=/funding/' + params.id + '/apply');
      return;
    }

    // Load funding opportunity
    const opportunities = storage.getFundingOpportunities();
    const found = opportunities.find((opp: FundingOpportunity) => opp.id === params.id);
    
    if (!found) {
      setError('Funding opportunity not found');
      return;
    }

    if (found.status !== 'open') {
      setError('This funding opportunity is no longer accepting applications');
      return;
    }

    setOpportunity(found);

    // Load user's prototypes - use same logic as dashboard
    const allPrototypes = storage.getPrototypes();
    
    // Use the exact same filter as dashboard (which works)
    const userPrototypes = allPrototypes.filter((p: any) => p.innovatorId === session.id);
    
    // Debug logging for troubleshooting
    if (userPrototypes.length === 0 && allPrototypes.length > 0) {
      console.log('=== Funding Application Debug ===');
      console.log('Session ID:', session.id);
      console.log('Session Name:', session.name);
      console.log('All prototypes:', allPrototypes.map(p => ({
        id: p.id,
        title: p.title,
        innovatorId: p.innovatorId,
        innovatorName: p.innovatorName,
        matches: p.innovatorId === session.id
      })));
    }
    
    if (userPrototypes.length === 0) {
      if (allPrototypes.length > 0) {
        // Show all prototypes as fallback with info message (not error)
        setPrototypes(allPrototypes);
        // Don't show info message if prototypes are available - user can proceed normally
        // setInfo is commented out to avoid showing unnecessary message
        // Allow user to proceed - they can select their prototype
      } else {
        setError(
          `You need to create a prototype before applying for funding. ` +
          `Please go to the Prototypes page to create one.`
        );
        return;
      }
    } else {
      // Found matching prototypes - use them
      setPrototypes(userPrototypes);
      
      // Pre-select first prototype if only one
      if (userPrototypes.length === 1) {
        setFormData(prev => ({ ...prev, prototypeId: userPrototypes[0].id, message: '' }));
      }
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

      if (!formData.message.trim()) {
        setError('Please provide a message explaining why you need this funding');
        setLoading(false);
        return;
      }

      const selectedPrototype = prototypes.find((p) => p.id === formData.prototypeId);
      if (!selectedPrototype) {
        setError('Selected prototype not found');
        setLoading(false);
        return;
      }

      // Check if already applied
      const existingApplications = storage.getApplications();
      const alreadyApplied = existingApplications.some(
        (app: Application) => 
          app.opportunityId === params.id && 
          app.innovatorId === session.id &&
          app.status === 'pending'
      );

      if (alreadyApplied) {
        setError('You have already submitted an application for this funding opportunity');
        setLoading(false);
        return;
      }

      const newApplication: Application = {
        id: Date.now().toString(),
        startupId: formData.prototypeId,
        opportunityId: params.id as string,
        innovatorId: session.id,
        innovatorName: session.name,
        innovatorEmail: session.email,
        status: 'pending',
        message: formData.message,
        // Enhanced fields
        fullName: formData.fullName || undefined,
        icNumber: formData.icNumber || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        country: formData.country || undefined,
        companyName: formData.companyName || undefined,
        companyWebsite: formData.companyWebsite || undefined,
        companyDescription: formData.companyDescription || undefined,
        companyIncorporatedDate: formData.companyIncorporatedDate || undefined,
        officeAddress: formData.officeAddress || undefined,
        hasOfficeInMalaysia: formData.hasOfficeInMalaysia || undefined,
        companyStage: formData.companyStage || undefined,
        postValuation: formData.postValuation || undefined,
        annualRevenue: formData.annualRevenue || undefined,
        focusArea: formData.focusArea.length > 0 ? formData.focusArea : undefined,
        technologyArea: formData.technologyArea.length > 0 ? formData.technologyArea : undefined,
        proposedActivities: formData.proposedActivities.length > 0 ? formData.proposedActivities : undefined,
        industryFocus: formData.industryFocus.length > 0 ? formData.industryFocus : undefined,
        hasRegisteredCompany: formData.hasRegisteredCompany,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to local storage
      storage.saveApplications([...existingApplications, newApplication]);

      // Update opportunity applications list
      if (opportunity) {
        const opportunities = storage.getFundingOpportunities();
        const oppIndex = opportunities.findIndex((opp: FundingOpportunity) => opp.id === params.id);
        if (oppIndex !== -1) {
          opportunities[oppIndex].applications.push(newApplication.id);
          storage.saveFundingOpportunities(opportunities);
        }
      }

      // Call API
      await fetch('/api/funding-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApplication),
      });

      setSuccess(true);
      
      // Redirect after 2 seconds
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

  if (error && !opportunity) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link href="/funding">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Funding
            </Button>
          </Link>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Need Help?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    If you have prototypes but they're not showing up, try:
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
                    <li>Make sure you're logged in with the correct account</li>
                    <li>Check that your prototypes are visible on the Prototypes page</li>
                    <li>Ensure your prototypes are not marked as "completed"</li>
                  </ul>
                </div>
                <div className="flex gap-4">
                  <Link href="/prototypes">
                    <Button variant="outline">Go to Prototypes</Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline">Go to Dashboard</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!opportunity) {
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
                Your funding application has been submitted and is under review.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                You will be notified once the funding provider reviews your application.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
                <Link href="/funding">
                  <Button variant="outline">View More Opportunities</Button>
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
        <Link href="/funding">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Funding
          </Button>
        </Link>

        {/* Funding Opportunity Info */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{opportunity.title}</CardTitle>
                <CardDescription className="text-base">{opportunity.description}</CardDescription>
              </div>
              <Badge variant={opportunity.status === 'open' ? 'default' : 'secondary'}>
                {opportunity.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Funding Amount</div>
                  <div className="font-semibold text-lg">RM {opportunity.amount.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Deadline</div>
                  <div className="font-semibold">{formatDate(opportunity.deadline)}</div>
                  <div className="text-xs text-muted-foreground">
                    {daysRemaining(opportunity.deadline)} days remaining
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Provider</div>
                <div className="font-semibold">{opportunity.providerName}</div>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">Requirements:</div>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                {opportunity.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Apply for Funding</CardTitle>
            <CardDescription>
              Fill out the form below to apply for this funding opportunity
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
            {info && (
              <Alert className="mb-6 border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                <Info className="h-4 w-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>{info}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="prototype" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 overflow-x-auto">
                  <TabsTrigger value="prototype">Prototype</TabsTrigger>
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="company">Company Info</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                {/* Prototype Selection Tab */}
                <TabsContent value="prototype" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Prototype Information
                    </h3>
                  </div>

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
                        <SelectValue placeholder="Choose a prototype to apply with" />
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
                              <p className="text-sm text-muted-foreground mb-3">
                                {selected.description}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Stage: </span>
                                  <span className="font-medium capitalize">{selected.stage}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Funding Needed: </span>
                                  <span className="font-medium">RM {selected.fundingNeeded.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Application Message / Business Proposal <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Explain why your prototype deserves this funding. Include details about your innovation, market potential, business model, and how the funding will help you achieve your goals..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={10}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Be comprehensive. Include market analysis, competitive advantage, revenue model, and expected impact.
                    </p>
                  </div>
                </TabsContent>

                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Personal Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        Full Name as in IC/Passport <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="icNumber">
                        IC Number / Passport No. <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="icNumber"
                        value={formData.icNumber}
                        onChange={(e) => setFormData({ ...formData, icNumber: e.target.value })}
                        placeholder="e.g., 123456-78-9012"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="e.g., +60 12-345 6789"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">
                        Country <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => setFormData({ ...formData, country: value })}
                        required
                      >
                        <SelectTrigger id="country">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Malaysia">Malaysia</SelectItem>
                          <SelectItem value="Singapore">Singapore</SelectItem>
                          <SelectItem value="Indonesia">Indonesia</SelectItem>
                          <SelectItem value="Thailand">Thailand</SelectItem>
                          <SelectItem value="Philippines">Philippines</SelectItem>
                          <SelectItem value="Vietnam">Vietnam</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* Company Information Tab */}
                <TabsContent value="company" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Building2 className="mr-2 h-5 w-5" />
                      Company Information
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasCompany"
                        checked={formData.hasRegisteredCompany}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, hasRegisteredCompany: checked === true })
                        }
                      />
                      <Label htmlFor="hasCompany" className="font-normal cursor-pointer">
                        Do you have a registered company?
                      </Label>
                    </div>

                    {formData.hasRegisteredCompany && (
                      <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                              id="companyName"
                              value={formData.companyName}
                              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                              placeholder="Enter company name"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="companyWebsite">Company Website</Label>
                            <Input
                              id="companyWebsite"
                              type="url"
                              value={formData.companyWebsite}
                              onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                              placeholder="https://example.com"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="companyIncorporatedDate">Company Incorporated Date</Label>
                            <Input
                              id="companyIncorporatedDate"
                              type="date"
                              value={formData.companyIncorporatedDate}
                              onChange={(e) => setFormData({ ...formData, companyIncorporatedDate: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="companyStage">Company Stage</Label>
                            <Select
                              value={formData.companyStage}
                              onValueChange={(value: any) => setFormData({ ...formData, companyStage: value })}
                            >
                              <SelectTrigger id="companyStage">
                                <SelectValue placeholder="Select stage" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                                <SelectItem value="seed">Seed</SelectItem>
                                <SelectItem value="series-a">Series A</SelectItem>
                                <SelectItem value="series-b">Series B</SelectItem>
                                <SelectItem value="series-c">Series C</SelectItem>
                                <SelectItem value="late-stage">Late Stage</SelectItem>
                                <SelectItem value="post-valuation">Post Valuation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="companyDescription">Company Short Description</Label>
                          <Textarea
                            id="companyDescription"
                            value={formData.companyDescription}
                            onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                            placeholder="Brief description of your company..."
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="officeAddress">Office Address</Label>
                          <Textarea
                            id="officeAddress"
                            value={formData.officeAddress}
                            onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                            placeholder="Enter office address"
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="hasOfficeInMalaysia">Does your company have an office in Malaysia?</Label>
                          <Select
                            value={formData.hasOfficeInMalaysia}
                            onValueChange={(value: any) => setFormData({ ...formData, hasOfficeInMalaysia: value })}
                          >
                            <SelectTrigger id="hasOfficeInMalaysia">
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                              <SelectItem value="used-to-have">Used to Have</SelectItem>
                              <SelectItem value="thinking-about-it">Thinking About It</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Business Details Tab */}
                <TabsContent value="details" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Business & Technology Focus</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label>Focus Area (Select all that apply)</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {[
                          'Digital Trade',
                          'Digital Cities',
                          'Digital Content',
                          'Digital Agriculture',
                          'Digital Health',
                          'Digital Tourism',
                          'Digital Services',
                          'Digital Finance',
                          'Islamic Digital Economy',
                          'Other',
                        ].map((area) => (
                          <div key={area} className="flex items-center space-x-2">
                            <Checkbox
                              id={`focus-${area}`}
                              checked={formData.focusArea.includes(area)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    focusArea: [...formData.focusArea, area],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    focusArea: formData.focusArea.filter((a) => a !== area),
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={`focus-${area}`} className="font-normal cursor-pointer text-sm">
                              {area}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Technology Area (Select all that apply)</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          'Artificial Intelligence & Big Data Analytics',
                          'Blockchain',
                          'Cloud & Data Centre',
                          'Cybersecurity',
                          'DroneTech',
                          'Internet of Things',
                          'Robotic, Automation & Extended Reality',
                          'Creative Media Technology',
                          'Integrated Circuit (IC) design',
                          'Advanced network connectivity',
                          'Other',
                        ].map((tech) => (
                          <div key={tech} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tech-${tech}`}
                              checked={formData.technologyArea.includes(tech)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    technologyArea: [...formData.technologyArea, tech],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    technologyArea: formData.technologyArea.filter((t) => t !== tech),
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={`tech-${tech}`} className="font-normal cursor-pointer text-sm">
                              {tech}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Proposed Activities in Malaysia (Select all that apply)</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['Market Expansion', 'Regional Support Hub', 'Research & Development', 'Other'].map(
                          (activity) => (
                            <div key={activity} className="flex items-center space-x-2">
                              <Checkbox
                                id={`activity-${activity}`}
                                checked={formData.proposedActivities.includes(activity)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFormData({
                                      ...formData,
                                      proposedActivities: [...formData.proposedActivities, activity],
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      proposedActivities: formData.proposedActivities.filter((a) => a !== activity),
                                    });
                                  }
                                }}
                              />
                              <Label htmlFor={`activity-${activity}`} className="font-normal cursor-pointer text-sm">
                                {activity}
                              </Label>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Industry Focus (Select all that apply)</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          'Energy & Green Technology',
                          'Manufacturing and Automation',
                          'Agriculture Technology',
                          'Islamic Finance',
                          'Healthcare',
                          'Education',
                          'E-commerce',
                          'Other High-Impact Industry',
                        ].map((industry) => (
                          <div key={industry} className="flex items-center space-x-2">
                            <Checkbox
                              id={`industry-${industry}`}
                              checked={formData.industryFocus.includes(industry)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    industryFocus: [...formData.industryFocus, industry],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    industryFocus: formData.industryFocus.filter((i) => i !== industry),
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={`industry-${industry}`} className="font-normal cursor-pointer text-sm">
                              {industry}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {formData.companyStage === 'post-valuation' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="postValuation">Post Valuation</Label>
                          <Select
                            value={formData.postValuation}
                            onValueChange={(value) => setFormData({ ...formData, postValuation: value })}
                          >
                            <SelectTrigger id="postValuation">
                              <SelectValue placeholder="Select valuation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="usd10m-50m">USD 10M to USD 50M</SelectItem>
                              <SelectItem value="usd50m-100m">USD 50M to USD 100M</SelectItem>
                              <SelectItem value="usd100m-500m">USD 100M to USD 500M</SelectItem>
                              <SelectItem value="usd500m-1b">USD 500M to USD 1B</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="annualRevenue">Annual Revenue</Label>
                          <Select
                            value={formData.annualRevenue}
                            onValueChange={(value) => setFormData({ ...formData, annualRevenue: value })}
                          >
                            <SelectTrigger id="annualRevenue">
                              <SelectValue placeholder="Select revenue" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lt-10m">{'< USD 10M'}</SelectItem>
                              <SelectItem value="10m-100m">USD 10M to USD 100M</SelectItem>
                              <SelectItem value="100m-300m">USD 100M to USD 300M</SelectItem>
                              <SelectItem value="300m-500m">USD 300M to USD 500M</SelectItem>
                              <SelectItem value="gt-500m">{'> USD 500M'}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-4 pt-4 border-t">
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

