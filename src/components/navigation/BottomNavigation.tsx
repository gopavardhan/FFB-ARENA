import { Home, Trophy, Wallet, TrendingUp, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTournaments } from "@/hooks/useTournaments";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Trophy, label: "Tournaments", path: "/tournaments", showBadge: true },
  { icon: Wallet, label: "Wallet", path: "/wallet" },
  { icon: TrendingUp, label: "Leaderboard", path: "/leaderboard" },
  { icon: User, label: "Profile", path: "/profile" },
];

export const BottomNavigation = () => {
  const { data: tournaments } = useTournaments({ status: "upcoming" });
  const upcomingCount = tournaments?.length || 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative",
                isActive
                  ? "text-secondary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon className={cn(
                    "w-6 h-6 mb-1", 
                    isActive && "animate-glow",
                    item.path === "/tournaments" && upcomingCount > 0 && !isActive && "animate-pulse"
                  )} />
                  {item.showBadge && upcomingCount > 0 && (
                    <Badge 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-secondary text-secondary-foreground animate-pulse"
                    >
                      {upcomingCount > 9 ? '9+' : upcomingCount}
                    </Badge>
                  )}
                </div>
                <span className={cn(
                  "text-xs font-rajdhani font-medium",
                  item.path === "/tournaments" && upcomingCount > 0 && !isActive && "text-secondary"
                )}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
