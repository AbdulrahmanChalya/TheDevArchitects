// App — root of the React tree and URL router.
//
// Main booking flow (happy path):
//   /  →  /search  →  /package/:id  →  /signin?redirect=...  →  /payment  →  /booking-success
//
// Other routes:
//   /destination/:id  — destination info from Home card click
//   /signup           — mock registration
//   /dummy            — dev test for backend search API
//
// Providers:
//   QueryClientProvider — React Query cache (JSON fetches, trip packages)
//   TooltipProvider     — shadcn tooltips
//   Toaster             — toast messages (SignIn / SignUp)
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import SearchResults from "@/pages/SearchResults";
import DestinationDetails from "@/pages/DestinationDetails";
import TripPackageDetails from "@/pages/TripPackageDetails";
import PaymentPage from "@/pages/PaymentPage";
import BookingSuccess from "@/pages/BookingSuccess";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import NotFound from "@/pages/not-found";
import DummyPage from "./pages/DummyPage";

// Maps each path to one page. Last route with no path = 404.
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={SearchResults} />
      <Route path="/destination/:destination" component={DestinationDetails} />
      <Route path="/package/:id" component={TripPackageDetails} />
      <Route path="/payment" component={PaymentPage} />
      <Route path="/dummy" component={DummyPage} />
      <Route path="/booking-success" component={BookingSuccess} />
      <Route path="/signin" component={SignIn} />
      <Route path="/signup" component={SignUp} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Wraps the router with global providers.
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
