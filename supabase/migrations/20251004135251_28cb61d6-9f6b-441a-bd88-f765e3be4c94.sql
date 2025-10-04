-- Phase 7: Enable Real-time Features

-- Enable realtime on key tables
ALTER TABLE public.user_balances REPLICA IDENTITY FULL;
ALTER TABLE public.tournaments REPLICA IDENTITY FULL;
ALTER TABLE public.deposits REPLICA IDENTITY FULL;
ALTER TABLE public.withdrawals REPLICA IDENTITY FULL;
ALTER TABLE public.tournament_registrations REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_balances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deposits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_registrations;