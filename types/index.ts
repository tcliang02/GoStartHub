export interface User {
  id: string;
  name: string;
  email: string;
  role: 'innovator' | 'mentor' | 'business' | 'investor';
  university?: string;
  field?: string;
  bio?: string;
  avatar?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  linkedin?: string;
  profile?: string;
}

export interface Startup {
  id: string;
  title: string;
  description: string;
  innovatorId: string;
  innovatorName: string;
  university?: string;
  companyName?: string;
  projectType?: 'uni' | 'individual' | 'company';
  category: string;
  stage: 'idea' | 'startup' | 'testing' | 'ready';
  growthStage?: 'pre-stage' | 'early-stage' | 'mid-stage' | 'late-stage';
  fundingNeeded: number;
  fundingReceived: number;
  images: string[];
  image?: string;
  videoUrl?: string;
  tags: string[];
  views?: number;
  likes?: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'funded' | 'completed';
  
  // Profile Section
  profile?: {
    generalInfo?: {
      description?: string;
    };
    contactInfo?: {
      location?: string;
      url?: string;
      email?: string;
      phone?: string;
    };
    keyPeople?: TeamMember[];
    programmes?: string[];
    foundedYear?: number;
    legalName?: string;
    commercialName?: string;
    growthStage?: 'Early' | 'Mid' | 'Late';
    primaryHQ?: string;
    primaryIndustry?: string;
    otherIndustries?: string[];
    primaryTechnology?: string;
    otherTechnology?: string[];
    companySize?: string;
  };
  
  // Team Section
  team?: {
    companySize?: string;
    totalFounders?: number;
    totalTopManagement?: number;
    otherEmployees?: number;
    founders?: TeamMember[];
    topManagement?: TeamMember[];
    otherEmployeesList?: TeamMember[];
  };
  
  // Financials Section
  financials?: {
    totalDeals?: number;
    totalInvestors?: number;
    lastDealDetails?: {
      amount: string;
      currency: string;
      date: string;
    };
    totalFundraised?: string;
    latestValuation?: string;
    latestFundingRound?: string;
  };
  
  // Pitch Details
  pitchPdf?: string;
  
  // News Section
  news?: Array<{
    id: string;
    title: string;
    date: string;
    time?: string;
    content: string;
    programmes?: string[];
  }>;
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  company?: string;
  expertise: string[];
  bio: string;
  experience: number;
  avatar?: string;
  availability: 'available' | 'busy' | 'unavailable';
}

export interface FundingOpportunity {
  id: string;
  title: string;
  description: string;
  providerId: string;
  providerName: string;
  amount: number;
  category: string;
  requirements: string[];
  deadline: string;
  status: 'open' | 'closed';
  applications: string[];
}

export interface Application {
  id: string;
  startupId: string;
  opportunityId: string;
  innovatorId: string;
  innovatorName: string;
  innovatorEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  
  // Enhanced application fields
  fullName?: string;
  icNumber?: string;
  phoneNumber?: string;
  country?: string;
  companyName?: string;
  companyWebsite?: string;
  companyDescription?: string;
  companyIncorporatedDate?: string;
  officeAddress?: string;
  hasOfficeInMalaysia?: 'yes' | 'no' | 'used-to-have' | 'thinking-about-it';
  companyStage?: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'late-stage' | 'post-valuation';
  postValuation?: string;
  annualRevenue?: string;
  focusArea?: string[];
  technologyArea?: string[];
  proposedActivities?: string[];
  industryFocus?: string[];
  hasRegisteredCompany?: boolean;
  businessProposalFile?: string;
  companyRegistrationFile?: string;
  companyProfileFile?: string;
  
  createdAt: string;
  updatedAt?: string;
}

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  mentorName: string;
  innovatorId: string;
  innovatorName: string;
  innovatorEmail: string;
  startupId?: string;
  startupTitle?: string;
  message: string;
  goals?: string;
  status: 'pending' | 'approved' | 'rejected';
  mentorResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Programme {
  id: string;
  title: string;
  description: string;
  type: 'accelerator' | 'pre-accelerator' | 'hackathon' | 'workshop' | 'bootcamp' | 'competition';
  category: string;
  organizer: string;
  organizerId: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  location: string;
  format: 'online' | 'offline' | 'hybrid';
  maxParticipants?: number;
  currentParticipants: number;
  eligibility: string[];
  benefits: string[];
  requirements: string[];
  fee: number;
  grantAmount?: number;
  status: 'upcoming' | 'open' | 'closed' | 'ongoing' | 'completed';
  image?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'networking' | 'workshop' | 'seminar' | 'conference' | 'hackathon' | 'competition' | 'exhibition';
  organizer: string;
  organizerId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  format: 'online' | 'offline' | 'hybrid';
  maxAttendees?: number;
  currentAttendees: number;
  registrationRequired: boolean;
  registrationDeadline?: string;
  fee: number;
  status: 'upcoming' | 'open' | 'closed' | 'ongoing' | 'completed';
  image?: string;
  agenda?: string[];
  speakers?: Array<{ name: string; title: string; bio?: string }>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProgrammeRegistration {
  id: string;
  programmeId: string;
  innovatorId: string;
  innovatorName: string;
  innovatorEmail: string;
  startupId?: string;
  startupTitle?: string;
  applicationMessage?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'waitlisted';
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  attendeeId: string;
  attendeeName: string;
  attendeeEmail: string;
  status: 'registered' | 'attended' | 'cancelled';
  createdAt: string;
}

