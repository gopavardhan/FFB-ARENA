/*
  # Add Tournament Deletion Function with Automatic Refunds

  1. New Function
    - `delete_tournament_with_refund(tournament_id UUID, deleted_by UUID)`
      - Validates if user has permission to delete (admin who created it or boss)
      - Gets all registered players for the tournament
      - Creates refund transactions for each player
      - Updates player balances
      - Deletes tournament registrations
      - Deletes tournament credentials
      - Deletes tournament results
      - Deletes the tournament
      - Returns success status and number of refunds issued

  2. Security
    - Function checks if user is boss or is the admin who created the tournament
    - All operations are wrapped in a transaction
    - Proper error handling with detailed messages

  3. Notes
    - Only upcoming or active tournaments can be deleted
    - Completed tournaments cannot be deleted
    - All joined players automatically receive refunds
*/

-- Create function to delete tournament with automatic refunds
CREATE OR REPLACE FUNCTION delete_tournament_with_refund(
  p_tournament_id UUID,
  p_deleted_by UUID
) RETURNS JSON AS $$
DECLARE
  v_tournament RECORD;
  v_user_role TEXT;
  v_registration RECORD;
  v_refund_count INTEGER := 0;
  v_user_balance RECORD;
  v_new_balance NUMERIC;
BEGIN
  -- Get user role
  SELECT role INTO v_user_role
  FROM user_roles
  WHERE user_id = p_deleted_by
  ORDER BY created_at ASC
  LIMIT 1;

  -- Get tournament details
  SELECT * INTO v_tournament
  FROM tournaments
  WHERE id = p_tournament_id;

  -- Check if tournament exists
  IF v_tournament.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Tournament not found'
    );
  END IF;

  -- Check permissions: must be boss OR admin who created the tournament
  IF v_user_role != 'boss' AND v_tournament.created_by != p_deleted_by THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You do not have permission to delete this tournament'
    );
  END IF;

  -- Check if tournament is completed (cannot delete completed tournaments)
  IF v_tournament.status = 'completed' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot delete completed tournaments'
    );
  END IF;

  -- Process refunds for all registered players
  FOR v_registration IN
    SELECT user_id, in_game_name
    FROM tournament_registrations
    WHERE tournament_id = p_tournament_id
  LOOP
    -- Get current user balance
    SELECT * INTO v_user_balance
    FROM user_balances
    WHERE user_id = v_registration.user_id;

    -- Calculate new balance
    v_new_balance := COALESCE(v_user_balance.amount, 0) + v_tournament.entry_fee;

    -- Update user balance
    IF v_user_balance.user_id IS NOT NULL THEN
      UPDATE user_balances
      SET amount = v_new_balance, updated_at = NOW()
      WHERE user_id = v_registration.user_id;
    ELSE
      INSERT INTO user_balances (user_id, amount)
      VALUES (v_registration.user_id, v_new_balance);
    END IF;

    -- Create refund transaction
    INSERT INTO transactions (
      user_id,
      type,
      amount,
      balance_before,
      balance_after,
      description,
      created_at
    ) VALUES (
      v_registration.user_id,
      'refund',
      v_tournament.entry_fee,
      COALESCE(v_user_balance.amount, 0),
      v_new_balance,
      'Tournament refund: ' || v_tournament.name,
      NOW()
    );

    v_refund_count := v_refund_count + 1;
  END LOOP;

  -- Delete related records (in order due to foreign key constraints)
  DELETE FROM tournament_results WHERE tournament_id = p_tournament_id;
  DELETE FROM tournament_registrations WHERE tournament_id = p_tournament_id;
  DELETE FROM tournament_credentials WHERE tournament_id = p_tournament_id;

  -- Finally, delete the tournament
  DELETE FROM tournaments WHERE id = p_tournament_id;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', 'Tournament deleted successfully',
    'refunds_issued', v_refund_count,
    'tournament_name', v_tournament.name
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_tournament_with_refund TO authenticated;
