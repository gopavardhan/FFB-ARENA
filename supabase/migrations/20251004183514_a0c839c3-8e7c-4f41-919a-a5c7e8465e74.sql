-- Fix security warning: Set search_path for get_next_slot function
CREATE OR REPLACE FUNCTION get_next_slot(p_tournament_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_next_slot INTEGER;
BEGIN
  SELECT COALESCE(MAX(slot_number), 0) + 1
  INTO v_next_slot
  FROM tournament_registrations
  WHERE tournament_id = p_tournament_id;
  
  RETURN v_next_slot;
END;
$$;