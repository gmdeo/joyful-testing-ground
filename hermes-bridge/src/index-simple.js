/**
 * Hermes Agent Bridge (Simplified - No Supabase)
 * REST API server connecting Hermes CLI to Dashboard UI
 * Supabase sync and authentication now handled by Edge Function
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

// Import simplified route handlers (no Supabase)
const cronRoutes = require('./routes/cron-simple');
const sessionRoutes = require('./routes/sessions-simple');
const statusRoutes = require('./routes/status-simple');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'hermes-bridge',
    version: '1.0.0-simplified',
    features: {
      supabase: false,
      authentication: false,
      cliExecution: true
    }
  });
});

// API Routes
app.use('/api/cron', cronRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/status', statusRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Hermes Agent Bridge (Simplified) running on port ${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Features: CLI execution only (no Supabase sync)`);
  console.log(`Authentication: Disabled (handled by Edge Function)`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;