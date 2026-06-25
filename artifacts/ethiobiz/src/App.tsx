import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { Layout } from "@/components/layout";
import { getSupabaseToken } from "@/lib/supabase";
import { AdminAuthProvider } from "@/lib/admin";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import VerifyEmail from "@/pages/verify-email";
import Businesses from "@/pages/businesses";
import BusinessDetail from "@/pages/business-detail";
import SearchPage from "@/pages/search";
import AddBusiness from "@/pages/add-business";

// Admin Pages
import AdminLogin from "@/pages/admin/login";
import AdminVerifyEmail from "@/pages/admin/verify-email";
import AdminDashboard from "@/pages/admin/index";
import AdminBusinesses from "@/pages/admin/businesses";
import AdminUsers from "@/pages/admin/users";
import AdminCategories from "@/pages/admin/categories";
import AdminAds from "@/pages/admin/ads";
import AdminAnalytics from "@/pages/admin/analytics";
import ManageAdmins from "@/pages/admin/manage-admins";
import AdminSettings from "@/pages/admin/settings";

const queryClient = new QueryClient();

setAuthTokenGetter(getSupabaseToken);

// Scroll to top on route change
function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function PublicRouter() {
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
        <Route path="/add-business" component={AddBusiness} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function AdminRouter() {
  return (
    <AdminAuthProvider>
      <Switch>
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/verify-email" component={AdminVerifyEmail} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/businesses" component={AdminBusinesses} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/categories" component={AdminCategories} />
        <Route path="/admin/ads" component={AdminAds} />
        <Route path="/admin/analytics" component={AdminAnalytics} />
        <Route path="/admin/manage-admins" component={ManageAdmins} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route component={NotFound} />
      </Switch>
    </AdminAuthProvider>
  );
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* Admin routes - must come first to avoid /admin matching the NotFound in PublicRouter */}
        <Route path="/admin/*">
          <AdminRouter />
        </Route>
        {/* Public routes */}
        <Route path="/*">
          <PublicRouter />
        </Route>
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
