import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import LogPurchase from "@/pages/log";
import PastPurchases from "@/pages/past";
import PurchaseDetail from "@/pages/purchase-detail";
import Reflect from "@/pages/reflect";
import Reflected from "@/pages/reflected";
import Insights from "@/pages/insights";
import Profile from "@/pages/profile";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/app" component={Dashboard} />
      <Route path="/app/log" component={LogPurchase} />
      <Route path="/app/past" component={PastPurchases} />
      <Route path="/app/purchase/:id" component={PurchaseDetail} />
      <Route path="/app/reflect/:id" component={Reflect} />
      <Route path="/app/reflected/:id" component={Reflected} />
      <Route path="/app/insights" component={Insights} />
      <Route path="/app/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
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
