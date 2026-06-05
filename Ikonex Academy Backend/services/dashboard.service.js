// dashboard.service.js
// Business logic for dashboard statistics.

const queries = require('../db/queries/dashboard.queries');
const { getGrade } = require('../utils/gradingScale');

/**
 * Get dashboard overview stats and top performing students.
 * @returns {Promise<object>}
 */
exports.getDashboardStats = async () => {
  const stats = await queries.getStats();
  const rawTopStudents = await queries.getTopPerformers(5);

  const topStudents = rawTopStudents.map(student => {
    const gradeInfo = getGrade(student.average);
    return {
      name: `${student.first_name} ${student.last_name}`,
      stream: student.stream_name,
      average: student.average,
      grade: gradeInfo.grade
    };
  });

  return {
    total_students: stats.total_students,
    total_streams: stats.total_streams,
    total_subjects: stats.total_subjects,
    average_score: stats.average_score,
    top_students: topStudents
  };
};
