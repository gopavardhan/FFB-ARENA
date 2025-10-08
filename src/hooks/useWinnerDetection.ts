import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useWinnerDetection = (onWinnerPosted?: (tournamentId: string) => void) => {
  useEffect(() => {
    // Set up real-time subscription for tournament winner updates
    const channel = supabase
      .channel('tournament_winners')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tournaments',
        filter: 'status=eq.active'
      }, (payload) => {
        const tournament = payload.new as any;
        
        // Check if winner was just posted (check all possible winner fields)
        if (tournament.winner_id || tournament.winner_user_id || tournament.winner_details) {
          console.log(`Winner posted for tournament ${tournament.id}`);
          onWinnerPosted?.(tournament.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onWinnerPosted]);
};