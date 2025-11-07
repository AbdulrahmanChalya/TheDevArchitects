import { Plane, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export default function Header() {
  const [, setLocation] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/">
          <div className="flex items-center gap-2 hover-elevate px-3 py-2 rounded-lg cursor-pointer" data-testid="link-home">
            <Plane className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">GetawayHub</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-menu">
            <Menu className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="default" 
            className="hidden md:flex" 
            onClick={() => setLocation("/signin")}
            data-testid="button-login"
          >
            <User className="h-4 w-4 mr-2" />
            Sign In
          </Button>
          <Button 
            variant="default" 
            size="default" 
            className="hidden md:flex" 
            onClick={() => setLocation("/signup")}
            data-testid="button-signup"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
}
