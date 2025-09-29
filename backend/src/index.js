require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
// Increase payload size limit for image uploads (base64 images can be large)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Define Routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/logs', require('../routes/logs'));
app.use('/api/medications', require('../routes/medications'));
app.use('/api/analyze', require('../routes/analyze'));

app.get('/', (req, res) => {
  res.send('PharrroHealth Backend is running!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Server accessible at http://localhost:${port}`);
  console.log(`Server accessible at http://0.0.0.0:${port}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});