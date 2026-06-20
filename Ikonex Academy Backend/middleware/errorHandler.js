// errorHandler.js
// Global Express error handler. Catches all errors passed via next(err).
// Returns a consistent JSON error shape to the client.

module.exports = (err, req, res, next) => {
  let status  = err.statusCode || 500;
  let message = err.message    || 'Internal Server Error';

  // Handle PostgreSQL Database Errors
  if (err.code === '23505') { // Unique Violation
    status = 409; // Conflict
    if (err.constraint === 'streams_name_key') {
      message = 'A class stream with this name already exists.';
    } else if (err.constraint === 'students_admission_number_key') {
      message = 'A student with this admission number is already registered.';
    } else if (err.constraint === 'subjects_name_key') {
      message = 'A subject with this name already exists.';
    } else if (err.constraint === 'subjects_code_key') {
      message = 'A subject with this code already exists.';
    } else if (err.constraint === 'scores_student_id_subject_id_term_year_key') {
      message = 'Scores for this subject have already been recorded for this student in the selected term.';
    } else {
      message = 'This record already exists. Please use a unique value.';
    }
  } else if (err.code === '23503') { // Foreign Key Violation
    status = 400;
    message = 'This action cannot be completed because the record is linked to other active data.';
  } else if (err.code === '22P02') { // Invalid Text Representation (e.g. wrong type for DB)
    status = 400;
    message = 'Invalid data format provided for one or more fields.';
  }

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined) {
    console.error(`[${req.method}] ${req.path} - ${status}: ${err.message}`);
  }

  res.status(status).json({ success: false, message });
};
