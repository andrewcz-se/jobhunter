import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import searchHandler from './api/search.js';
import verifyHandler from './api/verify.js';
import sanitizeHandler from './api/sanitize.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.all('/api/search', searchHandler);
app.all('/api/verify', verifyHandler);
app.all('/api/sanitize', sanitizeHandler);

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
