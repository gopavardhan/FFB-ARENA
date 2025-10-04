import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed, Activity } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Users, DollarSign, TrendingUp, Activity as ActivityIcon, UserCog, Wallet, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BossDashboard = () => {
  const navigate = useNavigate();

  // Mock data - will be replaced with real data from Supabase
  const recentActivities: Activity[] = [
    {
      id: "1",
      type: "payment",
      title: "New Deposit Request",
      description: "Player #1234 requested deposit of ₹500",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: "pending"
    },
    {
      id: "2",
      type: "payment",
      title: "Withdrawal Approved",
      description: "Withdrawal of ₹1000 approved for Player #5678",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      status: "success"
    },
    {
      id: "3",
      type: "user",
      title: "New User Registration",
      description: "john.doe@example.com registered as player",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: "success"
    },
    {
      id: "4",
      type: "tournament",
      title: "Tournament Completed",
      description: "Friday Night Battle concluded with 50 players",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      status: "success"
    },
  ];

  const quickActions = [
    {
      label: "Manage Admins",
      icon: UserCog,
      onClick: () => navigate("/boss/admins"),
      variant: "outline" as const,
    },
    {
      label: "Pending Deposits",
      icon: ArrowDownToLine,
      onClick: () => navigate("/boss/deposits"),
      variant: "outline" as const,
      count: 3,
    },
    {
      label: "Pending Withdrawals",
      icon: ArrowUpFromLine,
      onClick: () => navigate("/boss/withdrawals"),
      variant: "outline" as const,
      count: 2,
    },
    {
      label: "View All Transactions",
      icon: Wallet,
      onClick: () => navigate("/boss/transactions"),
      variant: "outline" as const,
    },
  ];

  return (
    <MainLayout showBottomNav={false}>
      <PageHeader 
        title="Boss Dashboard" 
        subtitle="System overview and management"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Users"
          value="0"
          icon={Users}
          iconColor="secondary"
        />
        <StatCard
          title="Platform Revenue"
          value="₹0"
          icon={DollarSign}
          iconColor="accent"
        />
        <StatCard
          title="Active Tournaments"
          value="0"
          icon={TrendingUp}
          iconColor="secondary"
        />
        <StatCard
          title="Pending Actions"
          value="5"
          icon={ActivityIcon}
          iconColor="accent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed activities={recentActivities} title="Recent Platform Activity" />
        </div>
        <div>
          <QuickActions actions={quickActions} />
        </div>
      </div>
    </MainLayout>
  );
};

export default BossDashboard;
