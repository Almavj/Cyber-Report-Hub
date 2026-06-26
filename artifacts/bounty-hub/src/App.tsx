import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import WriteupsList from "@/pages/writeups/list";
import NewWriteup from "@/pages/writeups/new";
import WriteupDetail from "@/pages/writeups/detail";
import EditWriteup from "@/pages/writeups/edit";
import ReportsList from "@/pages/reports/list";
import NewReport from "@/pages/reports/new";
import ReportDetail from "@/pages/reports/detail";
import EditReport from "@/pages/reports/edit";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        
        <Route path="/writeups" component={WriteupsList} />
        <Route path="/writeups/new" component={NewWriteup} />
        <Route path="/writeups/:id" component={WriteupDetail} />
        <Route path="/writeups/:id/edit" component={EditWriteup} />
        
        <Route path="/reports" component={ReportsList} />
        <Route path="/reports/new" component={NewReport} />
        <Route path="/reports/:id" component={ReportDetail} />
        <Route path="/reports/:id/edit" component={EditReport} />
        
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
