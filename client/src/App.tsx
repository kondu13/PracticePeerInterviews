import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page"; 
import DashboardPage from "@/pages/dashboard-page";
import MatchRequestsPage from "@/pages/match-requests-page";
import ScheduledInterviewsPage from "@/pages/scheduled-interviews-page";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} /> {/* Public home page */}
      <ProtectedRoute path="/dashboard" component={DashboardPage} /> {/* Protected dashboard */}
      <ProtectedRoute path="/match-requests" component={MatchRequestsPage} />
      <ProtectedRoute path="/scheduled-interviews" component={ScheduledInterviewsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
