
import { Card } from "@/components/ui/card";
import { User, Users, Hash } from "lucide-react";

interface SlotCardProps {
  slot: {
    slot_number: number;
    in_game_name: string;
    friend_in_game_name?: string | null;
    user_id: string;  };
  isPlayerSlot: boolean;
}

export const SlotCard = ({ slot, isPlayerSlot }: SlotCardProps) => {
  const cardClasses = isPlayerSlot
    ? "border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/50"
    : "border-border/20";

  // Parse team members from friend_in_game_name
  const getTeamMembers = () => {
    if (!slot.friend_in_game_name) return "Solo player";
    
    try {
      // Try to parse as JSON array (Squad mode)
      const parsed = JSON.parse(slot.friend_in_game_name);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean).join(", ") || "No team members listed";
      }
    } catch (e) {
      // If not JSON, treat as single friend name (Duo mode)
      return slot.friend_in_game_name;
    }
    
    return slot.friend_in_game_name;
  };

  return (
    <Card className={`p-3 sm:p-4 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:bg-card/80 active:scale-95 ${cardClasses}`}>
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          <span className="font-bold text-sm sm:text-lg font-orbitron truncate">{slot.in_game_name}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold bg-secondary/20 text-secondary px-2 py-1 rounded-md flex-shrink-0">
          <Hash className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>{slot.slot_number}</span>
        </div>
      </div>
      <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
        <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
        <span className="line-clamp-2 break-words">{getTeamMembers()}</span>
      </div>
      {isPlayerSlot && (
        <div className="mt-2 text-xs text-primary font-semibold text-center bg-primary/10 py-1 rounded">
          YOUR SLOT
        </div>
      )}
    </Card>
  );
};
