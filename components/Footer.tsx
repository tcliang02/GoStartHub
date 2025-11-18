import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-background mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Dreamify
              </h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Empowering young innovators to showcase their startups and connect with mentors and funding opportunities.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Innovators</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/startups" className="hover:text-primary transition-colors">
                  Showcase Startups
                </Link>
              </li>
              <li>
                <Link href="/mentors" className="hover:text-primary transition-colors">
                  Find Mentors
                </Link>
              </li>
              <li>
                <Link href="/funding" className="hover:text-primary transition-colors">
                  Funding Opportunities
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Businesses</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/businesses" className="hover:text-primary transition-colors">
                  Connect with Innovators
                </Link>
              </li>
              <li>
                <Link href="/funding" className="hover:text-primary transition-colors">
                  Offer Funding
                </Link>
              </li>
              <li>
                <Link href="/mentors" className="hover:text-primary transition-colors">
                  Become a Mentor
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Dreamify. All rights reserved.</p>
          <p className="mt-2">An initiative to support young innovators in Malaysia</p>
        </div>
      </div>
    </footer>
  );
}

