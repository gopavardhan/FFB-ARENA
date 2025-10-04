import { Home, Trophy, Wallet, TrendingUp, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Trophy, label: "Tournaments", path: "/tournaments" },
  { icon: Wallet, label: "Wallet", path: "/wallet" },
  { icon: TrendingUp, label: "Leaderboard", path: "/leaderboard" },
  { icon: User, label: "Profile", path: "/profile" },
];

export const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-all duration-300",
                isActive
                  ? "text-secondary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-6 h-6 mb-1", isActive && "animate-glow")} />
                <span className="text-xs font-rajdhani font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
