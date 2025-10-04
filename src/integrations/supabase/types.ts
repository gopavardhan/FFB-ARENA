export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      deposits: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          boss_notes: string | null
          created_at: string
          id: string
          screenshot_url: string
          status: Database["public"]["Enums"]["deposit_status"]
          user_id: string
          utr_number: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          boss_notes?: string | null
          created_at?: string
          id?: string
          screenshot_url: string
          status?: Database["public"]["Enums"]["deposit_status"]
          user_id: string
          utr_number: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          boss_notes?: string | null
          created_at?: string
          id?: string
          screenshot_url?: string
          status?: Database["public"]["Enums"]["deposit_status"]
          user_id?: string
          utr_number?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tournament_registrations: {
        Row: {
          id: string
          prize_amount: number | null
          rank: number | null
          registered_at: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          id?: string
          prize_amount?: number | null
          rank?: number | null
          registered_at?: string
          tournament_id: string
          user_id: string
        }
        Update: {
          id?: string
          prize_amount?: number | null
          rank?: number | null
          registered_at?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_registrations_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_results: {
        Row: {
          created_at: string | null
          id: string
          kills: number | null
          prize_amount: number | null
          rank: number
          tournament_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          kills?: number | null
          prize_amount?: number | null
          rank: number
          tournament_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          kills?: number | null
          prize_amount?: number | null
          rank?: number
          tournament_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_results_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          created_by: string
          entry_fee: number
          filled_slots: number
          game_mode: string | null
          id: string
          name: string
          prize_distribution: Json
          room_id: string | null
          room_password: string | null
          start_date: string
          status: Database["public"]["Enums"]["tournament_status"]
          total_slots: number
          tournament_rules: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          entry_fee: number
          filled_slots?: number
          game_mode?: string | null
          id?: string
          name: string
          prize_distribution?: Json
          room_id?: string | null
          room_password?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["tournament_status"]
          total_slots: number
          tournament_rules?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          entry_fee?: number
          filled_slots?: number
          game_mode?: string | null
          id?: string
          name?: string
          prize_distribution?: Json
          room_id?: string | null
          room_password?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["tournament_status"]
          total_slots?: number
          tournament_rules?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
          description: string
          id: string
          reference_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string
          description: string
          id?: string
          reference_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          description?: string
          id?: string
          reference_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      user_balances: {
        Row: {
          amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          cancellation_reason: string | null
          created_at: string
          id: string
          payout_utr: string | null
          processed_at: string | null
          processed_by: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          upi_id: string
          user_id: string
        }
        Insert: {
          amount: number
          cancellation_reason?: string | null
          created_at?: string
          id?: string
          payout_utr?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          upi_id: string
          user_id: string
        }
        Update: {
          amount?: number
          cancellation_reason?: string | null
          created_at?: string
          id?: string
          payout_utr?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          upi_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_deposit: {
        Args: { p_boss_id: string; p_boss_notes?: string; p_deposit_id: string }
        Returns: Json
      }
      approve_withdrawal: {
        Args: {
          p_boss_id: string
          p_payout_utr: string
          p_withdrawal_id: string
        }
        Returns: Json
      }
      cancel_withdrawal: {
        Args: {
          p_boss_id: string
          p_cancellation_reason: string
          p_withdrawal_id: string
        }
        Returns: Json
      }
      create_withdrawal_request: {
        Args: { p_amount: number; p_upi_id: string; p_user_id: string }
        Returns: Json
      }
      distribute_tournament_prizes: {
        Args: { p_admin_id: string; p_tournament_id: string }
        Returns: Json
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      register_for_tournament: {
        Args: { p_tournament_id: string; p_user_id: string }
        Returns: Json
      }
      reject_deposit: {
        Args: { p_boss_id: string; p_boss_notes: string; p_deposit_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "boss" | "admin" | "player"
      deposit_status: "pending" | "approved" | "rejected"
      tournament_status: "upcoming" | "active" | "completed" | "cancelled"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "tournament_entry"
        | "tournament_win"
        | "refund"
        | "withdrawal_refund"
      withdrawal_status: "pending" | "approved" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["boss", "admin", "player"],
      deposit_status: ["pending", "approved", "rejected"],
      tournament_status: ["upcoming", "active", "completed", "cancelled"],
      transaction_type: [
        "deposit",
        "withdrawal",
        "tournament_entry",
        "tournament_win",
        "refund",
        "withdrawal_refund",
      ],
      withdrawal_status: ["pending", "approved", "cancelled"],
    },
  },
} as const
