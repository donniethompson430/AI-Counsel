import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CaseWorkspace from "./pages/CaseWorkspace";
import SimpleAgentFixed from "./pages/SimpleAgentFixed";
import AgentSystemDemo from "./pages/AgentSystemDemo";
import PublicDashboard from "./pages/PublicDashboard";
import HandlerDashboard from "./pages/HandlerDashboard";
import CaseWorkspaceNew from "./pages/CaseWorkspaceNew";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* New 3-Dashboard Flow */}
          <Route path="/" element={<PublicDashboard />} />
          <Route path="/handler-dashboard" element={<HandlerDashboard />} />
          <Route path="/case-workspace" element={<CaseWorkspaceNew />} />

          {/* Development/Legacy Routes */}
          <Route path="/simple-agent" element={<SimpleAgentFixed />} />
          <Route path="/agent-system" element={<AgentSystemDemo />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/case/:caseId" element={<CaseWorkspace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
