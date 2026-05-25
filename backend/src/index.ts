
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT_BACKEND || 3000;

app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        message: '🚀 Backend SchoolManager CD running',
        timestamp: new Date().toISOString()
    });
});

// Root route
app.get('/', (_req, res) => {
    res.json({
        name: 'SchoolManager CD API',
        version: '0.1.0',
        docs: '/api/health'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
    console.log(`📚 Health: http://localhost:${PORT}/api/health`);
});
