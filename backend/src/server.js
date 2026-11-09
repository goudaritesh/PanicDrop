import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import cluster from 'node:cluster';
import os from 'node:os';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seed/seeder.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { productCache, categoryCache, adminStatsCache } from './utils/lruCache.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// High-Performance Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
}));

// Gzip / Deflate compression for 10k product payloads (saves ~80% bandwidth)
app.use(compression({
  threshold: 1024, // Only compress responses > 1KB
  level: 6,
}));

app.use(express.json());
app.use(morgan('dev'));

// Worker & Response Time Telemetry Middleware
app.use((req, res, next) => {
  const start = process.hrtime();
  
  // Attach worker metadata headers to every response
  res.setHeader('X-Worker-PID', process.pid.toString());
  if (cluster.isWorker && cluster.worker) {
    res.setHeader('X-Cluster-Worker-ID', cluster.worker.id.toString());
  }

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const timeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);
    // Log latency for monitoring
    if (res.statusCode >= 400) {
      console.warn(`[WARN] ${req.method} ${req.originalUrl} responded with ${res.statusCode} in ${timeMs}ms`);
    }
  });

  next();
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'PanicDrop API Server is healthy and running',
    timestamp: new Date().toISOString(),
    workerPid: process.pid,
    clusterWorkerId: cluster.isWorker && cluster.worker ? cluster.worker.id : 'standalone',
  });
});

// Cluster & System Diagnostics Endpoint
app.get('/api/system/cluster', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'ok',
    clusterMode: cluster.isWorker,
    workerId: cluster.isWorker && cluster.worker ? cluster.worker.id : 'standalone',
    workerPid: process.pid,
    hostCpus: os.cpus().length,
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: {
      rss: (mem.rss / 1024 / 1024).toFixed(2),
      heapTotal: (mem.heapTotal / 1024 / 1024).toFixed(2),
      heapUsed: (mem.heapUsed / 1024 / 1024).toFixed(2),
      external: (mem.external / 1024 / 1024).toFixed(2),
    },
    nodeVersion: process.version,
    platform: process.platform,
  });
});

// LRU Cache Telemetry & Diagnostics Endpoint
app.get('/api/cache/stats', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    caches: {
      products: productCache.getStats(),
      categories: categoryCache.getStats(),
      adminStats: adminStatsCache.getStats(),
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server & Database
export const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    const serverInstance = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 PanicDrop Backend Server Running on Port ${PORT} [PID: ${process.pid}]`);
      console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
      console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
      console.log(`⚡ LRU Cache Telemetry: http://localhost:${PORT}/api/cache/stats`);
      console.log(`🖥️  Cluster Info: http://localhost:${PORT}/api/system/cluster`);
      console.log(`=========================================`);
    });

    return serverInstance;
  } catch (err) {
    console.error(`Failed to start server: ${err.message}`);
    throw err;
  }
};

// Auto-run if executed directly
if (!cluster.isPrimary || process.env.STANDALONE_START === 'true') {
  startServer().catch((err) => {
    console.error('Server startup error:', err);
  });
}

export default app;
