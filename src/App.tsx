import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Verify from "./pages/Verify";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Helmet>
            <title>ibnOrigin - Ibeno Certificate of Origin Portal</title>
            <meta name="description" content="Official digital certificate of origin verification system for Ibeno Local Government Area, Akwa Ibom State. Secure, verifiable, and instant certificate issuance." />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta property="og:title" content="ibnOrigin - Ibeno Certificate Portal" />
            <meta property="og:description" content="Official digital certificate of origin verification system for Ibeno Local Government Area" />
            <meta property="og:type" content="website" />
            <meta name="keywords" content="Ibeno, certificate, origin, verification, government, digital, secure" />
            <link rel="canonical" href={window.location.origin} />
          </Helmet>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </HelmetProvider>
);

export default App;
