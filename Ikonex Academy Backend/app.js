// app.js
// Express application setup. Registers middleware, mounts routes, and attaches error handlers.
// Does NOT start the HTTP server — that happens in server.js.

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const router       = require('./routes/index');
const notFound     = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS — restrict to frontend origin in production
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Request logging (dev mode)
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// All API routes
app.use('/api', router);

// 404 and error handlers — must be last
app.use(notFound);
app.use(errorHandler);

module.exports = app;
