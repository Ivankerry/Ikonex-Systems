// results.routes.js

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/results.controller');

// ?term=Term+1&year=2026 required as query params on both routes
router.get('/student/:id', controller.getStudentResults);
router.get('/stream/:id',  controller.getStreamResults);

module.exports = router;
