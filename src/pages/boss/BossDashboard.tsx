import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Users, DollarSign, TrendingUp, Activity as ActivityIcon, UserCog, Wallet, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBossActivities } from "@/hooks/useActivities";

const BossDashboard = () => {
  const navigate = useNavigate();

  const { data: activities = [] } = useBossActivities();

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
          <ActivityFeed activities={activities} title="Recent Platform Activity" />
        </div>
        <div>
          <QuickActions actions={quickActions} />
        </div>
      </div>
    </MainLayout>
  );
};

export default BossDashboard;
