/**
 * Status Routes
 * API endpoints for Hermes status and statistics
 */

const express = require('express');
const router = express.Router();

const {
  getStatus,
  getCronJobs,
  getSessions
} = require('../utils/hermes-cli');

const {
  syncStatus,
  syncCronJobs,
  syncSessions,
  logEvent,
  getUserHermesData
} = require('../utils/supabase-sync');

/**
 * GET /api/status
 * Get current Hermes status
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get status from Hermes CLI
    const status = await getStatus();

    // Sync to Supabase
    await syncStatus(status, userId);

    // Log event
    await logEvent('status_checked', {
      gatewayStatus: status.gatewayService?.status,
      sessionsCount: status.sessions,
      cronJobsCount: status.scheduledJobs
    }, userId);

    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/status/gateway
 * Get gateway service status
 */
router.get('/gateway', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get status from Hermes CLI
    const status = await getStatus();

    await logEvent('gateway_status_checked', status.gatewayService, userId);

    res.json({
      success: true,
      data: {
        gateway: status.gatewayService,
        messagingPlatforms: status.messagingPlatforms
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting gateway status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/status/sessions
 * Get session statistics
 */
router.get('/sessions', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get sessions from Hermes CLI
    const sessions = await getSessions(50);

    await logEvent('sessions_stats_checked', {
      total: sessions.length,
      sources: [...new Set(sessions.map(s => s.source))]
    }, userId);

    res.json({
      success: true,
      data: {
        total: sessions.length,
        sessions,
        stats: {
          bySource: groupBySource(sessions),
          byTime: groupByTime(sessions)
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting session stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/status/cron
 * Get cron job statistics
 */
router.get('/cron', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get cron jobs from Hermes CLI
    const jobs = await getCronJobs();

    await logEvent('cron_stats_checked', {
      total: jobs.length,
      active: jobs.filter(j => j.status === 'active').length,
      paused: jobs.filter(j => j.status === 'paused').length
    }, userId);

    res.json({
      success: true,
      data: {
        total: jobs.length,
        jobs,
        stats: {
          active: jobs.filter(j => j.status === 'active').length,
          paused: jobs.filter(j => j.status === 'paused').length,
          bySchedule: groupBySchedule(jobs),
          nextRuns: jobs.map(j => ({
            id: j.id,
            name: j.name,
            nextRun: j.next_run
          })).sort((a, b) => new Date(a.nextRun) - new Date(b.nextRun))
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting cron stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper functions for statistics

function groupBySource(sessions) {
  const groups = {};
  sessions.forEach(session => {
    const source = session.source || 'unknown';
    groups[source] = (groups[source] || 0) + 1;
  });
  return groups;
}

function groupByTime(sessions) {
  const now = new Date();
  const groups = {
    lastHour: 0,
    lastDay: 0,
    lastWeek: 0,
    older: 0
  };

  sessions.forEach(session => {
    const sessionTime = new Date(session.lastActive);
    const diff = now - sessionTime;

    if (diff < 60 * 60 * 1000) {
      groups.lastHour++;
    } else if (diff < 24 * 60 * 60 * 1000) {
      groups.lastDay++;
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      groups.lastWeek++;
    } else {
      groups.older++;
    }
  });

  return groups;
}

function groupBySchedule(jobs) {
  const groups = {};
  jobs.forEach(job => {
    const schedule = job.schedule || 'unknown';
    groups[schedule] = (groups[schedule] || 0) + 1;
  });
  return groups;
}

module.exports = router;