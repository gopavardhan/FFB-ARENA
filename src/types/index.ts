// User Types
export type UserRole = 'boss' | 'admin' | 'player';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Tournament Types
export type TournamentStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface Tournament {
  id: string;
  name: string;
  entry_fee: number;
  total_slots: number;
  filled_slots: number;
  start_date: string;
  status: TournamentStatus;
  prize_distribution: Record<string, number>;
  room_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Payment Types
export type DepositStatus = 'pending' | 'approved' | 'rejected';
export type WithdrawalStatus = 'pending' | 'approved' | 'cancelled';

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  utr_number: string;
  screenshot_url: string;
  status: DepositStatus;
  boss_notes?: string;
  created_at: string;
  approved_at?: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  upi_id: string;
  status: WithdrawalStatus;
  payout_utr?: string;
  cancellation_reason?: string;
  created_at: string;
  processed_at?: string;
}

export interface Balance {
  user_id: string;
  amount: number;
  updated_at: string;
}
