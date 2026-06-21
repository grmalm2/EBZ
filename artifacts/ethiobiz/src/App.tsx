import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { Layout } from "@/components/layout";
import { getSupabaseToken } from "@/lib/supabase";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import VerifyEmail from "@/pages/verify-email";
import Businesses from "@/pages/businesses";
import BusinessDetail from "@/pages/business-detail";
import SearchPage from "@/pages/search";
import AdminDashboard from "@/pages/admin/index";
import AdminLogin from "@/pages/admin/login";
import AdminBusinesses from "@/pages/admin/businesses";
import ManageAdmins from "@/pages/admin/manage-admins";
import AdminVerifyEmail from "@/pages/admin/verify-email";
import AddBusiness from "@/pages/add-business";

const queryClient = new QueryClient();

setAuthTokenGetter(getSupabaseToken);

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/verify-email" component={VerifyEmail} />
        <Route path="/businesses" component={Businesses} />
        <Route path="/businesses/:id" component={BusinessDetail} />
        <Route path="/search" component={SearchPage} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/verify-email" component={AdminVerifyEmail} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/businesses" component={AdminBusinesses} />
        <Route path="/admin/manage-admins" component={ManageAdmins} />
        <Route path="/add-business" component={AddBusiness} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
