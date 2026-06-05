// notFound.js
// Catches any request that does not match a registered route.

module.exports = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
};
