// students.queries.js
// Raw SQL queries for student operations.

const pool = require('../../config/db');

exports.findAll = async () => {
  const { rows } = await pool.query(
    `SELECT s.*, st.name AS stream_name
     FROM students s
     LEFT JOIN streams st ON s.stream_id = st.id
     ORDER BY s.last_name, s.first_name`
  );
  return rows;
};

exports.findById = async (id) => {
  const { rows } = await pool.query(
    `SELECT s.*, st.name AS stream_name
     FROM students s
     LEFT JOIN streams st ON s.stream_id = st.id
     WHERE s.id = $1`,
    [id]
  );
  return rows[0] || null;
};

exports.findByStream = async (streamId) => {
  const { rows } = await pool.query(
    `SELECT * FROM students
     WHERE stream_id = $1
     ORDER BY last_name, first_name`,
    [streamId]
  );
  return rows;
};

exports.create = async ({ first_name, last_name, admission_number, date_of_birth, gender, stream_id }) => {
  const { rows } = await pool.query(
    `INSERT INTO students (first_name, last_name, admission_number, date_of_birth, gender, stream_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [first_name.trim(), last_name.trim(), admission_number.trim(), date_of_birth || null, gender || null, stream_id || null]
  );
  return rows[0];
};

exports.update = async (id, fields) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE students SET ${setClauses}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );
  return rows[0] || null;
};

exports.remove = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM students WHERE id = $1', [id]);
  return rowCount > 0;
};
