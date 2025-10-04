import { Bell, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { HamburgerMenu } from "./HamburgerMenu";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userRole } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-card border-b border-border shadow-md">
        <div className="container flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center font-orbitron font-bold text-primary">
              FF
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-orbitron font-bold text-gradient">FFB ARENA</h1>
                {userRole && (
                  <Badge variant={userRole === 'boss' ? 'default' : userRole === 'admin' ? 'secondary' : 'outline'} className="text-xs">
                    {userRole.toUpperCase()}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-inter">Powered by Vardhan</p>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Hamburger Menu */}
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};
