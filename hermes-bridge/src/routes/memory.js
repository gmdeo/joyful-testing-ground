/**
 * Memory Routes
 * API endpoints for managing Hermes agent memory
 */

const express = require('express');
const router = express.Router();

const { getMemory, addMemory } = require('../utils/hermes-cli');
const { logEvent } = require('../utils/supabase-sync');

/**
 * GET /api/memory
 * Get agent memory entries
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get memory from Hermes
    const memories = await getMemory();

    // Log event
    await logEvent('memory_viewed', { count: memories.length }, userId);

    res.json({
      success: true,
      data: {
        memories,
        total: memories.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting memory:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/memory
 * Add a memory entry
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { target, content, action = 'add' } = req.body;

    if (!target || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: target, content'
      });
    }

    // Add memory to Hermes
    const result = await addMemory(target, content, action);

    // Log event
    await logEvent('memory_added', {
      target,
      contentLength: content.length,
      action,
      result
    }, userId);

    res.json({
      success: true,
      data: {
        target,
        content,
        action,
        result
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding memory:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/memory/:id
 * Delete a memory entry
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // This is a placeholder implementation
    // Full implementation would require:
    // 1. Deleting the memory entry from Hermes
    // 2. Updating memory database

    await logEvent('memory_deleted', { memoryId: id }, userId);

    res.json({
      success: true,
      data: {
        memoryId: id,
        message: 'Memory deletion requires additional implementation'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;