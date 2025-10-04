import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";

const Leaderboard = () => {
  return (
    <MainLayout>
      <PageHeader 
        title="Leaderboard" 
        subtitle="Top players and rankings"
      />
      <div className="grid gap-4">
        <p className="text-muted-foreground">Leaderboard coming soon...</p>
      </div>
    </MainLayout>
  );
};

export default Leaderboard;
