// subjects.service.js
// Business logic for subject operations.

const queries = require('../db/queries/subjects.queries');

/**
 * Get all subjects.
 * @returns {Promise<Array>}
 */
exports.getAllSubjects = async () => {
  return await queries.findAll();
};

/**
 * Get a single subject by ID.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
exports.getSubjectById = async (id) => {
  return await queries.findById(id);
};

/**
 * Create a new subject.
 * @param {object} data
 * @returns {Promise<object>}
 */
exports.createSubject = async (data) => {
  return await queries.create(data);
};

/**
 * Update a subject.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<object|null>}
 */
exports.updateSubject = async (id, data) => {
  const fields = {};
  if (data.name !== undefined) fields.name = data.name;
  if (data.code !== undefined) fields.code = data.code;
  if (data.description !== undefined) fields.description = data.description;
  return await queries.update(id, fields);
};

/**
 * Delete a subject.
 * @param {number} id
 * @returns {Promise<boolean>}
 */
exports.deleteSubject = async (id) => {
  return await queries.remove(id);
};
