import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/context/AppContext";
import { AppLayout } from "@/components/AppLayout";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Activities from "@/pages/Activities";
import AddActivity from "@/pages/AddActivity";
import Billing from "@/pages/Billing";
import AddExpense from "@/pages/AddExpense";
import Equipment from "@/pages/Equipment";
import Industries from "@/pages/Industries";
import Drive from "@/pages/Drive";
import Users from "@/pages/Users";
import { useEffect } from "react";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, path }: { component: React.ComponentType<any>, path: string }) {
  const { user } = useApp();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  if (!user) return null;

  return <Route path={path} component={Component} />;
}

function Router() {
  const { user } = useApp();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (location === "/") {
      setLocation(user ? "/dashboard" : "/login");
    }
  }, [location, user, setLocation]);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/projects-and-activities" component={Projects} />
      <ProtectedRoute path="/projects" component={Projects} />
      <ProtectedRoute path="/projects/:id" component={ProjectDetail} />
      <ProtectedRoute path="/activities" component={Activities} />
      <ProtectedRoute path="/activities/add" component={AddActivity} />
      <ProtectedRoute path="/billing" component={Billing} />
      <ProtectedRoute path="/expenses/add" component={AddExpense} />
      <ProtectedRoute path="/industries" component={Industries} />
      <ProtectedRoute path="/equipment" component={Equipment} />
      <ProtectedRoute path="/drive" component={Drive} />
      <ProtectedRoute path="/users" component={Users} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppLayout>
              <Router />
            </AppLayout>
          </WouterRouter>
        </AppProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
