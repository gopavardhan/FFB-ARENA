import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Wallet, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <MainLayout>
      <PageHeader 
        title="Welcome to FFB ARENA" 
        subtitle="Your premier Free Fire tournament platform"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-secondary/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Trophy className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Tournaments</p>
              <h3 className="text-2xl font-orbitron font-bold">12</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-accent/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Wallet className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Balance</p>
              <h3 className="text-2xl font-orbitron font-bold">₹0</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-secondary/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Rank</p>
              <h3 className="text-2xl font-orbitron font-bold">-</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Featured Section */}
      <Card className="p-8 bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/30">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-orbitron font-bold text-gradient mb-4">
            Start Your Gaming Journey
          </h2>
          <p className="text-muted-foreground mb-6 font-inter">
            Join tournaments, compete with players, and win exciting prizes. 
            Your path to becoming a champion starts here!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="premium" size="lg">
              Browse Tournaments
            </Button>
            <Button variant="outline" size="lg">
              Add Funds
            </Button>
          </div>
        </div>
      </Card>
    </MainLayout>
  );
};

export default Index;
