import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";

const Tournaments = () => {
  return (
    <MainLayout>
      <PageHeader 
        title="Tournaments" 
        subtitle="Browse and join upcoming tournaments"
      />
      <div className="grid gap-4">
        <p className="text-muted-foreground">Tournament list coming soon...</p>
      </div>
    </MainLayout>
  );
};

export default Tournaments;
