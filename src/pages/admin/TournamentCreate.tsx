import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { tournamentSchema } from "@/lib/validation";

const TournamentCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    entryFee: "",
    totalSlots: "",
    startDate: "",
    gameMode: "Squad",
    prizeFirst: "",
    prizeSecond: "",
    prizeThird: "",
    roomId: "",
    roomPassword: "",
    tournamentRules: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const prizeDistribution = {
        "1": parseFloat(formData.prizeFirst),
        "2": parseFloat(formData.prizeSecond) || 0,
        "3": parseFloat(formData.prizeThird) || 0,
      };

      // Validate input
      const validatedData = tournamentSchema.parse({
        name: formData.name,
        entryFee: parseFloat(formData.entryFee),
        totalSlots: parseInt(formData.totalSlots),
        startDate: new Date(formData.startDate).toISOString(),
        gameMode: formData.gameMode,
        prizeDistribution,
        roomId: formData.roomId || null,
        roomPassword: formData.roomPassword || null,
        tournamentRules: formData.tournamentRules || null,
      });

      // Create tournament
      const { data: tournament, error: tournamentError } = await supabase
        .from("tournaments")
        .insert({
          name: validatedData.name,
          entry_fee: validatedData.entryFee,
          total_slots: validatedData.totalSlots,
          start_date: validatedData.startDate,
          game_mode: validatedData.gameMode,
          prize_distribution: validatedData.prizeDistribution,
          tournament_rules: validatedData.tournamentRules,
          created_by: user!.id,
          status: "upcoming",
        })
        .select()
        .single();

      if (tournamentError) throw tournamentError;

      // Store credentials separately if provided
      if (validatedData.roomId || validatedData.roomPassword) {
        const { error: credentialsError } = await supabase
          .from("tournament_credentials")
          .insert({
            tournament_id: tournament.id,
            room_id: validatedData.roomId,
            room_password: validatedData.roomPassword,
          });

        if (credentialsError) throw credentialsError;
      }

      toast({
        title: "Success",
        description: "Tournament created successfully",
      });

      navigate("/admin/tournaments");
    } catch (error: any) {
      console.error("Tournament creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create tournament",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Create Tournament" 
        subtitle="Set up a new tournament"
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter tournament name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gameMode">Game Mode *</Label>
              <Select value={formData.gameMode} onValueChange={(value) => handleChange("gameMode", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Solo">Solo</SelectItem>
                  <SelectItem value="Duo">Duo</SelectItem>
                  <SelectItem value="Squad">Squad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryFee">Entry Fee (₹) *</Label>
              <Input
                id="entryFee"
                type="number"
                min="0"
                step="0.01"
                value={formData.entryFee}
                onChange={(e) => handleChange("entryFee", e.target.value)}
                placeholder="Enter entry fee"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalSlots">Total Slots *</Label>
              <Input
                id="totalSlots"
                type="number"
                min="1"
                value={formData.totalSlots}
                onChange={(e) => handleChange("totalSlots", e.target.value)}
                placeholder="Enter total slots"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date & Time *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prizeFirst">1st Prize (₹) *</Label>
              <Input
                id="prizeFirst"
                type="number"
                min="0"
                step="0.01"
                value={formData.prizeFirst}
                onChange={(e) => handleChange("prizeFirst", e.target.value)}
                placeholder="Enter 1st prize"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prizeSecond">2nd Prize (₹)</Label>
              <Input
                id="prizeSecond"
                type="number"
                min="0"
                step="0.01"
                value={formData.prizeSecond}
                onChange={(e) => handleChange("prizeSecond", e.target.value)}
                placeholder="Enter 2nd prize (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prizeThird">3rd Prize (₹)</Label>
              <Input
                id="prizeThird"
                type="number"
                min="0"
                step="0.01"
                value={formData.prizeThird}
                onChange={(e) => handleChange("prizeThird", e.target.value)}
                placeholder="Enter 3rd prize (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomId">Room ID</Label>
              <Input
                id="roomId"
                value={formData.roomId}
                onChange={(e) => handleChange("roomId", e.target.value)}
                placeholder="Enter room ID (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomPassword">Room Password</Label>
              <Input
                id="roomPassword"
                value={formData.roomPassword}
                onChange={(e) => handleChange("roomPassword", e.target.value)}
                placeholder="Enter room password (optional)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rules">Tournament Rules</Label>
            <Textarea
              id="rules"
              value={formData.tournamentRules}
              onChange={(e) => handleChange("tournamentRules", e.target.value)}
              placeholder="Enter tournament rules and guidelines"
              rows={6}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" variant="premium" disabled={loading}>
              {loading ? "Creating..." : "Create Tournament"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/admin/tournaments")}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </MainLayout>
  );
};

export default TournamentCreate;
