import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed, Activity } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Wallet, TrendingUp, Plus, History, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeBalance } from "@/hooks/useRealtimeBalance";
import { useRealtimeTournaments } from "@/hooks/useRealtimeTournaments";
import { useRealtimeDepositsWithdrawals } from "@/hooks/useRealtimeDepositsWithdrawals";
import { useUserBalance } from "@/hooks/useWallet";
import { useTournaments } from "@/hooks/useTournaments";

const Index = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  // Enable real-time subscriptions
  useRealtimeBalance(user?.id);
  useRealtimeTournaments();
  useRealtimeDepositsWithdrawals(user?.id, userRole);

  // Fetch live data
  const { data: balance } = useUserBalance(user?.id || "");
  const { data: tournaments } = useTournaments({ status: "upcoming" });

  // Mock data - will be replaced with real data from Supabase
  const recentActivities: Activity[] = [
    {
      id: "1",
      type: "tournament",
      title: "Tournament Joined",
      description: "You joined 'Friday Night Battle' - Entry fee: ₹50",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: "success"
    },
    {
      id: "2",
      type: "tournament",
      title: "Tournament Completed",
      description: "Finished 5th in 'Morning Challenge' - Won ₹100",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      status: "success"
    },
    {
      id: "3",
      type: "payment",
      title: "Balance Added",
      description: "Successfully added ₹500 to your wallet",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      status: "success"
    },
  ];

  const quickActions = [
    {
      label: "Browse Tournaments",
      icon: Trophy,
      onClick: () => navigate("/tournaments"),
      variant: "premium" as const,
    },
    {
      label: "Add Funds",
      icon: Plus,
      onClick: () => navigate("/wallet"),
      variant: "outline" as const,
    },
    {
      label: "Match History",
      icon: History,
      onClick: () => navigate("/history"),
      variant: "outline" as const,
    },
    {
      label: "Leaderboard",
      icon: Award,
      onClick: () => navigate("/leaderboard"),
      variant: "outline" as const,
    },
  ];

  return (
    <MainLayout>
      <PageHeader 
        title={user ? `Welcome back!` : "Welcome to FFB ARENA"}
        subtitle="Your premier Free Fire tournament platform"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Your Balance"
          value={`₹${balance?.amount?.toFixed(2) || "0.00"}`}
          icon={Wallet}
          iconColor="accent"
        />
        <StatCard
          title="Active Tournaments"
          value={tournaments?.length.toString() || "0"}
          icon={Trophy}
          iconColor="secondary"
        />
        <StatCard
          title="Your Rank"
          value="-"
          icon={TrendingUp}
          iconColor="secondary"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          {/* Featured Section */}
          <Card className="p-8 bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/30 mb-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-orbitron font-bold text-gradient mb-4">
                Start Your Gaming Journey
              </h2>
              <p className="text-muted-foreground mb-6 font-inter">
                Join tournaments, compete with players, and win exciting prizes. 
                Your path to becoming a champion starts here!
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button variant="premium" size="lg" onClick={() => navigate("/tournaments")}>
                  Browse Tournaments
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate("/wallet")}>
                  Add Funds
                </Button>
              </div>
            </div>
          </Card>

          <ActivityFeed activities={recentActivities} title="Your Recent Activity" />
        </div>

        <div>
          <QuickActions actions={quickActions} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
