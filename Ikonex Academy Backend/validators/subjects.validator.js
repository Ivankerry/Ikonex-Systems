// subjects.validator.js

exports.validateCreateSubject = (body) => {
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2)
    return 'Subject name is required and must be at least 2 characters';
  if (/\d/.test(body.name)) {
    return 'Subject name cannot contain numbers';
  }
  if (!body.code || typeof body.code !== 'string' || body.code.trim().length < 2)
    return 'Subject code is required and must be at least 2 characters';
  return null;
};

exports.validateUpdateSubject = (body) => {
  if (!body.name && !body.code && !body.description)
    return 'Provide at least one field to update';
  if (body.name && /\d/.test(body.name)) {
    return 'Subject name cannot contain numbers';
  }
  return null;
};

exports.validateAssignSubject = (body) => {
  if (!body.stream_id || isNaN(body.stream_id)) return 'A valid stream ID is required';
  if (!body.subject_id || isNaN(body.subject_id)) return 'A valid subject ID is required';
  return null;
};
