import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/core/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Tournaments from "./pages/Tournaments";
import TournamentDetails from "./pages/TournamentDetails";
import Wallet from "./pages/Wallet";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import History from "./pages/History";
import BossDashboard from "./pages/boss/BossDashboard";
import AdminManagement from "./pages/boss/AdminManagement";
import DepositApprovals from "./pages/boss/DepositApprovals";
import WithdrawalApprovals from "./pages/boss/WithdrawalApprovals";
import AllTransactions from "./pages/boss/AllTransactions";
import AllTournaments from "./pages/boss/AllTournaments";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TournamentCreate from "./pages/admin/TournamentCreate";
import TournamentManagement from "./pages/admin/TournamentManagement";
import TournamentResults from "./pages/admin/TournamentResults";
import Announcements from "./pages/admin/Announcements";
import Notifications from "./pages/player/Notifications";
import Support from "./pages/player/Support";
import TermsConditions from "./pages/player/TermsConditions";
import PrivacyPolicy from "./pages/player/PrivacyPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            {/* Player Routes */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/tournaments" element={<ProtectedRoute><Tournaments /></ProtectedRoute>} />
            <Route path="/tournaments/:id" element={<ProtectedRoute><TournamentDetails /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute allowedRoles={['player']}><Wallet /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            <Route path="/terms" element={<ProtectedRoute><TermsConditions /></ProtectedRoute>} />
            <Route path="/privacy" element={<ProtectedRoute><PrivacyPolicy /></ProtectedRoute>} />
            
            {/* Boss Routes */}
            <Route path="/boss/dashboard" element={<ProtectedRoute allowedRoles={['boss']}><BossDashboard /></ProtectedRoute>} />
            <Route path="/boss/admins" element={<ProtectedRoute allowedRoles={['boss']}><AdminManagement /></ProtectedRoute>} />
            <Route path="/boss/tournaments" element={<ProtectedRoute allowedRoles={['boss']}><AllTournaments /></ProtectedRoute>} />
            <Route path="/boss/deposits" element={<ProtectedRoute allowedRoles={['boss']}><DepositApprovals /></ProtectedRoute>} />
            <Route path="/boss/withdrawals" element={<ProtectedRoute allowedRoles={['boss']}><WithdrawalApprovals /></ProtectedRoute>} />
            <Route path="/boss/transactions" element={<ProtectedRoute allowedRoles={['boss']}><AllTransactions /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/tournaments" element={<ProtectedRoute allowedRoles={['admin', 'boss']}><TournamentManagement /></ProtectedRoute>} />
            <Route path="/admin/tournaments/create" element={<ProtectedRoute allowedRoles={['admin', 'boss']}><TournamentCreate /></ProtectedRoute>} />
            <Route path="/admin/tournaments/:id/results" element={<ProtectedRoute allowedRoles={['admin', 'boss']}><TournamentResults /></ProtectedRoute>} />
            <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={['admin', 'boss']}><Announcements /></ProtectedRoute>} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
