import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);
const PORT = 5000;

app.get('/', (req, res) => {
  res.json({ message: 'Test server works!' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server listening on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error(`❌ Server error:`, err);
  process.exit(1);
});
