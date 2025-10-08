import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useTournamentStatusUpdater = () => {
  const { userRole } = useAuth();

  useEffect(() => {
    // Only run for admin/boss users to avoid multiple updates
    if (userRole !== 'admin' && userRole !== 'boss') return;

    const updateTournamentStatuses = async () => {
      try {
        // Get all upcoming tournaments that should now be active
        const { data: upcomingTournaments, error: fetchUpcomingError } = await supabase
          .from('tournaments')
          .select('id, start_date, status')
          .eq('status', 'upcoming');

        if (fetchUpcomingError) {
          console.error('Error fetching upcoming tournaments:', fetchUpcomingError);
        } else if (upcomingTournaments && upcomingTournaments.length > 0) {
          const now = new Date();
          const tournamentsToActivate = upcomingTournaments.filter(tournament => {
            const startTime = new Date(tournament.start_date);
            return now >= startTime;
          });

          if (tournamentsToActivate.length > 0) {
            // Update tournaments to active status
            const activatePromises = tournamentsToActivate.map(tournament =>
              supabase
                .from('tournaments')
                .update({ status: 'active' })
                .eq('id', tournament.id)
            );

            const activateResults = await Promise.all(activatePromises);
            
            // Check for errors
            const activateErrors = activateResults.filter(result => result.error);
            if (activateErrors.length > 0) {
              console.error('Error updating tournaments to active:', activateErrors);
            } else {
              console.log(`Updated ${tournamentsToActivate.length} tournaments to active status`);
            }
          }
        }

        // Get all active tournaments that should be completed (20 minutes after start)
        const { data: activeTournaments, error: fetchActiveError } = await supabase
          .from('tournaments')
          .select('id, status, start_date, winner_id, winner_user_id, winner_details')
          .eq('status', 'active');

        if (fetchActiveError) {
          console.error('Error fetching active tournaments:', fetchActiveError);
        } else if (activeTournaments && activeTournaments.length > 0) {
          const now = new Date();
          const tournamentsToComplete = activeTournaments.filter(tournament => {
            const startTime = new Date(tournament.start_date);
            const minutesSinceStart = (now.getTime() - startTime.getTime()) / (1000 * 60);
            
            // Tournament should be completed if:
            // 1. It has been 20 minutes or more since start time, OR
            // 2. It has a winner posted (check all possible winner fields)
            return minutesSinceStart >= 20 || 
                   tournament.winner_id || 
                   tournament.winner_user_id || 
                   tournament.winner_details;
          });

          if (tournamentsToComplete.length > 0) {
            // Update tournaments to completed status
            const completePromises = tournamentsToComplete.map(tournament =>
              supabase
                .from('tournaments')
                .update({ status: 'completed' })
                .eq('id', tournament.id)
            );

            const completeResults = await Promise.all(completePromises);
            
            // Check for errors
            const completeErrors = completeResults.filter(result => result.error);
            if (completeErrors.length > 0) {
              console.error('Error updating tournaments to completed:', completeErrors);
            } else {
              console.log(`Updated ${tournamentsToComplete.length} tournaments to completed status (${tournamentsToComplete.filter(t => {
                const startTime = new Date(t.start_date);
                const minutesSinceStart = (now.getTime() - startTime.getTime()) / (1000 * 60);
                return minutesSinceStart >= 20;
              }).length} by time, ${tournamentsToComplete.filter(t => t.winner_id || t.winner_user_id || t.winner_details).length} by winner)`);
            }
          }
        }

      } catch (error) {
        console.error('Error in tournament status updater:', error);
      }
    };

    // Run immediately
    updateTournamentStatuses();

    // Set up interval to check every 15 seconds (more frequent for winner detection)
    const interval = setInterval(updateTournamentStatuses, 15000);

    return () => clearInterval(interval);
  }, [userRole]);
};