// scores.queries.js

const pool = require('../../config/db');

exports.findByFilters = async ({ student_id, subject_id, stream_id, term, year }) => {
  // Build a dynamic WHERE clause based on provided filters
  const conditions = [];
  const values     = [];
  let i = 1;

  if (student_id) { conditions.push(`sc.student_id = $${i++}`); values.push(student_id); }
  if (subject_id) { conditions.push(`sc.subject_id = $${i++}`); values.push(subject_id); }
  if (stream_id)  { conditions.push(`st.stream_id  = $${i++}`); values.push(stream_id);  }
  if (term)       { conditions.push(`sc.term        = $${i++}`); values.push(term);       }
  if (year)       { conditions.push(`sc.year        = $${i++}`); values.push(year);       }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT sc.*,
            st.first_name, st.last_name, st.admission_number,
            sub.name AS subject_name, sub.code AS subject_code
     FROM scores sc
     JOIN students st  ON st.id  = sc.student_id
     JOIN subjects sub ON sub.id = sc.subject_id
     ${where}
     ORDER BY st.last_name, st.first_name`,
    values
  );
  return rows;
};

exports.checkDuplicate = async ({ student_id, subject_id, term, year, excludeId = null }) => {
  const { rows } = await pool.query(
    `SELECT id FROM scores
     WHERE student_id = $1 AND subject_id = $2 AND term = $3 AND year = $4
     ${excludeId ? 'AND id != $5' : ''}`,
    excludeId
      ? [student_id, subject_id, term, year, excludeId]
      : [student_id, subject_id, term, year]
  );
  return rows.length > 0;
};

exports.create = async ({ student_id, subject_id, ca_score, exam_score, term, year }) => {
  const { rows } = await pool.query(
    `INSERT INTO scores (student_id, subject_id, ca_score, exam_score, term, year)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [student_id, subject_id, ca_score, exam_score, term, year]
  );
  return rows[0];
};

exports.update = async (id, { ca_score, exam_score }) => {
  const { rows } = await pool.query(
    `UPDATE scores SET ca_score = COALESCE($1, ca_score),
                       exam_score = COALESCE($2, exam_score),
                       updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [ca_score, exam_score, id]
  );
  return rows[0] || null;
};

exports.remove = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM scores WHERE id = $1', [id]);
  return rowCount > 0;
};
