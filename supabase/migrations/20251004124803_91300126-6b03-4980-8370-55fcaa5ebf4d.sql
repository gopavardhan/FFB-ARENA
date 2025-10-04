-- Create tournament status enum
CREATE TYPE public.tournament_status AS ENUM ('upcoming', 'active', 'completed', 'cancelled');

-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  entry_fee NUMERIC(10,2) NOT NULL CHECK (entry_fee >= 0),
  total_slots INTEGER NOT NULL CHECK (total_slots > 0),
  filled_slots INTEGER NOT NULL DEFAULT 0 CHECK (filled_slots >= 0 AND filled_slots <= total_slots),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  game_mode TEXT,
  prize_distribution JSONB NOT NULL DEFAULT '{}',
  room_id TEXT,
  room_password TEXT,
  tournament_rules TEXT,
  status public.tournament_status NOT NULL DEFAULT 'upcoming',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tournament_registrations table
CREATE TABLE public.tournament_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  rank INTEGER,
  prize_amount NUMERIC(10,2),
  UNIQUE(tournament_id, user_id)
);

-- Create deposit status enum
CREATE TYPE public.deposit_status AS ENUM ('pending', 'approved', 'rejected');

-- Create deposits table
CREATE TABLE public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  utr_number TEXT NOT NULL UNIQUE CHECK (length(utr_number) = 12),
  screenshot_url TEXT NOT NULL,
  status public.deposit_status NOT NULL DEFAULT 'pending',
  boss_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create withdrawal status enum
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'approved', 'cancelled');

-- Create withdrawals table
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  upi_id TEXT NOT NULL,
  status public.withdrawal_status NOT NULL DEFAULT 'pending',
  payout_utr TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create transaction type enum
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'tournament_entry', 'tournament_win', 'refund');

-- Create transactions table for audit trail
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.transaction_type NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  balance_before NUMERIC(10,2) NOT NULL,
  balance_after NUMERIC(10,2) NOT NULL,
  reference_id UUID,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tournaments
CREATE POLICY "Anyone can view tournaments" ON public.tournaments
  FOR SELECT USING (true);

CREATE POLICY "Admins can create tournaments" ON public.tournaments
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'boss'));

CREATE POLICY "Admins can update their own tournaments" ON public.tournaments
  FOR UPDATE USING (
    created_by = auth.uid() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'boss'))
  );

CREATE POLICY "Admins can delete their own tournaments" ON public.tournaments
  FOR DELETE USING (
    created_by = auth.uid() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'boss'))
  );

-- RLS Policies for tournament_registrations
CREATE POLICY "Players can view their own registrations" ON public.tournament_registrations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins and Boss can view all registrations" ON public.tournament_registrations
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'boss'));

CREATE POLICY "Players can register for tournaments" ON public.tournament_registrations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update registrations" ON public.tournament_registrations
  FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'boss'));

-- RLS Policies for deposits
CREATE POLICY "Users can view their own deposits" ON public.deposits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Boss can view all deposits" ON public.deposits
  FOR SELECT USING (has_role(auth.uid(), 'boss'));

CREATE POLICY "Players can create deposits" ON public.deposits
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Boss can update deposits" ON public.deposits
  FOR UPDATE USING (has_role(auth.uid(), 'boss'));

-- RLS Policies for withdrawals
CREATE POLICY "Users can view their own withdrawals" ON public.withdrawals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Boss can view all withdrawals" ON public.withdrawals
  FOR SELECT USING (has_role(auth.uid(), 'boss'));

CREATE POLICY "Players can create withdrawals" ON public.withdrawals
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Boss can update withdrawals" ON public.withdrawals
  FOR UPDATE USING (has_role(auth.uid(), 'boss'));

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Boss can view all transactions" ON public.transactions
  FOR SELECT USING (has_role(auth.uid(), 'boss'));

-- Create indexes for better performance
CREATE INDEX idx_tournaments_status ON public.tournaments(status);
CREATE INDEX idx_tournaments_start_date ON public.tournaments(start_date);
CREATE INDEX idx_tournaments_created_by ON public.tournaments(created_by);
CREATE INDEX idx_tournament_registrations_tournament_id ON public.tournament_registrations(tournament_id);
CREATE INDEX idx_tournament_registrations_user_id ON public.tournament_registrations(user_id);
CREATE INDEX idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX idx_deposits_status ON public.deposits(status);
CREATE INDEX idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

-- Add triggers for updated_at
CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON public.tournaments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle tournament registration
CREATE OR REPLACE FUNCTION public.register_for_tournament(
  p_tournament_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entry_fee NUMERIC;
  v_user_balance NUMERIC;
  v_filled_slots INTEGER;
  v_total_slots INTEGER;
  v_balance_before NUMERIC;
  v_balance_after NUMERIC;
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

  -- Deduct entry fee
  v_balance_before := v_user_balance;
  v_balance_after := v_user_balance - v_entry_fee;
  
  UPDATE user_balances
  SET amount = v_balance_after
  WHERE user_id = p_user_id;

  -- Create registration
  INSERT INTO tournament_registrations (tournament_id, user_id)
  VALUES (p_tournament_id, p_user_id);

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

  RETURN jsonb_build_object('success', true, 'balance', v_balance_after);
END;
$$;