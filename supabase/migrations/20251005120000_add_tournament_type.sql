-- Add tournament_type column to tournaments
BEGIN;

ALTER TABLE public.tournaments
ADD COLUMN IF NOT EXISTS tournament_type TEXT DEFAULT 'BR';

-- Add a CHECK constraint to limit values to allowed set
ALTER TABLE public.tournaments
ADD CONSTRAINT chk_tournaments_tournament_type CHECK (tournament_type IN ('BR','CS','LoneWolf'));

COMMIT;