# Ikonex Academy — Student Management System
## Backend Build Prompt (Node.js + PostgreSQL)

---

## Overview

You are building the **backend API** for the Ikonex Academy Student Management System. This is a RESTful JSON API that the frontend consumes. It handles class streams, students, subjects, scores, result computation, PDF report generation, and dashboard statistics.

**Stack:** Node.js, Express.js, PostgreSQL, PDF generation via `pdfkit` or `puppeteer`.

**Critical rules:**
- Strict separation of concerns: routes → controllers → services → database queries. No business logic in route files. No raw SQL in controllers.
- All database access goes through the `db/` query layer only.
- All business logic (grade calculation, ranking, validation) lives in `services/`.
- Controllers only handle HTTP: parse request, call service, send response.
- Use `async/await` throughout. No callbacks.
- Every route must validate its input before passing to the controller.

---

## Folder Structure

Maintain this exact structure. Do not deviate:

```
backend/
├── server.js                   # Entry point: creates Express app, connects DB, starts server
├── app.js                      # Express app setup: middleware, routes, error handler
├── .env                        # Environment variables (never commit this)
├── .env.example                # Template for required env vars (commit this)
├── package.json
├── config/
│   └── db.js                   # PostgreSQL connection pool (node-postgres `pg`)
├── db/
│   ├── migrations/
│   │   └── 001_init.sql        # Full schema: all CREATE TABLE statements
│   └── queries/
│       ├── streams.queries.js
│       ├── students.queries.js
│       ├── subjects.queries.js
│       ├── scores.queries.js
│       ├── results.queries.js
│       └── dashboard.queries.js
├── routes/
│   ├── index.js                # Mounts all routers under /api
│   ├── streams.routes.js
│   ├── students.routes.js
│   ├── subjects.routes.js
│   ├── scores.routes.js
│   ├── results.routes.js
│   ├── reports.routes.js
│   └── dashboard.routes.js
├── controllers/
│   ├── streams.controller.js
│   ├── students.controller.js
│   ├── subjects.controller.js
│   ├── scores.controller.js
│   ├── results.controller.js
│   ├── reports.controller.js
│   └── dashboard.controller.js
├── services/
│   ├── streams.service.js
│   ├── students.service.js
│   ├── subjects.service.js
│   ├── scores.service.js
│   ├── results.service.js      # Grade calculation, ranking, average logic
│   ├── reports.service.js      # PDF generation
│   └── dashboard.service.js
├── middleware/
│   ├── validate.js             # Generic validation middleware factory
│   ├── errorHandler.js         # Global error handler
│   └── notFound.js             # 404 handler
├── validators/
│   ├── streams.validator.js
│   ├── students.validator.js
│   ├── subjects.validator.js
│   └── scores.validator.js
└── utils/
    ├── gradingScale.js         # Grading logic used by results.service.js
    └── apiResponse.js          # Standardised JSON response helpers
```

---

## Environment Variables

`.env.example`:
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/ikonex_academy
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## Database Schema

### `db/migrations/001_init.sql`

Run this file once to initialise the database. All tables use `SERIAL PRIMARY KEY` for IDs and `TIMESTAMPTZ` for timestamps.

```sql
-- =============================================
-- Ikonex Academy — Database Schema
-- Run: psql -d ikonex_academy -f 001_init.sql
-- =============================================

-- Class streams (e.g. Form 1A, Form 2B)
CREATE TABLE IF NOT EXISTS streams (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(50)  NOT NULL UNIQUE,  -- e.g. "Form 1A"
  year        INTEGER      NOT NULL,          -- academic year e.g. 2026
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id               SERIAL PRIMARY KEY,
  first_name       VARCHAR(100) NOT NULL,
  last_name        VARCHAR(100) NOT NULL,
  admission_number VARCHAR(30)  NOT NULL UNIQUE,
  date_of_birth    DATE,
  gender           VARCHAR(10)  CHECK (gender IN ('Male', 'Female', 'Other')),
  stream_id        INTEGER      REFERENCES streams(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  code        VARCHAR(20)  NOT NULL UNIQUE,  -- e.g. "MATH01"
  description TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Subjects assigned to streams (many-to-many)
CREATE TABLE IF NOT EXISTS stream_subjects (
  stream_id   INTEGER NOT NULL REFERENCES streams(id)  ON DELETE CASCADE,
  subject_id  INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (stream_id, subject_id)
);

-- Scores: one row per student + subject + term + year
CREATE TABLE IF NOT EXISTS scores (
  id          SERIAL PRIMARY KEY,
  student_id  INTEGER      NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id  INTEGER      NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  ca_score    NUMERIC(5,2) NOT NULL CHECK (ca_score    >= 0 AND ca_score    <= 40),
  exam_score  NUMERIC(5,2) NOT NULL CHECK (exam_score  >= 0 AND exam_score  <= 60),
  total_score NUMERIC(5,2) GENERATED ALWAYS AS (ca_score + exam_score) STORED,
  term        VARCHAR(20)  NOT NULL CHECK (term IN ('Term 1', 'Term 2', 'Term 3')),
  year        INTEGER      NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  -- Prevent duplicate score entry for same student+subject+term+year
  UNIQUE (student_id, subject_id, term, year)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_students_stream    ON students(stream_id);
CREATE INDEX IF NOT EXISTS idx_scores_student     ON scores(student_id);
CREATE INDEX IF NOT EXISTS idx_scores_subject     ON scores(subject_id);
CREATE INDEX IF NOT EXISTS idx_scores_term_year   ON scores(term, year);
```

---

## Configuration

### `config/db.js`

```js
// config/db.js
// PostgreSQL connection pool using node-postgres.
// All database queries in db/queries/ use this pool — never create a new Pool elsewhere.

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Max connections in pool. Tune for your VPS memory.
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
  console.log('PostgreSQL connected');
  release();
});

module.exports = pool;
```

### `app.js`

```js
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
```

### `server.js`

```js
// server.js
// Entry point. Loads env, connects to DB, starts HTTP server.

require('dotenv').config();
require('./config/db');          // Triggers DB connection on require

const app  = require('./app');
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Ikonex Academy API running on port ${port}`);
});
```

---

## Middleware

### `middleware/errorHandler.js`

```js
// errorHandler.js
// Global Express error handler. Catches all errors passed via next(err).
// Returns a consistent JSON error shape to the client.

module.exports = (err, req, res, next) => {
  const status  = err.statusCode || 500;
  const message = err.message    || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    console.error(`[${req.method}] ${req.path} — ${status}: ${message}`);
  }

  res.status(status).json({ success: false, message });
};
```

### `middleware/notFound.js`

```js
// notFound.js
// Catches any request that does not match a registered route.

module.exports = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
};
```

### `middleware/validate.js`

```js
// validate.js
// Validation middleware factory. Takes a validator function, runs it against req.body,
// and calls next(err) if validation fails. Keeps validation logic out of controllers.

/**
 * @param {Function} validatorFn - Takes (body) and returns null or an error message string
 * @returns {Function} Express middleware
 */
module.exports = function validate(validatorFn) {
  return (req, res, next) => {
    const error = validatorFn(req.body);
    if (error) {
      const err = new Error(error);
      err.statusCode = 400;
      return next(err);
    }
    next();
  };
};
```

---

## Utils

### `utils/apiResponse.js`

```js
// apiResponse.js
// Standardised JSON response helpers.
// Use these in every controller — never call res.json() directly with a raw object.

exports.success = (res, data, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data });
};

exports.created = (res, data) => {
  res.status(201).json({ success: true, data });
};

exports.noContent = (res) => {
  res.status(204).send();
};
```

### `utils/gradingScale.js`

```js
// gradingScale.js
// Centralised grading logic. Used by results.service.js.
// Edit the GRADE_SCALE array to change grade boundaries without touching service code.

const GRADE_SCALE = [
  { min: 70, max: 100, grade: 'A', label: 'Distinction'  },
  { min: 60, max: 69,  grade: 'B', label: 'Credit'       },
  { min: 50, max: 59,  grade: 'C', label: 'Merit'        },
  { min: 40, max: 49,  grade: 'D', label: 'Pass'         },
  { min: 0,  max: 39,  grade: 'F', label: 'Fail'         },
];

/**
 * Get grade info for a numeric score.
 * @param {number} score
 * @returns {{ grade: string, label: string }}
 */
function getGrade(score) {
  return GRADE_SCALE.find(g => score >= g.min && score <= g.max)
    || { grade: 'F', label: 'Fail' };
}

module.exports = { getGrade, GRADE_SCALE };
```

---

## Validators

### `validators/streams.validator.js`

```js
// streams.validator.js
// Validation rules for stream create/update requests.

/**
 * @param {object} body
 * @returns {string|null} Error message or null if valid
 */
exports.validateCreateStream = (body) => {
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2)
    return 'Stream name is required and must be at least 2 characters';
  if (!body.year || isNaN(body.year) || body.year < 2000 || body.year > 2100)
    return 'A valid academic year is required';
  return null;
};

exports.validateUpdateStream = (body) => {
  // At least one field must be present
  if (!body.name && !body.year) return 'Provide at least one field to update';
  return null;
};
```

### `validators/students.validator.js`

```js
// students.validator.js

exports.validateCreateStudent = (body) => {
  if (!body.first_name?.trim())       return 'First name is required';
  if (!body.last_name?.trim())        return 'Last name is required';
  if (!body.admission_number?.trim()) return 'Admission number is required';
  if (body.gender && !['Male','Female','Other'].includes(body.gender))
    return 'Gender must be Male, Female, or Other';
  if (!body.stream_id || isNaN(body.stream_id)) return 'A valid stream is required';
  return null;
};

exports.validateUpdateStudent = (body) => {
  if (Object.keys(body).length === 0) return 'Provide at least one field to update';
  if (body.gender && !['Male','Female','Other'].includes(body.gender))
    return 'Gender must be Male, Female, or Other';
  return null;
};
```

### `validators/scores.validator.js`

```js
// scores.validator.js

const VALID_TERMS = ['Term 1', 'Term 2', 'Term 3'];

exports.validateCreateScore = (body) => {
  if (!body.student_id || isNaN(body.student_id)) return 'A valid student is required';
  if (!body.subject_id || isNaN(body.subject_id)) return 'A valid subject is required';
  if (body.ca_score   == null || isNaN(body.ca_score)   || body.ca_score   < 0 || body.ca_score   > 40)
    return 'CA score must be between 0 and 40';
  if (body.exam_score == null || isNaN(body.exam_score) || body.exam_score < 0 || body.exam_score > 60)
    return 'Exam score must be between 0 and 60';
  if (!body.term || !VALID_TERMS.includes(body.term)) return `Term must be one of: ${VALID_TERMS.join(', ')}`;
  if (!body.year || isNaN(body.year)) return 'A valid year is required';
  return null;
};

exports.validateUpdateScore = (body) => {
  if (body.ca_score != null   && (isNaN(body.ca_score)   || body.ca_score   < 0 || body.ca_score   > 40))
    return 'CA score must be between 0 and 40';
  if (body.exam_score != null && (isNaN(body.exam_score) || body.exam_score < 0 || body.exam_score > 60))
    return 'Exam score must be between 0 and 60';
  return null;
};
```

---

## Database Query Layer

### `db/queries/streams.queries.js`

```js
// streams.queries.js
// Raw SQL queries for class stream operations. No business logic here.

const pool = require('../../config/db');

exports.findAll = async () => {
  const { rows } = await pool.query(
    `SELECT s.*, COUNT(st.id)::int AS student_count
     FROM streams s
     LEFT JOIN students st ON st.stream_id = s.id
     GROUP BY s.id
     ORDER BY s.name`
  );
  return rows;
};

exports.findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM streams WHERE id = $1', [id]);
  return rows[0] || null;
};

exports.create = async ({ name, year }) => {
  const { rows } = await pool.query(
    'INSERT INTO streams (name, year) VALUES ($1, $2) RETURNING *',
    [name.trim(), year]
  );
  return rows[0];
};

exports.update = async (id, fields) => {
  // Build SET clause dynamically from provided fields
  const keys   = Object.keys(fields);
  const values = Object.values(fields);
  const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE streams SET ${setClauses}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );
  return rows[0] || null;
};

exports.remove = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM streams WHERE id = $1', [id]);
  return rowCount > 0;
};
```

### `db/queries/scores.queries.js`

```js
// scores.queries.js

const pool = require('../../config/db');

exports.findByFilters = async ({ student_id, subject_id, stream_id, term, year }) => {
  // Build a dynamic WHERE clause based on provided filters
  const conditions = [];
  const values     = [];
  let i = 1;

  if (student_id) { conditions.push(`sc.student_id = $${i++}`); values.push(student_id); }
  if (subject_id) { conditions.push(`sc.subject_id = $${i++}`); values.push(subject_id); }
  if (stream_id)  { conditions.push(`st.stream_id  = $${i++}`); values.push(stream_id);  }
  if (term)       { conditions.push(`sc.term        = $${i++}`); values.push(term);       }
  if (year)       { conditions.push(`sc.year        = $${i++}`); values.push(year);       }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT sc.*,
            st.first_name, st.last_name, st.admission_number,
            sub.name AS subject_name, sub.code AS subject_code
     FROM scores sc
     JOIN students st  ON st.id  = sc.student_id
     JOIN subjects sub ON sub.id = sc.subject_id
     ${where}
     ORDER BY st.last_name, st.first_name`,
    values
  );
  return rows;
};

exports.checkDuplicate = async ({ student_id, subject_id, term, year, excludeId = null }) => {
  const { rows } = await pool.query(
    `SELECT id FROM scores
     WHERE student_id = $1 AND subject_id = $2 AND term = $3 AND year = $4
     ${excludeId ? 'AND id != $5' : ''}`,
    excludeId
      ? [student_id, subject_id, term, year, excludeId]
      : [student_id, subject_id, term, year]
  );
  return rows.length > 0;
};

exports.create = async ({ student_id, subject_id, ca_score, exam_score, term, year }) => {
  const { rows } = await pool.query(
    `INSERT INTO scores (student_id, subject_id, ca_score, exam_score, term, year)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [student_id, subject_id, ca_score, exam_score, term, year]
  );
  return rows[0];
};

exports.update = async (id, { ca_score, exam_score }) => {
  const { rows } = await pool.query(
    `UPDATE scores SET ca_score = COALESCE($1, ca_score),
                       exam_score = COALESCE($2, exam_score),
                       updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [ca_score, exam_score, id]
  );
  return rows[0] || null;
};

exports.remove = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM scores WHERE id = $1', [id]);
  return rowCount > 0;
};
```

---

## Services

### `services/results.service.js`

This is the most complex service. It computes totals, averages, grades, and positions.

```js
// results.service.js
// Business logic for result computation: totals, averages, grades, subject positions, class rankings.

const scoresQueries  = require('../db/queries/scores.queries');
const studentQueries = require('../db/queries/students.queries');
const { getGrade }   = require('../utils/gradingScale');

/**
 * Get full ranked results for a class stream.
 * Returns an array of student result objects sorted by total descending, with positions.
 *
 * @param {number} streamId
 * @param {string} term
 * @param {number} year
 * @returns {Promise<Array>}
 */
exports.getStreamResults = async (streamId, term, year) => {
  // 1. Get all students in stream
  const students = await studentQueries.findByStream(streamId);

  // 2. Get all scores for the stream+term+year
  const scores = await scoresQueries.findByFilters({ stream_id: streamId, term, year });

  // 3. Group scores by student_id
  const scoresByStudent = {};
  for (const score of scores) {
    if (!scoresByStudent[score.student_id]) scoresByStudent[score.student_id] = [];
    scoresByStudent[score.student_id].push(score);
  }

  // 4. Compute per-student totals and averages
  const results = students.map(student => {
    const studentScores = scoresByStudent[student.id] || [];
    const totalMarks    = studentScores.reduce((sum, s) => sum + parseFloat(s.total_score), 0);
    const average       = studentScores.length ? totalMarks / studentScores.length : 0;
    const gradeInfo     = getGrade(average);

    return {
      student_id:    student.id,
      name:          `${student.first_name} ${student.last_name}`,
      admission_no:  student.admission_number,
      subjects:      studentScores,
      total_marks:   parseFloat(totalMarks.toFixed(2)),
      average:       parseFloat(average.toFixed(2)),
      grade:         gradeInfo.grade,
      grade_label:   gradeInfo.label,
      position:      null,  // Assigned below
    };
  });

  // 5. Sort by total_marks descending and assign positions
  results.sort((a, b) => b.total_marks - a.total_marks);
  results.forEach((r, i) => { r.position = i + 1; });

  // 6. Compute subject-level positions (rank each student per subject)
  const subjectIds = [...new Set(scores.map(s => s.subject_id))];
  for (const subjectId of subjectIds) {
    const subjectScores = scores
      .filter(s => s.subject_id === subjectId)
      .sort((a, b) => b.total_score - a.total_score);

    subjectScores.forEach((score, i) => {
      const result = results.find(r => r.student_id === score.student_id);
      const subjectEntry = result?.subjects.find(s => s.subject_id === subjectId);
      if (subjectEntry) subjectEntry.subject_position = i + 1;
    });
  }

  return results;
};

/**
 * Get result summary for a single student across all subjects.
 *
 * @param {number} studentId
 * @param {string} term
 * @param {number} year
 * @returns {Promise<object>}
 */
exports.getStudentResults = async (studentId, term, year) => {
  const scores = await scoresQueries.findByFilters({ student_id: studentId, term, year });

  const totalMarks = scores.reduce((sum, s) => sum + parseFloat(s.total_score), 0);
  const average    = scores.length ? totalMarks / scores.length : 0;
  const gradeInfo  = getGrade(average);

  return {
    student_id:  studentId,
    scores,
    total_marks: parseFloat(totalMarks.toFixed(2)),
    average:     parseFloat(average.toFixed(2)),
    grade:       gradeInfo.grade,
    grade_label: gradeInfo.label,
  };
};
```

### `services/reports.service.js`

```js
// reports.service.js
// PDF report generation for individual student report cards and class performance reports.
// Uses pdfkit for PDF creation.

const PDFDocument = require('pdfkit');
const resultsService  = require('./results.service');
const studentQueries  = require('../db/queries/students.queries');
const streamQueries   = require('../db/queries/streams.queries');
const { GRADE_SCALE } = require('../utils/gradingScale');

/**
 * Generate a PDF report card for a single student.
 * Writes the PDF to the provided writable stream (res object from Express).
 *
 * @param {number} studentId
 * @param {string} term
 * @param {number} year
 * @param {object} res - Express response object (writable stream)
 */
exports.generateStudentReportCard = async (studentId, term, year, res) => {
  const student = await studentQueries.findById(studentId);
  if (!student) throw Object.assign(new Error('Student not found'), { statusCode: 404 });

  const stream  = await streamQueries.findById(student.stream_id);
  const result  = await resultsService.getStudentResults(studentId, term, year);

  // Get class position by running full stream results
  const streamResults = await resultsService.getStreamResults(student.stream_id, term, year);
  const studentRank   = streamResults.find(r => r.student_id === studentId);

  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Pipe PDF to response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="report_card_${student.admission_number}.pdf"`);
  doc.pipe(res);

  // --- PDF Layout ---
  // Header: School name, term, year
  doc.fontSize(20).font('Helvetica-Bold').text('IKONEX ACADEMY', { align: 'center' });
  doc.fontSize(12).font('Helvetica').text(`Student Report Card — ${term} ${year}`, { align: 'center' });
  doc.moveDown();

  // Student details box
  doc.fontSize(11).text(`Name:             ${student.first_name} ${student.last_name}`);
  doc.text(`Admission No.:    ${student.admission_number}`);
  doc.text(`Class Stream:     ${stream?.name || 'N/A'}`);
  doc.text(`Class Position:   ${studentRank?.position ?? 'N/A'} of ${streamResults.length}`);
  doc.moveDown();

  // Scores table header
  const cols = { subject: 50, ca: 280, exam: 340, total: 400, grade: 460 };
  doc.font('Helvetica-Bold').text('Subject',    cols.subject, doc.y);
  doc.text('CA (40)',   cols.ca,      doc.y);
  doc.text('Exam (60)', cols.exam,    doc.y);
  doc.text('Total',     cols.total,   doc.y);
  doc.text('Grade',     cols.grade,   doc.y);
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  // Score rows
  doc.font('Helvetica');
  for (const score of result.scores) {
    doc.text(score.subject_name,              cols.subject, doc.y, { width: 220 });
    doc.text(String(score.ca_score),          cols.ca,      doc.y);
    doc.text(String(score.exam_score),        cols.exam,    doc.y);
    doc.text(String(score.total_score),       cols.total,   doc.y);
    doc.text(result.grade,                    cols.grade,   doc.y);
    doc.moveDown(0.5);
  }

  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // Summary
  doc.font('Helvetica-Bold').text(`Total Marks: ${result.total_marks}`);
  doc.text(`Average Score: ${result.average}`);
  doc.text(`Overall Grade: ${result.grade} — ${result.grade_label}`);

  // Grading scale reference
  doc.moveDown(2);
  doc.font('Helvetica').fontSize(9).text('Grading Scale:', { underline: true });
  for (const g of GRADE_SCALE) {
    doc.text(`${g.grade}: ${g.min} – ${g.max} (${g.label})`);
  }

  doc.end();
};

/**
 * Generate a PDF class performance report for a stream.
 *
 * @param {number} streamId
 * @param {string} term
 * @param {number} year
 * @param {object} res - Express response object
 */
exports.generateClassReport = async (streamId, term, year, res) => {
  const stream  = await streamQueries.findById(streamId);
  if (!stream) throw Object.assign(new Error('Stream not found'), { statusCode: 404 });

  const results = await resultsService.getStreamResults(streamId, term, year);

  const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="class_report_${stream.name.replace(/\s/g,'_')}.pdf"`);
  doc.pipe(res);

  // Header
  doc.fontSize(18).font('Helvetica-Bold').text('IKONEX ACADEMY', { align: 'center' });
  doc.fontSize(12).font('Helvetica').text(`Class Performance Report — ${stream.name} | ${term} ${year}`, { align: 'center' });
  doc.moveDown();

  // Ranked table
  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('Pos', 50);  doc.text('Student', 90); doc.text('Adm. No.', 260);
  doc.text('Total', 340); doc.text('Average', 400); doc.text('Grade', 460);
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(760, doc.y).stroke();
  doc.moveDown(0.3);

  doc.font('Helvetica').fontSize(10);
  for (const r of results) {
    doc.text(String(r.position),     50);
    doc.text(r.name,                 90,  doc.y, { width: 160 });
    doc.text(r.admission_no,         260, doc.y);
    doc.text(String(r.total_marks),  340, doc.y);
    doc.text(String(r.average),      400, doc.y);
    doc.text(r.grade,                460, doc.y);
    doc.moveDown(0.5);
  }

  doc.end();
};
```

---

## Routes

### `routes/index.js`

```js
// index.js
// Mounts all route modules under /api. Add new route modules here.

const express  = require('express');
const router   = express.Router();

router.use('/streams',   require('./streams.routes'));
router.use('/students',  require('./students.routes'));
router.use('/subjects',  require('./subjects.routes'));
router.use('/scores',    require('./scores.routes'));
router.use('/results',   require('./results.routes'));
router.use('/reports',   require('./reports.routes'));
router.use('/dashboard', require('./dashboard.routes'));

module.exports = router;
```

### `routes/streams.routes.js`

```js
// streams.routes.js
// Routes for class stream management.

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/streams.controller');
const validate   = require('../middleware/validate');
const { validateCreateStream, validateUpdateStream } = require('../validators/streams.validator');

router.get('/',               controller.getAll);
router.get('/:id',            controller.getOne);
router.post('/',   validate(validateCreateStream), controller.create);
router.put('/:id', validate(validateUpdateStream), controller.update);
router.delete('/:id',         controller.remove);

// Stream subjects
router.get('/:id/subjects',   controller.getSubjects);
router.post('/subjects',      controller.assignSubject);

module.exports = router;
```

### `routes/scores.routes.js`

```js
// scores.routes.js

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/scores.controller');
const validate   = require('../middleware/validate');
const { validateCreateScore, validateUpdateScore } = require('../validators/scores.validator');

router.get('/',               controller.getAll);      // Supports ?student_id= &subject_id= &stream_id= &term= &year=
router.post('/',  validate(validateCreateScore), controller.create);
router.put('/:id', validate(validateUpdateScore), controller.update);
router.delete('/:id',         controller.remove);

module.exports = router;
```

### `routes/results.routes.js`

```js
// results.routes.js

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/results.controller');

// ?term=Term+1&year=2026 required as query params on both routes
router.get('/student/:id', controller.getStudentResults);
router.get('/stream/:id',  controller.getStreamResults);

module.exports = router;
```

### `routes/reports.routes.js`

```js
// reports.routes.js

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/reports.controller');

// Returns a PDF stream directly — no JSON
// Query params: ?term=Term+1&year=2026
router.get('/student/:id/pdf', controller.studentReportCard);
router.get('/stream/:id/pdf',  controller.classReport);

module.exports = router;
```

---

## Controllers

### `controllers/streams.controller.js`

```js
// streams.controller.js
// HTTP layer for stream management. No business logic — delegates to streams.service.js.

const service    = require('../services/streams.service');
const { success, created, noContent } = require('../utils/apiResponse');

exports.getAll = async (req, res, next) => {
  try {
    const streams = await service.getAllStreams();
    success(res, streams);
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const stream = await service.getStreamById(Number(req.params.id));
    if (!stream) return next(Object.assign(new Error('Stream not found'), { statusCode: 404 }));
    success(res, stream);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const stream = await service.createStream(req.body);
    created(res, stream);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const stream = await service.updateStream(Number(req.params.id), req.body);
    if (!stream) return next(Object.assign(new Error('Stream not found'), { statusCode: 404 }));
    success(res, stream);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await service.deleteStream(Number(req.params.id));
    noContent(res);
  } catch (err) { next(err); }
};

exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await service.getStreamSubjects(Number(req.params.id));
    success(res, subjects);
  } catch (err) { next(err); }
};

exports.assignSubject = async (req, res, next) => {
  try {
    await service.assignSubjectToStream(req.body);
    success(res, { message: 'Subject assigned to stream' });
  } catch (err) { next(err); }
};
```

### `controllers/scores.controller.js`

```js
// scores.controller.js
// HTTP layer for score operations. Duplicate checking is handled by scores.service.js.

const service  = require('../services/scores.service');
const { success, created, noContent } = require('../utils/apiResponse');

exports.getAll = async (req, res, next) => {
  try {
    const scores = await service.getScores(req.query);
    success(res, scores);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const score = await service.createScore(req.body);
    created(res, score);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const score = await service.updateScore(Number(req.params.id), req.body);
    if (!score) return next(Object.assign(new Error('Score not found'), { statusCode: 404 }));
    success(res, score);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await service.deleteScore(Number(req.params.id));
    noContent(res);
  } catch (err) { next(err); }
};
```

### `controllers/reports.controller.js`

```js
// reports.controller.js
// Streams PDF directly to the response — does NOT return JSON.

const reportsService = require('../services/reports.service');

exports.studentReportCard = async (req, res, next) => {
  try {
    const { term, year } = req.query;
    if (!term || !year) {
      return next(Object.assign(new Error('term and year query params are required'), { statusCode: 400 }));
    }
    await reportsService.generateStudentReportCard(Number(req.params.id), term, Number(year), res);
  } catch (err) { next(err); }
};

exports.classReport = async (req, res, next) => {
  try {
    const { term, year } = req.query;
    if (!term || !year) {
      return next(Object.assign(new Error('term and year query params are required'), { statusCode: 400 }));
    }
    await reportsService.generateClassReport(Number(req.params.id), term, Number(year), res);
  } catch (err) { next(err); }
};
```

---

## Dashboard Endpoint

`GET /api/dashboard/stats`

Returns:
```json
{
  "success": true,
  "data": {
    "total_students": 120,
    "total_streams": 6,
    "total_subjects": 8,
    "average_score": 61.4,
    "top_students": [
      { "name": "Jane Doe", "stream": "Form 2A", "average": 88.5, "grade": "A" }
    ]
  }
}
```

The dashboard query joins students, streams, scores, and computes the average from the scores table in a single query. Implement this in `db/queries/dashboard.queries.js`.

---

## Complete API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET    | /api/streams | List all streams with student count |
| GET    | /api/streams/:id | Get stream details |
| POST   | /api/streams | Create stream |
| PUT    | /api/streams/:id | Update stream |
| DELETE | /api/streams/:id | Delete stream |
| GET    | /api/streams/:id/subjects | Get subjects assigned to stream |
| POST   | /api/streams/subjects | Assign subject to stream (`{ stream_id, subject_id }`) |
| GET    | /api/students | List all students (supports `?stream_id=`) |
| GET    | /api/students/:id | Get student details |
| POST   | /api/students | Register student |
| PUT    | /api/students/:id | Update student |
| DELETE | /api/students/:id | Delete student |
| GET    | /api/subjects | List all subjects |
| GET    | /api/subjects/:id | Get subject details |
| POST   | /api/subjects | Create subject |
| PUT    | /api/subjects/:id | Update subject |
| DELETE | /api/subjects/:id | Delete subject |
| GET    | /api/scores | Get scores (supports `?student_id= &subject_id= &stream_id= &term= &year=`) |
| POST   | /api/scores | Record score |
| PUT    | /api/scores/:id | Update score |
| DELETE | /api/scores/:id | Delete score |
| GET    | /api/results/student/:id | Get student results (`?term= &year=`) |
| GET    | /api/results/stream/:id | Get ranked stream results (`?term= &year=`) |
| GET    | /api/reports/student/:id/pdf | Download student report card PDF (`?term= &year=`) |
| GET    | /api/reports/stream/:id/pdf | Download class performance PDF (`?term= &year=`) |
| GET    | /api/dashboard/stats | Dashboard summary statistics |

---

## Error Response Shape

All errors return:
```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

Duplicate score attempt returns `400` with:
```json
{ "success": false, "message": "A score already exists for this student, subject, term, and year" }
```

---

## Dependencies

```json
{
  "dependencies": {
    "express":   "^4.19.0",
    "pg":        "^8.11.0",
    "dotenv":    "^16.0.0",
    "cors":      "^2.8.5",
    "helmet":    "^7.0.0",
    "morgan":    "^1.10.0",
    "pdfkit":    "^0.15.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

Install: `npm install`

---

## Scripts (`package.json`)

```json
"scripts": {
  "start":  "node server.js",
  "dev":    "nodemon server.js",
  "db:migrate": "psql $DATABASE_URL -f db/migrations/001_init.sql"
}
```

---

## Code Quality Rules

- Every file has a one-line comment at the top describing its purpose
- Every exported function has a JSDoc comment with `@param` and `@returns`
- No `var`. Use `const` by default, `let` only when reassigned
- No raw SQL outside `db/queries/` files
- No business logic in controllers or route files
- No `console.log` in production paths — use `console.error` for genuine errors only
- All async functions wrapped in `try/catch` with `next(err)` for Express error propagation
- Parameterised queries only — never string-interpolate user input into SQL

---

## Deployment Notes

- Deploy to a **VPS** (Ubuntu), **Railway**, or **Render**
- Set all `.env` variables in the deployment environment
- Run `npm run db:migrate` once after provisioning the database
- For VPS: use **PM2** to keep the process alive (`pm2 start server.js --name ikonex-api`)
- Set `CORS_ORIGIN` to the deployed frontend URL in production
- The frontend `BASE_URL` in `api.js` must point to the deployed backend URL
