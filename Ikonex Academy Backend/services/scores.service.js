// scores.service.js
// Business logic for score entry and verification.

const queries = require('../db/queries/scores.queries');

/**
 * Get scores by filters.
 * @param {object} filters
 * @returns {Promise<Array>}
 */
exports.getScores = async (filters = {}) => {
  return await queries.findByFilters(filters);
};

/**
 * Create a new score card. Prevents duplicate entry.
 * @param {object} data
 * @returns {Promise<object>}
 */
exports.createScore = async (data) => {
  const isDuplicate = await queries.checkDuplicate({
    student_id: data.student_id,
    subject_id: data.subject_id,
    term: data.term,
    year: data.year
  });

  if (isDuplicate) {
    throw Object.assign(
      new Error('A score already exists for this student, subject, term, and year'),
      { statusCode: 400 }
    );
  }

  return await queries.create(data);
};

/**
 * Update an existing score card.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<object|null>}
 */
exports.updateScore = async (id, data) => {
  return await queries.update(id, {
    ca_score: data.ca_score,
    exam_score: data.exam_score
  });
};

/**
 * Delete a score card.
 * @param {number} id
 * @returns {Promise<boolean>}
 */
exports.deleteScore = async (id) => {
  return await queries.remove(id);
};
