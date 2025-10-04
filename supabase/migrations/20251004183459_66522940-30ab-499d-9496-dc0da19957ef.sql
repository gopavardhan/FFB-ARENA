-- Add in-game name fields and slot number to tournament registrations
ALTER TABLE tournament_registrations
ADD COLUMN in_game_name TEXT,
ADD COLUMN friend_in_game_name TEXT,
ADD COLUMN slot_number INTEGER;

-- Create function to get next available slot
CREATE OR REPLACE FUNCTION get_next_slot(p_tournament_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
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

-- Update register_for_tournament function to include in-game names and slot
CREATE OR REPLACE FUNCTION public.register_for_tournament(
  p_tournament_id uuid, 
  p_user_id uuid,
  p_in_game_name text DEFAULT NULL,
  p_friend_in_game_name text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_entry_fee NUMERIC;
  v_user_balance NUMERIC;
  v_filled_slots INTEGER;
  v_total_slots INTEGER;
  v_balance_before NUMERIC;
  v_balance_after NUMERIC;
  v_slot_number INTEGER;
BEGIN
  -- Get tournament details
  SELECT entry_fee, filled_slots, total_slots
  INTO v_entry_fee, v_filled_slots, v_total_slots
  FROM tournaments
  WHERE id = p_tournament_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tournament not found');
  END IF;

  -- Check if tournament is full
  IF v_filled_slots >= v_total_slots THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tournament is full');
  END IF;

  -- Get user balance
  SELECT amount INTO v_user_balance
  FROM user_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_user_balance < v_entry_fee THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  -- Check if already registered
  IF EXISTS (SELECT 1 FROM tournament_registrations WHERE tournament_id = p_tournament_id AND user_id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already registered');
  END IF;

  -- Get next available slot
  v_slot_number := get_next_slot(p_tournament_id);

  -- Deduct entry fee
  v_balance_before := v_user_balance;
  v_balance_after := v_user_balance - v_entry_fee;
  
  UPDATE user_balances
  SET amount = v_balance_after
  WHERE user_id = p_user_id;

  -- Create registration with in-game names and slot
  INSERT INTO tournament_registrations (tournament_id, user_id, in_game_name, friend_in_game_name, slot_number)
  VALUES (p_tournament_id, p_user_id, p_in_game_name, p_friend_in_game_name, v_slot_number);

  -- Update filled slots
  UPDATE tournaments
  SET filled_slots = filled_slots + 1
  WHERE id = p_tournament_id;

  -- Create transaction record
  INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, reference_id, description)
  VALUES (
    p_user_id,
    'tournament_entry',
    -v_entry_fee,
    v_balance_before,
    v_balance_after,
    p_tournament_id,
    'Tournament entry fee'
  );

  RETURN jsonb_build_object('success', true, 'balance', v_balance_after, 'slot_number', v_slot_number);
END;
$$;