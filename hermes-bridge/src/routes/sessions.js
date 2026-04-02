/**
 * Sessions Routes
 * API endpoints for managing Hermes sessions
 */

const express = require('express');
const router = express.Router();

const {
  getSessions,
  getSessionDetails,
  deleteSession,
  renameSession,
  startChat
} = require('../utils/hermes-cli');

const {
  syncSessions,
  logEvent,
  getUserHermesData
} = require('../utils/supabase-sync');

/**
 * GET /api/sessions
 * List all sessions
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    // Get sessions from Hermes CLI
    const sessions = await getSessions(limit);

    // Sync to Supabase
    await syncSessions(sessions, userId);

    // Log event
    await logEvent('sessions_listed', { count: sessions.length }, userId);

    res.json({
      success: true,
      data: {
        sessions,
        limit,
        total: sessions.length
      },
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
    const userId = req.user.id;
    const { id } = req.params;

    // Get session details
    const session = await getSessionDetails(id);

    // Log event
    await logEvent('session_details_viewed', { sessionId: id }, userId);

    res.json({
      success: true,
      data: {
        session,
        id
      },
      timestamp: new Date().toISOString()
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
    const userId = req.user.id;
    const { id } = req.params;

    // Delete the session
    const result = await deleteSession(id);

    // Log event
    await logEvent('session_deleted', { sessionId: id, result }, userId);

    // Remove from Supabase
    const { error: deleteError } = await require('@supabase/supabase-js')
      .createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      .from('hermes_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting session from Supabase:', deleteError);
    }

    // Trigger sync
    const sessions = await getSessions(20);
    await syncSessions(sessions, userId);

    res.json({
      success: true,
      data: {
        sessionId: id,
        result
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/sessions/:id/rename
 * Rename a session
 */
router.put('/:id/rename', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: name'
      });
    }

    // Rename the session
    const result = await renameSession(id, name);

    // Log event
    await logEvent('session_renamed', {
      sessionId: id,
      oldName: result.name,
      newName: name
    }, userId);

    // Update in Supabase
    const { error: updateError } = await require('@supabase/supabase-js')
      .createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      .from('hermes_sessions')
      .update({
        title: name,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating session in Supabase:', updateError);
    }

    res.json({
      success: true,
      data: {
        sessionId: id,
        name,
        result
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error renaming session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sessions/new
 * Start a new session
 */
router.post('/new', async (req, res) => {
  try {
    const userId = req.user.id;
    const { prompt, options = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: prompt'
      });
    }

    // Start a new chat session
    const result = await startChat(prompt, options);

    // Log event
    await logEvent('session_started', {
      prompt,
      options,
      result
    }, userId);

    res.json({
      success: true,
      data: {
        response: result.response,
        timestamp: result.timestamp
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating new session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sessions/:id/resume
 * Resume an existing session
 */
router.post('/:id/resume', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Log event (actual resume logic would require more complex implementation)
    await logEvent('session_resumed', { sessionId: id }, userId);

    // This is a placeholder - actual resume would require:
    // 1. Loading session state from database
    // 2. Restoring context/memory
    // 3. Starting new interaction with restored context

    res.json({
      success: true,
      data: {
        sessionId: id,
        message: 'Session resume initiated',
        note: 'Full resume functionality requires additional implementation'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resuming session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;