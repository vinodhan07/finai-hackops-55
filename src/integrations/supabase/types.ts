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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          action_url: string | null
          alert_type: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          severity: string
          tenant_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          alert_type: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          severity?: string
          tenant_id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          severity?: string
          tenant_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budget_categories: {
        Row: {
          budget: number
          color: string
          created_at: string
          icon: string
          id: number
          name: string
          spent: number
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number
          color?: string
          created_at?: string
          icon?: string
          id?: number
          name: string
          spent?: number
          tenant_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number
          color?: string
          created_at?: string
          icon?: string
          id?: number
          name?: string
          spent?: number
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_accounts: {
        Row: {
          account_name: string
          account_type: string
          balance: number
          created_at: string
          currency: string
          id: string
          is_active: boolean
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          account_type: string
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          tenant_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_type?: string
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          created_at: string
          current_amount: number
          description: string | null
          goal_type: string
          id: string
          priority: string
          status: string
          target_amount: number | null
          target_date: string | null
          tenant_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          description?: string | null
          goal_type: string
          id?: string
          priority?: string
          status?: string
          target_amount?: number | null
          target_date?: string | null
          tenant_id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          description?: string | null
          goal_type?: string
          id?: string
          priority?: string
          status?: string
          target_amount?: number | null
          target_date?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      income_sources: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: number
          name: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          date: string
          id?: number
          name: string
          tenant_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: number
          name?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount_invested: number
          created_at: string
          current_value: number
          expected_return_rate: number | null
          id: string
          investment_name: string
          investment_type: string
          maturity_date: string | null
          purchase_date: string
          risk_level: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_invested: number
          created_at?: string
          current_value?: number
          expected_return_rate?: number | null
          id?: string
          investment_name: string
          investment_type: string
          maturity_date?: string | null
          purchase_date: string
          risk_level?: string
          tenant_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_invested?: number
          created_at?: string
          current_value?: number
          expected_return_rate?: number | null
          id?: string
          investment_name?: string
          investment_type?: string
          maturity_date?: string | null
          purchase_date?: string
          risk_level?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cibil_last_updated: string | null
          cibil_score: number | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          cibil_last_updated?: string | null
          cibil_score?: number | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          tenant_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          cibil_last_updated?: string | null
          cibil_score?: number | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      readings: {
        Row: {
          consumption: number | null
          cost_per_unit: number | null
          created_at: string
          current_reading: number
          id: string
          meter_number: string | null
          notes: string | null
          previous_reading: number | null
          reading_date: string
          reading_type: string
          tenant_id: string
          total_cost: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          consumption?: number | null
          cost_per_unit?: number | null
          created_at?: string
          current_reading: number
          id?: string
          meter_number?: string | null
          notes?: string | null
          previous_reading?: number | null
          reading_date?: string
          reading_type: string
          tenant_id?: string
          total_cost?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          consumption?: number | null
          cost_per_unit?: number | null
          created_at?: string
          current_reading?: number
          id?: string
          meter_number?: string | null
          notes?: string | null
          previous_reading?: number | null
          reading_date?: string
          reading_type?: string
          tenant_id?: string
          total_cost?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          amount: number | null
          category: string | null
          completed: boolean | null
          created_at: string
          description: string | null
          due_date: string
          id: number
          priority: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          category?: string | null
          completed?: boolean | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: number
          priority?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          category?: string | null
          completed?: boolean | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: number
          priority?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          category: string
          created_at: string
          current_amount: number
          description: string | null
          id: string
          priority: string
          status: string
          target_amount: number
          target_date: string | null
          tenant_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          current_amount?: number
          description?: string | null
          id?: string
          priority?: string
          status?: string
          target_amount: number
          target_date?: string | null
          tenant_id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          current_amount?: number
          description?: string | null
          id?: string
          priority?: string
          status?: string
          target_amount?: number
          target_date?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: number
          mode: string
          status: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description: string
          id?: number
          mode?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: number
          mode?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
