/**
 * Hermes Dashboard API Layer
 * Type-safe CRUD operations for Supabase database and HermessBridge
 */

import { supabase, type Database } from './supabase';

// =============================================================================
// HERMESBRIDGE API
// =============================================================================

// Route all bridge calls through the hermes-proxy edge function
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${SUPABASE_URL}/functions/v1/hermes-proxy`;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function bridgeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();

    if (!result.success && result.error) {
      throw new Error(result.error);
    }

    return result.data as T;
  } catch (error) {
    console.error(`Bridge API error for ${endpoint}:`, error);
    throw error;
  }
}

export const bridgeApi = {
  // Cron Jobs
  async getCronJobs() {
    return bridgeRequest<any[]>('/api/cron/jobs');
  },

  async createCronJob(job: any) {
    return bridgeRequest<any>('/api/cron/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
  },

  async pauseCronJob(id: string) {
    return bridgeRequest<any>(`/api/cron/jobs/${id}/pause`, {
      method: 'POST',
    });
  },

  async resumeCronJob(id: string) {
    return bridgeRequest<any>(`/api/cron/jobs/${id}/resume`, {
      method: 'POST',
    });
  },

  async runCronJob(id: string) {
    return bridgeRequest<any>(`/api/cron/jobs/${id}/run`, {
      method: 'POST',
    });
  },

  async deleteCronJob(id: string) {
    // Note: DELETE requires /jobs endpoint with job ID
    return bridgeRequest<any>(`/api/cron/jobs/${id}`, {
      method: 'DELETE',
    });
  },

  // Sessions
  async getSessions() {
    return bridgeRequest<any[]>('/api/sessions');
  },

  async getSessionDetails(id: string) {
    return bridgeRequest<any>(`/api/sessions/${id}`);
  },

  async deleteSession(id: string) {
    return bridgeRequest<any>(`/api/sessions/${id}`, {
      method: 'DELETE',
    });
  },

  async renameSession(id: string, newName: string) {
    return bridgeRequest<any>(`/api/sessions/${id}/rename`, {
      method: 'PUT',
      body: JSON.stringify({ name: newName }),
    });
  },

  // Status
  async getStatus() {
    return bridgeRequest<any>('/api/status');
  },

  async getGatewayStatus() {
    return bridgeRequest<any>('/api/status/gateway');
  },

  async getCronStats() {
    return bridgeRequest<any>('/api/status/cron');
  },

  async getSessionStats() {
    return bridgeRequest<any>('/api/status/sessions');
  },
};

// =============================================================================
// SESSIONS API (Supabase)
// =============================================================================

export const sessionsApi = {
  async list() {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(session: Database['public']['Tables']['sessions']['Insert']) {
    const { data, error } = await supabase
      .from('sessions')
      .insert(session)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Database['public']['Tables']['sessions']['Update']) {
    const { data, error } =await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async filterByStatus(status: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('status', status)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// TASKS API
// =============================================================================

export const tasksApi = {
  async list() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(task: Database['public']['Tables']['tasks']['Insert']) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Database['public']['Tables']['tasks']['Update']) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async filterByStatus(status: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async filterByPriority(priority: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('priority', priority)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async bulkUpdate(ids: string[], updates: Database['public']['Tables']['tasks']['Update']) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .in('id', ids)
      .select();

    if (error) throw error;
    return data;
  },

  async bulkDelete(ids: string[]) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .in('id', ids);

    if (error) throw error;
  },
};

// =============================================================================
// CRON JOBS API
// =============================================================================

export const cronJobsApi = {
  async list() {
    const { data, error } = await supabase
      .from('cron_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('cron_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getByJobId(jobId: string) {
    const { data, error } = await supabase
      .from('cron_jobs')
      .select('*')
      .eq('job_id', jobId)
      .single();

    if (error) throw error;
    return data;
  },

  async create(job: Database['public']['Tables']['cron_jobs']['Insert']) {
    const { data, error } = await supabase
      .from('cron_jobs')
      .insert(job)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Database['public']['Tables']['cron_jobs']['Update']) {
    const { data, error } = await supabase
      .from('cron_jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('cron_jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async pause(id: string, reason?: string) {
    const { data, error } = await supabase
      .from('cron_jobs')
      .update({
        enabled: false,
        paused_at: new Date().toISOString(),
        paused_reason: reason || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async resume(id: string) {
    const { data, error } = await supabase
      .from('cron_jobs')
      .update({
        enabled: true,
        paused_at: null,
        paused_reason: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async filterByStatus(enabled: boolean) {
    const { data, error } = await supabase
      .from('cron_jobs')
      .select('*')
      .eq('enabled', enabled)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// MEMORY API
// =============================================================================

export const memoryApi = {
  async list() {
    const { data, error } = await supabase
      .from('memory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('memory')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(memory: Database['public']['Tables']['memory']['Insert']) {
    const { data, error } = await supabase
      .from('memory')
      .insert(memory)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Database['public']['Tables']['memory']['Update']) {
    const { data, error } = await supabase
      .from('memory')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('memory')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async filterByTarget(target: 'user' | 'memory') {
    const { data, error } = await supabase
      .from('memory')
      .select('*')
      .eq('target', target)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async search(query: string) {
    const { data, error } = await supabase
      .from('memory')
      .select('*')
      .or(`content.ilike.%${query}%,old_text.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// TOOL EXECUTIONS API
// =============================================================================

export const toolExecutionsApi = {
  async list(sessionId?: string) {
    let query = supabase
      .from('tool_executions')
      .select('*');

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('tool_executions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(execution: Database['public']['Tables']['tool_executions']['Insert']) {
    const { data, error } = await supabase
      .from('tool_executions')
      .insert(execution)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Database['public']['Tables']['tool_executions']['Update']) {
    const { data, error } = await supabase
      .from('tool_executions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('tool_executions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async filterByStatus(status: string) {
    const { data, error } = await supabase
      .from('tool_executions')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async filterByTool(toolName: string) {
    const { data, error } = await supabase
      .from('tool_executions')
      .select('*')
      .eq('tool_name', toolName)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// SETTINGS API
// =============================================================================

export const settingsApi = {
  async get() {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async update(updates: Database['public']['Tables']['settings']['Update']) {
    const { data, error } = await supabase
      .from('settings')
      .update(updates)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateConfig(config: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('settings')
      .update({ config })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTheme(theme: string) {
    const { data, error } = await supabase
      .from('settings')
      .update({ theme })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleNotifications(enabled: boolean) {
    const { data, error } = await supabase
      .from('settings')
      .update({ notifications_enabled: enabled })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// REAL-TIME SUBSCRIPTIONS
// =============================================================================

export const realtime = {
  onSessionsChange(callback: (payload: { new?: any; old?: any }) => void) {
    return supabase
      .channel('sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
        },
        callback
      )
      .subscribe();
  },

  onTasksChange(callback: (payload: { new?: any; old?: any }) => void) {
    return supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        callback
      )
      .subscribe();
  },

  onCronJobsChange(callback: (payload: { new?: any; old?: any }) => void) {
    return supabase
      .channel('cron-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cron_jobs',
        },
        callback
      )
      .subscribe();
  },

  onToolExecutionsChange(callback: (payload: { new?: any; old?: any }) => void) {
    return supabase
      .channel('tool-executions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tool_executions',
        },
        callback
      )
      .subscribe();
  },
};

// =============================================================================
// AUTH HELPERS
// =============================================================================

export const auth = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// =============================================================================
// EXPORT ALL APIS
// =============================================================================

export const api = {
  sessions: sessionsApi,
  tasks: tasksApi,
  cronJobs: cronJobsApi,
  memory: memoryApi,
  toolExecutions: toolExecutionsApi,
  settings: settingsApi,
  realtime,
  auth,
};