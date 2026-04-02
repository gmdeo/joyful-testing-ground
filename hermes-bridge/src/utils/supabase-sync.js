/**
 * Supabase Synchronization Utilities
 * Syncs Hermes data to/from Supabase for real-time dashboard updates
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Sync Hermes status to Supabase
 */
async function syncStatus(statusData, userId) {
  try {
    const { error } = await supabase
      .from('hermes_status')
      .upsert({
        user_id: userId,
        environment: statusData.environment,
        gateway_status: statusData.gatewayService,
        messaging_platforms: statusData.messagingPlatforms,
        scheduled_jobs_count: statusData.scheduledJobs,
        sessions_count: statusData.sessions,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;

    console.log('Status synced to Supabase');
  } catch (error) {
    console.error('Error syncing status:', error);
    throw error;
  }
}

/**
 * Sync cron jobs to Supabase
 */
async function syncCronJobs(jobs, userId) {
  try {
    for (const job of jobs) {
      const { error } = await supabase
        .from('hermes_cron_jobs')
        .upsert({
          id: job.id,
          user_id: userId,
          name: job.name,
          schedule: job.schedule,
          status: job.status,
          repeat: job.repeat,
          next_run: job.nextRun,
          deliver: job.deliver,
          skills: job.skills,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) throw error;
    }

    console.log(`Synced ${jobs.length} cron jobs to Supabase`);
  } catch (error) {
    console.error('Error syncing cron jobs:', error);
    throw error;
  }
}

/**
 * Sync sessions to Supabase
 */
async function syncSessions(sessions, userId) {
  try {
    for (const session of sessions) {
      const { error } = await supabase
        .from('hermes_sessions')
        .upsert({
          id: session.id,
          user_id: userId,
          title: session.title,
          last_active: session.lastActive,
          source: session.source,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) throw error;
    }

    console.log(`Synced ${sessions.length} sessions to Supabase`);
  } catch (error) {
    console.error('Error syncing sessions:', error);
    throw error;
  }
}

/**
 * Log Hermes event to Supabase
 */
async function logEvent(eventType, data, userId) {
  try {
    const { error } = await supabase
      .from('hermes_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_data: data,
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    console.log(`Event logged: ${eventType}`);
  } catch (error) {
    console.error('Error logging event:', error);
    throw error;
  }
}

/**
 * Get user's Hermes data from Supabase
 */
async function getUserHermesData(userId) {
  try {
    const { data: status, error: statusError } = await supabase
      .from('hermes_status')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (statusError && statusError.code !== 'PGRST116') {
      throw statusError;
    }

    const { data: cronJobs, error: cronError } = await supabase
      .from('hermes_cron_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('next_run', { ascending: true });

    if (cronError) throw cronError;

    const { data: sessions, error: sessionsError } = await supabase
      .from('hermes_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_active', { ascending: false });

    if (sessionsError) throw sessionsError;

    const { data: events, error: eventsError } = await supabase
      .from('hermes_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (eventsError && eventsError.code !== 'PGRST116') {
      throw eventsError;
    }

    return {
      status: status || null,
      cronJobs: cronJobs || [],
      sessions: sessions || [],
      recentEvents: events || []
    };
  } catch (error) {
    console.error('Error getting user Hermes data:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time events for a user
 */
function subscribeToUserEvents(userId, callback) {
  const subscription = supabase
    .channel(`hermes_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'hermes_events',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Cleanup old sessions in Supabase
 */
async function cleanupOldSessions(userId, daysToKeep = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { error } = await supabase
      .from('hermes_sessions')
      .delete()
      .eq('user_id', userId)
      .lt('last_active', cutoffDate.toISOString());

    if (error) throw error;

    console.log(`Cleaned up sessions older than ${daysToKeep} days`);
  } catch (error) {
    console.error('Error cleaning up old sessions:', error);
    throw error;
  }
}

/**
 * Archive old events in Supabase
 */
async function archiveOldEvents(userId, daysToKeep = 7) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { error } = await supabase
      .from('hermes_events')
      .delete()
      .eq('user_id', userId)
      .lt('created_at', cutoffDate.toISOString());

    if (error) throw error;

    console.log(`Archived events older than ${daysToKeep} days`);
  } catch (error) {
    console.error('Error archiving old events:', error);
    throw error;
  }
}

module.exports = {
  syncStatus,
  syncCronJobs,
  syncSessions,
  logEvent,
  getUserHermesData,
  subscribeToUserEvents,
  cleanupOldSessions,
  archiveOldEvents
};