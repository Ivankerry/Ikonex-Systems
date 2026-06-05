// dashboard.queries.js
// Raw SQL queries for dashboard statistics and lists.

const pool = require('../../config/db');

exports.getStats = async () => {
  const query = `
    SELECT
      (SELECT COUNT(*)::int FROM students) AS total_students,
      (SELECT COUNT(*)::int FROM streams) AS total_streams,
      (SELECT COUNT(*)::int FROM subjects) AS total_subjects,
      COALESCE((SELECT AVG(total_score)::numeric(5,2) FROM scores), 0.00)::float AS average_score
  `;
  const { rows } = await pool.query(query);
  return rows[0];
};

exports.getTopPerformers = async (limit = 5) => {
  const query = `
    SELECT
      st.id AS student_id,
      st.first_name,
      st.last_name,
      st.admission_number,
      str.name AS stream_name,
      AVG(sc.total_score)::numeric(5,2)::float AS average
    FROM students st
    JOIN streams str ON st.stream_id = str.id
    JOIN scores sc ON sc.student_id = st.id
    GROUP BY st.id, str.name
    ORDER BY average DESC
    LIMIT $1
  `;
  const { rows } = await pool.query(query, [limit]);
  return rows;
};
