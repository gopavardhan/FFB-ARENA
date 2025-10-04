import { Bell, Menu, X, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { HamburgerMenu } from "./HamburgerMenu";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useUserBalance } from "@/hooks/useWallet";
import ffbArenaLogo from "@/assets/ffb-arena-logo.jpg";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { data: balance } = useUserBalance(user?.id || "");

  const handleLogoClick = () => {
    if (userRole === 'boss') {
      navigate('/boss/dashboard');
    } else if (userRole === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleBalanceClick = () => {
    if (userRole === 'player') {
      navigate('/wallet');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-card border-b border-border shadow-md">
        <div className="container flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
            <img 
              src={ffbArenaLogo} 
              alt="FFB ARENA" 
              className="w-10 h-10 rounded-lg object-cover"
            />
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
            {/* Balance Display for Players */}
            {userRole === 'player' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBalanceClick}
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-secondary/10 to-accent/10 border-secondary/30 hover:bg-secondary/20"
              >
                <Wallet className="w-4 h-4 text-secondary" />
                <span className="font-orbitron font-bold text-gradient">
                  ₹{balance?.amount?.toFixed(2) || "0.00"}
                </span>
              </Button>
            )}
            
            {/* Mobile Balance Icon for Players */}
            {userRole === 'player' && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBalanceClick}
                className="sm:hidden relative"
              >
                <Wallet className="w-5 h-5 text-secondary" />
              </Button>
            )}
            
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/notifications')}>
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
