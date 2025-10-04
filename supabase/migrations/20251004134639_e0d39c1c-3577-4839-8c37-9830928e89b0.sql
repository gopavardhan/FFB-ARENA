-- Phase 6: Payment System & Tournament Backend Integration

-- =====================================================
-- 1. TOURNAMENT RESULTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tournament_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rank INTEGER NOT NULL,
  kills INTEGER DEFAULT 0,
  prize_amount NUMERIC(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- Enable RLS
ALTER TABLE public.tournament_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view tournament results"
  ON public.tournament_results FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage tournament results"
  ON public.tournament_results FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'boss'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_tournament_results_updated_at
  BEFORE UPDATE ON public.tournament_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 2. UTR VALIDATION CONSTRAINTS
-- =====================================================
-- Add check constraint for 12-digit UTR format
ALTER TABLE public.deposits 
  ADD CONSTRAINT deposits_utr_format_check 
  CHECK (utr_number ~ '^\d{12}$');

-- Create unique index on UTR numbers to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS deposits_utr_unique_idx 
  ON public.deposits(utr_number);

-- =====================================================
-- 3. DEPOSIT APPROVAL FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.approve_deposit(
  p_deposit_id UUID,
  p_boss_id UUID,
  p_boss_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deposit_amount NUMERIC;
  v_user_id UUID;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
  v_screenshot_url TEXT;
BEGIN
  -- Check if boss has permission
  IF NOT has_role(p_boss_id, 'boss'::app_role) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Get deposit details
  SELECT amount, user_id, screenshot_url
  INTO v_deposit_amount, v_user_id, v_screenshot_url
  FROM deposits
  WHERE id = p_deposit_id AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Deposit not found or already processed');
  END IF;

  -- Get current balance
  SELECT amount INTO v_current_balance
  FROM user_balances
  WHERE user_id = v_user_id
  FOR UPDATE;

  -- Calculate new balance
  v_new_balance := v_current_balance + v_deposit_amount;

  -- Update deposit status
  UPDATE deposits
  SET status = 'approved',
      approved_by = p_boss_id,
      approved_at = NOW(),
      boss_notes = p_boss_notes
  WHERE id = p_deposit_id;

  -- Update user balance
  UPDATE user_balances
  SET amount = v_new_balance,
      updated_at = NOW()
  WHERE user_id = v_user_id;

  -- Create transaction record
  INSERT INTO transactions (
    user_id, type, amount, balance_before, balance_after, 
    reference_id, description
  ) VALUES (
    v_user_id, 'deposit', v_deposit_amount, v_current_balance, 
    v_new_balance, p_deposit_id, 'Deposit approved'
  );

  -- Delete screenshot from storage (done via client-side for now)
  
  RETURN jsonb_build_object(
    'success', true, 
    'new_balance', v_new_balance,
    'screenshot_url', v_screenshot_url
  );
END;
$$;

-- =====================================================
-- 4. DEPOSIT REJECTION FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.reject_deposit(
  p_deposit_id UUID,
  p_boss_id UUID,
  p_boss_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_screenshot_url TEXT;
BEGIN
  -- Check if boss has permission
  IF NOT has_role(p_boss_id, 'boss'::app_role) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Get screenshot URL and update status
  UPDATE deposits
  SET status = 'rejected',
      approved_by = p_boss_id,
      approved_at = NOW(),
      boss_notes = p_boss_notes
  WHERE id = p_deposit_id AND status = 'pending'
  RETURNING screenshot_url INTO v_screenshot_url;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Deposit not found or already processed');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'screenshot_url', v_screenshot_url
  );
END;
$$;

-- =====================================================
-- 5. WITHDRAWAL APPROVAL FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.approve_withdrawal(
  p_withdrawal_id UUID,
  p_boss_id UUID,
  p_payout_utr TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if boss has permission
  IF NOT has_role(p_boss_id, 'boss'::app_role) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Validate UTR format
  IF p_payout_utr !~ '^\d{12}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid UTR format. Must be 12 digits.');
  END IF;

  -- Update withdrawal status
  UPDATE withdrawals
  SET status = 'approved',
      payout_utr = p_payout_utr,
      processed_by = p_boss_id,
      processed_at = NOW()
  WHERE id = p_withdrawal_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Withdrawal not found or already processed');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- =====================================================
-- 6. WITHDRAWAL CANCELLATION FUNCTION (WITH REFUND)
-- =====================================================
CREATE OR REPLACE FUNCTION public.cancel_withdrawal(
  p_withdrawal_id UUID,
  p_boss_id UUID,
  p_cancellation_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_withdrawal_amount NUMERIC;
  v_user_id UUID;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  -- Check if boss has permission
  IF NOT has_role(p_boss_id, 'boss'::app_role) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Get withdrawal details
  SELECT amount, user_id
  INTO v_withdrawal_amount, v_user_id
  FROM withdrawals
  WHERE id = p_withdrawal_id AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Withdrawal not found or already processed');
  END IF;

  -- Get current balance
  SELECT amount INTO v_current_balance
  FROM user_balances
  WHERE user_id = v_user_id
  FOR UPDATE;

  -- Calculate new balance (refund the amount)
  v_new_balance := v_current_balance + v_withdrawal_amount;

  -- Update withdrawal status
  UPDATE withdrawals
  SET status = 'cancelled',
      cancellation_reason = p_cancellation_reason,
      processed_by = p_boss_id,
      processed_at = NOW()
  WHERE id = p_withdrawal_id;

  -- Refund user balance
  UPDATE user_balances
  SET amount = v_new_balance,
      updated_at = NOW()
  WHERE user_id = v_user_id;

  -- Create transaction record for refund
  INSERT INTO transactions (
    user_id, type, amount, balance_before, balance_after,
    reference_id, description
  ) VALUES (
    v_user_id, 'withdrawal_refund', v_withdrawal_amount, v_current_balance,
    v_new_balance, p_withdrawal_id, 'Withdrawal cancelled: ' || p_cancellation_reason
  );

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;

-- =====================================================
-- 7. WITHDRAWAL CREATION WITH IMMEDIATE BALANCE DEDUCTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_withdrawal_request(
  p_user_id UUID,
  p_amount NUMERIC,
  p_upi_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
  v_withdrawal_id UUID;
BEGIN
  -- Get and lock user balance
  SELECT amount INTO v_current_balance
  FROM user_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check sufficient balance
  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount;

  -- Create withdrawal request
  INSERT INTO withdrawals (user_id, amount, upi_id, status)
  VALUES (p_user_id, p_amount, p_upi_id, 'pending')
  RETURNING id INTO v_withdrawal_id;

  -- Immediately deduct balance
  UPDATE user_balances
  SET amount = v_new_balance,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Create transaction record
  INSERT INTO transactions (
    user_id, type, amount, balance_before, balance_after,
    reference_id, description
  ) VALUES (
    p_user_id, 'withdrawal', -p_amount, v_current_balance,
    v_new_balance, v_withdrawal_id, 'Withdrawal request created'
  );

  RETURN jsonb_build_object(
    'success', true,
    'withdrawal_id', v_withdrawal_id,
    'new_balance', v_new_balance
  );
END;
$$;

-- =====================================================
-- 8. TOURNAMENT COMPLETION & PRIZE DISTRIBUTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.distribute_tournament_prizes(
  p_tournament_id UUID,
  p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result RECORD;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
  v_total_distributed NUMERIC := 0;
BEGIN
  -- Check if admin has permission
  IF NOT (has_role(p_admin_id, 'admin'::app_role) OR has_role(p_admin_id, 'boss'::app_role)) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Loop through tournament results and distribute prizes
  FOR v_result IN
    SELECT user_id, prize_amount
    FROM tournament_results
    WHERE tournament_id = p_tournament_id AND prize_amount > 0
  LOOP
    -- Get current balance
    SELECT amount INTO v_current_balance
    FROM user_balances
    WHERE user_id = v_result.user_id
    FOR UPDATE;

    -- Calculate new balance
    v_new_balance := v_current_balance + v_result.prize_amount;

    -- Update balance
    UPDATE user_balances
    SET amount = v_new_balance,
        updated_at = NOW()
    WHERE user_id = v_result.user_id;

    -- Create transaction record
    INSERT INTO transactions (
      user_id, type, amount, balance_before, balance_after,
      reference_id, description
    ) VALUES (
      v_result.user_id, 'tournament_prize', v_result.prize_amount,
      v_current_balance, v_new_balance, p_tournament_id,
      'Tournament prize winnings'
    );

    v_total_distributed := v_total_distributed + v_result.prize_amount;
  END LOOP;

  -- Update tournament status to completed
  UPDATE tournaments
  SET status = 'completed',
      updated_at = NOW()
  WHERE id = p_tournament_id;

  RETURN jsonb_build_object(
    'success', true,
    'total_distributed', v_total_distributed
  );
END;
$$;