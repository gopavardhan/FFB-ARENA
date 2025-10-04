import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed, Activity } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Trophy, Users, Calendar, Flag, Plus, BarChart, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Mock data - will be replaced with real data from Supabase
  const recentActivities: Activity[] = [
    {
      id: "1",
      type: "tournament",
      title: "New Tournament Registration",
      description: "Player #2345 joined 'Friday Night Battle'",
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      status: "success"
    },
    {
      id: "2",
      type: "tournament",
      title: "Tournament Starting Soon",
      description: "'Evening Clash' starts in 30 minutes",
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
      status: "pending"
    },
    {
      id: "3",
      type: "user",
      title: "Player Query",
      description: "Support ticket from Player #1234 about tournament rules",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      status: "pending"
    },
    {
      id: "4",
      type: "tournament",
      title: "Results Submitted",
      description: "Results for 'Morning Challenge' need verification",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: "pending"
    },
  ];

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
      label: "Update Results",
      icon: BarChart,
      onClick: () => navigate("/admin/results"),
      variant: "outline" as const,
      count: 1,
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
          <ActivityFeed activities={recentActivities} title="Tournament Activity" />
        </div>
        <div>
          <QuickActions actions={quickActions} />
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
