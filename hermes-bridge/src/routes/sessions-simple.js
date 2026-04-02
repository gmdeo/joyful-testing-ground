/**
 * Sessions Routes (Simplified - No Supabase)
 * API endpoints for managing Hermes sessions
 * Supabase sync is now handled by the Edge Function proxy
 */

const express = require('express');
const router = express.Router();

const {
  getSessions
} = require('../utils/hermes-cli');

/**
 * GET /api/sessions
 * List all sessions
 */
router.get('/', async (req, res) => {
  try {
    // Get fresh data from Hermes CLI
    const sessions = await getSessions();

    res.json({
      success: true,
      data: sessions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/sessions/:id
 * Get session details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Execute Hermes CLI session info command
    const { exec } = require('child_process');
    exec(`hermes sessions info ${id}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error getting session ${id}:`, error);
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }

      console.log(`Session ${id} info:`, stdout);

      res.json({
        success: true,
        data: {
          id,
          info: stdout
        },
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('Error getting session details:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/sessions/:id
 * Delete a session
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting session ${id}...`);

    // Execute Hermes CLI delete command
    const { exec } = require('child_process');
    exec(`hermes sessions delete ${id}`, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error deleting session ${id}:`, error);
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }

      console.log(`Session ${id} deleted:`, stdout);

      try {
        const sessions = await getSessions();
        res.json({
          success: true,
          message: `Session ${id} deleted successfully`,
          data: sessions,
          timestamp: new Date().toISOString()
        });
      } catch (fetchError) {
        console.error('Error getting updated sessions:', fetchError);
        res.status(500).json({
          success: false,
          error: fetchError.message
        });
      }
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;