import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';

import authRoutes from './routes/auth';
import planRoutes from './routes/plans';
import paymentRoutes from './routes/payments';
import sessionRoutes from './routes/sessions';
import adminRoutes from './routes/admin';
import publicRoutes from './routes/public';

import { errorHandler } from './middleware/errorHandler';
import { sessionCleanup } from './services/sessionService';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: '*',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting (generous for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  skip: () => true
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    system: 'KijaniLink Smart ISP & WiFi Billing Ecosystem',
    version: '2.4.0',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use(errorHandler);

// Cron jobs
cron.schedule('*/5 * * * *', () => {
  sessionCleanup();
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌿 KijaniLink Core Server listening on http://0.0.0.0:${PORT}`);
  console.log(`📡 M-Pesa Daraja & MikroTik RouterOS API Gateway Ready`);
});

export default app;
