// results.service.js
// Business logic for result computation: totals, averages, grades, subject positions, class rankings.

const scoresQueries  = require('../db/queries/scores.queries');
const studentQueries = require('../db/queries/students.queries');
const { getGrade }   = require('../utils/gradingScale');

/**
 * Get full ranked results for a class stream.
 * Returns an array of student result objects sorted by total descending, with positions.
 *
 * @param {number} streamId
 * @param {string} term
 * @param {number} year
 * @returns {Promise<Array>}
 */
exports.getStreamResults = async (streamId, term, year) => {
  // 1. Get all students in stream
  const students = await studentQueries.findByStream(streamId);

  // 2. Get all scores for the stream+term+year
  const scores = await scoresQueries.findByFilters({ stream_id: streamId, term, year });

  // 3. Group scores by student_id
  const scoresByStudent = {};
  for (const score of scores) {
    if (!scoresByStudent[score.student_id]) scoresByStudent[score.student_id] = [];
    scoresByStudent[score.student_id].push(score);
  }

  // 4. Compute per-student totals and averages
  const results = students.map(student => {
    const studentScores = scoresByStudent[student.id] || [];
    const totalMarks    = studentScores.reduce((sum, s) => sum + parseFloat(s.total_score), 0);
    const average       = studentScores.length ? totalMarks / studentScores.length : 0;
    const gradeInfo     = getGrade(average);

    return {
      student_id:    student.id,
      name:          `${student.first_name} ${student.last_name}`,
      admission_no:  student.admission_number,
      subjects:      studentScores,
      total_marks:   parseFloat(totalMarks.toFixed(2)),
      average:       parseFloat(average.toFixed(2)),
      grade:         gradeInfo.grade,
      grade_label:   gradeInfo.label,
      position:      null,  // Assigned below
    };
  });

  // 5. Sort by total_marks descending and assign positions
  results.sort((a, b) => b.total_marks - a.total_marks);
  results.forEach((r, i) => { r.position = i + 1; });

  // 6. Compute subject-level positions (rank each student per subject)
  const subjectIds = [...new Set(scores.map(s => s.subject_id))];
  for (const subjectId of subjectIds) {
    const subjectScores = scores
      .filter(s => s.subject_id === subjectId)
      .sort((a, b) => b.total_score - a.total_score);

    subjectScores.forEach((score, i) => {
      const result = results.find(r => r.student_id === score.student_id);
      const subjectEntry = result?.subjects.find(s => s.subject_id === subjectId);
      if (subjectEntry) subjectEntry.subject_position = i + 1;
    });
  }

  return results;
};

/**
 * Get result summary for a single student across all subjects.
 *
 * @param {number} studentId
 * @param {string} term
 * @param {number} year
 * @returns {Promise<object>}
 */
exports.getStudentResults = async (studentId, term, year) => {
  // We need the student's stream to calculate positions against peers
  const student = await studentQueries.findById(studentId);
  if (!student) throw Object.assign(new Error('Student not found'), { statusCode: 404 });

  // Get full stream results to extract accurate subject positions and class rank
  const streamResults = await exports.getStreamResults(student.stream_id, term, year);
  const studentResult = streamResults.find(r => r.student_id === studentId);

  if (!studentResult) {
    // Fallback if no scores exist yet
    return {
      student_id:  studentId,
      scores:      [],
      total_marks: 0,
      average:     0,
      grade:       'E',
      grade_label: 'Fail',
      position:    'N/A'
    };
  }

  // streamResults maps 'scores' to 'subjects', so we map it back to 'scores' for the frontend
  return {
    student_id:  studentId,
    scores:      studentResult.subjects,
    total_marks: studentResult.total_marks,
    average:     studentResult.average,
    grade:       studentResult.grade,
    grade_label: studentResult.grade_label,
    position:    studentResult.position
  };
};
