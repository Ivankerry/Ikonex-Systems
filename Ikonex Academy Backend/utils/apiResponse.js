// apiResponse.js
// Standardised JSON response helpers.
// Use these in every controller — never call res.json() directly with a raw object.

exports.success = (res, data, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data });
};

exports.created = (res, data) => {
  res.status(201).json({ success: true, data });
};

exports.noContent = (res) => {
  res.status(204).send();
};
