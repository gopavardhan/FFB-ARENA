import { ReactNode } from "react";
import { Header } from "@/components/navigation/Header";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
  showBottomNav?: boolean;
}

export const MainLayout = ({ 
  children, 
  className,
  showBottomNav = true 
}: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className={cn(
        "container mx-auto px-4 py-6",
        showBottomNav && "pb-20 md:pb-6",
        className
      )}>
        {children}
      </main>

      {showBottomNav && <BottomNavigation />}
    </div>
  );
};
