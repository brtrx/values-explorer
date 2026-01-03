import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Compare from "./pages/Compare";
import Carriers from "./pages/Carriers";
import ExploreScenarios from "./pages/ExploreScenarios";
import SharedProfile from "./pages/SharedProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Use HashRouter only on GitHub Pages to avoid 404 on refresh
  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname === 'brtrx.github.io';
  const Router = isGitHubPages ? HashRouter : BrowserRouter;
  const basename = (!isGitHubPages && process.env.NODE_ENV === 'production') ? '/trait-generator' : '';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router basename={basename}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/editor" element={<Index />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/carriers" element={<Carriers />} />
            <Route path="/scenarios" element={<ExploreScenarios />} />
            <Route path="/p/:id" element={<SharedProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
