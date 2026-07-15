// Site footer. Newsletter submit is a stub (no API). Footer links are placeholders.
import { Plane, Mail } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  // Prevent reload; log email only (no newsletter API yet).
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter signup triggered");
  };

  return (
    <footer className="bg-muted/30 border-t mt-20">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Plane className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">GetawayHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your perfect trip planner. Discover amazing destinations and create unforgettable memories.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/help">
                  <span
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    data-testid="link-footer-help"
                  >
                    Help Center
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <span
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    data-testid="link-footer-privacy"
                  >
                    Privacy Policy
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <span
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    data-testid="link-footer-terms"
                  >
                    Terms of Service
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to get special offers and travel tips.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Your email"
                  className="pl-10"
                  data-testid="input-newsletter-email"
                />
              </div>
              {/* Submit email — logs only, no backend */}
              <Button type="submit" className="w-full" data-testid="button-newsletter-submit">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center">
          <p className="text-sm text-muted-foreground">© 2025 GetawayHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
