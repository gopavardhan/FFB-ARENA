import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Trophy, Users, Calendar, Flag, Plus, BarChart, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminActivities } from "@/hooks/useActivities";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: activities = [] } = useAdminActivities();

  const quickActions = [
    {
      label: "Create Tournament",
      icon: Plus,
      onClick: () => navigate("/admin/tournaments/create"),
      variant: "premium" as const,
    },
    {
      label: "Manage Tournaments",
      icon: Trophy,
      onClick: () => navigate("/admin/tournaments"),
      variant: "outline" as const,
    },
    {
      label: "Send Announcement",
      icon: MessageSquare,
      onClick: () => navigate("/admin/announcements"),
      variant: "outline" as const,
    },
  ];

  return (
    <MainLayout showBottomNav={false}>
      <PageHeader 
        title="Admin Dashboard" 
        subtitle="Tournament management and oversight"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Your Tournaments"
          value="0"
          icon={Trophy}
          iconColor="secondary"
        />
        <StatCard
          title="Total Players"
          value="0"
          icon={Users}
          iconColor="accent"
        />
        <StatCard
          title="Upcoming"
          value="0"
          icon={Calendar}
          iconColor="secondary"
        />
        <StatCard
          title="Completed"
          value="0"
          icon={Flag}
          iconColor="accent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed activities={activities} title="Tournament Activity" />
        </div>
        <div>
          <QuickActions actions={quickActions} />
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
