// reports.routes.js

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/reports.controller');

// Returns a PDF stream directly - no JSON
// Query params: ?term=Term+1&year=2026
router.get('/student/:id/pdf', controller.studentReportCard);
router.get('/stream/:id/pdf',  controller.classReport);

module.exports = router;
