import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick?: () => void;
  className?: string;
  label?: string;
}

export const FloatingActionButton = ({ 
  onClick, 
  className,
  label = "Quick Action" 
}: FloatingActionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="premium"
      size="icon"
      className={cn(
        "fixed bottom-20 right-6 md:bottom-8 md:right-8 h-14 w-14 rounded-full shadow-2xl z-40 animate-glow",
        className
      )}
      aria-label={label}
    >
      <Plus className="w-6 h-6" />
    </Button>
  );
};
