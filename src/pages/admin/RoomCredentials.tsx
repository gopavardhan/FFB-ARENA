import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RoomCredentialsProps {
  tournamentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RoomCredentials = ({ tournamentId, open, onOpenChange }: RoomCredentialsProps) => {
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("tournament_credentials")
        .upsert({
          tournament_id: tournamentId,
          room_id: roomId,
          room_password: password,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Room credentials updated successfully",
      });
      
      onOpenChange(false);
      setRoomId("");
      setPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Room Credentials</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Room ID</Label>
            <Input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID"
            />
          </div>
          <div>
            <Label>Room Password</Label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter room password"
            />
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Updating..." : "Update Credentials"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};