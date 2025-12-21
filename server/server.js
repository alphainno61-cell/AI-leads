const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());

// Simple rate limiting middleware
const requestCounts = new Map();
const rateLimitMiddleware = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - 15 * 60 * 1000; // 15 minutes
    
    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, []);
    }
    
    const requests = requestCounts.get(ip);
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= 100) { // 100 requests per 15 minutes
        return res.status(429).json({
            error: 'Too Many Requests',
            message: 'API rate limit exceeded'
        });
    }
    
    recentRequests.push(now);
    requestCounts.set(ip, recentRequests);
    next();
};

app.use(rateLimitMiddleware);

// Routes
app.use('/api/leads', require('./routes/leads'));
app.use('/api/validate', require('./routes/validation'));
app.use('/api/sources', require('./routes/sources'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV 
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Lead Generation API Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔒 GDPR Compliance: ${process.env.GDPR_COMPLIANCE}`);
});

module.exports = app;