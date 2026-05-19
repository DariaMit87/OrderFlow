const app = require('./app');

const PORT = process.env.PORT || 3000;

// Starts the HTTP server
app.listen(PORT, () => {
  console.log(`OrderFlow running on http://localhost:${PORT}`);
});
