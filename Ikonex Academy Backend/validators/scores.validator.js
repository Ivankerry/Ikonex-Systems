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
