// students.validator.js

exports.validateCreateStudent = (body) => {
  if (!body.first_name?.trim())       return 'First name is required';
  if (!body.last_name?.trim())        return 'Last name is required';
  if (!body.admission_number?.trim()) return 'Admission number is required';

  const nameRegex = /^[A-Za-z\s'-]+$/;
  if (!nameRegex.test(body.first_name)) {
    return 'First name must contain only letters, spaces, hyphens, or apostrophes';
  }
  if (!nameRegex.test(body.last_name)) {
    return 'Last name must contain only letters, spaces, hyphens, or apostrophes';
  }

  const admRegex = /^[A-Za-z0-9/-]+$/;
  if (!admRegex.test(body.admission_number)) {
    return 'Admission number must contain only letters, numbers, hyphens, or slashes';
  }

  if (body.gender && !['Male','Female','Other'].includes(body.gender))
    return 'Gender must be Male, Female, or Other';
  if (!body.stream_id || isNaN(body.stream_id)) return 'A valid stream is required';
  return null;
};

exports.validateUpdateStudent = (body) => {
  if (Object.keys(body).length === 0) return 'Provide at least one field to update';
  
  const nameRegex = /^[A-Za-z\s'-]+$/;
  if (body.first_name && !nameRegex.test(body.first_name)) {
    return 'First name must contain only letters, spaces, hyphens, or apostrophes';
  }
  if (body.last_name && !nameRegex.test(body.last_name)) {
    return 'Last name must contain only letters, spaces, hyphens, or apostrophes';
  }

  const admRegex = /^[A-Za-z0-9/-]+$/;
  if (body.admission_number && !admRegex.test(body.admission_number)) {
    return 'Admission number must contain only letters, numbers, hyphens, or slashes';
  }

  if (body.gender && !['Male','Female','Other'].includes(body.gender))
    return 'Gender must be Male, Female, or Other';
  return null;
};
