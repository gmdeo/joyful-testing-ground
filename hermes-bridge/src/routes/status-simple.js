/**
 * Status Routes (Simplified - No Supabase)
 * API endpoints for Hermes agent status
 * Supabase sync is now handled by the Edge Function proxy
 */

const express = require('express');
const router = express.Router();

const {
  getStatus,
  getSessions,
  getCronJobs
} = require('../utils/hermes-cli');

/**
 * GET /api/status
 * Get overall Hermes status
 */
router.get('/', async (req, res) => {
  try {
    const status = await getStatus();

    // Get additional stats for complete picture
    const sessions = await getSessions();
    const cronJobs = await getCronJobs();

    res.json({
      success: true,
      data: {
        ...status,
        sessionsCount: sessions.length,
        cronJobsCount: cronJobs.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting Hermes status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/status/gateway
 * Get gateway-specific status
 */
router.get('/gateway', async (req, res) => {
  try {
    const status = await getStatus();

    res.json({
      success: true,
      data: {
        gatewayService: status.gatewayService,
        environment: status.environment,
        messagingPlatforms: status.messagingPlatforms,
        timestamp: new Date().toISOString()
      }
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
 * GET /api/status/cron
 * Get cron jobs statistics
 */
router.get('/cron', async (req, res) => {
  try {
    const cronJobs = await getCronJobs();

    // Calculate statistics
    const stats = {
      total: cronJobs.length,
      active: cronJobs.filter(job => job.status === 'active').length,
      paused: cronJobs.filter(job => job.status === 'paused').length,
      byTarget: {},
      bySchedule: {}
    };

    // Group by delivery target
    cronJobs.forEach(job => {
      const target = job.deliver || 'unknown';
      stats.byTarget[target] = (stats.byTarget[target] || 0) + 1;
    });

    // Group by schedule type (hourly, daily, weekly, etc.)
    cronJobs.forEach(job => {
      const schedule = job.schedule || 'unknown';
      const type = schedule.includes('hourly') ? 'hourly' :
                   schedule.includes('daily') ? 'daily' :
                   schedule.includes('weekly') ? 'weekly' :
                   schedule.includes('monthly') ? 'monthly' : 'custom';
      stats.bySchedule[type] = (stats.bySchedule[type] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        summary: stats,
        jobs: cronJobs,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting cron statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/status/sessions
 * Get sessions statistics
 */
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await getSessions();

    // Calculate statistics
    const stats = {
      total: sessions.length,
      totalCount: sessions.length,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: {
        summary: stats,
        sessions: sessions,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting session statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;