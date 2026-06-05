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
