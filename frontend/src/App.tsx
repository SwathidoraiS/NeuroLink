import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";

import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import NeuralBackground from "./components/NeuralBackground";

import Home from "./pages/Home";
import About from "./pages/About";
import Features from "./pages/Features";
import Demo from "./pages/Demo";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CognitiveProfile from "./pages/CognitiveProfile";
import DecisionLab from "./pages/DecisionLab";
import EmotionTracker from "./pages/EmotionTracker";
import TwinSettings from "./pages/TwinSettings";
import NotFound from "./pages/NotFound";

import Courses from "./pages/Courses";               // ✅ NEW
import CourseDetail from "./pages/CourseDetail";     // ✅ NEW

import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    // Auto-redirect logged-in users from "/" or "/auth"
    if (token && user && (location.pathname === "/" || location.pathname === "/auth")) {
      navigate("/dashboard");
    }

    // Protected route list
    const protectedRoutes = [
      "/dashboard",
      "/cognitive-profile",
      "/decision-lab",
      "/emotion-tracker",
      "/twin-settings",
      "/courses",             // ✅ NEW
    ];

    const isProtected = protectedRoutes.some((path) =>
      location.pathname.startsWith(path)
    );

    if (!token && isProtected) {
      navigate("/auth");
    }
  }, [location.pathname, navigate]);

  return (
    <div className="relative min-h-screen">
      <NeuralBackground />
      <Navigation />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<Auth />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cognitive-profile"
          element={
            <ProtectedRoute>
              <CognitiveProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/decision-lab"
          element={
            <ProtectedRoute>
              <DecisionLab />
            </ProtectedRoute>
          }
        />

        <Route
          path="/emotion-tracker"
          element={
            <ProtectedRoute>
              <EmotionTracker />
            </ProtectedRoute>
          }
        />

    

        <Route
          path="/twin-settings"
          element={
            <ProtectedRoute>
              <TwinSettings />
            </ProtectedRoute>
          }
        />

        {/* NEW EDUCATION MODULE ROUTES */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute>
              <CourseDetail />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
