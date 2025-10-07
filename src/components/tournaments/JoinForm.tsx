
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  player_ign: z.string().min(3, { message: "IGN must be at least 3 characters." }),
  team_members: z.string().optional(),
});

interface JoinFormProps {
  match_id: string;
  existingSlots: number[];
  totalSlots: number;
  isPlayerInTournament: boolean;
}

export const JoinForm = ({ match_id, existingSlots, totalSlots, isPlayerInTournament }: JoinFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      player_ign: "",
      team_members: "",
    },
  });

  const getNextAvailableSlot = () => {
    const occupiedSlots = new Set(existingSlots);
    for (let i = 1; i <= totalSlots; i++) {
      if (!occupiedSlots.has(i)) {
        return i;
      }
    }
    return null;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to join.");
      return;
    }

    if (isPlayerInTournament) {
        toast.info("You have already joined this tournament.");
        return;
    }

    setIsSubmitting(true);
    const nextSlot = getNextAvailableSlot();

    if (nextSlot === null) {
      toast.error("Sorry, all slots are filled.");
      setIsSubmitting(false);
      return;
    }

    const teamMembersArray = values.team_members?.split(",").map(name => name.trim()).filter(name => name) || [];

    const { error } = await supabase.from("tournament_slots").insert({
      match_id,
      slot_number: nextSlot,
      player_ign: values.player_ign,
      team_members: teamMembersArray,
      user_id: user.id,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Successfully joined slot #${nextSlot}!`);
      form.reset();
    }
    setIsSubmitting(false);
  };

  if (isPlayerInTournament) {
      return (
        <Card className="p-6 mt-6 bg-card/60 backdrop-blur-sm text-center">
            <h3 className="text-lg font-bold text-green-500">You're in!</h3>
            <p className="text-muted-foreground">You have successfully joined the tournament.</p>
        </Card>
      )
  }

  return (
    <Card className="p-6 mt-6 bg-card/60 backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-4 font-orbitron">Join the Tournament</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="player_ign"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your In-Game Name (IGN)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your IGN" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="team_members"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Members (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Comma-separated names" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" variant="premium" className="w-full" disabled={isSubmitting || existingSlots.length >= totalSlots}>
            {isSubmitting ? "Joining..." : (existingSlots.length >= totalSlots ? "Slots Full" : "Join Slot")}
          </Button>
        </form>
      </Form>
    </Card>
  );
};
