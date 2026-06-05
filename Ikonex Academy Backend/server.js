// server.js
// Entry point. Loads env, connects to DB, starts HTTP server.

require('dotenv').config();
require('./config/db');          // Triggers DB connection on require

const app  = require('./app');
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Ikonex Academy API running on port ${port}`);
});
