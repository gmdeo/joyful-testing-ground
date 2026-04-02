/**
 * Chat Routes
 * API endpoints for managing Hermes chat sessions
 */

const express = require('express');
const router = express.Router();

const { startChat, sendMessage } = require('../utils/hermes-cli');
const { logEvent } = require('../utils/supabase-sync');

/**
 * POST /api/chat/new
 * Start a new chat session
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

    // Start the chat
    const result = await startChat(prompt, options);

    // Log event
    await logEvent('chat_started', {
      prompt,
      options,
      responseLength: result.response.length
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
    console.error('Error starting chat:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/chat/message
 * Send a message in an existing session
 */
router.post('/message', async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, message'
      });
    }

    // Send message
    const result = await sendMessage(sessionId, message);

    // Log event
    await logEvent('chat_message_sent', {
      sessionId,
      messageLength: message.length
    }, userId);

    res.json({
      success: true,
      data: {
        result,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/chat/:id/messages
 * Get chat history for a session
 */
router.get('/:id/messages', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: sessionId } = req.params;

    // For now, return a placeholder
    // Full implementation would require:
    // 1. Loading session messages from database
    // 2. Returning message history

    await logEvent('chat_history_viewed', { sessionId }, userId);

    res.json({
      success: true,
      data: {
        sessionId,
        message: 'Message history retrieval requires additional implementation',
        messages: []
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;