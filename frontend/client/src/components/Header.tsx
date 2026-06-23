// Header — site nav on every page.
// Logo → Home. Shows sign-in/sign-up or user menu when authenticated.
import { Plane, User, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const [, setLocation] = useLocation();
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Account";

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      setLocation("/");
    } catch {
      toast({
        title: "Sign out failed",
        description: "Unable to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-12 items-center justify-between px-4 md:px-6">
        <Link href="/">
          <div
            className="flex items-center gap-2 hover-elevate px-2 py-1 rounded-lg cursor-pointer"
            data-testid="link-home"
          >
            <Plane className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">GetawayHub</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            data-testid="button-menu"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {!loading && user ? (
            <>
              <span className="hidden md:inline text-sm text-muted-foreground max-w-[160px] truncate">
                {displayName}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-3 w-3 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex"
                onClick={() => setLocation("/signin")}
                data-testid="button-login"
              >
                <User className="h-3 w-3 mr-2" />
                Sign In
              </Button>

              <Button
                variant="default"
                size="sm"
                className="hidden md:flex"
                onClick={() => setLocation("/signup")}
                data-testid="button-signup"
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
