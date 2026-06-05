// students.service.js
// Business logic for student operations.

const queries = require('../db/queries/students.queries');

/**
 * Get all students, optionally filtered by stream.
 * @param {object} filters
 * @returns {Promise<Array>}
 */
exports.getAllStudents = async (filters = {}) => {
  if (filters.stream_id) {
    return await queries.findByStream(Number(filters.stream_id));
  }
  return await queries.findAll();
};

/**
 * Get student by ID.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
exports.getStudentById = async (id) => {
  return await queries.findById(id);
};

/**
 * Register a new student.
 * @param {object} data
 * @returns {Promise<object>}
 */
exports.createStudent = async (data) => {
  return await queries.create(data);
};

/**
 * Update student information.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<object|null>}
 */
exports.updateStudent = async (id, data) => {
  const fields = {};
  if (data.first_name !== undefined) fields.first_name = data.first_name;
  if (data.last_name !== undefined) fields.last_name = data.last_name;
  if (data.admission_number !== undefined) fields.admission_number = data.admission_number;
  if (data.date_of_birth !== undefined) fields.date_of_birth = data.date_of_birth;
  if (data.gender !== undefined) fields.gender = data.gender;
  if (data.stream_id !== undefined) fields.stream_id = data.stream_id;
  return await queries.update(id, fields);
};

/**
 * Delete a student.
 * @param {number} id
 * @returns {Promise<boolean>}
 */
exports.deleteStudent = async (id) => {
  return await queries.remove(id);
};
