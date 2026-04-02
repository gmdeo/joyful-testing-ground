import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

// Types for database tables
export type Database = {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          user_id: string;
          key: string;
          title: string | null;
          started_at: string;
          finished_at: string | null;
          status: 'active' | 'completed' | 'failed' | 'timeout';
          message_count: number;
          turn_count: number;
          total_tokens: number;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['sessions']['Row']>;
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          session_id: string | null;
          title: string;
          description: string | null;
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          tags: string[];
          due_date: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tasks']['Row']>;
      };
      cron_jobs: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          name: string;
          schedule: string;
          skill: string | null;
          skills: string[];
          prompt_preview: string | null;
          enabled: boolean;
          last_run_at: string | null;
          last_status: string | null;
          last_error: string | null;
          next_run_at: string | null;
          paused_at: string | null;
          paused_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cron_jobs']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['cron_jobs']['Row']>;
      };
      memory: {
        Row: {
          id: string;
          user_id: string;
          target: 'user' | 'memory';
          action: 'add' | 'replace' | 'remove';
          content: string;
          old_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['memory']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['memory']['Row']>;
      };
      tool_executions: {
        Row: {
          id: string;
          user_id: string;
          session_id: string | null;
          tool_name: string;
          parameters: Record<string, unknown>;
          result: string | null;
          status: 'pending' | 'running' | 'completed' | 'failed';
          started_at: string | null;
          completed_at: string | null;
          duration_ms: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tool_executions']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['tool_executions']['Row']>;
      };
      settings: {
        Row: {
          id: string;
          user_id: string;
          config: Record<string, unknown>;
          theme: string;
          notifications_enabled: boolean;
          api_keys: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['settings']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['settings']['Row']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

export type Session = Database['public']['Tables']['sessions']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type CronJob = Database['public']['Tables']['cron_jobs']['Row'];
export type Memory = Database['public']['Tables']['memory']['Row'];
export type ToolExecution = Database['public']['Tables']['tool_executions']['Row'];
export type Settings = Database['public']['Tables']['settings']['Row'];