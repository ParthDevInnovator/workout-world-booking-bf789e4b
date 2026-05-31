import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OwnerLayout } from "@/components/owner/OwnerLayout";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Gyms from "./pages/Gyms";
import GymDetail from "./pages/GymDetail";
import UserDashboard from "./pages/user/Dashboard";
import OwnerDashboard from "./pages/owner/Dashboard";
import MyGyms from "./pages/owner/MyGyms";
import AddGym from "./pages/owner/AddGym";
import Bookings from "./pages/owner/Bookings";
import Profile from "./pages/owner/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const OwnerShell = ({ children }: { children: JSX.Element }) => (
  <ProtectedRoute role="owner">
    <OwnerLayout>{children}</OwnerLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/gyms" element={<Gyms />} />
            <Route path="/user/*" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
            <Route path="/owner" element={<OwnerShell><OwnerDashboard /></OwnerShell>} />
            <Route path="/owner/dashboard" element={<OwnerShell><OwnerDashboard /></OwnerShell>} />
            <Route path="/owner/gyms" element={<OwnerShell><MyGyms /></OwnerShell>} />
            <Route path="/owner/add-gym" element={<OwnerShell><AddGym /></OwnerShell>} />
            <Route path="/owner/bookings" element={<OwnerShell><Bookings /></OwnerShell>} />
            <Route path="/owner/profile" element={<OwnerShell><Profile /></OwnerShell>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
