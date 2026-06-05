// subjects.queries.js
// Raw SQL queries for subject operations and stream-subject mapping.

const pool = require('../../config/db');

exports.findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM subjects ORDER BY name');
  return rows;
};

exports.findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM subjects WHERE id = $1', [id]);
  return rows[0] || null;
};

exports.create = async ({ name, code, description }) => {
  const { rows } = await pool.query(
    'INSERT INTO subjects (name, code, description) VALUES ($1, $2, $3) RETURNING *',
    [name.trim(), code.trim(), description ? description.trim() : null]
  );
  return rows[0];
};

exports.update = async (id, fields) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE subjects SET ${setClauses}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );
  return rows[0] || null;
};

exports.remove = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM subjects WHERE id = $1', [id]);
  return rowCount > 0;
};

exports.assignToStream = async ({ stream_id, subject_id }) => {
  const { rows } = await pool.query(
    `INSERT INTO stream_subjects (stream_id, subject_id)
     VALUES ($1, $2)
     ON CONFLICT (stream_id, subject_id) DO NOTHING
     RETURNING *`,
    [stream_id, subject_id]
  );
  return rows[0] || { stream_id, subject_id };
};

exports.unassignFromStream = async ({ stream_id, subject_id }) => {
  const { rowCount } = await pool.query(
    'DELETE FROM stream_subjects WHERE stream_id = $1 AND subject_id = $2',
    [stream_id, subject_id]
  );
  return rowCount > 0;
};

exports.findByStream = async (streamId) => {
  const { rows } = await pool.query(
    `SELECT s.*
     FROM subjects s
     JOIN stream_subjects ss ON ss.subject_id = s.id
     WHERE ss.stream_id = $1
     ORDER BY s.name`,
    [streamId]
  );
  return rows;
};
