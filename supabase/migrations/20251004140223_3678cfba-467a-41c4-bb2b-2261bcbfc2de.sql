-- Phase 8: Critical Security Fixes (Part 1)

-- 1. Fix tournament credentials exposure - only show room details to registered players
DROP POLICY IF EXISTS "Anyone can view tournaments" ON public.tournaments;

CREATE POLICY "Anyone can view basic tournament info" 
ON public.tournaments 
FOR SELECT 
USING (true);

-- Create a new table for sensitive tournament data visible only to registered players
CREATE TABLE IF NOT EXISTS public.tournament_credentials (
  tournament_id UUID PRIMARY KEY REFERENCES public.tournaments(id) ON DELETE CASCADE,
  room_id TEXT,
  room_password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.tournament_credentials ENABLE ROW LEVEL SECURITY;

-- Only registered players can see room credentials
CREATE POLICY "Registered players can view room credentials"
ON public.tournament_credentials
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tournament_registrations
    WHERE tournament_id = tournament_credentials.tournament_id
    AND user_id = auth.uid()
  )
);

-- Admins can manage credentials
CREATE POLICY "Admins can manage credentials"
ON public.tournament_credentials
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'boss'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'boss'::app_role));

-- Remove room_id and room_password from tournaments table (will be in credentials table)
ALTER TABLE public.tournaments DROP COLUMN IF EXISTS room_id;
ALTER TABLE public.tournaments DROP COLUMN IF EXISTS room_password;

-- 2. Fix tournament results exposure - only show own results + admins
DROP POLICY IF EXISTS "Anyone can view tournament results" ON public.tournament_results;

CREATE POLICY "Users can view own tournament results"
ON public.tournament_results
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all tournament results"
ON public.tournament_results
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'boss'::app_role));

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deposits_user_status ON public.deposits(user_id, status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_status ON public.withdrawals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_tournament ON public.tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_user ON public.tournament_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON public.transactions(user_id, created_at DESC);