/**
 * Cron Jobs Routes
 * API endpoints for managing Hermes cron jobs
 */

const express = require('express');
const router = express.Router();

const {
  getCronJobs,
  createCronJob,
  editCronJob,
  pauseCronJob,
  resumeCronJob,
  runCronJob,
  deleteCronJob
} = require('../utils/hermes-cli');

const {
  syncCronJobs,
  logEvent,
  getUserHermesData
} = require('../utils/supabase-sync');

/**
 * GET /api/cron/jobs
 * List all cron jobs
 */
router.get('/jobs', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get jobs from Supabase first (for speed)
    const { data: cachedJobs, error: cachedError } = await getUserHermesData(userId);

    if (cachedError) {
      console.error('Error fetching cached jobs:', cachedError);
    }

    // Get fresh data from Hermes CLI
    const jobs = await getCronJobs();

    // Sync to Supabase
    await syncCronJobs(jobs, userId);

    // Log event
    await logEvent('cron_jobs_listed', { count: jobs.length }, userId);

    res.json({
      success: true,
      data: {
        jobs,
        cached: cachedJobs?.cronJobs || []
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting cron jobs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/cron/jobs
 * Create a new cron job
 */
router.post('/jobs', async (req, res) => {
  try {
    const userId = req.user.id;
    const cronConfig = req.body;

    // Validate required fields
    if (!cronConfig.name || !cronConfig.schedule) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, schedule'
      });
    }

    // Create the cron job
    const result = await createCronJob(cronConfig);

    // Log event
    await logEvent('cron_job_created', {
      jobConfig: cronConfig,
      result
    }, userId);

    // Trigger immediate sync
    const jobs = await getCronJobs();
    await syncCronJobs(jobs, userId);

    res.json({
      success: true,
      data: {
        jobId: result.id,
        ...cronConfig
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating cron job:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/cron/jobs/:id
 * Edit an existing cron job
 */
router.put('/jobs/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    // Edit the cron job
    const result = await editCronJob(id, updates);

    // Log event
    await logEvent('cron_job_edited', {
      jobId: id,
      updates,
      result
    }, userId);

    // Trigger sync
    const jobs = await getCronJobs();
    await syncCronJobs(jobs, userId);

    res.json({
      success: true,
      data: {
        jobId: id,
        updates,
        result
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error editing cron job:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/cron/jobs/:id
 * Delete a cron job
 */
router.delete('/jobs/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Delete the cron job
    const result = await deleteCronJob(id);

    // Log event
    await logEvent('cron_job_deleted', {
      jobId: id,
      result
    }, userId);

    // Trigger sync
    const jobs = await getCronJobs();
    await syncCronJobs(jobs, userId);

    res.json({
      success: true,
      data: {
        jobId: id,
        result
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting cron job:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/cron/jobs/:id/pause
 * Pause a cron job
 */
router.post('/jobs/:id/pause', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Pause the cron job
    const result = await pauseCronJob(id);

    // Log event
    await logEvent('cron_job_paused', {
      jobId: id,
      result
    }, userId);

    // Trigger sync
    const jobs = await getCronJobs();
    await syncCronJobs(jobs, userId);

    res.json({
      success: true,
      data: {
        jobId: id,
        result
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error pausing cron job:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/cron/jobs/:id/resume
 * Resume a paused cron job
 */
router.post('/jobs/:id/resume', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Resume the cron job
    const result = await resumeCronJob(id);

    // Log event
    await logEvent('cron_job_resumed', {
      jobId: id,
      result
    }, userId);

    // Trigger sync
    const jobs = await getCronJobs();
    await syncCronJobs(jobs, userId);

    res.json({
      success: true,
      data: {
        jobId: id,
        result
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resuming cron job:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/cron/jobs/:id/run
 * Run a cron job immediately
 */
router.post('/jobs/:id/run', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Run the cron job immediately
    const result = await runCronJob(id);

    // Log event
    await logEvent('cron_job_executed', {
      jobId: id,
      result
    }, userId);

    res.json({
      success: true,
      data: {
        jobId: id,
        result
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error running cron job:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;