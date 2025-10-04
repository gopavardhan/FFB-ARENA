import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";

const Profile = () => {
  return (
    <MainLayout>
      <PageHeader 
        title="Profile" 
        subtitle="Manage your account settings"
      />
      <div className="grid gap-4">
        <p className="text-muted-foreground">Profile settings coming soon...</p>
      </div>
    </MainLayout>
  );
};

export default Profile;
