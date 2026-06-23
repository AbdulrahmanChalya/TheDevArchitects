// Header — site nav on every page.
// Logo → Home. Shows sign-in/sign-up or avatar + user info when authenticated.
import { Plane, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

function getInitials(displayName: string, email?: string | null) {
  const source = displayName.trim() || email?.split("@")[0] || "U";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export default function Header() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Account";
  const initials = getInitials(displayName, user?.email);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg px-2 py-1 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? undefined} alt={displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start min-w-0 max-w-[180px]">
                    <span className="text-sm font-medium text-foreground truncate w-full text-left">
                      {displayName}
                    </span>
                    {user.email && (
                      <span className="text-xs text-muted-foreground truncate w-full text-left">
                        {user.email}
                      </span>
                    )}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    {user.email && (
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    void handleLogout();
                  }}
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/signin")}
                data-testid="button-login"
              >
                <User className="h-3 w-3 sm:mr-2" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => setLocation("/signup")}
                data-testid="button-signup"
              >
                <span>Sign Up</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
