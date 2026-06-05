// streams.service.js
// Business logic for stream management. Delegates DB calls to streams.queries.js.

const queries = require('../db/queries/streams.queries');
const subjectsQueries = require('../db/queries/subjects.queries');

/**
 * Get all streams.
 * @returns {Promise<Array>}
 */
exports.getAllStreams = async () => {
  return await queries.findAll();
};

/**
 * Get a single stream by ID.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
exports.getStreamById = async (id) => {
  return await queries.findById(id);
};

/**
 * Create a new stream.
 * @param {object} data
 * @returns {Promise<object>}
 */
exports.createStream = async (data) => {
  return await queries.create(data);
};

/**
 * Update an existing stream.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<object|null>}
 */
exports.updateStream = async (id, data) => {
  // Only extract stream fields for safety
  const fields = {};
  if (data.name !== undefined) fields.name = data.name;
  if (data.year !== undefined) fields.year = data.year;
  return await queries.update(id, fields);
};

/**
 * Delete a stream.
 * @param {number} id
 * @returns {Promise<boolean>}
 */
exports.deleteStream = async (id) => {
  return await queries.remove(id);
};

/**
 * Get subjects assigned to a stream.
 * @param {number} streamId
 * @returns {Promise<Array>}
 */
exports.getStreamSubjects = async (streamId) => {
  return await subjectsQueries.findByStream(streamId);
};

/**
 * Assign a subject to a stream.
 * @param {object} data
 * @returns {Promise<object>}
 */
exports.assignSubjectToStream = async (data) => {
  return await subjectsQueries.assignToStream(data);
};
