// streams.queries.js
// Raw SQL queries for class stream operations. No business logic here.

const pool = require('../../config/db');

exports.findAll = async () => {
  const { rows } = await pool.query(
    `SELECT s.*, COUNT(st.id)::int AS student_count
     FROM streams s
     LEFT JOIN students st ON st.stream_id = s.id
     GROUP BY s.id
     ORDER BY s.name`
  );
  return rows;
};

exports.findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM streams WHERE id = $1', [id]);
  return rows[0] || null;
};

exports.create = async ({ name, year }) => {
  const { rows } = await pool.query(
    'INSERT INTO streams (name, year) VALUES ($1, $2) RETURNING *',
    [name.trim(), year]
  );
  return rows[0];
};

exports.update = async (id, fields) => {
  // Build SET clause dynamically from provided fields
  const keys   = Object.keys(fields);
  const values = Object.values(fields);
  const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE streams SET ${setClauses}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );
  return rows[0] || null;
};

exports.remove = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM streams WHERE id = $1', [id]);
  return rowCount > 0;
};
