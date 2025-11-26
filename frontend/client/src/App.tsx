import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import SearchResults from "@/pages/SearchResults";
import DestinationDetails from "@/pages/DestinationDetails";
import BookHotel from "@/pages/BookHotel";
import BookFlight from "@/pages/BookFlight";
import Payment from "@/pages/Payment";
import BookingSuccess from "@/pages/BookingSuccess";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import NotFound from "@/pages/not-found";
import PaymentPage from "./pages/PaymentPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={SearchResults} />
      <Route path="/destination/:destination" component={DestinationDetails} />
      <Route path="/book-hotel" component={BookHotel} />
      <Route path="/book-flight" component={BookFlight} />
      <Route path="/payment" component={PaymentPage} />
      <Route path="/booking-success" component={BookingSuccess} />
      <Route path="/signin" component={SignIn} />
      <Route path="/signup" component={SignUp} />
      <Route component={NotFound} />
    </Switch>
  );
}

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
