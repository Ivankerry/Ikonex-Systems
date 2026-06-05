// index.js
// Mounts all route modules under /api. Add new route modules here.

const express  = require('express');
const router   = express.Router();
const pool     = require('../config/db');

// Healthcheck endpoint to verify API and DB health
router.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'OK',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'ERROR',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.use('/streams',   require('./streams.routes'));
router.use('/students',  require('./students.routes'));
router.use('/subjects',  require('./subjects.routes'));
router.use('/scores',    require('./scores.routes'));
router.use('/results',   require('./results.routes'));
router.use('/reports',   require('./reports.routes'));
router.use('/dashboard', require('./dashboard.routes'));

module.exports = router;

