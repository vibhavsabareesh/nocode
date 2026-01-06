import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModeProvider } from "@/contexts/ModeContext";

import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import FocusSession from "./pages/FocusSession";
import SessionEnd from "./pages/SessionEnd";
import Library from "./pages/Library";
import ChapterPage from "./pages/ChapterPage";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import NotesGenerator from "./pages/NotesGenerator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ModeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/home" element={<Home />} />
              <Route path="/focus/:taskId" element={<FocusSession />} />
              <Route path="/session-end" element={<SessionEnd />} />
              <Route path="/library" element={<Library />} />
              <Route path="/chapter/:chapterId" element={<ChapterPage />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notes" element={<NotesGenerator />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ModeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
