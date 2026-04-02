/**
 * Hermes Agent Bridge
 * REST API server connecting Hermes CLI to Dashboard UI
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

// Import route handlers
const cronRoutes = require('./routes/cron');
const sessionRoutes = require('./routes/sessions');
const chatRoutes = require('./routes/chat');
const taskRoutes = require('./routes/tasks');
const memoryRoutes = require('./routes/memory');
const statusRoutes = require('./routes/status');

// Import Hermes CLI wrapper functions
const {
  getStatus,
  getCronJobs,
  getSessions
} = require('./utils/hermes-cli');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || '*',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication middleware (DISABLED FOR TESTING - ENABLE IN PRODUCTION)
const authenticateToken = (req, res, next) => {
  // For testing, allow all requests without authentication
  req.user = { id: 'test-user' };
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'hermes-bridge',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/cron', authenticateToken, cronRoutes);
app.use('/api/sessions', authenticateToken, sessionRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);
app.use('/api/tasks', authenticateToken, taskRoutes);
app.use('/api/memory', authenticateToken, memoryRoutes);
app.use('/api/status', authenticateToken, statusRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                  Hermes Agent Bridge                      ║
╠════════════════════════════════════════════════════════════╣
║  Server:  http://localhost:${PORT}                             ║
║  APIs:    /api/cron, /api/sessions, /api/chat, etc.       ║
║  Status:  Ready to connect with Hermes CLI                ║
╚════════════════════════════════════════════════════════════╝
  `);

  // Sync initial data on startup
  syncInitialData();
});

// Helper function to sync initial data from Hermes to Supabase
async function syncInitialData() {
  console.log('🔄 Syncing initial data from Hermes to Supabase...');
  try {
    // Get status
    const status = await getStatus();
    console.log(`✓ Hermes status: Gateway ${status.gatewayService?.status || 'unknown'}`);

    // Sync cron jobs to Supabase
    const cronJobs = await getCronJobs();
    await syncCronJobsToSupa(cronJobs, 'system');
    console.log(`✓ Synced ${cronJobs.length} cron jobs to Supabase`);

    // Sync sessions to Supabase
    const sessions = await getSessions(50);
    await syncSessionsToSupa(sessions, 'system');
    console.log(`✓ Synced ${sessions.length} sessions to Supabase`);

    // Sync status to Supabase
    await syncStatusToSupa(status, 'system');
    console.log(`✓ Synced status to Supabase`);

    console.log('✓ Initial data sync completed successfully');
  } catch (error) {
    console.error('✗ Initial data sync error:', error.message);
    // Don't fail startup on sync errors
  }
}

async function syncCronJobs() {
  try {
    const jobs = await getCronJobs();
    await syncCronJobsToSupa(jobs, 'system'); // System user for initial sync
    return jobs;
  } catch (error) {
    console.error('Error syncing cron jobs:', error);
    return [];
  }
}

async function syncSessions() {
  try {
    const sessions = await getSessions(50);
    await syncSessionsToSupa(sessions, 'system');
    return sessions;
  } catch (error) {
    console.error('Error syncing sessions:', error);
    return [];
  }
}

async function syncStatus() {
  try {
    const status = await getStatus();
    await syncStatusToSupa(status, 'system');
    return status;
  } catch (error) {
    console.error('Error syncing status:', error);
    return null;
  }
}

// Supabase sync helper functions
async function syncStatusToSupa(statusData, userId) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    await supabase.from('hermes_status').upsert({
      user_id: userId,
      environment: statusData.environment,
      gateway_status: statusData.gatewayService,
      messaging_platforms: statusData.messagingPlatforms,
      scheduled_jobs_count: statusData.scheduledJobs,
      sessions_count: statusData.sessions,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    console.log('✓ Status synced to Supabase');
  } catch (error) {
    console.error('✗ Error syncing status:', error.message);
  }
}

async function syncCronJobsToSupa(jobs, userId) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    for (const job of jobs) {
      await supabase.from('hermes_cron_jobs').upsert({
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
      }, { onConflict: 'id' });
    }

    console.log(`✓ Synced ${jobs.length} cron jobs to Supabase`);
  } catch (error) {
    console.error('✗ Error syncing cron jobs:', error.message);
  }
}

async function syncSessionsToSupa(sessions, userId) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    for (const session of sessions) {
      await supabase.from('hermes_sessions').upsert({
        id: session.id,
        user_id: userId,
        title: session.title,
        last_active: session.lastActive,
        source: session.source,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    }

    console.log(`✓ Synced ${sessions.length} sessions to Supabase`);
  } catch (error) {
    console.error('✗ Error syncing sessions:', error.message);
  }
}

module.exports = app;