import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Trophy, Users, Calendar, Flag } from "lucide-react";

const AdminDashboard = () => {
  return (
    <MainLayout showBottomNav={false}>
      <PageHeader 
        title="Admin Dashboard" 
        subtitle="Tournament management and oversight"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-secondary/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Trophy className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Tournaments</p>
              <h3 className="text-2xl font-orbitron font-bold">0</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-accent/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Players</p>
              <h3 className="text-2xl font-orbitron font-bold">0</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-secondary/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Calendar className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <h3 className="text-2xl font-orbitron font-bold">0</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-accent/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Flag className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <h3 className="text-2xl font-orbitron font-bold">0</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="text-center text-muted-foreground py-12">
        <p>Admin tournament management features coming soon...</p>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
