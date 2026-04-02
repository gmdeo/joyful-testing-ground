/**
 * Cron Jobs Routes (Simplified - No Supabase)
 * API endpoints for managing Hermes cron jobs
 * Supabase sync is now handled by the Edge Function proxy
 */

const express = require('express');
const router = express.Router();

const {
  getCronJobs,
  pauseCronJob,
  resumeCronJob,
  runCronJob,
  deleteCronJob
} = require('../utils/hermes-cli');

/**
 * GET /api/cron/jobs
 * List all cron jobs
 */
router.get('/jobs', async (req, res) => {
  try {
    // Get fresh data from Hermes CLI
    const jobs = await getCronJobs();

    res.json({
      success: true,
      data: jobs,
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
 * POST /api/cron/jobs/:id/pause
 * Pause a cron job
 */
router.post('/jobs/:id/pause', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Pausing cron job ${id}...`);

    // Execute Hermes CLI pause command
    const { exec } = require('child_process');
    exec(`hermes cron pause ${id}`, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error pausing job ${id}:`, error);
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }

      console.log(`Job ${id} paused:`, stdout);

      // Return updated job list
      try {
        const jobs = await getCronJobs();
        res.json({
          success: true,
          message: `Job ${id} paused successfully`,
          data: jobs,
          timestamp: new Date().toISOString()
        });
      } catch (fetchError) {
        console.error('Error getting updated jobs:', fetchError);
        res.status(500).json({
          success: false,
          error: fetchError.message
        });
      }
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
 * Resume a cron job
 */
router.post('/jobs/:id/resume', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Resuming cron job ${id}...`);

    // Execute Hermes CLI resume command
    const { exec } = require('child_process');
    exec(`hermes cron resume ${id}`, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error resuming job ${id}:`, error);
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }

      console.log(`Job ${id} resumed:`, stdout);

      try {
        const jobs = await getCronJobs();
        res.json({
          success: true,
          message: `Job ${id} resumed successfully`,
          data: jobs,
          timestamp: new Date().toISOString()
        });
      } catch (fetchError) {
        console.error('Error getting updated jobs:', fetchError);
        res.status(500).json({
          success: false,
          error: fetchError.message
        });
      }
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
    const { id } = req.params;
    console.log(`Running cron job ${id} immediately...`);

    // Execute Hermes CLI run command
    const { exec } = require('child_process');
    exec(`hermes cron run ${id}`, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running job ${id}:`, error);
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }

      console.log(`Job ${id} executed:`, stdout);

      try {
        const jobs = await getCronJobs();
        res.json({
          success: true,
          message: `Job ${id} executed successfully`,
          data: jobs,
          timestamp: new Date().toISOString()
        });
      } catch (fetchError) {
        console.error('Error getting updated jobs:', fetchError);
        res.status(500).json({
          success: false,
          error: fetchError.message
        });
      }
    });
  } catch (error) {
    console.error('Error running cron job:', error);
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
    const { id } = req.params;
    console.log(`Deleting cron job ${id}...`);

    // Execute Hermes CLI delete command
    const { exec } = require('child_process');
    exec(`hermes cron remove ${id}`, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error deleting job ${id}:`, error);
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }

      console.log(`Job ${id} deleted:`, stdout);

      try {
        const jobs = await getCronJobs();
        res.json({
          success: true,
          message: `Job ${id} deleted successfully`,
          data: jobs,
          timestamp: new Date().toISOString()
        });
      } catch (fetchError) {
        console.error('Error getting updated jobs:', fetchError);
        res.status(500).json({
          success: false,
          error: fetchError.message
        });
      }
    });
  } catch (error) {
    console.error('Error deleting cron job:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;