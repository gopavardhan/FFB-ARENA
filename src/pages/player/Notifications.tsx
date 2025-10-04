import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";

const Notifications = () => {
  return (
    <MainLayout>
      <PageHeader 
        title="Notifications" 
        subtitle="Your activity updates"
        showBack={true}
      />
      <Card className="p-12 text-center">
        <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No notifications yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          You'll receive notifications about tournament updates, deposits, withdrawals, and more.
        </p>
      </Card>
    </MainLayout>
  );
};

export default Notifications;