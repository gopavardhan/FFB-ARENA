import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showBack?: boolean;
  className?: string;
}

export const PageHeader = ({ 
  title, 
  subtitle, 
  action, 
  showBack = false,
  className 
}: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className={cn("mb-6", className)}>
      {showBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      )}
      
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-gradient mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground font-inter">{subtitle}</p>
          )}
        </div>
        
        {action && <div>{action}</div>}
      </div>
    </div>
  );
};
