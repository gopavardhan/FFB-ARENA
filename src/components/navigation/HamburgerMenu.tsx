import { X, Bell, History, MessageCircle, FileText, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

  const menuItems = [
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: History, label: "Match History", path: "/history" },
    { icon: MessageCircle, label: "Help & Support", path: "/support" },
    { icon: FileText, label: "Terms & Conditions", path: "/terms" },
    { icon: Shield, label: "Privacy Policy", path: "/privacy" },
  ];

export const HamburgerMenu = ({ isOpen, onClose }: HamburgerMenuProps) => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Menu */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-card border-l border-border z-50 shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-orbitron font-bold text-gradient">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col p-4 gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-accent/10 transition-colors group"
            >
              <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
              <span className="font-rajdhani font-medium text-foreground group-hover:text-secondary transition-colors">
                {item.label}
              </span>
            </Link>
          ))}

          <div className="my-4 border-t border-border" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-destructive/10 transition-colors group"
          >
            <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-destructive transition-colors" />
            <span className="font-rajdhani font-medium text-foreground group-hover:text-destructive transition-colors">
              Logout
            </span>
          </button>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border">
          <p className="text-xs text-center text-muted-foreground font-inter">
            © Vardhan Technologies
          </p>
        </div>
      </div>
    </>
  );
};
