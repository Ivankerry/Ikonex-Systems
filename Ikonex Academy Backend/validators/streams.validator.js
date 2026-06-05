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
