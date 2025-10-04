import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";

const Wallet = () => {
  return (
    <MainLayout>
      <PageHeader 
        title="Wallet" 
        subtitle="Manage your balance and transactions"
      />
      <div className="grid gap-4">
        <p className="text-muted-foreground">Wallet management coming soon...</p>
      </div>
    </MainLayout>
  );
};

export default Wallet;
