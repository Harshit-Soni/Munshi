export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.18'
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          kind: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          kind: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      incomes: {
        Row: {
          amount: number
          created_at: string
          effective_from: string
          id: string
          label: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          effective_from?: string
          id?: string
          label?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          effective_from?: string
          id?: string
          label?: string | null
          user_id?: string
        }
        Relationships: []
      }
      recurring_transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          description: string | null
          end_date: string | null
          frequency: string
          id: string
          kind: string
          next_run_date: string
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          kind: string
          next_run_date: string
          start_date: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          kind?: string
          next_run_date?: string
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          kind: string
          period: string | null
          recurring_id: string | null
          source: string
          source_ref: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: string
          kind: string
          period?: string | null
          recurring_id?: string | null
          source?: string
          source_ref?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          kind?: string
          period?: string | null
          recurring_id?: string | null
          source?: string
          source_ref?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

export type Kind = 'expense' | 'saving'

export type Category = Database['public']['Tables']['categories']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Recurring = Database['public']['Tables']['recurring_transactions']['Row']
export type Income = Database['public']['Tables']['incomes']['Row']
